import NavbarSettings from "../models/navbar.model.js";

// Get settings
export const getNavbarSettings = async (req, res) => {
  try {
    const settings = await NavbarSettings.findOne();
    if (!settings)
      return res.status(404).json({ message: "No settings found" });
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch navbar settings" });
  }
};

// Update settings
export const updateNavbarSettings = async (req, res) => {
  try {
    let settings = await NavbarSettings.findOne();
    if (!settings) {
      settings = new NavbarSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update navbar settings" });
  }
};
