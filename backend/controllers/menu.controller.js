// controllers/menu.controller.js
import Menu from "../models/menu.models.js";
import { Op } from "sequelize";

// Get all menus
export const getMenus = async (req, res) => {
  try {
    const menus = await Menu.findAll({ order: [["order", "ASC"]] });
    res.json(menus);
  } catch (error) {
    console.error("❌ Error fetching menus:", error);
    res.status(500).json({ message: "Error fetching menus" });
  }
};

// Get menus by location (navbar/footer) recursively
export const getMenusByLocation = async (req, res) => {
  const { location } = req.params;
  try {
    // Fetch top-level menus
    const parentMenus = await Menu.findAll({
      where: { location, parentId: null },
      order: [["order", "ASC"]],
    });

    // Recursive function to attach children
    const attachChildren = async (menu) => {
      const children = await Menu.findAll({
        where: { parentId: menu.id },
        order: [["order", "ASC"]],
      });

      const childrenWithNested = await Promise.all(
        children.map(attachChildren)
      );
      return { ...menu.toJSON(), children: childrenWithNested };
    };

    const menusWithChildren = await Promise.all(
      parentMenus.map(attachChildren)
    );
    res.json(menusWithChildren);
  } catch (error) {
    console.error("❌ Error fetching menus by location:", error);
    res.status(500).json({ message: "Error fetching menus by location" });
  }
};

// Create a new menu
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

    res.json(menu);
  } catch (error) {
    console.error("❌ Error creating menu:", error);
    res.status(500).json({ message: "Error creating menu" });
  }
};

// Update a menu
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
    res.status(500).json({ message: "Error updating menu" });
  }
};

// Delete a menu and its children recursively
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
    res.status(500).json({ message: "Error deleting menu" });
  }
};

// Reorder multiple menus
export const reorderMenus = async (req, res) => {
  try {
    const { menus } = req.body; // [{ id, order }]
    const updates = menus.map(({ id, order }) =>
      Menu.update({ order }, { where: { id } })
    );
    await Promise.all(updates);

    res.json({ message: "Menus reordered successfully" });
  } catch (error) {
    console.error("❌ Error reordering menus:", error);
    res.status(500).json({ message: "Error reordering menus" });
  }
};
