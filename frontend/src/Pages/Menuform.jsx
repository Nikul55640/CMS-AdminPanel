// src/components/MenuForm.jsx
import { useState, useEffect } from "react";

const MenuForm = ({ menu = {}, menus = [], pages = [], onSave, onCancel }) => {
  const [title, setTitle] = useState(menu?.title || "");
  const [link, setLink] = useState(menu?.link || "");
  const [pageId, setPageId] = useState(menu?.pageId || "");
  const [parentId, setParentId] = useState(menu?.parentId || "");
  const [icon, setIcon] = useState(menu?.icon || "");
  const [openInNewTab, setOpenInNewTab] = useState(menu?.openInNewTab || false);

  useEffect(() => {
    setTitle(menu?.title || "");
    setLink(menu?.link || "");
    setPageId(menu?.pageId || "");
    setParentId(menu?.parentId || "");
    setIcon(menu?.icon || "");
    setOpenInNewTab(menu?.openInNewTab || false);
  }, [menu]);

  const handleIconUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setIcon(reader.result);
    reader.readAsDataURL(file);
  };

  const handlePageSelect = (e) => {
    const selectedId = e.target.value;
    setPageId(selectedId || "");
    const selectedPage = pages.find((p) => p.parent_id.toString() === selectedId);
    setLink(selectedPage ? `/pages/${selectedPage.slug}` : "");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Title is required");

    onSave({
      ...menu,
      title,
      link: link || null,
      pageId: pageId || null,
      parentId: parentId || null,
      icon: icon || null,
      openInNewTab,
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

        {/* Link / Page */}
        <label className="block mb-4">
          <span className="font-semibold">Link / Page</span>
          <select
            value={pageId || ""}
            onChange={handlePageSelect}
            className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
          >
            <option value="">-- Select Page (optional) --</option>
            {pages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={link}
            onChange={(e) => {
              setLink(e.target.value);
              setPageId(""); // clear pageId if manually editing
            }}
            placeholder="External link e.g. https://example.com"
            className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </label>

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
            className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Paste icon/image URL"
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
