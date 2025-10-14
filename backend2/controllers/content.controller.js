// controllers/content.controller.js
import Page from "../models/page.model.js";
import { AsyncHandler } from "../utils/api.js";

// Get content by slug
export const getContent = AsyncHandler(async (req, res) => {
  const { slug } = req.params;

  const page = await Page.findOne({ where: { slug } });
  if (!page) return res.status(404).json({ message: "Content not found" });

  res.json({
    html: page.html || "",
    css: page.css || "",
    js: page.js || "",
  });
});

// Update content by slug
export const updateContent = AsyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { html, css, js } = req.body;

  const page = await Page.findOne({ where: { slug } });
  if (!page) return res.status(404).json({ message: "Content not found" });

  if (html !== undefined) page.html = html;
  if (css !== undefined) page.css = css;
  if (js !== undefined) page.js = js;

  await page.save();

  res.json({ message: "Content updated", html: page.html, css: page.css, js: page.js });
});


// Get all contents (for admin)
export const getAllContents = AsyncHandler(async (req, res) => {
  const pages = await Page.findAll({
    attributes: ['id', 'slug', 'title', 'description', 'status', 'updatedAt']
  });
  res.json(pages);
});