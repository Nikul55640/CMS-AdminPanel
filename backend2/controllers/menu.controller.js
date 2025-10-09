// src/controllers/menu.controller.js
import Menu from "../models/menu.model.js";
import CustomContent from "../models/custommenu.model.js";
import { Op } from "sequelize";
import { sequelize } from "../db/sequelize.js";

// ---------------------- READ ----------------------

// Get all menus (flat list)
export const getMenus = async (req, res) => {
  try {
    const menus = await Menu.findAll({ order: [["order", "ASC"]] });
    res.json(menus);
  } catch (error) {
    console.error("❌ Error fetching menus:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get menus by location (nested tree) + custom HTML/CSS
export const getMenusByLocation = async (req, res) => {
  const { location } = req.params;

  try {
    // Fetch flat menus
    const flatMenus = await Menu.findAll({
      where: { location },
      order: [["order", "ASC"]],
      raw: true,
    });

    // Build nested tree
    const buildTree = (items, parentId = null) =>
      items
        .filter((i) => i.parentId === parentId)
        .sort((a, b) => a.order - b.order)
        .map((i) => ({ ...i, children: buildTree(items, i.id) }));

    const menuTree = buildTree(flatMenus);

    // Fetch custom HTML/CSS for this section
    const customContent = await CustomContent.findOne({
      where: { section: location },
    });

    res.json({
      menus: menuTree,
      customContent: customContent || { html: "", css: "" },
    });
  } catch (error) {
    console.error("❌ Error fetching menus by location:", error);
    res.status(500).json({ message: error.message });
  }
};

// ---------------------- CREATE ----------------------
export const createMenu = async (req, res) => {
  try {
    const { title, url, location, parentId, pageId, icon, openInNewTab } =
      req.body;

    const siblingCount = await Menu.count({
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
      icon: icon || null,
      openInNewTab: !!openInNewTab,
      order: siblingCount,
    });

    res.status(201).json(menu);
  } catch (error) {
    console.error("❌ Error creating menu:", error);
    res.status(500).json({ message: error.message });
  }
};

// ---------------------- UPDATE MENU (non-hierarchy fields) ----------------------
export const updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url, location, parentId, pageId, icon, openInNewTab } =
      req.body;

    const menu = await Menu.findByPk(id);
    if (!menu) return res.status(404).json({ message: "Menu not found" });

    await menu.update({
      title,
      url: url || "",
      location: location || "none",
      parentId: parentId || null,
      pageId: pageId || null,
      icon: icon || null,
      openInNewTab: !!openInNewTab,
    });

    res.json(menu);
  } catch (error) {
    console.error("❌ Error updating menu:", error);
    res.status(500).json({ message: error.message });
  }
};

// ---------------------- DELETE MENU RECURSIVELY ----------------------
export const deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteRecursive = async (menuId) => {
      const children = await Menu.findAll({ where: { parentId: menuId } });
      for (const child of children) await deleteRecursive(child.id);

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

// ---------------------- UPDATE MENU HIERARCHY (drag & drop) ----------------------
export const updateMenuHierarchy = async (req, res) => {
  const { menuTree, location } = req.body;

  if (!Array.isArray(menuTree))
    return res.status(400).json({ message: "Invalid menu tree format." });

  const updateItems = async (items, parentId = null, transaction) => {
    let order = 0;

    for (const item of items) {
      const { id, children } = item;
      if (!id) continue;

      await Menu.update(
        { parentId, order, location },
        { where: { id }, transaction }
      );

      if (children && children.length > 0) {
        await updateItems(children, id, transaction);
      }
      order++;
    }
  };

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

/// ---------------------- CUSTOM CONTENT ----------------------

// Save or update custom HTML/CSS for navbar/footer
export const saveCustomContent = async (req, res) => {
  try {
    const { section, html, css } = req.body;

    if (!section)
      return res.status(400).json({ message: "Section is required" });

    let content = await CustomContent.findOne({ where: { section } });

    if (content) {
      content.html = html || content.html;
      content.css = css || content.css;
      await content.save();
    } else {
      content = await CustomContent.create({ section, html, css });
    }

    res.status(200).json({ message: "Custom content saved", content });
  } catch (error) {
    console.error("❌ Error saving custom content:", error);
    res.status(500).json({ message: error.message });
  }
};

// ---------------------- FETCH CUSTOM CONTENT ----------------------
export const getCustomContent = async (req, res) => {
  try {
    const { section } = req.query;

    if (!section)
      return res.status(400).json({ message: "Section is required" });

    const content = await CustomContent.findOne({ where: { section } });

    if (!content) return res.status(404).json({ message: "Content not found" });

    res.status(200).json({ content });
  } catch (error) {
    console.error("❌ Error fetching custom content:", error);
    res.status(500).json({ message: error.message });
  }
};
