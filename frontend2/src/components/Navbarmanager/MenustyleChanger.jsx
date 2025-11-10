import React, { useState, useEffect } from "react";
import axios from "axios";
import { Upload, Trash2, Image } from "lucide-react";

const API = "http://localhost:5000/api/menus/logo/navbar";

const MenuStyleEditor = ({ onStyleChange }) => {
  const [style, setStyle] = useState({
    backgroundColor: "#ffffff",
    textColor: "#000000",
    hoverColor: "#1d4ed8",
    fontSize: "16",
    fontFamily: "Arial, sans-serif",
    alignment: "left",
    sticky: false,
    mode: "basic",
    customCSS: "",
    logoUrl: "",
  });

  const [uploading, setUploading] = useState(false);
   const [showSearch, setShowSearch] = useState(true); // toggle for search

  // ✅ Load saved styles + logo
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("menu_style") || "{}");
    if (saved) setStyle((prev) => ({ ...prev, ...saved }));
  }, []);

  // ✅ Handle field changes
  const handleChange = (field, value) => {
    const updated = { ...style, [field]: value };
    setStyle(updated);
    localStorage.setItem("menu_style", JSON.stringify(updated));
    onStyleChange?.(updated);
  };

  // ✅ Handle logo upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("logo", file);

    try {
      setUploading(true);
      const res = await axios.post(API, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const logoUrl = res.data.logoUrl;
      handleChange("logoUrl", logoUrl);
    } catch (err) {
      console.error("❌ Logo upload failed:", err);
      alert("Logo upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-lg font-semibold mb-3">Menu Style Editor</h2>

      {/* ✅ Logo Upload Section */}
      <div className="flex items-center gap-3 mb-4">
        {style.logoUrl ? (
          <div className="relative">
            <img
              src={style.logoUrl}
              alt="Logo"
              className="h-12 w-12 rounded object-contain border"
            />
            <button
              onClick={() => handleChange("logoUrl", "")}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ) : (
          <label className="cursor-pointer flex items-center gap-2 bg-blue-100 text-blue-600 px-3 py-2 rounded hover:bg-blue-200 transition">
            <Upload size={16} />
            <span>{uploading ? "Uploading..." : "Upload Logo"}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {/* ✅ Basic Mode */}
      {style.mode === "basic" ? (
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col text-sm">
            Background
            <input
              type="color"
              value={style.backgroundColor}
              onChange={(e) => handleChange("backgroundColor", e.target.value)}
            />
          </label>

          <label className="flex flex-col text-sm">
            Text Color
            <input
              type="color"
              value={style.textColor}
              onChange={(e) => handleChange("textColor", e.target.value)}
            />
          </label>

          <label className="flex flex-col text-sm">
            Hover Color
            <input
              type="color"
              value={style.hoverColor}
              onChange={(e) => handleChange("hoverColor", e.target.value)}
            />
          </label>

          <label className="flex flex-col text-sm">
            Font Size
            <input
              type="number"
              value={style.fontSize}
              onChange={(e) => handleChange("fontSize", e.target.value)}
            />
          </label>

          <label className="flex flex-col text-sm col-span-2">
            Font Family
            <input
              type="text"
              value={style.fontFamily}
              onChange={(e) => handleChange("fontFamily", e.target.value)}
              placeholder="e.g., Arial, Poppins, Roboto"
            />
          </label>
              <div>
            <label className="flex items-center gap-2 text-gray-600">
              <input
                type="checkbox"
                checked={showSearch}
                onChange={(e) => setShowSearch(e.target.checked)}
              />
              Show Search Bar
            </label>
          </div>
        </div>
      ) : (
        <label className="flex flex-col text-sm mt-4">
          Custom CSS
          <textarea
            rows={5}
            value={style.customCSS}
            onChange={(e) => handleChange("customCSS", e.target.value)}
            className="border rounded-md p-2 font-mono mt-1"
            placeholder="Write custom CSS here..."
          />
        </label>
      )}
    </div>
  );
};

export default MenuStyleEditor;
