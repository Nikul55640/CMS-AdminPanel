import express from "express";
import { getContent, updateContent } from "../controllers/content.controller.js";

const router = express.Router();

// Fetch content for live preview
router.get("/content/:slug", getContent);

// Update content from editor
router.put("/content/:slug", updateContent);

export default router;
