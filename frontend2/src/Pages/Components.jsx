import { useContext, useState, useEffect } from "react";
import CmsContext from "../context/CmsContext";
import axios from "axios";
import toast from "react-hot-toast";
import { Save, Eye, Pencil, Trash } from "lucide-react";

const ComponentForm = () => {
  const { addComponent, components, fetchComponents, removeComponent } =
    useContext(CmsContext);

  const [form, setForm] = useState({ name: "", html: "", css: "", js: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    // Fetch components on mount
    fetchComponents();
  }, []);

  const handleSave = async () => {
    if (!form.name) return toast.error("⚠️ Enter a component name!");

    try {
      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/components/${editingId}`,
          form,
          { withCredentials: true } // send cookies automatically
        );
        toast.success("✅ Component updated!");
        fetchComponents();
        setEditingId(null);
      } else {
        const res = await axios.post(
          "http://localhost:5000/api/components",
          form,
          { withCredentials: true } // send cookies automatically
        );
        addComponent(res.data);
        toast.success("✅ Component created!");
      }
      setForm({ name: "", html: "", css: "", js: "" });
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error(err.response?.data?.message || "❌ Failed to save component");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/components/${id}`, {
        withCredentials: true, // send cookies automatically
      });
      removeComponent(id);
      toast.success("✅ Component deleted!");
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error(
        err.response?.data?.message || "❌ Failed to delete component"
      );
    }
  };

  const handleEdit = (cmp) => {
    setEditingId(cmp.id);
    setForm({ name: cmp.name, html: cmp.html, css: cmp.css, js: cmp.js });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePreview = (cmp) => {
    const newWindow = window.open("", "_blank");
    const previewHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>Preview - ${cmp.name}</title>
        <style>
          body { font-family: 'Inter', sans-serif; margin: 20px; background: #f9f9f9; }
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

  return (
    <div className="max-w-3xl mx-auto mt-12 bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 text-center border bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <h1 className="text-xl font-bold tracking-wide">
          {editingId ? "Edit Component" : "Create Component"}
        </h1>
        <p className="mt-1 text-sm opacity-90">
          Build reusable components for your website. Clean, fast, and
          intuitive.
        </p>
      </div>

      {/* Form */}
      <div className="px-8 py-6 space-y-5 border rounded-br-2xl rounded-bl-2xl ">
        <div className="flex flex-col">
          <label className="mb-1 text-gray-700 font-bold">
            Component Name *
          </label>
          <input
            type="text"
            placeholder="Header Component"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 transition"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-gray-700 font-bold">HTML</label>
          <textarea
            placeholder="<div>Hello World</div>"
            value={form.html}
            onChange={(e) => setForm({ ...form, html: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 min-h-[100px] transition"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-gray-700 font-bold">CSS</label>
          <textarea
            placeholder="div { color: red; }"
            value={form.css}
            onChange={(e) => setForm({ ...form, css: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 min-h-[80px] transition"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-gray-700 font-bold">JavaScript</label>
          <textarea
            placeholder="console.log('Hello');"
            value={form.js}
            onChange={(e) => setForm({ ...form, js: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 min-h-[80px] transition"
          />
        </div>

        <button
          onClick={handleSave}
          className={`w-full sm:w-auto px-6 py-2 flex gap-2 rounded-lg font-semibold text-white transition ${
            editingId
              ? "bg-yellow-500 hover:bg-yellow-600"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          <Save /> {editingId ? "Update Component" : "Save Component"}
        </button>
      </div>

      {/* Saved Components */}
      <div className="px-8 py-6 border-t border-gray-200 space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Saved Components</h2>
        {components.length === 0 && (
          <p className="text-gray-500">
            No components yet. Start by creating one above!
          </p>
        )}
        <ul className="space-y-3">
          {components.map((cmp) => (
            <li
              key={cmp.id}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm hover:shadow-md transition"
            >
              <div>
                <strong className="text-gray-800">{cmp.name}</strong>
                <p className="text-xs text-gray-500 mt-1">
                  Created:{" "}
                  {new Date(cmp.createdAt || Date.now()).toLocaleString()}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
                <button
                  onClick={() => handlePreview(cmp)}
                  className="bg-blue-500 text-white px-3 py-1 flex gap-1 hover:cursor-pointer rounded-lg hover:bg-blue-600 text-sm transition"
                >
                  <Eye size={20} /> Preview
                </button>
                <button
                  onClick={() => handleEdit(cmp)}
                  className="bg-yellow-500 hover:cursor-pointer flex gap-1 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 text-sm transition"
                >
                  <Pencil size={20} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(cmp.id)}
                  className="bg-red-500 text-white px-3 py-1 flex gap-1 hover:cursor-pointer rounded-lg hover:bg-red-600 text-sm transition"
                >
                  <Trash size={20} /> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ComponentForm;
