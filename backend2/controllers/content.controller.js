import Page from "../models/page.model.js"; // or Component if for components

// Get content by slug (or ID)
export const getContent = async (req, res) => {
  const { slug } = req.params;

  try {
    const page = await Page.findOne({ where: { slug } });
    if (!page) return res.status(404).json({ message: "Content not found" });

    res.json({
      html: page.html || "",
      css: page.css || "",
      js: page.js || "",
    });
  } catch (err) {
    console.error("❌ Failed to fetch content:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update content by slug (or ID)
export const updateContent = async (req, res) => {
  const { slug } = req.params;
  const { html, css, js } = req.body;

  try {
    const page = await Page.findOne({ where: { slug } });
    if (!page) return res.status(404).json({ message: "Content not found" });

    if (html !== undefined) page.html = html;
    if (css !== undefined) page.css = css;
    if (js !== undefined) page.js = js;

    await page.save();
    res.json({ message: "Content updated", html: page.html, css: page.css, js: page.js });
  } catch (err) {
    console.error("❌ Failed to update content:", err);
    res.status(500).json({ message: "Server error" });
  }
};
