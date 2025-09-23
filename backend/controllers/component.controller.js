import Component from "../models/component.model.js";

// Get all components
export const getComponents = async (req, res) => {
  try {
    const components = await Component.find().sort({ createdAt: -1 });
    res.json(components);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch components" });
  }
};

// Add a new component
export const addComponent = async (req, res) => {
  const { name, category = "General", items = [] } = req.body;

  if (!name) return res.status(400).json({ message: "Component name is required" });

  try {
    const component = new Component({ name, category, items });
    await component.save();
    res.status(201).json(component);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create component" });
  }
};

// Update component by ID
export const updateComponent = async (req, res) => {
  const { id } = req.params;
  const { name, category, items } = req.body;

  try {
    const component = await Component.findById(id);
    if (!component) return res.status(404).json({ message: "Component not found" });

    if (name !== undefined) component.name = name;
    if (category !== undefined) component.category = category;
    if (items !== undefined) component.items = items;

    await component.save();
    res.json(component);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update component" });
  }
};

// Delete component by ID
export const deleteComponent = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Component.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Component not found" });

    res.json({ message: "Component deleted successfully", component: deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete component" });
  }
};
