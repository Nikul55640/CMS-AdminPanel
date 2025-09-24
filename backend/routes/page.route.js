// routes/page.routes.js
import express from "express";
import {
  getPages,
  addPage,
  updatePage,
  deletePage,
  getStats,
  getPublishedPages,
} from "../controllers/page.controller.js";
import  authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Public route: get all pages
router.get("/", getPages);
router.get("/published", getPublishedPages);
router.get("/stats",authMiddleware, getStats); // ✅ new route
// Protected routes: require authentication
router.post("/", authMiddleware, addPage);
router.put("/:slug", authMiddleware, updatePage);
router.delete("/:slug", authMiddleware, deletePage);



export default router;
