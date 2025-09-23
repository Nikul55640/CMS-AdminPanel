import mongoose from "mongoose";

const componentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, default: "General" },
    html: { type: String, default: "" },
    css: { type: String, default: "" },
    js: { type: String, default: "" },
    thumbnail: { type: String, default: "" }, // optional preview image
    order: { type: Number, default: 0 },
    fromPage: { type: String, default: "" }, // optional: page it came from
  },
  { timestamps: true }
);

export default mongoose.model("Component", componentSchema);
