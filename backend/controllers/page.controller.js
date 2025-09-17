import Page from "../models/page.model.js";

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
  // Only accept slug and title from Page
  const { slug, title  } = req.body;

  // Validate required fields
  if (!slug || !title) {
    return res.status(400).json({ message: "Slug and title are required" });
  }
  try {
    const page = new Page({
      slug,
      title,
      description: "", // Initialize empty
      html: "",        // Initialize empty
      css: ""          // Initialize empty
    });
    await page.save();
    res.status(201).json(page);
  } catch (err) {
    res.status(500).json({ message: "Error creating page" });
    console.log(err)
  }
};

// Update page by slug
export const updatePage = async (req, res) => {
  const { slug } = req.params;
  const { html, css } = req.body;

  // Only allow html and css to be updated
  try {
    const page = await Page.findOneAndUpdate(
      { slug },
      { html, css },
      { new: true }
    );

    if (!page) return res.status(404).json({ message: "Page not found" });

    res.json(page);
  } catch (err) {
    res.status(500).json({ message: "Error updating page" });
  }
};
