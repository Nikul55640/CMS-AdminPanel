import mongoose from "mongoose";

const menuSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  location: {
    type: String,
    enum: ["navbar", "footer", "none"],
    default: "none",
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Menu",
    default: null,
  }, // parent for submenu
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Menu", menuSchema);
