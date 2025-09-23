import express from "express";
import { createComponent, getComponents, updateComponent, deleteComponent } from "../controllers/component.controller.js";

const router = express.Router();

router.post("/", createComponent);
router.get("/", getComponents);
router.put("/:id", updateComponent);
router.delete("/:id", deleteComponent);

export default router;
