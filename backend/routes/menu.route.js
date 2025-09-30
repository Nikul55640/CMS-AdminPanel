import express from "express";
import {
  getMenus,
  getMenusByLocation,
  createMenu,
  updateMenu,
  deleteMenu,
  updateMenuHierarchy,
} from "../controllers/menu.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// CRUD
router.get("/", getMenus);
router.get("/location/:location", getMenusByLocation);
router.post("/", authMiddleware, createMenu);
router.put("/:id", authMiddleware, updateMenu);
router.delete("/:id", authMiddleware, deleteMenu);

// ✅ Hierarchy update
router.put("/hierarchy", authMiddleware, updateMenuHierarchy);

export default router;
