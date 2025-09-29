import Menu from "../models/menu.model.js";
import { Op } from "sequelize";
import { sequelize } from "../db/sequelize.js"; 

// --- READ OPERATIONS ---

// ✅ Get all menus (flat list, primarily for internal management)
export const getMenus = async (req, res) => {
  try {
    const menus = await Menu.findAll({ order: [["order", "ASC"]] });
    res.json(menus);
  } catch (error) {
    console.error("❌ Error fetching menus:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get menus by location (navbar/footer) and build the tree recursively
export const getMenusByLocation = async (req, res) => {
  const { location } = req.params;
  try {
    // Fetch all items for the location in a flat list for efficient tree-building
    const flatMenus = await Menu.findAll({
      where: { location },
      order: [["order", "ASC"]],
      raw: true, // Use raw: true to get plain JS objects
    }); // Helper function to build the tree from the flat list

    const buildMenuTree = (items, parentId = null) => {
      return items
        .filter((item) => item.parentId === parentId)
        .sort((a, b) => a.order - b.order) // Ensure correct sorting
        .map((item) => ({
          ...item,
          children: buildMenuTree(items, item.id),
        }));
    };

    const menusWithChildren = buildMenuTree(flatMenus);
    res.json(menusWithChildren);
  } catch (error) {
    console.error("❌ Error fetching menus by location:", error);
    res.status(500).json({ message: error.message });
  }
};

// --- CRUD OPERATIONS ---

// ✅ Create a new menu (Correctly calculating order)
export const createMenu = async (req, res) => {
  try {
    const { title, url, location, parentId, pageId } = req.body; // Determine the current highest order for the new sibling list
    const count = await Menu.count({
      where: {
        location: location || "none",
        parentId: parentId || { [Op.is]: null },
      },
    });

    const menu = await Menu.create({
      title,
      url: url || "",
      location: location || "none",
      parentId: parentId || null,
      pageId: pageId || null,
      order: count, // Place the new item at the end of its level
    });

    res.status(201).json(menu);
  } catch (error) {
    console.error("❌ Error creating menu:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update a menu (non-structural details like title/url)
export const updateMenu = async (req, res) => {
  // ... (Your existing updateMenu logic) ...
  try {
    const { id } = req.params;
    const { title, url, location, parentId, pageId } = req.body;

    const menu = await Menu.findByPk(id);
    if (!menu) return res.status(404).json({ message: "Menu not found" });

    await menu.update({
      title,
      url: url || "",
      location: location || "none",
      parentId: parentId || null,
      pageId: pageId || null, // NOTE: We don't update 'order' here, only in updateMenuHierarchy
    });

    res.json(menu);
  } catch (error) {
    console.error("❌ Error updating menu:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete a menu and its children recursively
export const deleteMenu = async (req, res) => {
  // ... (Your existing deleteMenu logic) ...
  try {
    const { id } = req.params; // Recursive deletion function

    const deleteRecursive = async (menuId) => {
      const children = await Menu.findAll({ where: { parentId: menuId } });
      for (const child of children) {
        await deleteRecursive(child.id);
      }
      const menu = await Menu.findByPk(menuId);
      if (menu) await menu.destroy();
    };

    await deleteRecursive(id);
    res.json({ message: "Menu and its children deleted" });
  } catch (error) {
    console.error("❌ Error deleting menu:", error);
    res.status(500).json({ message: error.message });
  }
};

// --- CORE HIERARCHY UPDATE (Replacing reorderMenus) ---

// ⚠️ IMPORTANT: This is the controller that handles the result of the
// drag-and-drop action, updating both 'parentId' and 'order' simultaneously.
export const updateMenuHierarchy = async (req, res) => {
  const { menuTree, location } = req.body;

  if (!Array.isArray(menuTree)) {
    return res.status(400).json({ message: "Invalid menu tree format." });
  } // --- 1. Recursive Update Function ---

  const updateItems = async (items, parentId = null, transaction) => {
    let order = 0;

    for (const item of items) {
      const { id, children } = item; // Skip items that don't have a valid ID

      if (!id || isNaN(parseInt(id))) continue; // Update the current item's parent, order, and location

      await Menu.update(
        {
          parentId: parentId,
          order: order,
          location: location,
        },
        {
          where: { id: id },
          transaction,
        }
      );
      order++; // Recursively call for children

      if (children && children.length > 0) {
        await updateItems(children, id, transaction);
      }
    }
  }; // --- 2. Execute in a Transaction ---

  try {
    await sequelize.transaction(async (t) => {
      await updateItems(menuTree, null, t);
    });

    res.json({ message: "Menu hierarchy updated successfully." });
  } catch (error) {
    console.error("❌ Error updating menu hierarchy:", error);
    res.status(500).json({
      message: "Failed to update menu hierarchy.",
      error: error.message,
    });
  }
};
