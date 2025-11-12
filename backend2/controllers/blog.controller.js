import { Op } from "sequelize";
import slugify from "slugify";
import Blog from "../models/blog.model.js";

export const fetchBlog = async (req, res) => {
  try {
    const { slug } = req.params;
    console.log(`🔹 [FetchBlog] Searching for: ${slug}`);

    const blog = await Blog.findOne({
      where: {
        [Op.or]: [
          { slug },
          { urlHandle: slug },
          { id: isNaN(slug) ? 0 : Number(slug) },
        ],
      },
    });

    if (!blog) {
      console.warn(`⚠️ [FetchBlog] Blog not found: ${slug}`);
      return res.status(404).json({ message: "Blog not found" });
    }

    console.log(`✅ [FetchBlog] Blog found: ${blog.id}`);
    return res.json(blog);
  } catch (error) {
    console.error("❌ [FetchBlog] Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const fetchBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔹 [FetchBlogById] Searching for ID: ${id}`);

    const blog = await Blog.findByPk(id);

    if (!blog) {
      console.warn(`⚠️ [FetchBlogById] Blog not found: ${id}`);
      return res.status(404).json({ message: "Blog not found" });
    }

    console.log(`✅ [FetchBlogById] Blog found: ${blog.id}`);
    return res.json(blog);
  } catch (error) {
    console.error("❌ [FetchBlogById] Error:", error);
    return res.status(500).json({ message: error.message });
  }
};



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
      seoTitle,
      seoDescription,
      urlHandle,
      publishedAt,
    } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    const slug = slugify(urlHandle || title, { lower: true, strict: true });

    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
      ? tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const newBlog = await Blog.create({
      title,
      slug,
      description,
      content,
      imageUrl: imageUrl || "",
      author: author || "Admin",
      category: category || "General",
      tags: parsedTags,
      status: status || "draft",
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || description || "",
      urlHandle: slug,
      publishedAt:
        status === "published"
          ? new Date()
          : status === "scheduled" && publishedAt
          ? new Date(publishedAt)
          : null,
    });

    console.log(`✅ [CreateBlog] Blog created: ${newBlog.id}`);
    return res.status(201).json(newBlog);
  } catch (error) {
    console.error("❌ [CreateBlog] Error:", error);
    return res.status(500).json({ message: error.message });
  }
};


export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.findAll({ order: [["createdAt", "DESC"]] });
    console.log(`📄 [GetAllBlogs] Found ${blogs.length} blogs`);
    return res.json(blogs);
  } catch (error) {
    console.error("❌ [GetAllBlogs] Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    console.log(`🛠️ [UpdateBlog] Updating blog ID: ${id}`, data);

    if (data.title || data.urlHandle) {
      data.slug = slugify(data.urlHandle || data.title, {
        lower: true,
        strict: true,
      });
    }

    if (data.status === "published" && !data.publishedAt) {
      data.publishedAt = new Date();
    } else if (data.status === "scheduled" && data.publishedAt) {
      data.publishedAt = new Date(data.publishedAt);
    }

    if (data.tags && typeof data.tags === "string") {
      data.tags = data.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    const [updatedCount, updatedRows] = await Blog.update(data, {
      where: { id },
      returning: true,
    });

    if (updatedCount === 0) {
      console.warn(`⚠️ [UpdateBlog] Blog not found: ${id}`);
      return res.status(404).json({ message: "Blog not found" });
    }

    console.log(`✅ [UpdateBlog] Blog updated: ${id}`);
    return res.json(updatedRows[0]);
  } catch (error) {
    console.error("❌ [UpdateBlog] Error:", error);
    return res.status(500).json({ message: error.message });
  }
};


export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ [DeleteBlog] Deleting blog ID: ${id}`);

    const deleted = await Blog.destroy({ where: { id } });

    if (!deleted) {
      console.warn(`⚠️ [DeleteBlog] Blog not found: ${id}`);
      return res.status(404).json({ message: "Blog not found" });
    }

    console.log(`✅ [DeleteBlog] Blog deleted: ${id}`);
    return res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("❌ [DeleteBlog] Error:", error);
    return res.status(500).json({ message: error.message });
  }
};
