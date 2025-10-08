import express from "express";
import {
  getMenus,
  getMenusByLocation,
  createMenu,
  updateMenu,
  deleteMenu,
  updateMenuHierarchy,
  saveCustomContent, // added for custom HTML/CSS
  getCustomContent,  // added for fetching custom HTML/CSS
} from "../controllers/menu.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getMenus); // get all menus (flat)
router.get("/location/:location", getMenusByLocation); // get menus by location + custom content
router.post("/", authMiddleware, createMenu); // create menu
router.put("/:id", authMiddleware, updateMenu); // update menu
router.delete("/:id", authMiddleware, deleteMenu); // delete menu recursively
router.post("/hierarchy", authMiddleware, updateMenuHierarchy); // drag & drop hierarchy

router.post("/custom-content", authMiddleware, saveCustomContent); // create/update custom content
router.get("/custom-content", getCustomContent); // fetch custom HTML/CSS by section

export default router;
