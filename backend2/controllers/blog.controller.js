// controllers/blog.controller.js
import { Op } from "sequelize";
import slugify from "slugify";
import Blog from "../models/blog.model.js";

// ✅ Create Blog Post
export const createBlog = async (req, res) => {
  try {
    const {
      title,
      description,
      content,
      imageUrl,
      author,
      category,
      tags,
      status,
    } = req.body;
    const slug = slugify(title, { lower: true, strict: true });
    const newBlog = await Blog.create({
      title,
      slug,
      description,
      content,
      imageUrl,
      author,
      category,
      tags: Array.isArray(tags) ? tags : JSON.parse(tags || "[]"),
      status,
      publishedAt: status === "published" ? new Date() : null,
    });

    return res.status(201).json(newBlog);
  } catch (error) {
    console.error("Create Blog Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ✅ Get All Blogs
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.findAll({
      order: [["createdAt", "DESC"]],
    });
    return res.json(blogs);
  } catch (error) {
    console.error("Get Blogs Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ✅ Get Blog by Slug
export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ where: { slug: req.params.slug } });
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    return res.json(blog);
  } catch (error) {
    console.error("Get Blog By Slug Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ✅ Update Blog
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    if (data.title) {
      data.slug = slugify(data.title, { lower: true, strict: true });
    }

    if (data.status === "published" && !data.publishedAt) {
      data.publishedAt = new Date();
    }

    const [updatedCount, updatedRows] = await Blog.update(data, {
      where: { id },
      returning: true,
    });

    if (updatedCount === 0) {
      return res.status(404).json({ message: "Blog not found" });
    }

    return res.json(updatedRows[0]);
  } catch (error) {
    console.error("Update Blog Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ✅ Delete Blog
export const deleteBlog = async (req, res) => {
  try {
    const deleted = await Blog.destroy({
      where: { id: req.params.id },
    });

    if (!deleted) return res.status(404).json({ message: "Blog not found" });

    return res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Delete Blog Error:", error);
    return res.status(500).json({ message: error.message });
  }
};
