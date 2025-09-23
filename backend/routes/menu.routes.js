import express from "express";
import {
  getMenus,
  getMenusByLocation,
  createMenu,
  updateMenu,
  deleteMenu,
  reorderMenus,
} from "../controllers/menu.controller.js";

const router = express.Router();

router.get("/", getMenus);
router.get("/location/:location", getMenusByLocation);
router.post("/", createMenu);
router.put("/:id", updateMenu);
router.delete("/:id", deleteMenu);
router.put("/reorder", reorderMenus);

export default router;
