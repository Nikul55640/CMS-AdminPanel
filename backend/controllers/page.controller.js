import Page from "../models/page.model.js";
import slugify from "slugify";

// Get all pages
export const getPages = async (req, res) => {
  try {
    const pages = await Page.find();
    res.json(pages);
  } catch (err) {
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
    const existingPage = await Page.findOne({ slug });
    if (existingPage)
      return res.status(400).json({ message: "Slug already exists" });

    const page = new Page({ slug, title, description, html, css, js });
    await page.save();
    res.status(201).json(page);
  } catch (err) {
    console.error(err);
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
    const page = await Page.findOne({ slug });
    if (!page) return res.status(404).json({ message: "Page not found" });

    if (title !== undefined) {
      page.title = title;
      if (!newSlug) page.slug = slugify(title, { lower: true, strict: true });
    }
    if (description !== undefined) page.description = description;
    if (html !== undefined) page.html = html.slice(0, 50000); // limit length
    if (css !== undefined) page.css = css.slice(0, 50000); // limit length
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
    console.error(err);
    res.status(500).json({ message: "Failed to update page" });
  }
};

// Delete page by slug
export const deletePage = async (req, res) => {
  try {
    const { slug } = req.params;
    const deletedPage = await Page.findOneAndDelete({ slug });

    if (!deletedPage)
      return res.status(404).json({ message: "Page not found" });

    res.json({ message: "Page deleted successfully", page: deletedPage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting page" });
  }
};
