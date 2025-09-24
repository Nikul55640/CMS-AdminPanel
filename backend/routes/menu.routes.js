// routes/menu.routes.js
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

// Public route: get all menus
router.get("/", getMenus);

// Public route: get menus by location (navbar/footer)
router.get("/location/:location", getMenusByLocation);

// Protected routes: require authentication
router.post("/", authMiddleware, createMenu);
router.put("/:id", authMiddleware, updateMenu);
router.delete("/:id", authMiddleware, deleteMenu);
router.put("/reorder", authMiddleware, reorderMenus);

export default router;
