// routes/blog.routes.js
import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
} from "../controllers/blog.controller.js";
import upload from "../middleware/upload.js";

const router = express.Router();
router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});
router.post("/", createBlog);
router.get("/", getAllBlogs);
router.get("/:slug", getBlogBySlug);
router.put("/:id", updateBlog);
router.delete("/:id", deleteBlog);

export default router;
