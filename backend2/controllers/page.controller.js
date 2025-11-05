import Page from "../models/page.model.js";
import slugify from "slugify";
import { AsyncHandler } from "../utils/ApiHelpers.js";

// ✅ Get all pages (admin only)
export const getPages = AsyncHandler(async (req, res) => {
  const pages = await Page.findAll({ order: [["createdAt", "DESC"]] });
  res.json(pages);
});

// ✅ Get all published pages (public)
export const getPublishedPages = AsyncHandler(async (req, res) => {
  const pages = await Page.findAll({
    where: { status: "published" },
    order: [["createdAt", "DESC"]],
  });
  res.json(pages);
});

// ✅ Get a single page by slug (only if published or admin)
export const getPageBySlug = AsyncHandler(async (req, res) => {
  const { slug } = req.params;
  const page = await Page.findOne({ where: { slug } });

  if (!page) return res.status(404).json({ message: "Page not found" });

  // Check if draft — block for public
  if (page.status === "draft" && !req.user) {
    return res
      .status(403)
      .json({ message: "Unauthorized access to draft page" });
  }

  res.json(page);
});

// ✅ Add a new page
export const addPage = AsyncHandler(async (req, res) => {
  const {
    title,
    description = "",
    html = "",
    css = "",
    js = "",
    status = "draft",
  } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ message: "Title is required" });
  }

  // Generate slug automatically
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

// ✅ Update page by slug
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

  // Update fields dynamically
  if (title !== undefined) page.title = title;
  if (description !== undefined) page.description = description;
  if (html !== undefined) page.html = html.slice(0, 100000);
  if (css !== undefined) page.css = css.slice(0, 50000);
  if (js !== undefined) page.js = js;
  if (status !== undefined) page.status = status;
  if (metaTitle !== undefined) page.metaTitle = metaTitle;
  if (metaDescription !== undefined) page.metaDescription = metaDescription;
  if (keywords !== undefined) page.keywords = keywords;
  if (newSlug !== undefined) {
    const newSlugified = slugify(newSlug, { lower: true, strict: true });
    page.slug = newSlugified;
  } else if (title) {
    page.slug = slugify(title, { lower: true, strict: true });
  }

  await page.save();
  res.json(page);
});

// ✅ Delete page by slug
export const deletePage = AsyncHandler(async (req, res) => {
  const { slug } = req.params;
  const page = await Page.findOne({ where: { slug } });
  if (!page) return res.status(404).json({ message: "Page not found" });

  await page.destroy();
  res.json({ message: "Page deleted", slug });
});


export const getStats = AsyncHandler(async (req, res) => {
  const totalPages = await Page.count();
  const drafts = await Page.count({ where: { status: "draft" } });
  const published = await Page.count({ where: { status: "published" } });

  res.json({ totalPages, drafts, published });
});
