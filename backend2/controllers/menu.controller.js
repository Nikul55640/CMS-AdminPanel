// controllers/menu.controller.js
import Menu from "../models/menu.model.js";
import CustomContent from "../models/custommenu.model.js"; // fixed import
import { sequelize } from "../db/sequelize.js";
import { Op } from "sequelize";
import { AsyncHandler } from "../utils/ApiHelpers.js";

// ---------------- PUBLIC ROUTES ---------------- //

// Get all menus (flat)
export const getMenus = AsyncHandler(async (req, res) => {
  const menus = await Menu.findAll({ order: [["order", "ASC"]] });
  res.json(menus);
});

// Create menu
export const createMenu = AsyncHandler(async (req, res) => {
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
});

// Update menu
export const updateMenu = AsyncHandler(async (req, res) => {
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
});

// Delete menu recursively
export const deleteMenu = AsyncHandler(async (req, res) => {
  const { id } = req.params;

  const deleteRecursive = async (menuId) => {
    const children = await Menu.findAll({ where: { parentId: menuId } });
    for (const child of children) await deleteRecursive(child.id);

    const menu = await Menu.findByPk(menuId);
    if (menu) await menu.destroy();
  };

  await deleteRecursive(id);
  res.json({ message: "Menu and its children deleted" });
});

// Update menu hierarchy (drag & drop)
export const updateMenuHierarchy = AsyncHandler(async (req, res) => {
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
      if (children?.length) await updateItems(children, id, transaction);
      order++;
    }
  };

  await sequelize.transaction(async (t) => {
    await updateItems(menuTree, null, t);
  });

  res.json({ message: "Menu hierarchy updated" });
});

// ---------------- CUSTOM CONTENT ---------------- //

// Save custom content
export const saveCustomContent = AsyncHandler(async (req, res) => {
  const { section, html, css, js } = req.body;
  if (!section) return res.status(400).json({ message: "Section is required" });

  let content = await CustomContent.findOne({ where: { section } });

  if (content) {
    content.html = html || content.html;
    content.css = css || content.css;
    content.js = js || content.js;
    await content.save();
  } else {
    content = await CustomContent.create({ section, html, css, js });
  }

  res.json({ message: "Custom content saved", content });
});

// Get custom content
export const getCustomContent = AsyncHandler(async (req, res) => {
  const { section } = req.query;
  if (!section) return res.status(400).json({ message: "Section is required" });

  const content = await CustomContent.findOne({ where: { section } });
  if (!content) return res.status(404).json({ message: "Content not found" });

  res.json({ content });
});

export const deleteCustomContent = AsyncHandler(async (req, res) => {
  const { section } = req.params;
  if (!section) return res.status(400).json({ message: "Section is required" });

  const content = await CustomContent.findOne({ where: { section } });
  if (!content) return res.status(404).json({ message: "Content not found" });

  await content.destroy();
  res.json({ message: "Custom content deleted" });
});

// ---------------- ACTIVE MENUS ---------------- //
// Get Active Menu
export const getActiveMenu = AsyncHandler(async (req, res) => {
  const { section } = req.query;
  if (!section) return res.status(400).json({ message: "Section is required" });

  const customMenu = await CustomContent.findOne({ where: { section } });
  if (customMenu?.activeMenuId === "custom")
    return res.json({ activeMenuId: "custom" });

  if (customMenu?.activeMenuId)
    return res.json({ activeMenuId: customMenu.activeMenuId });

  // Fallback: check if any Menu is active
  const activeMenu = await Menu.findOne({
    where: { isActive: true, location: section },
  });
  if (activeMenu) return res.json({ activeMenuId: activeMenu.id });

  res.status(404).json({ message: "No active menu found" });
});

// Set Active Menus (supports multiple)
export const setActiveMenus = AsyncHandler(async (req, res) => {
  const { menuIds = [], section } = req.body;

  if (!section) return res.status(400).json({ message: "Section is required" });

  // Deactivate all menus in this section first
  await Menu.update({ isActive: false }, { where: { location: section } });

  // Activate menus from menuIds (skip "custom")
  const validMenuIds = menuIds.filter((id) => id !== "custom");
  if (validMenuIds.length) {
    await Menu.update({ isActive: true }, { where: { id: validMenuIds } });
  }

  // Handle "custom" separately
  if (menuIds.includes("custom")) {
    const customMenu = await CustomContent.findOne({ where: { section } });
    if (customMenu && customMenu.html.trim()) {
      // Only store "custom" as active if HTML exists
      customMenu.activeMenuId = "custom";
      await customMenu.save();
    }
  } else {
    // If user deselected "custom", remove activeMenuId
    const customMenu = await CustomContent.findOne({ where: { section } });
    if (customMenu) {
      customMenu.activeMenuId = null;
      await customMenu.save();
    }
  }

  // Rebuild activeMenuIds to return
  const updatedMenus = await Menu.findAll({
    where: { location: section, isActive: true },
  });
  const activeIds = updatedMenus.map((m) => String(m.id));

  // Include custom only if it has HTML and was selected
  const customMenu = await CustomContent.findOne({ where: { section } });
  if (customMenu?.activeMenuId === "custom") activeIds.push("custom");

  res.json({
    message: `Active menus updated`,
    activeMenuIds: activeIds,
  });
});

export const getMenusByLocation = AsyncHandler(async (req, res) => {
  const { location } = req.params;

  const flatMenus = await Menu.findAll({
    where: { location },
    order: [["order", "ASC"]],
    raw: true,
    nested: true,
  });

   // Build a map of all menus for easy lookup
    const map = {};
    flatMenus.forEach(menu => {
      map[menu.id] = { ...menu, children: [] };
    });

    // Build hierarchy (attach children to parents)
    const roots = [];
    flatMenus.forEach(menu => {
      if (menu.parentId) {
        if (map[menu.parentId]) {
          map[menu.parentId].children.push(map[menu.id]);
        }
      } else {
        roots.push(map[menu.id]);
      }
    });

  const customContent = await CustomContent.findOne({
    where: { section: location },
    raw: true,
  });

  // Get all active menus in this section
  const activeMenus = await Menu.findAll({
    where: { location, isActive: true },
    raw: true,
  });
  const activeMenuIds = activeMenus.map((m) => m.id.toString());
  if (customContent?.activeMenuId === "custom") activeMenuIds.push("custom");

  res.json({
    menus: roots,
    customContent: customContent || { html: "", css: "", js: "" },
    activeMenuIds,
  });
});
