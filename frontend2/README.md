# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

4. Content Library

Reusable Components
Text blocks, Hero sections, Forms
Preview + Drag to page
Media Library
Upload / delete / reuse images & videos
Optional: Categorize media

5. Settings Page

Site-wide configuration:
Site title, favicon, logo
Theme colors, fonts
SEO meta defaults
Admin user management

6. Optional Pages / Features

Analytics
Page views
Last edited by / updated
Preview Mode
Live preview of pages without publishing
Roles & Permissions
Admin, Editor, Viewer
Restrict editing / publishing

 const handleExportSelected = () => {
    if (selectedPages.length === 0) return;

    const exportData = pages.filter((p) => selectedPages.includes(p.slug));

    const textContent = exportData
      .map(
        (p) =>
          `Title: ${p.title || "Untitled"} | Slug: ${p.slug} | Status: ${
            p.status || "draft"
          } | Created: ${
            p.createdAt ? new Date(p.createdAt).toLocaleString() : "-"
          } | Updated: ${
            p.updatedAt ? new Date(p.updatedAt).toLocaleString() : "-"
          }`
      )
      .join("\n");

    const blob = new Blob([textContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = selectedPages.join(",") + ".txt";
    link.click();

    toast.success("✅ Selected pages exported as text file!");
  };
import { useContext, useState, useEffect, useCallback } from "react";
import CmsContext from "../context/CmsContext";
import axios from "axios";
import toast from "react-hot-toast";
import { Save, Eye, Pencil, Trash, Code, X } from "lucide-react"; // Added Code and X icons

// --- Modal Component (Basic implementation) ---
// In a real application, you'd put this in its own file (e.g., Modal.jsx)
const CodeEditorModal = ({ isOpen, onClose, language, code, onCodeChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-full max-h-[80vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">
            Edit {language.toUpperCase()}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        {/* Code Editor Area (Placeholder) */}
        <div className="flex-grow p-4 relative">
         
          <textarea
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            className="w-full h-full border border-gray-300 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`Enter your ${language} code here...`}
          />
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};


const ComponentForm = () => {
  const { token, addComponent, components, fetchComponents, removeComponent } =
    useContext(CmsContext);

  const [form, setForm] = useState({ name: "", html: "", css: "", js: "" });
  const [editingId, setEditingId] = useState(null);

  // State for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeEditor, setActiveEditor] = useState(""); // 'html', 'css', or 'js'

  useEffect(() => {
    if (token) fetchComponents();
  }, [token]);

  // Function to open the modal for a specific editor
  const openModal = (editorType) => {
    setActiveEditor(editorType);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setActiveEditor("");
  }, []);

  // Function to handle code changes from the modal
  const handleCodeChange = (newCode) => {
    setForm((prevForm) => ({ ...prevForm, [activeEditor]: newCode }));
  };

  const handleSave = async () => {
    if (!form.name) return toast.error("⚠️ Enter a component name!");

    try {
      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/components/${editingId}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("✅ Component updated!");
        fetchComponents();
        setEditingId(null);
      } else {
        const res = await axios.post(
          "http://localhost:5000/api/components",
          form,
          { headers: { Authorization: `Bearer ${token}` } }
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
        headers: { Authorization: `Bearer ${token}` },
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
    <div className="max-w-3xl mx-auto mt-10">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <h1 className="text-2xl font-bold tracking-wide">
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
              className="w-full border border-gray-300 rounded-lg px-4 py-2  transition"
            />
          </div>

          {/* HTML Editor Button */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-700 font-bold">HTML</label>
            <button
              onClick={() => openModal("html")}
              className="flex items-center justify-center gap-2 bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-200 transition text-gray-700 font-semibold"
            >
              <Code size={20} />
              Open HTML Editor (
              {form.html.length > 0 ? "Edit Code" : "Add Code"})
            </button>
          </div>

          {/* CSS Editor Button */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-700 font-bold">CSS</label>
            <button
              onClick={() => openModal("css")}
              className="flex items-center justify-center gap-2 bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-200 transition text-gray-700 font-semibold"
            >
              <Code size={20} />
              Open CSS Editor ({form.css.length > 0 ? "Edit Code" : "Add Code"})
            </button>
          </div>

          {/* JavaScript Editor Button */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-700 font-bold">JavaScript</label>
            <button
              onClick={() => openModal("js")}
              className="flex items-center justify-center gap-2 bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-200 transition text-gray-700 font-semibold"
            >
              <Code size={20} />
              Open JavaScript Editor (
              {form.js.length > 0 ? "Edit Code" : "Add Code"})
            </button>
          </div>

          <button
            onClick={handleSave}
            className={`w-full sm:w-auto px-6 py-2 flex gap-2 rounded-lg font-semibold text-white transition ${
              editingId
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            <Save />
            {editingId ? "Update Component" : " Save Component"}
          </button>
        </div>

        {/* Saved Components Section (rest of the code remains the same) */}
        {/* ... (Saved Components div) */}
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
                    className="bg-blue-500 text-white px-3 py-1 flex gap-1  hover:cursor-pointer rounded-lg hover:bg-blue-600 text-sm transition"
                  >
                    <Eye size={20} /> Preview
                  </button>
                  <button
                    onClick={() => handleEdit(cmp)}
                    className="bg-yellow-500 hover:cursor-pointer flex gap-1  text-white px-3 py-1 rounded-lg hover:bg-yellow-600 text-sm transition"
                  >
                    <Pencil size={20} />  Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cmp.id)}
                    className="bg-red-500 text-white px-3 py-1 flex gap-1  hover:cursor-pointer rounded-lg hover:bg-red-600 text-sm transition"
                  >
                    <Trash size={20} />  Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>


      <CodeEditorModal
        isOpen={isModalOpen}
        onClose={closeModal}
        language={activeEditor}
        code={form[activeEditor] || ""} // Pass the code for the active editor
        onCodeChange={handleCodeChange}
      />
    </div>
  );
};

export default ComponentForm;
