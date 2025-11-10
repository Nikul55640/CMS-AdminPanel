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
      type: DataTypes.JSON, // store array of strings directly
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
  },
  {
    tableName: "blogs",
    timestamps: true, // adds createdAt, updatedAt automatically
    underscored: false, //
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
