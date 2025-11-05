import React, { useState } from "react";
import { Upload } from "lucide-react";

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

    const [uploading, setUploading] = useState(false);
    
 const handleChange = (field, value) => {
    const updated = { ...style, [field]: value };
    setStyle(updated);
    onStyleChange?.(updated);
  };

  const menuPreviewStyle = {
    backgroundColor: style.backgroundColor,
    color: style.textColor,
    fontSize: `${style.fontSize}px`,
    fontFamily: style.fontFamily,
    display: "flex",
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
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    // Temporary local preview
    const localLogoURL = URL.createObjectURL(file);

    // 🧠 If HTML already has an <img>, replace its src; else insert new
    let updatedHTML = customHTML;
    const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/i;

    if (imgRegex.test(updatedHTML)) {
      // Replace the existing <img> src with the new one
      updatedHTML = updatedHTML.replace(
        imgRegex,
        `<img src="${localLogoURL}" alt="Menu Logo" class="h-8 w-auto" />`
      );
    } else {
      // Otherwise, add logo at the top
      updatedHTML = `<img src="${localLogoURL}" alt="Menu Logo" class="h-8 w-auto" />\n${
        customHTML || ""
      }`;
    }

    setCustomHTML(updatedHTML);

    // Upload to backend
    const formData = new FormData();
    formData.append("logo", file);

    try {
      const res = await axios.put(
        `http://localhost:5000/api/menus/logo/${location}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // ✅ Replace local preview URL with actual server URL
      const serverLogoURL = `http://localhost:5000${res.data.logo}`;
      setLogoPreview(serverLogoURL);

      setCustomHTML((prevHTML) =>
        prevHTML.replace(localLogoURL, serverLogoURL)
      );
    } catch (err) {
      console.error("Logo upload failed:", err);
      alert("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-lg font-semibold mb-3">Menu Style Editor</h2>

      {/* Mode Switch */}
      <div className="flex items-center justify-between mb-4">
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
          <Upload size={18} /> {uploading ? "Uploading..." : "Upload Logo"}
        </label>

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

      {style.mode === "basic" ? (
        <>
          {/* Basic Controls */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col text-sm">
              Background
              <input
                type="color"
                value={style.backgroundColor}
                onChange={(e) =>
                  handleChange("backgroundColor", e.target.value)
                }
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
          </div>
        </>
      ) : (
        <>
          {/* Advanced Mode */}
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
        </>
      )}
    </div>
  );
};

export default MenuStyleEditor;
