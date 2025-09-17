import mongoose from "mongoose";

const PageSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: String,
  description: String,
  html: String,
  css: String,

});
const Page = mongoose.model("Page", PageSchema);

export default Page
