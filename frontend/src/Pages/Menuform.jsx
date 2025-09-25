// src/components/MenuForm.jsx
import { useState, useEffect } from "react";

const MenuForm = ({ menu, pages, menus, onSave, onCancel }) => {
  const [title, setTitle] = useState(menu?.title || "");
  const [url, setUrl] = useState(menu?.url || "");
  const [pageId, setPageId] = useState(menu?.pageId || "");
  const [parentId, setParentId] = useState(menu?.parentId || "");

  useEffect(() => {
    if (menu) {
      setTitle(menu.title || "");
      setUrl(menu.url || "");
      setPageId(menu.pageId || "");
      setParentId(menu.parentId || "");
    }
  }, [menu]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return alert("Title is required");

    onSave({
      ...menu,
      title,
      url,
      pageId: pageId || null,
      parentId: parentId || null,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4">
          {menu?.id ? "Edit Menu" : "Add Menu"}
        </h2>

        <label className="block mb-2 font-semibold">Title</label>
        <input
          className="border p-2 w-full mb-3 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="block mb-2 font-semibold">URL</label>
        <input
          className="border p-2 w-full mb-3 rounded"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <label className="block mb-2 font-semibold">Linked Page</label>
        <select
          className="border p-2 w-full mb-3 rounded"
          value={pageId || ""}
          onChange={(e) => setPageId(e.target.value)}
        >
          <option value="">-- None --</option>
          {pages.map((p) => (
            <option key={p._id} value={p._id}>
              {p.title}
            </option>
          ))}
        </select>

        <label className="block mb-2 font-semibold">Parent Menu</label>
        <select
          className="border p-2 w-full mb-4 rounded"
          value={parentId || ""}
          onChange={(e) => setParentId(e.target.value)}
        >
          <option value="">-- None --</option>
          {menus
            .filter((m) => !menu || m.id !== menu.id)
            .map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
        </select>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default MenuForm;
