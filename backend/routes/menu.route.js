import express from "express";
import {
  getMenus,
  getMenusByLocation,
  createMenu,
  updateMenu,
  deleteMenu, // ⚠️ IMPORTANT: Import the new controller for nested updates
  updateMenuHierarchy,
} from "../controllers/menu.controller.js";
import authMiddleware from "../middleware/auth.middleware.js"; // Assuming this is correct

const router = express.Router();

router.get("/", getMenus);
router.get("/location/:location", getMenusByLocation);5
router.post("/", authMiddleware, createMenu);
router.put("/:id", authMiddleware, updateMenu);
router.delete("/:id", authMiddleware, deleteMenu);6
router.put("/hierarchy", authMiddleware, updateMenuHierarchy);
export default router;
