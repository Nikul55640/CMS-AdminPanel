// src/components/MenuManager.jsx
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import CmsContext from "../context/CmsContext";
import MenuForm from "./MenuForm.jsx";

const API = "http://localhost:8000/api";

const MenuItem = ({ item, onEdit, onDelete, onAddSubmenu, level = 0 }) => (
  <div style={{ paddingLeft: level * 20 + 8, marginBottom: 4 }}>
    <div className="flex justify-between items-center p-2 border rounded bg-white">
      <span>{item.title}</span>
      <div className="flex gap-2">
        <button
          onClick={() => onAddSubmenu(item)}
          className="px-2 py-1 bg-green-500 text-white rounded"
        >
          Add
        </button>
        <button
          onClick={() => onEdit(item)}
          className="px-2 py-1 bg-blue-500 text-white rounded"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(item)}
          className="px-2 py-1 bg-red-500 text-white rounded"
        >
          Delete
        </button>
      </div>
    </div>

    {item.children?.length > 0 &&
      item.children.map((child) => (
        <MenuItem
          key={child.id}
          item={child}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddSubmenu={onAddSubmenu}
          level={level + 1}
        />
      ))}
  </div>
);

const buildTree = (list) => {
  const map = {};
  const roots = [];

  list.forEach((item) => {
    map[item.id] = {
      ...item,
      children: item.children ? [...item.children] : [],
    };
  });

  list.forEach((item) => {
    if (item.parentId && map[item.parentId]) {
      map[item.parentId].children.push(map[item.id]);
    } else if (!item.parentId) {
      roots.push(map[item.id]);
    }
  });

  return roots;
};

const MenuManager = () => {
  const { menus, token, pages, fetchMenus } = useContext(CmsContext);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);

  // --- Navbar Settings ---
  const [navbarSettings, setNavbarSettings] = useState({
    logo: "",
    bg: "#1f2937",
    text: "#ffffff",
    hover: "#facc15",
    fontSize: "16px",
    align: "left",
    customClass: "",
    sticky: false,
    showLogin: false,
    showSearch: false,
  });

  const [tempSettings, setTempSettings] = useState({ ...navbarSettings });

  useEffect(() => {
    fetchMenus("navbar");

    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API}/navbar/settings`);
        setNavbarSettings(res.data);
        setTempSettings(res.data);
      } catch (err) {
        console.warn("⚠️ No navbar settings found, using defaults", err);
      }
    };
    fetchSettings();
  }, [token, fetchMenus]);

  const handleTempChange = (key, value) => {
    setTempSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveNavbarSettings = async () => {
    try {
      await axios.put(`${API}/navbar/settings`, tempSettings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNavbarSettings(tempSettings);
      toast.success("✅ Navbar settings updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update navbar settings");
    }
  };

  const openAddForm = (parent) => {
    setEditingMenu({ parentId: parent?.id || null });
    setShowForm(true);
  };
  const openEditForm = (menu) => {
    setEditingMenu(menu);
    setShowForm(true);
  };

  const handleSaveMenu = async (data) => {
    try {
      setLoading(true);
      if (data.id) {
        await axios.put(`${API}/menus/${data.id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(
          `${API}/menus`,
          { ...data, location: "navbar" },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      fetchMenus("navbar");
      setShowForm(false);
      toast.success("✅ Menu saved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save menu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (menu) => {
    if (!window.confirm(`Delete menu "${menu.title}"?`)) return;
    try {
      await axios.delete(`${API}/menus/${menu.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMenus("navbar");
      toast.success("✅ Deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    }
  };

  const nestedMenus = buildTree(menus || []);
  const renderLink = (menu) =>
    menu.pageId
      ? `/pages/${pages.find((p) => p.id === menu.pageId)?.slug || ""}`
      : menu.link || "#";

  const renderMenu = (menu) => (
    <div key={menu.id} className="relative inline-block mx-2 group">
      <a
        href={renderLink(menu)}
        target={menu.openInNewTab ? "_blank" : "_self"}
        className="px-2 py-1 inline-flex items-center gap-1 rounded transition-colors"
        style={{ color: tempSettings.text }}
        onMouseEnter={(e) => (e.currentTarget.style.color = tempSettings.hover)}
        onMouseLeave={(e) => (e.currentTarget.style.color = tempSettings.text)}
      >
        {menu.title}
        {menu.children?.length > 0 && <span className="ml-1">▼</span>}
      </a>
      {menu.children?.length > 0 && (
        <div
          className="absolute hidden group-hover:block rounded mt-1 shadow-lg min-w-[150px] z-20"
          style={{ backgroundColor: tempSettings.bg }}
        >
          {menu.children.map(renderMenu)}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Menu Manager</h2>

      {/* Navbar Settings */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6 shadow">
        <h3 className="text-lg font-semibold mb-3">Navbar Settings</h3>

        {/* Logo */}
        <div className="mb-3">
          <label className="block mb-1 font-medium">Logo</label>
          <input
            type="text"
            value={tempSettings.logo}
            onChange={(e) => handleTempChange("logo", e.target.value)}
            placeholder="Paste image URL"
            className="w-full border p-2 rounded mb-2"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => handleTempChange("logo", reader.result);
              reader.readAsDataURL(file);
            }}
          />
          {tempSettings.logo && (
            <img
              src={tempSettings.logo}
              alt="Logo"
              className="h-12 mt-2 object-contain"
            />
          )}
        </div>

        {/* Colors */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          {["bg", "text", "hover"].map((key) => (
            <div key={key}>
              <label className="block font-medium mb-1">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
              <input
                type="color"
                value={tempSettings[key]}
                onChange={(e) => handleTempChange(key, e.target.value)}
                className="w-full h-8"
              />
            </div>
          ))}
        </div>

        {/* Font & Alignment */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {["fontSize", "align"].map((key) => (
            <div key={key}>
              <label className="block font-medium mb-1">
                {key === "fontSize" ? "Font Size" : "Alignment"}
              </label>
              <select
                value={tempSettings[key]}
                onChange={(e) => handleTempChange(key, e.target.value)}
                className="w-full border p-2 rounded"
              >
                {key === "fontSize"
                  ? ["14px", "16px", "18px", "20px"].map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))
                  : ["left", "center", "right"].map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
              </select>
            </div>
          ))}
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          {[
            { key: "sticky", label: "Sticky Navbar" },
            { key: "showLogin", label: "Show Login" },
            { key: "showSearch", label: "Show Search" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={tempSettings[key]}
                onChange={(e) => handleTempChange(key, e.target.checked)}
              />
              {label}
            </label>
          ))}
        </div>

        {/* Custom Class */}
        <label className="block font-medium mb-3">
          Custom Class
          <input
            type="text"
            value={tempSettings.customClass}
            onChange={(e) => handleTempChange("customClass", e.target.value)}
            placeholder="e.g. sticky-navbar"
            className="w-full border p-2 rounded mt-1"
          />
        </label>

        {/* Save Navbar Settings Button */}
        <button
          onClick={saveNavbarSettings}
          className="px-4 py-2 bg-blue-600 text-white rounded mb-3"
        >
          Save Navbar Settings
        </button>

        {/* Live Preview */}
        <div
          className={`p-3 rounded ${tempSettings.customClass} ${
            tempSettings.sticky ? "sticky top-0" : ""
          }`}
          style={{
            backgroundColor: tempSettings.bg,
            color: tempSettings.text,
            fontSize: tempSettings.fontSize,
            textAlign: tempSettings.align,
          }}
        >
          {tempSettings.logo && (
            <img
              src={tempSettings.logo}
              alt="Logo"
              className="h-10 inline-block mr-2"
            />
          )}
          {nestedMenus.map(renderMenu)}
          {tempSettings.showLogin && (
            <button className="ml-4 px-3 py-1 bg-blue-600 text-white rounded">
              Login / Signup
            </button>
          )}
          {tempSettings.showSearch && (
            <input
              type="text"
              placeholder="Search..."
              className="ml-4 px-2 py-1 border rounded"
            />
          )}
        </div>
      </div>

      {/* Menu Management */}
      <button
        onClick={() => openAddForm(null)}
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded"
      >
        Add Menu
      </button>
      {nestedMenus.map((item) => (
        <MenuItem
          key={item.id}
          item={item}
          onEdit={openEditForm}
          onDelete={handleDelete}
          onAddSubmenu={openAddForm}
        />
      ))}
      {showForm && (
        <MenuForm
          menu={editingMenu}
          menus={menus || []}
          pages={pages || []}
          onSave={handleSaveMenu}
          onCancel={() => setShowForm(false)}
        />
      )}
      {loading && <p>Loading...</p>}
    </div>
  );
};

export default MenuManager;
