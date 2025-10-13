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
  getActiveMenu,
  setActiveMenus,
} from "../controllers/menu.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getMenus);
router.get("/location/:location", getMenusByLocation);
router.get("/custom-content", getCustomContent);
router.get("/active-menu", getActiveMenu); // new route
router.post("/", authMiddleware, createMenu);
router.put("/:id", authMiddleware, updateMenu);
router.delete("/:id", authMiddleware, deleteMenu);
router.post("/hierarchy", authMiddleware, updateMenuHierarchy);
router.post("/custom-content", authMiddleware, saveCustomContent);
router.post("/set-active", authMiddleware, setActiveMenus);
router.delete("/custom-content/:section", authMiddleware, deleteCustomContent);

export default router;
