// controllers/component.controller.js
import Component from "../models/component.model.js";

// Create new component
export const createComponent = async (req, res) => {
  try {
    const { name, category, html, css, js, fromPage, thumbnail } = req.body;

    const count = await Component.count();

    const component = await Component.create({
      name,
      category,
      html,
      css,
      js,
      fromPage,
      thumbnail,
      order: count,
    });

    res.status(201).json(component);
  } catch (err) {
    console.error("❌ Error creating component:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get all components
export const getComponents = async (req, res) => {
  try {
    const components = await Component.findAll({ order: [["order", "ASC"]] });
    res.json(components);
  } catch (err) {
    console.error("❌ Error fetching components:", err);
    res.status(500).json({ message: err.message });
  }
};

// Update component
export const updateComponent = async (req, res) => {
  try {
    const comp = await Component.findByPk(req.params.id);
    if (!comp) return res.status(404).json({ message: "Component not found" });

    await comp.update(req.body);
    res.json(comp);
  } catch (err) {
    console.error("❌ Error updating component:", err);
    res.status(500).json({ message: err.message });
  }
};

// Delete component
export const deleteComponent = async (req, res) => {
  try {
    const comp = await Component.findByPk(req.params.id);
    if (!comp) return res.status(404).json({ message: "Component not found" });

    await comp.destroy();
    res.json({ message: "Component deleted" });
  } catch (err) {
    console.error("❌ Error deleting component:", err);
    res.status(500).json({ message: err.message });
  }
};

// Move component up or down
export const moveComponent = async (req, res) => {
  try {
    const comp = await Component.findByPk(req.params.id);
    if (!comp) return res.status(404).json({ message: "Component not found" });

    const components = await Component.findAll({ order: [["order", "ASC"]] });
    const index = components.findIndex((c) => c.id === comp.id);
    if (index === -1) return res.status(404).json({ message: "Component not found" });

    const newIndex = req.params.direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= components.length) return res.status(400).json({ message: "Invalid direction" });

    await comp.update({ order: newIndex });
    res.json({ message: "Component moved" });
  } catch (err) {
    console.error("❌ Error moving component:", err);
    res.status(500).json({ message: err.message });
  }
};