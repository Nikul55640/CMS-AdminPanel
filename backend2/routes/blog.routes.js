import express from "express";
import {
  createBlog,
  getAllBlogs,
  updateBlog,
  deleteBlog,
  fetchBlog,
  fetchBlogById,
} from "../controllers/blog.controller.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      console.warn("⚠️ No file received in upload request");
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    console.log("✅ [Upload] File uploaded successfully:", imageUrl);

    return res.json({ imageUrl });
  } catch (error) {
    console.error("❌ [Upload] Error handling upload:", error);
    return res.status(500).json({ message: "Upload failed", error: error.message });
  }
});


router.get("/slug/:slug", fetchBlog); // fetch by slug/urlHandle/ID
router.get("/id/:id", fetchBlogById); // fetch by numeric ID

// ------------------------
// ✅ CRUD routes
// ------------------------
router.post("/", createBlog);
router.get("/", getAllBlogs);
router.put("/:id", updateBlog);
router.delete("/:id", deleteBlog);

export default router;
