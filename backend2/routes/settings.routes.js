import express from "express";
import {
  getSetting,
  updateSetting,
  getAllSettings,
} from "../controllers/settings.controller.js";

const router = express.Router();

// Get a specific setting (e.g., /api/settings/theme)
router.get("/:key", getSetting);

// Update a setting (e.g., POST /api/settings/theme)
router.post("/:key", updateSetting);

// Get all settings
router.get("/", getAllSettings);

export default router;
