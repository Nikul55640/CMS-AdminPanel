// controllers/component.controller.js
import Component from "../models/component.model.js";
import { AsyncHandler } from "../utils/ApiHelpers.js";

// Create component
export const createComponent = AsyncHandler(async (req, res) => {
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
});

// Get all components
export const getComponents = AsyncHandler(async (req, res) => {
  const components = await Component.findAll({ order: [["order", "ASC"]] });
  res.json(components);
});

// Update component
export const updateComponent = AsyncHandler(async (req, res) => {
  const comp = await Component.findByPk(req.params.id);
  if (!comp) return res.status(404).json({ message: "Component not found" });

  await comp.update(req.body);
  res.json(comp);
});

// Delete component
export const deleteComponent = AsyncHandler(async (req, res) => {
  const comp = await Component.findByPk(req.params.id);
  if (!comp) return res.status(404).json({ message: "Component not found" });

  await comp.destroy();
  res.json({ message: "Component deleted" });
});

// Move component up/down
export const moveComponent = AsyncHandler(async (req, res) => {
  const comp = await Component.findByPk(req.params.id);
  if (!comp) return res.status(404).json({ message: "Component not found" });

  const components = await Component.findAll({ order: [["order", "ASC"]] });
  const index = components.findIndex((c) => c.id === comp.id);
  if (index === -1)
    return res.status(404).json({ message: "Component not found" });

  const newIndex = req.params.direction === "up" ? index - 1 : index + 1;
  if (newIndex < 0 || newIndex >= components.length)
    return res.status(400).json({ message: "Invalid direction" });

  // Swap orders
  const otherComp = components[newIndex];
  await comp.update({ order: newIndex });
  await otherComp.update({ order: index });

  res.json({ message: "Component moved" });
});

// Get single component
export const getComponent = AsyncHandler(async (req, res) => {
  const comp = await Component.findByPk(req.params.id);
  if (!comp) return res.status(404).json({ message: "Component not found" });

  res.json(comp);
});

