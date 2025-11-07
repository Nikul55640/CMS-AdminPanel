// src/models/blog.model.js
import { DataTypes } from "sequelize";
import { sequelize } from "../db/sequelize.js";

const Blog = sequelize.define(
  "Blog",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
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
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    image_url: {
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
      type: DataTypes.JSON, // array of strings
      allowNull: true,
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM("draft", "published", "scheduled"),
      allowNull: false,
      defaultValue: "draft",
    },
    published_At: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "blogs",
    timestamps: true,
    hooks: {
      beforeValidate: (blog) => {
        if (!blog.slug && blog.title) {
          blog.slug = blog.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
        }
      },
    },
  }
);

export default Blog;
