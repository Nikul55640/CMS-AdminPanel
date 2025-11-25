// import { useContext, useState, useEffect, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import CmsContext from "../context/CmsContext";
// import StudioEditor from "@grapesjs/studio-sdk/react";
// import "@grapesjs/studio-sdk/style";
// import {
//   layoutSidebarButtons,
//   dialogComponent,
//   tableComponent,
//   listPagesComponent,
//   lightGalleryComponent,
//   swiperComponent,
//   iconifyComponent,
//   accordionComponent,
//   animationComponent,
//   rteTinyMce,
//   canvasGridMode,
//   googleFontsAssetProvider,
// } from "@grapesjs/studio-sdk-plugins";
// import toast from "react-hot-toast";
// import axios from "axios";

// const EditorPage = () => {
//   const { slug } = useParams();
//   const { pages, setPages } = useContext(CmsContext);
//   const page = pages.find((p) => p.slug === slug);
//   const navigate = useNavigate();

//   const editorRef = useRef(null);
//   const [isSaving, setIsSaving] = useState(false);
//   const [formData, setFormData] = useState({
//     title: page?.title || "",
//     slug: page?.slug || "",
//     description: page?.description || "",
//     metaTitle: page?.metaTitle || "",
//     metaDescription: page?.metaDescription || "",
//     keywords: page?.keywords || "",
//     status: page?.status || "draft",
//   });

//   const handleChange = (field, value) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleSave = async () => {
//     if (!editorRef.current || !page) return toast("Editor not ready!");

//     const html = editorRef.current.getHtml();
//     const css = editorRef.current.getCss();

//     if (!html.trim()) return toast("⚠️ Page content cannot be empty!");

//     console.log("Payload:", { ...formData, html, css });
//     setIsSaving(true);
//     try {
//       const res = await axios.put(
//         `http://localhost:5000/api/pages/${page.slug}`,
//         { ...formData, html, css },
//         {
//           withCredentials: true,
//         }
//       );

//       setPages(pages.map((p) => (p.slug === page.slug ? res.data : p)));
//       toast.success("✅ Page updated successfully!");
//       navigate("/admin/pages");
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to save page");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const loadSavedComponents = async () => {
//     if (!editorRef.current) return;

//     try {
//       const res = await axios.get("http://localhost:5000/api/components", {
//         withCredentials: true,
//       });

//       const bm = editorRef.current.BlockManager;
//       res.data.forEach((cmp) => {
//         bm.add(cmp.name, {
//           label: cmp.name,
//           category: cmp.category || "Reusable",
//           content: `<div>${cmp.html}</div><style>${cmp.css}</style>`,
//         });
//       });
//     } catch (err) {
//       console.error("Failed to load components:", err);
//     }
//   };

//   useEffect(() => {
//     return () => {
//       if (editorRef.current?.destroy) {
//         editorRef.current.destroy();
//         editorRef.current = null;
//       }
//     };
//   }, []);

//   if (!page) return <p>Page not found</p>;
//   console.log(loadSavedComponents);
//   return (
//     <div className="flex flex-col h-screen">
//       {/* Header */}

//       <div className="flex flex-1 overflow-hidden">
//         {/* Right panel - GrapesJS Editor */}
//         <div className="w-3/4 p-4 bg-gray-50 overflow-y-auto border-r">
//           <StudioEditor
//             key={slug}
//             options={{
//               initialHtml: page.html || "<div>Start editing...</div>",
//               initialCss: page.css || "",
//               style: { height: "100%", width: "100%" },

//               /* ===============================
//        🔐 SAFE SCRIPT CONFIG
//     =============================== */
//               allowScripts: true, // Allow JS inside components
//               enableScripting: true, // Enables <script> inside canvas
//               allowUnsafeInlineStyle: false,

//               /* ===============================
//        📚 PRELOAD JS LIBRARIES INSIDE CANVAS
//     =============================== */
//               canvas: {
//                 scripts: [
//                   "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js",
//                   "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js",
//                 ],
//                 styles: [
//                   "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css",
//                 ],
//               },

//               /* ===============================
//        🎨 CSS Manager
//     =============================== */
//               cssManager: {
//                 clearProperties: true,
//                 sectors: [
//                   {
//                     name: "Manual CSS",
//                     open: true,
//                     buildProps: [],
//                   },
//                 ],
//               },

//               /* ===============================
//        🔌 Plugins + Custom Editors
//     =============================== */
//               plugins: [
//                 googleFontsAssetProvider.init({
//                   apiKey: "GOOGLE_FONTS_API_KEY",
//                 }),

//                 canvasGridMode?.init({ styleableGrid: true }),

//                 rteTinyMce.init({6
//                   enableOnClick: true,
//                 }),

//                 animationComponent.init({
//                   animations: ({ items }) => [
//                     ...items,
//                     {
//                       id: "customWiggle",
//                       name: "Custom Wiggle",
//                       css: `
//               @keyframes customWiggle {
//                 0% { transform: rotate(0deg); }
//                 15% { transform: rotate(-5deg); }
//                 30% { transform: rotate(5deg); }
//                 45% { transform: rotate(-5deg); }
//                 60% { transform: rotate(3deg); }
//                 75% { transform: rotate(-2deg); }
//                 100% { transform: rotate(0deg); }
//               }
//             `,
//                     },
//                   ],
//                 }),

//                 accordionComponent.init({
//                   block: { category: "My Accordions" },
//                   blockGroup: { category: "My Accordions" },
//                 }),

//                 iconifyComponent.init({
//                   block: { category: "Extra", label: "Iconify" },
//                 }),

//                 swiperComponent?.init({ block: false }),

//                 /* Add swiper block manually */
//                 (editor) => {
//                   editor.Blocks.add("swiper", {
//                     label: "Swiper Slider",
//                     category: "Swiper example",
//                     content: `
//             <div class="swiper" data-swiper>
//               <div class="swiper-wrapper">
//                 <div class="swiper-slide">Slide 1</div>
//                 <div class="swiper-slide">Slide 2</div>
//                 <div class="swiper-slide">Slide 3</div>
//               </div>
//               <div class="swiper-button-next"></div>
//               <div class="swiper-button-prev"></div>
//             </div>
//           `,
//                     /* 👇 JavaScript executed when placed on canvas */
//                     script: function () {
//                       const el = this.querySelector("[data-swiper]");
//                       if (el) {
//                         new Swiper(el, {
//                           navigation: {
//                             nextEl: ".swiper-button-next",
//                             prevEl: ".swiper-button-prev",
//                           },
//                         });
//                       }
//                     },
//                   });
//                 },

//                 lightGalleryComponent?.init({ block: false }),

//                 (editor) => {
//                   editor.Blocks.add("gallery-images", {
//                     label: "Gallery Images",
//                     category: "LightGallery examples",
//                     content: {
//                       type: "lightGallery",
//                       components: [],
//                     },
//                   });
//                 },

//                 listPagesComponent?.init({
//                   block: { category: "Extra", label: "My List Pages" },
//                 }),

//                 tableComponent.init({
//                   block: { category: "Extra", label: "My Table" },
//                 }),

//                 dialogComponent.init({
//                   block: { category: "Extra", label: "My Dialog" },
//                 }),

//                 layoutSidebarButtons.init({
//                   sidebarButton: ({ id, buttonProps }) =>
//                     id === "panelGlobalStyles" ? null : buttonProps,
//                 }),

//                 (editor) =>
//                   editor.onReady(() => {
//                     const firstP = editor.getWrapper().find("p")[0];
//                     if (firstP) editor.select(firstP);
//                   }),
//               ],
//             }}
//             /* ================================
//      🟢 EDITOR READY
//   ================================ */
//             onReady={(editor) => {
//               editorRef.current = editor;

//               editor.DomComponents.clear();
//               editor.CssComposer.clear();

//               editor.setComponents(page.html || "<div>Start editing...</div>");
//               editor.setStyle(page.css || "");

//               loadSavedComponents();

//               const addBlock = (id, opts) => {
//                 if (!editor.Blocks.get(id)) editor.Blocks.add(id, opts);
//               };

//               addBlock("text-block", {
//                 label: "Text",
//                 category: "Basic",
//                 content: '<p style="padding:10px;">Insert your text here</p>',
//               });
//             }}
//           />
//         </div>
//         <div className="w-1/4 p-4 bg-gray-50 overflow-y-auto border-r">
//           <h2 className="text-lg font-semibold mb-2">Page Info</h2>
//           <input
//             type="text"
//             placeholder="Title"
//             className="border p-2 rounded mb-2 w-full"
//             value={formData.title}
//             onChange={(e) => handleChange("title", e.target.value)}
//           />
//           <input
//             type="text"
//             placeholder="Slug"
//             className="border p-2 rounded mb-2 w-full"
//             value={formData.slug}
//             onChange={(e) => handleChange("slug", e.target.value)}
//           />
//           <textarea
//             placeholder="Description"
//             className="border p-2 rounded mb-2 w-full"
//             value={formData.description}
//             onChange={(e) => handleChange("description", e.target.value)}
//           />

//           <h2 className="text-lg font-semibold mt-4 mb-2">SEO</h2>
//           <input
//             type="text"
//             placeholder="Meta Title"
//             className="border p-2 rounded mb-2 w-full"
//             value={formData.metaTitle}
//             onChange={(e) => handleChange("metaTitle", e.target.value)}
//           />
//           <textarea
//             placeholder="Meta Description"
//             className="border p-2 rounded mb-2 w-full"
//             value={formData.metaDescription}
//             onChange={(e) => handleChange("metaDescription", e.target.value)}
//           />
//           <input
//             type="text"
//             placeholder="Keywords"
//             className="border p-2 rounded mb-2 w-full"
//             value={formData.keywords}
//             onChange={(e) => handleChange("keywords", e.target.value)}
//           />

//           <h2 className="text-lg font-semibold mt-4 mb-2">Status</h2>
//           <select
//             className="border p-2 rounded w-full"
//             value={formData.status}
//             onChange={(e) => handleChange("status", e.target.value)}
//           >
//             <option value="draft">Draft</option>
//             <option value="published">Published</option>
//           </select>
//           <button
//             onClick={handleSave}
//             disabled={isSaving}
//             className={`px-4 py-2 rounded text-white ${
//               isSaving
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-green-500 hover:bg-green-600"
//             }`}
//           >
//             {isSaving ? "Saving..." : "Save & Close"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EditorPage;
// 

import { useContext, useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CmsContext from "../context/CmsContext";
import StudioEditor from "@grapesjs/studio-sdk/react";
import "@grapesjs/studio-sdk/style";
import toast from "react-hot-toast";
import axios from "axios";
import {
  ChevronLeft,
  Save,
  Code,
  FileText,
  Zap,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// OPTIONAL: if you also want the same plugins like EditorAdd
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

const EditorPage = () => {
  const { slug } = useParams();
  const { pages, setPages } = useContext(CmsContext);
  const page = pages.find((p) => p.slug === slug);
  const navigate = useNavigate();
  const editorRef = useRef(null);

  const [isSaving, setIsSaving] = useState(false);
  const [expandedSection, setExpandedSection] = useState("html");
  const [codePanelExpanded, setCodePanelExpanded] = useState(false);

  const [formData, setFormData] = useState({
    title: page?.title || "",
    slug: page?.slug || "",
    description: page?.description || "",
    metaTitle: page?.metaTitle || "",
    metaDescription: page?.metaDescription || "",
    keywords: page?.keywords || "",
    status: page?.status || "draft",
  });

  const [htmlContent, setHtmlContent] = useState(
    page?.html || "<div>Start editing...</div>"
  );
  const [cssContent, setCssContent] = useState(page?.css || "");
  const [jsContent, setJsContent] = useState(page?.js || "");

  // 🔁 guard flags to avoid infinite loops
  const updatingFromCodeRef = useRef(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Load saved components (same pattern as EditorAdd)
  const loadSavedComponents = async () => {
    if (!editorRef.current) return;

    try {
      const res = await axios.get("http://localhost:5000/api/components", {
        withCredentials: true,
      });
      const bm = editorRef.current.BlockManager;

      res.data.forEach((cmp) => {
        bm.add(cmp.name, {
          label: cmp.name,
          category: cmp.category || "Saved Components",
          content: `
            <div>${cmp.html || ""}</div>
            <style>${cmp.css || ""}</style>
            ${cmp.js ? `<script>${cmp.js}</script>` : ""}
          `,
        });
      });
    } catch (err) {
      console.error(
        "❌ Failed to fetch saved components",
        err.response || err.message
      );
    }
  };

  /* ------------------------
     TEXTAREA → EDITOR SYNC
  ------------------------- */

  // HTML -> GrapesJS
  useEffect(() => {
    if (!editorRef.current) return;
    if (!updatingFromCodeRef.current) return; // only when user changes textarea

    const editor = editorRef.current;

    editor.DomComponents.clear();
    editor.setComponents(htmlContent || "<div></div>");

    // after applying to editor, reset flag
    updatingFromCodeRef.current = false;
  }, [htmlContent]);

  // CSS -> GrapesJS
  useEffect(() => {
    if (!editorRef.current) return;
    if (!updatingFromCodeRef.current) return;

    const editor = editorRef.current;
    editor.CssComposer.clear();
    editor.setStyle(cssContent || "");

    updatingFromCodeRef.current = false;
  }, [cssContent]);

  /* ------------------------
     JS → Canvas iframe
  ------------------------- */
  useEffect(() => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    const frame = editor.Canvas.getFrameEl();
    if (!frame) return;

    const iframeDoc = frame.contentDocument || frame.contentWindow?.document;
    if (!iframeDoc) return;

    // remove previous custom script
    iframeDoc
      .querySelectorAll("script[data-custom-js]")
      .forEach((s) => s.remove());

    if (!jsContent.trim()) return;

    const script = iframeDoc.createElement("script");
    script.dataset.customJs = "true";
    script.innerHTML = `
      try {
        ${jsContent}
      } catch (e) {
        console.error("Custom JS error:", e);
      }
    `;
    iframeDoc.body.appendChild(script);
  }, [jsContent]);

  /* ------------------------
     EDITOR → TEXTAREA SYNC
  ------------------------- */
  const attachEditorSyncEvents = (editor) => {
    const syncFromEditor = () => {
      // here change comes from editor, so DO NOT set updatingFromCodeRef
      const newHtml = editor.getHtml();
      const newCss = editor.getCss();

      setHtmlContent(newHtml);
      setCssContent(newCss);
    };

    editor.on("component:add", syncFromEditor);
    editor.on("component:update", syncFromEditor);
    editor.on("component:remove", syncFromEditor);
    editor.on("style:change", syncFromEditor);
    editor.on("load", syncFromEditor);
  };

  /* ------------------------
     FIX: RESIZE EDITOR WHEN PANEL EXPANDS
  ------------------------- */
  useEffect(() => {
    if (!editorRef.current) return;
    setTimeout(() => editorRef.current.refresh(), 100);
  }, [codePanelExpanded]);

  /* ------------------------
     SAVE PAGE
  ------------------------- */
  const handleSave = async () => {
    if (!page) return toast.error("Editor not ready!");

    const payload = {
      ...formData,
      html: htmlContent,
      css: cssContent,
      js: jsContent,
    };

    setIsSaving(true);

    try {
      const res = await axios.put(
        `http://localhost:5000/api/pages/${page.slug}`,
        payload,
        { withCredentials: true }
      );

      setPages((prev) =>
        prev.map((p) => (p.slug === page.slug ? res.data : p))
      );
      toast.success("Page saved successfully!");
      navigate("/admin/pages");
    } catch (error) {
      console.error(error);
      toast.error("Save failed!");
    } finally {
      setIsSaving(false);
    }
  };

  /* ------------------------
     PAGE NOT FOUND
  ------------------------- */
  if (!page)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-300 text-xl">
        Page not found
      </div>
    );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* TOP NAVBAR */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/pages")}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              <ChevronLeft size={20} />
            </button>

            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {formData.title || "Untitled Page"}
              </h1>
              <p className="text-sm text-gray-500">{slug}</p>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-5 py-2 rounded-lg flex items-center gap-2 font-medium text-white transition-all ${
              isSaving
                ? "bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700 shadow-md"
            }`}
          >
            <Save size={18} />
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </header>

      {/* MAIN EDITOR */}
      <div
        className="overflow-hidden transition-all"
        style={{
          height: codePanelExpanded ? "55vh" : "calc(120vh - 70px)",
        }}
      >
        <StudioEditor
          key={slug}
          options={{
            storageManager: { autoload: false, autosave: false },
            initialHtml: page?.html || "<div>Start editing...</div>",
            initialCss: page?.css || "",
            allowScripts: true,
            enableScripting: true,
            canvas: {
              scripts: [
                "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js",
              ],
            },
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

            // clear and load current page content
            editor.DomComponents.clear();
            editor.CssComposer.clear();
            editor.setComponents(htmlContent || "<div>Start editing...</div>");
            editor.setStyle(cssContent || "");

            loadSavedComponents();
            attachEditorSyncEvents(editor);

            setTimeout(() => editor.refresh(), 50);
          }}
        />
      </div>

      {/* BOTTOM PANEL */}
      <div className="bg-white border-t shadow-inner flex flex-col">
        {/* COLLAPSE HEADER */}
        <div
          className="flex justify-between items-center px-5 py-3 bg-gray-50 border-b cursor-pointer hover:bg-gray-100"
          onClick={() => setCodePanelExpanded(!codePanelExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Code size={20} />
            </div>
            <div>
              <h3 className="font-semibold">Code & Page Details</h3>
              <p className="text-xs text-gray-500">
                Edit HTML, CSS, JavaScript & SEO
              </p>
            </div>
          </div>

          {codePanelExpanded ? (
            <ChevronDown size={22} />
          ) : (
            <ChevronUp size={22} />
          )}
        </div>

        {/* CONTENT */}
        {codePanelExpanded && (
          <div className="max-h-[40vh] overflow-auto">
            {/* TABS */}
            <div className="flex gap-1 bg-gray-50 border-b px-3 sticky top-0">
              {[
                { id: "html", label: "HTML", icon: Code },
                { id: "css", label: "CSS", icon: FileText },
                { id: "js", label: "JavaScript", icon: Zap },
                { id: "info", label: "Page Info", icon: Settings },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setExpandedSection(id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 ${
                    expandedSection === id
                      ? "border-blue-600 text-blue-600 bg-white"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT */}
            <div className="p-5">
              {/* HTML */}
              {expandedSection === "html" && (
                <textarea
                  className="w-full h-48 border p-3 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500"
                  value={htmlContent}
                  onChange={(e) => {
                    updatingFromCodeRef.current = true;
                    setHtmlContent(e.target.value);
                  }}
                />
              )}

              {/* CSS */}
              {expandedSection === "css" && (
                <textarea
                  className="w-full h-48 border p-3 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500"
                  value={cssContent}
                  onChange={(e) => {
                    updatingFromCodeRef.current = true;
                    setCssContent(e.target.value);
                  }}
                />
              )}

              {/* JS */}
              {expandedSection === "js" && (
                <textarea
                  className="w-full h-48 border p-3 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500"
                  value={jsContent}
                  onChange={(e) => setJsContent(e.target.value)}
                />
              )}

              {/* PAGE INFO */}
              {expandedSection === "info" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    className="p-3 border rounded-lg"
                    placeholder="Title"
                    value={formData.title}
                    onChange={(e) =>
                      handleChange("title", e.target.value)
                    }
                  />

                  <input
                    className="p-3 border rounded-lg"
                    placeholder="Slug"
                    value={formData.slug}
                    onChange={(e) => handleChange("slug", e.target.value)}
                  />

                  <textarea
                    className="p-3 border rounded-lg col-span-full"
                    placeholder="Description"
                    rows={2}
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                  />

                  <input
                    className="p-3 border rounded-lg"
                    placeholder="Meta Title"
                    value={formData.metaTitle}
                    onChange={(e) =>
                      handleChange("metaTitle", e.target.value)
                    }
                  />

                  <input
                    className="p-3 border rounded-lg"
                    placeholder="Keywords"
                    value={formData.keywords}
                    onChange={(e) =>
                      handleChange("keywords", e.target.value)
                    }
                  />

                  <textarea
                    className="p-3 border rounded-lg col-span-full"
                    placeholder="Meta Description"
                    rows={2}
                    value={formData.metaDescription}
                    onChange={(e) =>
                      handleChange("metaDescription", e.target.value)
                    }
                  />

                  <select
                    className="p-3 border rounded-lg"
                    value={formData.status}
                    onChange={(e) =>
                      handleChange("status", e.target.value)
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorPage;
