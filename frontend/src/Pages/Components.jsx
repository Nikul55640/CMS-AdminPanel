import { useContext, useState, useEffect } from "react";
import CmsContext from "../context/CmsContext";
import axios from "axios";
import toast from "react-hot-toast";

const ComponentForm = () => {
  const { token, addComponent, components, fetchComponents, removeComponent } =
    useContext(CmsContext);

  const [form, setForm] = useState({
    name: "",
    html: "",
    css: "",
    js: "",
  });

  const [editingId, setEditingId] = useState(null); // Track editing
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    if (token) fetchComponents();
  }, [token]);

  // Save or update component
  const handleSave = async () => {
    if (!form.name) return toast.error("Please enter a component name!");

    try {
      if (editingId) {
        // Update
        await axios.put(
          `http://localhost:5000/api/components/${editingId}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Component updated!");
        fetchComponents();
        setEditingId(null);
      } else {
        // Create
        const res = await axios.post(
          "http://localhost:5000/api/components",
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        addComponent(res.data);
        toast.success("Component created!");
      }

      setForm({ name: "", html: "", css: "", js: "" });
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error(err.response?.data?.message || "Failed to save component");
    }
  };

  // Delete component
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/components/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      removeComponent(id);
      toast.success("Component deleted!");
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error(err.response?.data?.message || "Failed to delete component");
    }
  };

  // Edit component → fills form
  const handleEdit = (cmp) => {
    setEditingId(cmp.id);
    setForm({ name: cmp.name, html: cmp.html, css: cmp.css, js: cmp.js });
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to form
  };

  // Preview component
  const handlePreview = (cmp) => {
    const newWindow = window.open("", "_blank");
    const previewHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>Preview - ${cmp.name}</title>
        <style>
          body { font-family: sans-serif; margin: 20px; }
          ${cmp.css || ""}
        </style>
      </head>
      <body>
        ${cmp.html || ""}
        <script>${cmp.js || ""}</script>
      </body>
      </html>
    `;
    newWindow.document.write(previewHTML);
    newWindow.document.close();
  };

  // Copy to clipboard
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text || "").then(() => {
      toast.success(`${label} copied to clipboard`);
    });
  };

  // Toggle HTML preview
  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded shadow-md mb-6 w-full max-w-5xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">
        {editingId ? "Edit Component" : "Create New Component"}
      </h2>

      {/* Form */}
      <div className="flex flex-col gap-3 mb-4">
        <input
          placeholder="Component Name"
          className="border rounded p-2 w-full"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <textarea
          placeholder="HTML"
          className="border rounded p-2 w-full h-24"
          value={form.html}
          onChange={(e) => setForm({ ...form, html: e.target.value })}
        />
        <textarea
          placeholder="CSS"
          className="border rounded p-2 w-full h-24"
          value={form.css}
          onChange={(e) => setForm({ ...form, css: e.target.value })}
        />
        <textarea
          placeholder="JavaScript"
          className="border rounded p-2 w-full h-24"
          value={form.js}
          onChange={(e) => setForm({ ...form, js: e.target.value })}
        />
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full sm:w-auto"
          onClick={handleSave}
        >
          {editingId ? "Update Component" : "Save Component"}
        </button>
      </div>

      {/* Component List */}
      <h2 className="text-xl font-bold mt-6 mb-2">Saved Components</h2>
      <ul className="flex flex-col gap-3">
        {components.map((cmp) => (
          <li
            key={cmp.id}
            className="border p-3 rounded bg-gray-50 shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center"
          >
            <div>
              <strong>{cmp.name}</strong>
              <p className="text-xs text-gray-500">
                Created:{" "}
                {new Date(cmp.createdAt || Date.now()).toLocaleString()}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
              <button
                onClick={() => handlePreview(cmp)}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
              >
                Preview
              </button>
              {cmp.html && (
                <>
                  <button
                    onClick={() => copyToClipboard(cmp.html, "HTML")}
                    className="bg-gray-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Copy HTML
                  </button>
                  <button
                    onClick={() => copyToClipboard(cmp.css, "CSS")}
                    className="bg-gray-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Copy CSS
                  </button>
                  <button
                    onClick={() => copyToClipboard(cmp.js, "JS")}
                    className="bg-gray-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Copy JS
                  </button>
                </>
              )}
              <button
                className="bg-yellow-500 text-white px-2 py-1 rounded"
                onClick={() => handleEdit(cmp)}
              >
                Edit
              </button>
              <button
                className="bg-red-500 text-white px-2 py-1 rounded"
                onClick={() => handleDelete(cmp.id)}
              >
                Delete
              </button>
            </div>

            {/* Expand HTML Preview */}
            {cmp.html && (
              <button
                onClick={() => toggleExpand(cmp.id)}
                className="text-sm text-blue-600 mt-2 sm:mt-0"
              >
                {expanded[cmp.id] ? "Hide Preview ↓" : "Show Preview →"}
              </button>
            )}
            {expanded[cmp.id] && (
              <div
                className="mt-2 border p-3 bg-white rounded"
                dangerouslySetInnerHTML={{ __html: cmp.html }}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ComponentForm;
