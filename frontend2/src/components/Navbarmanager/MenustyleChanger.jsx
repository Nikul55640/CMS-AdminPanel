import React, { useState, useEffect } from "react";
import axios from "axios";
import { Upload, Trash2, Image } from "lucide-react";

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
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // ✅ Load saved logo on mount
  useEffect(() => {
    const savedLogo = localStorage.getItem("menu_logo");
    if (savedLogo) setLogoPreview(savedLogo);
  }, []);

  // ✅ Update style + notify parent
  const handleChange = (field, value) => {
    const updated = { ...style, [field]: value };
    setStyle(updated);
    onStyleChange?.(updated);
  };

  // ✅ Upload logo to backend
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const localURL = URL.createObjectURL(file);
    setLogoPreview(localURL);

    try {
      const formData = new FormData();
      formData.append("logo", file);

      const res = await axios.post(
        "http://localhost:5000/api/menus/logo/navbar",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const serverURL = res.data?.logoUrl || localURL;
      setLogoPreview(serverURL);
      localStorage.setItem("menu_logo", serverURL);
    } catch (err) {
      console.error("❌ Logo upload failed:", err);
      alert("Logo upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Remove logo
  const handleRemoveLogo = () => {
    setLogoPreview(null);
    localStorage.removeItem("menu_logo");
  };

  // ✅ Menu preview styles
  const menuPreviewStyle = {
    backgroundColor: style.backgroundColor,
    color: style.textColor,
    fontSize: `${style.fontSize}px`,
    fontFamily: style.fontFamily,
    display: "flex",
    alignItems: "center",
    justifyContent:
      style.alignment === "center"
        ? "center"
        : style.alignment === "right"
        ? "flex-end"
        : "flex-start",
    position: style.sticky ? "sticky" : "relative",
    top: style.sticky ? 0 : "auto",
    padding: "10px 20px",
    gap: "20px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-lg font-semibold mb-3">Menu Style Editor</h2>

      {/* ✅ Upload Logo */}
      <div className="mb-4 flex items-center gap-4">
        <input
          type="file"
          accept="image/*"
          id="logo-upload"
          className="hidden"
          onChange={handleLogoUpload}
        />
        <label
          htmlFor="logo-upload"
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600 transition-colors"
        >
          <Upload size={18} />
          {uploading ? "Uploading..." : "Upload Logo"}
        </label>

        {logoPreview && (
          <div className="flex items-center gap-3">
            <img
              src={logoPreview}
              alt="Logo Preview"
              className="h-10 w-10 object-contain border rounded-md"
            />
            <button
              onClick={handleRemoveLogo}
              className="p-2 text-red-500 hover:text-red-600 bg-gray-100 rounded-md"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* ✅ Mode Switch */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-medium text-gray-600">Mode:</span>
        <select
          value={style.mode}
          onChange={(e) => handleChange("mode", e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="basic">Basic</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {/* ✅ Basic Mode Editor */}
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

          <label className="flex flex-col text-sm">
            Alignment
            <select
              value={style.alignment}
              onChange={(e) => handleChange("alignment", e.target.value)}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm mt-2">
            <input
              type="checkbox"
              checked={style.sticky}
              onChange={(e) => handleChange("sticky", e.target.checked)}
            />
            Sticky Navbar
          </label>

          {/* ✅ Alignment Buttons */}
          <div className="flex gap-3 mt-4 col-span-2">
            {["left", "center", "right"].map((align) => (
              <button
                key={align}
                onClick={() => handleChange("alignment", align)}
                className={`px-3 py-1 rounded ${
                  style.alignment === align
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {align.charAt(0).toUpperCase() + align.slice(1)}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* ✅ Advanced Mode */
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

      {/* ✅ Live Preview */}
      <div className="mt-6 p-4 rounded-md border bg-gray-50">
        <h3 className="text-sm font-semibold mb-2 text-gray-600">
          Live Preview
        </h3>
        <div style={menuPreviewStyle}>
          {logoPreview ? (
            <img
              src={logoPreview}
              alt="Logo"
              className="h-8 w-8 object-contain"
            />
          ) : (
            <Image className="h-6 w-6 text-gray-400" />
          )}
          <nav className="flex gap-4">
            {["Home", "About", "Contact"].map((item) => (
              <span
                key={item}
                style={{
                  cursor: "pointer",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = style.hoverColor)}
                onMouseLeave={(e) => (e.target.style.color = style.textColor)}
              >
                {item}
              </span>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default MenuStyleEditor;
