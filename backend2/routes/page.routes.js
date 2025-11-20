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

/* ============================================
   PUBLIC ROUTES
   ============================================ */

// Show published pages list
router.get("/published", getPublishedPages);

// ⭐ NEW → Public single page route
router.get("/public/:slug", getPageBySlug);

/* ============================================
   PROTECTED (ADMIN ONLY)
   ============================================ */

// Admin can see all pages
router.get("/", authMiddleware, getPages);

// Admin stats
router.get("/stats", authMiddleware, getStats);

// Create page
router.post("/", authMiddleware, addPage);

// Update page
router.put("/:slug", authMiddleware, updatePage);

// Delete page
router.delete("/:slug", authMiddleware, deletePage);

/* ============================================
   MUST BE LAST → Slug route for admin preview
   ============================================ */

// Admin or preview: /pages/home
router.get("/:slug", getPageBySlug);

export default router;
