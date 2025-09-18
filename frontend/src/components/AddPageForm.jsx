import { useState, useContext, useRef, useEffect } from "react";
import StudioEditor from "@grapesjs/studio-sdk/react";
import "@grapesjs/studio-sdk/style";
import { layoutSidebarButtons } from "@grapesjs/studio-sdk-plugins";
import PageContext from "../context/PageContext";
import axios from "axios";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";

const AddPageForm = () => {
  const { pages = [], setPages, token } = useContext(PageContext);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorKey, setEditorKey] = useState(0); // used to remount the editor
  const editorRef = useRef(null); // real editor instance

  const [pageContent, setPageContent] = useState({ html: "", css: "" });

  // Open editor fresh
  const openEditor = () => {
    // Destroy any previous instance just in case
    if (editorRef.current && typeof editorRef.current.destroy === "function") {
      try { editorRef.current.destroy(); } catch (e) { console.log(e) }
      editorRef.current = null;
    }

    setEditorKey(Date.now()); // new key -> new instance
    setEditorOpen(true);
  };

  // Close and destroy editor instance
  const closeEditor = () => {
    if (editorRef.current && typeof editorRef.current.destroy === "function") {
      try { editorRef.current.destroy(); } catch (e) { console.log(e)}
    }
    editorRef.current = null;
    setEditorOpen(false);
    setEditorKey(0);
  };

  // Save editor content to local state
  const handleSaveEditorContent = () => {
    const ed = editorRef.current;
    if (!ed) return toast.error("Editor not ready yet!");
    const html = ed.getHtml?.() ?? "";
    const css = ed.getCss?.() ?? "";
    if (!html.trim()) return toast.error("Editor content cannot be empty!");
    setPageContent({ html, css });
    toast.success("✅ Editor content saved!");
    closeEditor();
  };

  // Save page to backend
  const handleSavePage = async () => {
    if (!title.trim() || !slug.trim()) {
      return toast.error("⚠️ Title and Slug are required");
    }
    if (pages.find((p) => p.slug === slug)) {
      return toast.error("⚠️ Slug already exists");
    }
    if (!pageContent.html) {
      return toast.error("⚠️ Please save editor content first!");
    }

    setIsSaving(true);
    try {
      const res = await axios.post(
        "http://localhost:8000/api/pages",
        {
          title,
          description,
          slug,
          html: pageContent.html,
          css: pageContent.css,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newPage = res.data;
      setPages([...pages, newPage]);
      toast.success("✅ Page created successfully!");

      // Reset form and editor state
      setTitle("");
      setDescription("");
      setSlug("");
      setPageContent({ html: "", css: "" });
      editorRef.current = null;
    } catch (err) {
      console.error("❌ Error creating page:", err);
      toast.error("Failed to create page.");
    } finally {
      setIsSaving(false);
    }
  };

  // Cleanup if component unmounts
  useEffect(() => {
    return () => {
      if (editorRef.current && typeof editorRef.current.destroy === "function") {
        try { editorRef.current.destroy(); } catch (e) { console.log(e) }
        editorRef.current = null;
      }
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <>
      <div className="w-120 mx-auto mt-2 border-2 bg-zinc-300 shadow-lg rounded-lg p-6">
        <h2 className="text-3xl font-extrabold mb-6 text-center">Add New Page</h2>

        <div className="flex flex-col gap-4 mb-6">
          <label className="text-xl font-semibold -mb-4 mt-0.5">Title</label>
          <input
            className="border rounded p-2"
            placeholder="Page Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label className="text-xl font-semibold -mb-4 mt-0.5">Description</label>
          <input
            className="border rounded p-2"
            placeholder="Page Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label className="text-xl font-semibold -mb-4 mt-0.5">Slug</label>
          <input
            className="border rounded p-2"
            placeholder="Slug (e.g., about-us)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />

          <div>
            <button
              onClick={openEditor}
              className="flex justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-800 w-107 h-auto"
            >
              <Plus size={26} /> 
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={handleSavePage}
            disabled={isSaving}
            className={`px-6 py-2 rounded flex justify-between text-white ${
              isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isSaving ? "Saving..." : "Save Page"}
          </button>
        </div>
      </div>

      {/* Editor Modal */}
      {editorOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
          onMouseDown={(e) => {
            // click outside modal closes editor
            if (e.target === e.currentTarget) closeEditor();
          }}
        >
          <div className="bg-white w-[95%] h-[95%] rounded-lg shadow-lg flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Studio Editor</h2>
              <button onClick={closeEditor} className="text-gray-500 hover:text-black">✖</button>
            </div>

            {/* Editor */}
            <div className="flex-grow">
              <StudioEditor
                key={editorKey} // forces remount each time
                options={{
                  // disable storage autoload/autosave so old content from localStorage isn't loaded
                  storageManager: { autoload: false, autosave: false },
                  initialHtml: "<div>Start editing...</div>",
                  initialCss: "",
                  style: { height: "100%", width: "100%" },
                  plugins: [
                    layoutSidebarButtons.init({
                      sidebarButton({ id, buttonProps }) {
                        if (id === "panelGlobalStyles") return null;
                        return buttonProps;
                      },
                    }),
                  ],
                }}
                onReady={(editor) => {
                  // Keep reference
                  editorRef.current = editor;

                  // Ensure editor is cleared (defensive)
                  try {
                    editor.DomComponents.clear();
                    editor.CssComposer.clear();
                    editor.setComponents("<div>Start editing...</div>");
                    editor.setStyle("");
                  } catch (e) {
                    console.log(e)
                  }

                  // Add blocks only if not already present (defensive)
                  try {
                    const bm = editor.BlockManager || editor.Blocks;
                    if (bm && !bm.get?.("text-block")) {
                      bm.add("text-block", {
                        label: "Text",
                        content: '<p style="padding:10px;">Insert your text here</p>',
                        category: "Basic",
                      });
                    }
                    if (bm && !bm.get?.("image-block")) {
                      bm.add("image-block", {
                        label: "Image",
                        content: '<img src="https://via.placeholder.com/600x300" style="max-width:100%"/>',
                        category: "Basic",
                      });
                    }
                    if (bm && !bm.get?.("button-block")) {
                      bm.add("button-block", {
                        label: "Button",
                        content: '<button style="padding:10px 20px; background:#2563eb; color:white; border:none; border-radius:6px;">Click Me</button>',
                        category: "Basic",
                      });
                    }
                    // Layout, Hero, Card, Form, Footer (same pattern)
                    if (bm && !bm.get?.("2-columns")) {
                      bm.add("2-columns", {
                        label: "2 Columns",
                        content: `<div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                                    <div style="background:#f3f4f6; padding:20px;">Column 1</div>
                                    <div style="background:#f3f4f6; padding:20px;">Column 2</div>
                                  </div>`,
                        category: "Layout",
                      });
                    }
                    if (bm && !bm.get?.("hero-section")) {
                      bm.add("hero-section", {
                        label: "Hero Section",
                        content: `<section style="padding:60px; text-align:center; background:#f9fafb;">
                                    <h1 style="font-size:2.5rem; font-weight:bold;">Welcome to My Website</h1>
                                    <p style="margin:20px 0; color:#555;">Hero description</p>
                                    <button style="padding:12px 24px; background:#16a34a; color:white; border:none; border-radius:6px;">Get Started</button>
                                  </section>`,
                        category: "Layout",
                      });
                    }
                    if (bm && !bm.get?.("card-block")) {
                      bm.add("card-block", {
                        label: "Card",
                        content: `<div style="border:1px solid #e5e7eb; border-radius:8px; padding:20px; text-align:center;">
                                    <img src="https://via.placeholder.com/150" style="border-radius:50%; margin-bottom:15px;" />
                                    <h3 style="font-size:1.25rem; font-weight:bold;">Card Title</h3>
                                    <p style="color:#6b7280;">Card description.</p>
                                  </div>`,
                        category: "Components",
                      });
                    }
                    if (bm && !bm.get?.("form-block")) {
                      bm.add("form-block", {
                        label: "Form",
                        content: `<form style="display:flex; flex-direction:column; gap:12px; max-width:400px; margin:auto;">
                                    <input type="text" placeholder="Your name" style="padding:10px; border:1px solid #ccc; border-radius:4px;"/>
                                    <input type="email" placeholder="Your email" style="padding:10px; border:1px solid #ccc; border-radius:4px;"/>
                                    <textarea placeholder="Your message" style="padding:10px; border:1px solid #ccc; border-radius:4px;"></textarea>
                                    <button type="submit" style="padding:12px; background:#2563eb; color:white; border:none; border-radius:4px;">Send</button>
                                  </form>`,
                        category: "Forms",
                      });
                    }
                    if (bm && !bm.get?.("footer-block")) {
                      bm.add("footer-block", {
                        label: "Footer",
                        content: `<footer style="padding:20px; background:#111827; color:white; text-align:center;">
                                    <p>&copy; 2025 My Website. All rights reserved.</p>
                                  </footer>`,
                        category: "Layout",
                      });
                    }
                  } catch (e) {
                    console.log(e)
                  }
                }}
              />
            </div>

            {/* Save footer */}
            <div className="p-4 border-t flex justify-end gap-2">
              <button
                onClick={handleSaveEditorContent}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Save Editor Content
              </button>
              <button
                onClick={closeEditor}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddPageForm;
