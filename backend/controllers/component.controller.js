import Component from "../models/component.model.js"; 

// Create new component (from saved page section)
export const createComponent = async (req, res) => {
  try {
    const { name, category, html, css, js, fromPage, thumbnail } = req.body;
    const count = await Component.countDocuments();

    const component = new Component({
      name, category, html, css, js, fromPage, thumbnail, order: count
    });

    await component.save();
    res.status(201).json(component);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all components
export const getComponents = async (req, res) => {
  try {
    const components = await Component.find().sort({ order: 1 });
    res.json(components);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update component
export const updateComponent = async (req, res) => {
  try {
    const comp = await Component.findById(req.params.id);
    if (!comp) return res.status(404).json({ message: "Component not found" });

    Object.assign(comp, req.body);
    await comp.save();
    res.json(comp);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete component
export const deleteComponent = async (req, res) => {
  try {
    const comp = await Component.findByIdAndDelete(req.params.id);
    if (!comp) return res.status(404).json({ message: "Component not found" });
    res.json({ message: "Component deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
