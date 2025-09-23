import mongoose from "mongoose";

// Subitem (dropdown) schema
const subItemSchema = new mongoose.Schema({
  label: { type: String, required: true },
  link: { type: String, default: "#" },
});

// Main item schema
const itemSchema = new mongoose.Schema({
  label: { type: String, required: true },
  link: { type: String, default: "#" },
  children: [subItemSchema], // Nested dropdown items
});

// Component schema
const componentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: "General" },
  items: [itemSchema], // Stores items with subitems
  createdAt: { type: Date, default: Date.now },
});

const Component = mongoose.model("Component", componentSchema);
export default Component;
