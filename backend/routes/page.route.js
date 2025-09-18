import express from "express";
import { getPages, addPage, updatePage, deletePage } from "../controllers/page.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getStats } from "../controllers/status.controller.js";

const router = express.Router();

router.get("/", getPages);
router.post("/", authMiddleware, addPage);
router.put("/:slug", authMiddleware, updatePage);
router.delete("/:slug", authMiddleware, deletePage); // ✅ Delete route
router.get("/stats", authMiddleware, getStats);

export default router;
