import express from "express";
import {
  getMenus,
  getMenusByLocation,
  createMenu,
  updateMenu,
  deleteMenu,
  updateMenuHierarchy,
  saveCustomContent,
  getCustomContent,
  deleteCustomContent,
  setActiveMenus,
} from "../controllers/menu.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// ---------------- PUBLIC ROUTES ---------------- //

// Get all menus (flat)
router.get("/", getMenus);

// Get menus by location (nested + active menu info)
router.get("/location/:location", getMenusByLocation);

// Get custom content for a section
router.get("/custom-content", getCustomContent);

// ---------------- AUTHENTICATED ROUTES ---------------- //

// Create a new menu
router.post("/", authMiddleware, createMenu);

// Update a menu by ID
router.put("/:id", authMiddleware, updateMenu);

// Delete a menu by ID (recursively deletes submenus)
router.delete("/:id", authMiddleware, deleteMenu);

// Update menu hierarchy (drag & drop)
router.post("/hierarchy", authMiddleware, updateMenuHierarchy);

// Save custom content for a section
router.post("/custom-content", authMiddleware, saveCustomContent);

// Delete custom content for a section
router.delete("/custom-content/:section", authMiddleware, deleteCustomContent);

// Set active menus for a section (supports multiple + custom)
router.post("/set-active", authMiddleware, setActiveMenus);

export default router;
