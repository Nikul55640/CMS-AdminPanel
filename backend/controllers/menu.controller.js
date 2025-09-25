import Menu from "../models/menu.models.js";
import { Op } from "sequelize";

// ✅ Get all menus
export const getMenus = async (req, res) => {
  try {
    const menus = await Menu.findAll({ order: [["order", "ASC"]] });
    res.json(menus);
  } catch (error) {
    console.error("❌ Error fetching menus:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get menus by location (navbar/footer) recursively
export const getMenusByLocation = async (req, res) => {
  const { location } = req.params;
  try {
    console.log("📥 Requested location:", location);

    const parentMenus = await Menu.findAll({
      where: {
        location,
        parentId: { [Op.is]: null },
      },
      order: [["order", "ASC"]],
    });

    console.log(`✅ Found ${parentMenus.length} top-level menus`);

    const attachChildren = async (menu, visited = new Set()) => {
      if (visited.has(menu.id)) {
        console.warn(`⚠️ Circular reference detected for menu ID: ${menu.id}`);
        return menu.toJSON();
      }
      visited.add(menu.id);

      const children = await Menu.findAll({
        where: { parentId: menu.id },
        order: [["order", "ASC"]],
      });

      const childrenWithNested = await Promise.all(
        children.map((child) => attachChildren(child, visited))
      );

      return { ...menu.toJSON(), children: childrenWithNested };
    };

    const menusWithChildren = await Promise.all(
      parentMenus.map((menu) => attachChildren(menu))
    );

    res.json(menusWithChildren);
  } catch (error) {
    console.error("❌ Error fetching menus by location:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Create a new menu
export const createMenu = async (req, res) => {
  try {
    const { title, url, location, parentId, pageId } = req.body;
    const count = await Menu.count({ where: { location } });

    const menu = await Menu.create({
      title,
      url: url || "",
      location: location || "none",
      parentId: parentId || null,
      pageId: pageId || null,
      order: count,
    });

    res.status(201).json(menu);
  } catch (error) {
    console.error("❌ Error creating menu:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update a menu
export const updateMenu = async (req, res) => {
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
      pageId: pageId || null,
    });

    res.json(menu);
  } catch (error) {
    console.error("❌ Error updating menu:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete a menu and its children recursively
export const deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;

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

// ✅ Reorder multiple menus
export const reorderMenus = async (req, res) => {
  try {
    const { menus } = req.body; // [{ id, order }]
    if (!Array.isArray(menus)) throw new Error("Menus must be an array");

    const updates = menus.map(({ id, order }) =>
      Menu.update({ order }, { where: { id } })
    );
    await Promise.all(updates);

    res.json({ message: "Menus reordered successfully" });
  } catch (error) {
    console.error("❌ Error reordering menus:", error);
    res.status(500).json({ message: error.message });
  }
};
