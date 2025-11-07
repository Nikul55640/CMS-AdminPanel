import express from "express";
import {
  createBlog,
  getAllBlogs,
  updateBlog,
  deleteBlog,
  getBlogBySlug,
} from "../controllers/blog.controller.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Image Upload
router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  const imageUrl = `/uploads/${req.file.filename}`;
  return res.json({ imageUrl });
});

// Create Blog
router.post("/", createBlog);

// Get All Blogs
router.get("/", getAllBlogs);

// Get Blog by ID
router.get("/:id",getBlogBySlug);

// Update Blog
router.put("/:id", updateBlog);

// Delete Blog
router.delete("/:id", deleteBlog);

export default router;
