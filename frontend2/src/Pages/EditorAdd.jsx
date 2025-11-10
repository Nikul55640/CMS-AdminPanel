import { useRef, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import StudioEditor from "@grapesjs/studio-sdk/react";
import "@grapesjs/studio-sdk/style";
import {
  layoutSidebarButtons,
  dialogComponent,
  tableComponent,
  listPagesComponent,
  lightGalleryComponent,
  swiperComponent,
  iconifyComponent,
  accordionComponent,
  animationComponent,
  rteTinyMce,
  canvasGridMode,
  googleFontsAssetProvider,
} from "@grapesjs/studio-sdk-plugins";
import toast from "react-hot-toast";
import CmsContext from "../context/CmsContext";
import axios from "axios";


const EditorAdd = () => {
  const editorRef = useRef(null);
  const [editorKey] = useState(Date.now());
  const { setPageContent } = useContext(CmsContext);
  const navigate = useNavigate();

  // Cleanup editor on unmount
  useEffect(() => {
    return () => {
      if (editorRef.current?.destroy) {
        try {
          editorRef.current.destroy();
        } catch (e) {
          console.log("Editor destroy error:", e);
        }
        editorRef.current = null;
      }
    };
  }, []);

  // Save a section as a reusable component
  const handleSaveAsComponent = async () => {
    if (!editorRef.current) return;

    const html = editorRef.current.getHtml();
    const css = editorRef.current.getCss();

    const componentName = prompt("Enter component name");
    if (!componentName) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/components",
        { name: componentName, html, css, category: "Reusable" },
        { withCredentials: true }
      );

      const bm = editorRef.current.BlockManager;
      bm.add(res.data.name, {
        label: res.data.name,
        category: res.data.category || "Reusable",
        content: `<div>${res.data.html}</div><style>${res.data.css}</style>`,
      });

      toast.success("Component saved!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save component");
    }
  };



  // Save current page content
  const handleSaveContent = () => {
    if (!editorRef.current) return;

    const html = editorRef.current.getHtml();
    const css = editorRef.current.getCss();

    setPageContent({ html, css });
    toast.success("✅ Content saved!");
    navigate("/admin/addPage");
  };

  // Load saved components from backend on editor ready
  const loadSavedComponents = async () => {
    if (!editorRef.current) return;

    try {
      const bm = editorRef.current.BlockManager;

      // ✅ Get all components from backend (no second API needed)
      const res = await axios.get("http://localhost:5000/api/components", {
        withCredentials: true,
      });

      if (!res.data || res.data.length === 0) {
        console.warn("⚠️ No components found from backend.");
        return;
      }

      // ✅ Add all components (reusable or not)
      res.data.forEach((cmp) => {
        bm.add(cmp.name, {
          label: cmp.name,
          category: cmp.category || "Custom Components",
          content: `
          <div>${cmp.html || ""}</div>
          <style>${cmp.css || ""}</style>
          ${cmp.js ? `<script>${cmp.js}</script>` : ""}
        `,
        });
      });

      console.log(`✅ Loaded ${res.data.length} components`);
    } catch (err) {
      console.error("❌ Failed to load components:", err);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b bg-white shadow">
          <h1 className="text-xl font-bold">Editor PRO</h1>
          <button
            onClick={handleSaveAsComponent}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 "
          >
            Save as Component
          </button>
          <button
            onClick={handleSaveContent}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save Content
          </button>
        </div>

        <div className="flex-grow">
          <StudioEditor
            key={editorKey}
            options={{
              storageManager: { autoload: false, autosave: false },
              initialHtml: "<div>Start editing...</div>",
              initialCss: "",
              style: { height: "100%", width: "100%" },
              plugins: [
                googleFontsAssetProvider.init({
                  apiKey: "GOOGLE_FONTS_API_KEY",
                }),
                canvasGridMode?.init({ styleableGrid: true }),
                rteTinyMce.init({ enableOnClick: true }),
                animationComponent.init(),
                accordionComponent.init(),
                iconifyComponent.init(),
                swiperComponent?.init({ block: true }),
                lightGalleryComponent?.init({ block: true }),
                listPagesComponent?.init(),
                tableComponent.init(),
                dialogComponent.init(),
                layoutSidebarButtons.init(),

              ],
            }}
            onReady={(editor) => {
              editorRef.current = editor;

              // Clear default content
              editor.DomComponents.clear();
              editor.CssComposer.clear();
              editor.setComponents("<div>Start editing...</div>");
              editor.setStyle("");

            
              loadSavedComponents();

              // Add default blocks
              const bm = editor.BlockManager;
              bm.add("section", {
                label: "Section",
                content: `<section style="padding: 20px; border: 1px solid #ccc;">
                  <h2>Section Title</h2>
                  <p>Section content...</p>
                </section>`,
              });
              bm.add("text", {
                label: "Text",
                content: '<div data-gjs-type="text">Insert your text here</div>',
              });
              bm.add("image", {
                label: "Image",
                content: { type: "image" },
              });
              bm.add("link", {
                label: "Link",
                content: '<a href="#">Insert link</a>',
              }); 
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EditorAdd;
