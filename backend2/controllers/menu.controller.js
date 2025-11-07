import Menu from "../models/menu.model.js";
import CustomContent from "../models/custommenu.model.js";
import { sequelize } from "../db/sequelize.js";
import { Op } from "sequelize";
import { AsyncHandler } from "../utils/ApiHelpers.js";

// ---------------- PUBLIC ROUTES ---------------- //

export const getMenus = AsyncHandler(async (req, res) => {
  const menus = await Menu.findAll({ order: [["order", "ASC"]] });
  res.json(menus);
});

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

export const saveCustomContent = AsyncHandler(async (req, res) => {
  const { section, html, css, js, menuType, logo } = req.body;
  if (!section) return res.status(400).json({ message: "Section is required" });

  let content = await CustomContent.findOne({ where: { section } });

  if (content) {
    content.html = html ?? content.html;
    content.css = css ?? content.css;
    content.js = js ?? content.js;
    content.menuType = menuType ?? content.menuType;
    content.logo = logo ?? content.logo;
    await content.save();
  } else {
    content = await CustomContent.create({
      section,
      html,
      css,
      js,
      logo: logo || null,
      menuType: menuType || "manual",
    });
  }

  res.json({ message: "Custom content saved successfully", content });
});

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

// ---------------- LOGO UPLOAD ---------------- //

// export const uploadMenuLogo = AsyncHandler(async (req, res) => {
//   const { location } = req.params;
//   let logoPath = "";

//   if (req.file) {
//     logoPath = `/uploads/${req.file.filename}`;
//   } else if (req.body.logo) {
//     logoPath = req.body.logo;
//   } else {
//     return res.status(400).json({ message: "No logo provided" });
//   }

//   let custom = await CustomContent.findOne({ where: { section: location } });
//   if (custom) {
//     custom.logo = logoPath;
//     await custom.save();
//   } else {
//     custom = await CustomContent.create({ section: location, logo: logoPath });
//   }

//   res.json({
//     success: true,
//     message: "Logo uploaded successfully",
//     logo: custom.logo,
//   });
// });

// ---------------- ACTIVE MENUS ---------------- //

export const getActiveMenu = AsyncHandler(async (req, res) => {
  const { section } = req.query;
  if (!section) return res.status(400).json({ message: "Section is required" });

  const customMenu = await CustomContent.findOne({ where: { section } });
  if (customMenu?.activeMenuId === "custom")
    return res.json({ activeMenuId: "custom" });

  if (customMenu?.activeMenuId)
    return res.json({ activeMenuId: customMenu.activeMenuId });

  const activeMenu = await Menu.findOne({
    where: { isActive: true, location: section },
  });
  if (activeMenu) return res.json({ activeMenuId: activeMenu.id });

  res.status(404).json({ message: "No active menu found" });
});

export const setActiveMenus = AsyncHandler(async (req, res) => {
  const { menuIds = [], section } = req.body;

  if (!section) return res.status(400).json({ message: "Section is required" });

  await Menu.update({ isActive: false }, { where: { location: section } });
  const validMenuIds = menuIds.filter((id) => id !== "custom");
  if (validMenuIds.length)
    await Menu.update({ isActive: true }, { where: { id: validMenuIds } });

  if (menuIds.includes("custom")) {
    const customMenu = await CustomContent.findOne({ where: { section } });
    if (customMenu && customMenu.html?.trim()) {
      customMenu.activeMenuId = "custom";
      await customMenu.save();
    }
  } else {
    const customMenu = await CustomContent.findOne({ where: { section } });
    if (customMenu) {
      customMenu.activeMenuId = null;
      await customMenu.save();
    }
  }

  const updatedMenus = await Menu.findAll({
    where: { location: section, isActive: true },
  });
  const activeIds = updatedMenus.map((m) => String(m.id));
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
  });

  const map = {};
  flatMenus.forEach((menu) => {
    map[menu.id] = { ...menu, children: [] };
  });

  const roots = [];
  flatMenus.forEach((menu) => {
    if (menu.parentId && map[menu.parentId]) {
      map[menu.parentId].children.push(map[menu.id]);
    } else {
      roots.push(map[menu.id]);
    }
  });

  const customContent = await CustomContent.findOne({
    where: { section: location },
    raw: true,
  });
  const activeMenus = await Menu.findAll({
    where: { location, isActive: true },
    raw: true,
  });
  const activeMenuIds = activeMenus.map((m) => m.id.toString());
  if (customContent?.activeMenuId === "custom") activeMenuIds.push("custom");

  res.json({
    menus: roots,
    customContent: customContent || {
      html: "",
      css: "",
      js: "",
      logo: null,
      menuType: "manual",
    },
    activeMenuIds,
  });
});

export const manuallogoupload = async (req, res) => {
  try {
    const { location } = req.params; // e.g., navbar or footer

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const logoUrl = `/uploads/${req.file.filename}`;

    // Update existing record or create new one
    const [record, created] = await CustomContent.findOrCreate({
      where: { section: location },
      defaults: { logo: logoUrl },
    });

    if (!created) {
      record.logo = logoUrl;
      await record.save();
    }

    res.status(200).json({
      message: "✅ Logo uploaded successfully",
      logoUrl: `http://localhost:5000${logoUrl}`,
    });
  } catch (error) {
    console.error("❌ Logo upload error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
