import { useContext, useState, useEffect } from "react";
import CmsContext from "../context/CmsContext";
import axios from "axios";
import toast from "react-hot-toast";

const ComponentForm = () => {
  const { token, addComponent, components, fetchComponents, removeComponent } =
    useContext(CmsContext);

  const [form, setForm] = useState({
    name: "",
    data: { html: "", css: "", js: "" },
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
          `http://localhost:8000/api/components/${editingId}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Component updated!");
        fetchComponents();
        setEditingId(null);
      } else {
        // Create
        const res = await axios.post(
          "http://localhost:8000/api/components",
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        addComponent(res.data);
        toast.success("Component created!");
      }

      setForm({ name: "", data: { html: "", css: "", js: "" } });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save component");
    }
  };

  // Delete component
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/components/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      removeComponent(id);
      toast.success("Component deleted!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete component");
    }
  };

  // Edit component → fills form
  const handleEdit = (cmp) => {
    setEditingId(cmp._id);
    setForm({ name: cmp.name, data: { ...cmp.data } });
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
          ${cmp.data.css || ""}
        </style>
      </head>
      <body>
        ${cmp.data.html || ""}
        <script>${cmp.data.js || ""}</script>
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

  // Filter components
  const filteredComponents = components.filter(
    (cmp) =>
      cmp.name.toLowerCase()||
      cmp.type?.toLowerCase()
  );

  return (
    <div className="p-4 bg-white rounded shadow mb-4">
      <h2 className="text-xl font-bold mb-2">
        {editingId ? "Edit Component" : "Create New Component"}
      </h2>

      {/* Form */}
      <input
        placeholder="Component Name"
        className="border p-2 w-full mb-2"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <textarea
        placeholder="HTML"
        className="border p-2 w-full mb-2 h-24"
        value={form.data.html}
        onChange={(e) =>
          setForm({ ...form, data: { ...form.data, html: e.target.value } })
        }
      />
      <textarea
        placeholder="CSS"
        className="border p-2 w-full mb-2 h-24"
        value={form.data.css}
        onChange={(e) =>
          setForm({ ...form, data: { ...form.data, css: e.target.value } })
        }
      />
      <textarea
        placeholder="JavaScript"
        className="border p-2 w-full mb-4 h-24"
        value={form.data.js}
        onChange={(e) =>
          setForm({ ...form, data: { ...form.data, js: e.target.value } })
        }
      />

      <button
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        onClick={handleSave}
      >
        {editingId ? "Update Component" : "Save Component"}
      </button>

      {/* Component List */}
      <h2 className="text-xl font-bold mt-6 mb-2">Saved Components</h2>
      <ul>
        {filteredComponents.map((cmp) => (
          <li
            key={cmp._id}
            className="border p-3 mb-3 rounded bg-gray-50 shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div>
                <strong>{cmp.name}</strong>
                <p className="text-xs text-gray-500">
                  Created:{" "}
                  {new Date(cmp.createdAt || Date.now()).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePreview(cmp)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                >
                  Preview
                </button>
                {cmp.data?.html && (
                  <>
                    <button
                      onClick={() => copyToClipboard(cmp.data.html, "HTML")}
                      className="bg-gray-500 text-white px-2 py-1 rounded text-sm"
                    >
                      Copy HTML
                    </button>
                    <button
                      onClick={() => copyToClipboard(cmp.data.css, "CSS")}
                      className="bg-gray-500 text-white px-2 py-1 rounded text-sm"
                    >
                      Copy CSS
                    </button>
                    <button
                      onClick={() => copyToClipboard(cmp.data.js, "JS")}
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
                  onClick={() => handleDelete(cmp._id)}
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Expand HTML Preview */}
            {cmp.data?.html && (
              <button
                onClick={() => toggleExpand(cmp._id)}
                className="text-sm text-blue-600 mt-2"
              >
                {expanded[cmp._id] ? "Hide Preview ↓" : "Show Preview →"}
              </button>
            )}
            {expanded[cmp._id] && (
              <div
                className="mt-2 border p-3 bg-white rounded"
                dangerouslySetInnerHTML={{ __html: cmp.data.html }}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ComponentForm;
