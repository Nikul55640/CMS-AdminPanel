import Menu from "../models/menu.models.js";

// Get all menus
export const getMenus = async (req, res) => {
  try {
    const menus = await Menu.find().sort({ order: 1 });
    res.json(menus);
  } catch (error) {
    res.status(500).json({ message: "Error fetching menus" });
  }
};

// Get menus by location
export const getMenusByLocation = async (req, res) => {
  const { location } = req.params;
  try {
    const menus = await Menu.find({ location, parentId: null }).sort({
      order: 1,
    });
    const menusWithChildren = await Promise.all(
      menus.map(async (menu) => {
        const children = await Menu.find({ parentId: menu._id }).sort({
          order: 1,
        });
        return { ...menu._doc, children };
      })
    );
    res.json(menusWithChildren);
  } catch (error) {
    res.status(500).json({ message: "Error fetching menus" });
  }
};
// Create a menu
export const createMenu = async (req, res) => {
  try {
    const { title, url, location } = req.body;
    const order = (await Menu.countDocuments()) || 0;
    const menu = await Menu.create({ title, url, location, order });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: "Error creating menu" });
  }
};

// Update a menu
export const updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Menu.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating menu" });
  }
};

// Delete a menu
export const deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;
    await Menu.findByIdAndDelete(id);
    res.json({ message: "Menu deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting menu" });
  }
};

// Update multiple menu orders
export const reorderMenus = async (req, res) => {
  try {
    const { menus } = req.body; // [{ _id, order }]
    const updates = menus.map((menu) =>
      Menu.findByIdAndUpdate(menu._id, { order: menu.order })
    );
    await Promise.all(updates);
    res.json({ message: "Menus reordered" });
  } catch (error) {
    res.status(500).json({ message: "Error reordering menus" });
  }
};
