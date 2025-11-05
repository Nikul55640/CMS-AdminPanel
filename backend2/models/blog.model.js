// models/blog.model.js
import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    default: "",
  },
  author: {
    type: String,
    default: "Admin",
  },
  category: {
    type: String,
    default: "General",
  },
  tags: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ["draft", "published"],
    default: "draft",
  },
  publishedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Blog", blogSchema);
