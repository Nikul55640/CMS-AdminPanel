import express from "express";
import {
  getComponents,
  addComponent,
  updateComponent,
  deleteComponent,
} from "../controllers/component.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Get all reusable components
router.get("/", authMiddleware, getComponents);

// Add a new component
router.post("/", authMiddleware, addComponent);

// Update a component by ID
router.put("/:id", authMiddleware, updateComponent);

// Delete a component by ID
router.delete("/:id", authMiddleware, deleteComponent);

export default router;
