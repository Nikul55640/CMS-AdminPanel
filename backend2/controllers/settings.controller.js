import Settings from "../models/settings.model.js";

// Get a specific setting
export const getSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Settings.findOne({ where: { key } });

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: `Setting '${key}' not found`,
      });
    }

    let value = setting.value;
    // Try to parse if it looks like JSON
    try {
      value = JSON.parse(value);
    } catch (e) {
      // Keep as string if not JSON
    }

    res.json({
      success: true,
      [key]: value,
    });
  } catch (err) {
    console.error("Error fetching setting:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch setting",
    });
  }
};

// Update or create a setting
export const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (!value) {
      return res.status(400).json({
        success: false,
        message: "Value is required",
      });
    }

    const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value);

    let setting = await Settings.findOne({ where: { key } });

    if (setting) {
      setting.value = stringValue;
      await setting.save();
    } else {
      setting = await Settings.create({
        key,
        value: stringValue,
      });
    }

    res.json({
      success: true,
      message: `Setting '${key}' updated successfully`,
      [key]: value,
    });
  } catch (err) {
    console.error("Error updating setting:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update setting",
    });
  }
};

// Get all settings
export const getAllSettings = async (req, res) => {
  try {
    const settings = await Settings.findAll();
    const result = {};

    settings.forEach((s) => {
      let value = s.value;
      try {
        value = JSON.parse(value);
      } catch (e) {
        // Keep as string
      }
      result[s.key] = value;
    });

    res.json({
      success: true,
      settings: result,
    });
  } catch (err) {
    console.error("Error fetching settings:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch settings",
    });
  }
};
