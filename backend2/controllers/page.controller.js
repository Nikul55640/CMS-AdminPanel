import Page from "../models/page.model.js";
import slugify from "slugify";
import { AsyncHandler } from "../utils/ApiHelpers.js";

// Get all pages
export const getPages = AsyncHandler(async (req, res) => {
  const pages = await Page.findAll();
  res.json(pages);
});

// Get all published pages
export const getPublishedPages = AsyncHandler(async (req, res) => {
  const pages = await Page.findAll({ where: { status: "published" } });
  res.json(pages);
});

// Get a single page by slug
export const getPageBySlug = AsyncHandler(async (req, res) => {
  const { slug } = req.params;
  const page = await Page.findOne({ where: { slug } });
  if (!page) return res.status(404).json({ message: "Page not found" });
  res.json(page);
});

// Add a new page
export const addPage = AsyncHandler(async (req, res) => {
  const {
    slug="",
    title,
    description = "",
    html = "",
    css = "",
    js = "",
  } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Title required" });
  }

  const existingPage = await Page.findOne({ where: { slug } });
  if (existingPage) {
    return res.status(400).json({ message: "Slug already exists" });
  }

  const page = await Page.create({ slug, title, description, html, css, js });
  res.status(201).json(page);
});

// Update page by slug
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

  if (title !== undefined) {
    page.title = title;
    if (!newSlug) page.slug = slugify(title, { lower: true, strict: true });
  }
  if (description !== undefined) page.description = description;
  if (html !== undefined) page.html = html.slice(0, 50000);
  if (css !== undefined) page.css = css.slice(0, 50000);
  if (js !== undefined) page.js = js;
  if (status !== undefined) page.status = status;
  if (metaTitle !== undefined) page.metaTitle = metaTitle;
  if (metaDescription !== undefined) page.metaDescription = metaDescription;
  if (keywords !== undefined) page.keywords = keywords;
  if (newSlug !== undefined)
    page.slug = slugify(newSlug, { lower: true, strict: true });

  await page.save();
  res.json(page);
});

// Delete page by slug
export const deletePage = AsyncHandler(async (req, res) => {
  const { slug } = req.params;
  const page = await Page.findOne({ where: { slug } });
  if (!page) return res.status(404).json({ message: "Page not found" });

  await page.destroy();
  res.json({ message: "Page deleted", page });
});

// Get page stats
export const getStats = AsyncHandler(async (req, res) => {
  const totalPages = await Page.count();
  const drafts = await Page.count({ where: { status: "draft" } });
  const published = await Page.count({ where: { status: "published" } });

  res.json({ totalPages, drafts, published });
});
