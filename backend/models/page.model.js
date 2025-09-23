import mongoose from "mongoose";
import slugify from "slugify";

const PageSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: String,
  html: String,
  css: String,
  js: String,
  status: { type: String, enum: ["draft", "published"], default: "draft" },
  // SEO fields
  metaTitle: String,
  metaDescription: String,
  keywords: String,
}, { timestamps: true });

// Auto-generate slug if not provided or if title changes
PageSchema.pre("validate", function(next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

const Page = mongoose.model("Page", PageSchema);
export default Page;
