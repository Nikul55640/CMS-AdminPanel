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

// ❌ Do NOT expose all pages publicly
// router.get("/", getPages);

// ✅ Public should only see published pages
router.get("/published", getPublishedPages);

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
   MUST BE LAST → Slug route
   ============================================ */

// Both public + admin can view page by slug
router.get("/:slug", getPageBySlug);

export default router;
