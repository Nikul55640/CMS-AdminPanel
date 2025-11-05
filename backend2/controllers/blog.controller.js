// controllers/blog.controller.js
import Blog from "../models/blog.model.js";
import slugify from "slugify";

// ✅ Create Blog Post
export const createBlog = async (req, res) => {
  try {
    const { title, description, content, imageUrl, author, category, tags, status } = req.body;

    const slug = slugify(title, { lower: true, strict: true });

    const newBlog = await Blog.create({
      title,
      slug,
      description,
      content,
      imageUrl,
      author,
      category,
      tags,
      status,
      publishedAt: status === "published" ? new Date() : null,
    });

    res.status(201).json(newBlog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get All Blogs
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get Blog by Slug
export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Update Blog
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (data.title) data.slug = slugify(data.title, { lower: true, strict: true });
    if (data.status === "published" && !data.publishedAt)
      data.publishedAt = new Date();

    const updated = await Blog.findByIdAndUpdate(id, data, { new: true });
    if (!updated) return res.status(404).json({ message: "Blog not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Delete Blog
export const deleteBlog = async (req, res) => {
  try {
    const deleted = await Blog.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Blog not found" });
    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
