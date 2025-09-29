import express from "express";
import {
  getNavbarSettings,
  updateNavbarSettings,
} from "../controllers/navbar.controller.js";

const router = express.Router();

router.get("/settings", getNavbarSettings);
router.put("/settings", updateNavbarSettings); // ✅ PUT endpoint

export default router;
