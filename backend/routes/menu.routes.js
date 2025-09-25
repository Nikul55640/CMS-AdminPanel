import express from "express";
import {
  getMenus,
  getMenusByLocation,
  createMenu,
  updateMenu,
  deleteMenu,
  reorderMenus,
} from "../controllers/menu.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getMenus);
router.get("/location/:location", getMenusByLocation);

// Protected routes
router.post("/", authMiddleware, createMenu);
router.put("/:id", authMiddleware, updateMenu);
router.delete("/:id", authMiddleware, deleteMenu);
router.put("/reorder", authMiddleware, reorderMenus);

export default router;

