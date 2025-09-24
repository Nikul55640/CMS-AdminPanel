// controllers/page.controller.js
import Page from "../models/page.model.js";
import slugify from "slugify";
import { Op } from "sequelize";

// Get all pages
export const getPages = async (req, res) => {
  try {
    const pages = await Page.findAll();
    res.json(pages);
  } catch (err) {
    console.error("❌ Error fetching pages:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Add a new page
export const addPage = async (req, res) => {
  const {
    slug,
    title,
    description = "",
    html = "",
    css = "",
    js = "",
  } = req.body;

  if (!slug || !title)
    return res.status(400).json({ message: "Slug and title are required" });

  try {
    const existingPage = await Page.findOne({ where: { slug } });
    if (existingPage)
      return res.status(400).json({ message: "Slug already exists" });

    const page = await Page.create({ slug, title, description, html, css, js });
    res.status(201).json(page);
  } catch (err) {
    console.error("❌ Error creating page:", err);
    res.status(500).json({ message: "Error creating page" });
  }
};

// Update page by slug
export const updatePage = async (req, res) => {
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

  try {
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
  } catch (err) {
    console.error("❌ Failed to update page:", err);
    res.status(500).json({ message: "Failed to update page" });
  }
};

// Delete page by slug
export const deletePage = async (req, res) => {
  const { slug } = req.params;

  try {
    const page = await Page.findOne({ where: { slug } });
    if (!page) return res.status(404).json({ message: "Page not found" });

    await page.destroy();
    res.json({ message: "Page deleted successfully", page });
  } catch (err) {
    console.error("❌ Error deleting page:", err);
    res.status(500).json({ message: "Error deleting page" });
  }
};

// Get all published pages
export const getPublishedPages = async (req, res) => {
  try {
    const pages = await Page.findAll({ where: { status: "published" } });
    res.json(pages);
  } catch (err) {
    console.error("❌ Error fetching published pages:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getStats = async (req, res) => {
  try {
    // Total pages
    const totalPages = await Page.count();

    // Draft pages
    const drafts = await Page.count({
      where: { status: "draft" },
    });

    // Published pages
    const published = await Page.count({
      where: { status: "published" },
    });

    res.json({ totalPages, drafts, published });
  } catch (err) {
    console.error("❌ Error fetching stats:", err);
    res.status(500).json({ message: "Error fetching stats" });
  }
};
