import React, { useState } from "react";
import axios from "axios";
import { X, Upload, Trash2 } from "lucide-react";

const tabs = ["HTML", "CSS", "JS"];

const CustomContentDialog = ({
  open,
  onClose,
  customHTML,
  customCSS,
  customJS,
  setCustomHTML,
  setCustomCSS,
  setCustomJS,
  customActiveTab,
  setCustomActiveTab,
  onSave,
  onDelete,
  location = "navbar", // default for logo upload
}) => {
  const [logoPreview, setLogoPreview] = useState("");
  const [uploading, setUploading] = useState(false);

  if (!open) return null;

  const activeContent =
    customActiveTab === "HTML"
      ? customHTML
      : customActiveTab === "CSS"
      ? customCSS
      : customJS;

  const setActiveContent =
    customActiveTab === "HTML"
      ? setCustomHTML
      : customActiveTab === "CSS"
      ? setCustomCSS
      : setCustomJS;

  // 🟢 Handle Logo Upload
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

  // 🟢 Handle Logo Delete
  const handleLogoDelete = () => {
    setLogoPreview("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h2 className="font-semibold text-lg text-gray-800">
            Custom Navbar Content
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* 🟢 Logo Upload Section */}
        <div className="p-4 border-b bg-white">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Menu Logo
          </label>

          <div className="flex items-center gap-4">
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

            {logoPreview && (
              <div className="flex items-center gap-3">
                <img
                  src={logoPreview}
                  alt="Menu Logo"
                  className="w-16 h-16 object-contain border rounded-md shadow-sm"
                />
                <button
                  onClick={handleLogoDelete}
                  className="p-2 text-red-500 hover:text-red-700 transition"
                  title="Remove Logo"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setCustomActiveTab(tab)}
              className={`flex-1 py-2 text-sm font-medium transition-all ${
                customActiveTab === tab
                  ? "bg-blue-500 text-white shadow-inner"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex flex-col md:flex-row flex-1 overflow-auto p-4 gap-4 bg-white">
          {/* Code Editor */}
          <div className="flex-1 flex flex-col min-h-[300px]">
            <label className="text-sm font-medium text-gray-700 mb-2">
              {customActiveTab} Editor
            </label>
            <textarea
              className="flex p-3 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-2 shadow-sm"
              placeholder={`Write your ${customActiveTab} here...`}
              value={activeContent}
              onChange={(e) => setActiveContent(e.target.value)}
            />
          </div>

          {/* Live Preview */}
          <div className="flex-1 flex flex-col min-h-[200px]">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Live Preview
            </label>
            <iframe
              className="border border-gray-300 rounded-lg shadow-sm bg-white"
              title="Custom Content Preview"
              sandbox="allow-scripts"
              srcDoc={`<!DOCTYPE html><html><head><style>${customCSS}</style></head><body>${customHTML}<script>${customJS}</script></body></html>`}
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end flex-wrap gap-2 p-4 border-t bg-gray-50">
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomContentDialog;
