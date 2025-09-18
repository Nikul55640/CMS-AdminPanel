// controllers/stats.controller.js
import Page from "../models/page.model.js";

export const getStats = async (req, res) => {
  try {
    const totalPages = await Page.countDocuments();
    const drafts = await Page.countDocuments({ status: "draft" });
    const published = await Page.countDocuments({ status: "published" });

    res.json({ totalPages, drafts, published });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats" });
  }
};
