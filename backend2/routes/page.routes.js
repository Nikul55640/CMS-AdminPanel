import express from "express";
import {
  getPages,
  addPage,
  updatePage,
  deletePage,
  getStats,
  getPublishedPages,
  getPageBySlug,
} from "../controllers/page.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
// Optionally filter by websiteId using query parameter: /?websiteId=1
router.get("/", getPages);
router.get("/published", getPublishedPages);

// Protected routes
router.get("/stats", authMiddleware, getStats);
router.post("/", authMiddleware, addPage);
router.put("/:slug", authMiddleware, updatePage);
router.get("/:slug", getPageBySlug);
// Soft delete / archive
router.delete("/:slug", authMiddleware, deletePage);

export default router;
