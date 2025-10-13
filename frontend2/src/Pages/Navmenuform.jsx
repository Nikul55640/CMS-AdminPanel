import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

const MenuForm = ({ menu = {}, menus = [], onSave, onCancel }) => {
  const [title, setTitle] = useState(menu?.title || "");
  const [url, setUrl] = useState(menu?.url || "");
  const [pageId, setPageId] = useState(menu?.pageId || "");
  const [parentId, setParentId] = useState(menu?.parentId || null);
  const [icon, setIcon] = useState(menu?.icon || "");
  const [openInNewTab, setOpenInNewTab] = useState(menu?.openInNewTab || false);
  const [location, setLocation] = useState(menu?.location || "navbar");

  const [pages, setPages] = useState([]);
  const [linkType, setLinkType] = useState(menu?.pageId ? "page" : "url");

  const token = localStorage.getItem("token");

  useEffect(() => {
    setTitle(menu?.title || "");
    setUrl(menu?.url || "");
    setPageId(menu?.pageId || "");
    setParentId(menu?.parentId || null);
    setIcon(menu?.icon || "");
    setOpenInNewTab(menu?.openInNewTab || false);
    setLocation(menu?.location || "navbar");
    setLinkType(menu?.pageId ? "page" : "url");
  }, [menu]);

  // Fetch pages from backend
  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await axios.get(`${API}/pages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPages(res.data.pages || res.data);
      } catch (err) {
        console.error("Failed to fetch pages:", err);
      }
    };
    fetchPages();
  }, []);

  // Handle icon upload as Base64
  const handleIconUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setIcon(reader.result);
    reader.readAsDataURL(file);
  };

  // Handle page selection
  const handlePageSelect = (e) => {
    const selectedId = e.target.value;
    setPageId(selectedId || "");
    const selectedPage = pages.find((p) => p.id.toString() === selectedId);
    setUrl(selectedPage ? `/pages/${selectedPage.slug}` : "");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Title is required");

    onSave({
      ...menu,
      title,
      url: linkType === "url" ? url || null : url || null,
      pageId: linkType === "page" ? pageId || null : null,
      parentId: parentId || null,
      icon: icon || null,
      openInNewTab,
      location,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 overflow-y-auto max-h-[90vh]"
      >
        <h3 className="text-xl font-bold mb-4 text-gray-800">
          {menu?.id ? "Edit Menu Item" : "Add New Menu Item"}
        </h3>

        {/* Location */}
        <label className="block mb-4">
          <span className="font-semibold">Location *</span>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          >
            <option value="navbar">Navbar</option>
            <option value="footer">Footer</option>
          </select>
        </label>

        {/* Title */}
        <label className="block mb-4">
          <span className="font-semibold">Title *</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Menu title"
            required
          />
        </label>

        {/* Link Type */}
        <label className="block mb-4">
          <span className="font-semibold">Link Type</span>
          <select
            value={linkType}
            onChange={(e) => setLinkType(e.target.value)}
            className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="page">Page</option>
            <option value="url">External URL</option>
          </select>
        </label>

        {/* Page Selection */}
        {linkType === "page" && (
          <label className="block mb-4">
            <span className="font-semibold">Select Page</span>
            <select
              value={pageId || ""}
              onChange={handlePageSelect}
              className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">-- Select Page --</option>
              {pages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>
        )}

        {/* External URL */}
        {linkType === "url" && (
          <label className="block mb-4">
            <span className="font-semibold">External URL</span>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </label>
        )}

        {/* Open in New Tab */}
        <label className="flex items-center mb-4 gap-2">
          <input
            type="checkbox"
            checked={openInNewTab}
            onChange={(e) => setOpenInNewTab(e.target.checked)}
            className="w-4 h-4"
          />
          <span>Open in new tab</span>
        </label>

        {/* Parent Menu */}
        <label className="block mb-4">
          <span className="font-semibold">Parent Menu</span>
          <select
            value={parentId || ""}
            onChange={(e) =>
              setParentId(e.target.value === "" ? null : e.target.value)
            }
            className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">-- None (Top level) --</option>
            {menus
              .filter((m) => m.id !== menu?.id)
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
          </select>
        </label>

        {/* Icon */}
        <label className="block mb-6">
          <span className="font-semibold">Icon (optional)</span>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="Paste icon/image URL"
            className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleIconUpload}
            className="mt-2 w-full"
          />
          {icon && (
            <img
              src={icon}
              alt="icon preview"
              className="mt-2 w-12 h-12 object-contain border rounded"
            />
          )}
        </label>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default MenuForm;
