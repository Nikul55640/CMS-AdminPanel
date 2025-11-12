// src/models/blog.model.js
import { DataTypes } from "sequelize";
import { sequelize } from "../db/sequelize.js";

const Blog = sequelize.define(
  "Blog",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    content: {
      type: DataTypes.JSON, // ✅ allows object/array content
      allowNull: false,
      defaultValue: {}, // optional but helpful
    },

    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Admin",
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "General",
    },
    tags: {
      type: DataTypes.JSON, // ✅ array of strings
      allowNull: true,
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM("draft", "published", "scheduled"),
      allowNull: false,
      defaultValue: "draft",
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // ✅ SEO + URL Handle fields
    seoTitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    seoDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    urlHandle: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
  },
  {
    tableName: "blogs",
    timestamps: true,
    underscored: false,
    hooks: {
      beforeValidate: (blog) => {
        // ✅ Auto-generate slug from title or urlHandle
        if (!blog.slug && (blog.title || blog.urlHandle)) {
          const base = blog.urlHandle || blog.title;
          blog.slug = base
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
        }

        // ✅ Auto-generate SEO title/desc if missing
        if (!blog.seoTitle && blog.title) {
          blog.seoTitle = `${blog.title} | My Blog`;
        }
        if (!blog.seoDescription && blog.description) {
          blog.seoDescription = blog.description.substring(0, 160);
        }
      },
    },
  }
);

export default Blog;
