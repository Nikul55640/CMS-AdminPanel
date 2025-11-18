import Page from "../models/page.model.js";
import slugify from "slugify";
import { AsyncHandler } from "../utils/ApiHelpers.js";

// ======================================
// ✅ ADMIN — Get ALL pages
// ======================================
export const getPages = AsyncHandler(async (req, res) => {
  const pages = await Page.findAll({ order: [["createdAt", "DESC"]] });
  res.json(pages);
});

// ======================================
// ✅ PUBLIC — Get ONLY published pages
// ======================================
export const getPublishedPages = AsyncHandler(async (req, res) => {
  const pages = await Page.findAll({
    where: { status: "published" },
    order: [["createdAt", "DESC"]],
  });
  res.json(pages);
});

// ======================================
// ✅ PUBLIC + ADMIN — Get page by slug
// PUBLIC: Only published
// ADMIN: Can see draft + published
// ======================================
export const getPageBySlug = AsyncHandler(async (req, res) => {
  const { slug } = req.params;
  const page = await Page.findOne({ where: { slug } });

  if (!page) return res.status(404).json({ message: "Page not found" });

  // 🟡 If the page is draft → only admin can access
  if (page.status === "draft") {
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Unauthorized access to draft page" });
    }
  }

  // 🟢 For published pages → public can access
  res.json(page);
});

// ======================================
// ✅ ADMIN — Add new page
// ======================================
export const addPage = AsyncHandler(async (req, res) => {
  const {
    title,
    description = "",
    html = "",
    css = "",
    js = "",
    status = "draft", // default draft
  } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ message: "Title is required" });
  }

  const slug = slugify(title, { lower: true, strict: true });

  const existing = await Page.findOne({ where: { slug } });
  if (existing) return res.status(400).json({ message: "Slug already exists" });

  const page = await Page.create({
    title,
    slug,
    description,
    html: html.slice(0, 100000),
    css: css.slice(0, 50000),
    js,
    status,
  });

  res.status(201).json(page);
});

// ======================================
// ✅ ADMIN — Update page
// ======================================
export const updatePage = AsyncHandler(async (req, res) => {
  const { slug } = req.params;
  const {
    title,
    description,
    html,
    css,
    js,
    status,
    metaTitle,
    metaDescription,
    keywords,
    newSlug,
  } = req.body;

  const page = await Page.findOne({ where: { slug } });
  if (!page) return res.status(404).json({ message: "Page not found" });

  if (title !== undefined) page.title = title;
  if (description !== undefined) page.description = description;
  if (html !== undefined) page.html = html.slice(0, 100000);
  if (css !== undefined) page.css = css.slice(0, 50000);
  if (js !== undefined) page.js = js;
  if (status !== undefined) page.status = status;
  if (metaTitle !== undefined) page.metaTitle = metaTitle;
  if (metaDescription !== undefined) page.metaDescription = metaDescription;
  if (keywords !== undefined) page.keywords = keywords;

  // 🟡 Slug update
  if (newSlug !== undefined) {
    page.slug = slugify(newSlug, { lower: true, strict: true });
  } else if (title) {
    page.slug = slugify(title, { lower: true, strict: true });
  }

  await page.save();
  res.json(page);
});

// ======================================
// ✅ ADMIN — Delete page
// ======================================
export const deletePage = AsyncHandler(async (req, res) => {
  const { slug } = req.params;
  const page = await Page.findOne({ where: { slug } });

  if (!page) return res.status(404).json({ message: "Page not found" });

  await page.destroy();

  res.json({ message: "Page deleted", slug });
});

// ======================================
// ✅ ADMIN — Page Stats
// ======================================
export const getStats = AsyncHandler(async (req, res) => {
  const totalPages = await Page.count();
  const drafts = await Page.count({ where: { status: "draft" } });
  const published = await Page.count({ where: { status: "published" } });

  res.json({ totalPages, drafts, published });
});
