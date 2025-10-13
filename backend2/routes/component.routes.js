import express from "express";
import {
  createComponent,
  getComponents,
  updateComponent,
  deleteComponent,
} from "../controllers/component.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Public
router.get("/", getComponents);

// Protected
router.post("/", authMiddleware, createComponent);
router.put("/:id", authMiddleware, updateComponent);
router.delete("/:id", authMiddleware, deleteComponent);

export default router;
