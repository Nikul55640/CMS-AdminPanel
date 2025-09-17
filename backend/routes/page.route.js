import express from "express";
import { getPages, addPage, updatePage } from "../controllers/page.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js"

const router = express.Router();

router.get("/", getPages);
router.post("/", authMiddleware, addPage);
router.put("/:slug", authMiddleware, updatePage);

export default router;
