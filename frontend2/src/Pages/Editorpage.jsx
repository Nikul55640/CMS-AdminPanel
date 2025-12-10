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

//                 rteTinyMce.init({
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

import { useContext, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CmsContext from "../context/CmsContext";
import StudioEditor from "@grapesjs/studio-sdk/react";
import "@grapesjs/studio-sdk/style";
import toast from "react-hot-toast";
import axios from "../utils/axios";
import {
  ChevronLeft,
  Save,
  Code,
  FileText,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";

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

  const [htmlContent, setHtmlContent] = useState(page?.html || "<div></div>");
  const [cssContent, setCssContent] = useState(page?.css || "");
  const [jsContent, setJsContent] = useState(page?.js || "");

  // 🔥 Apply editor code to GrapesJS Canvas
  const applyToCanvas = () => {
    const editor = editorRef.current;
    if (!editor) return;

    console.log("🎯 Applying to Canvas");
    console.log("HTML Length:", htmlContent.length);
    console.log("CSS Length:", cssContent.length);
    console.log("JS Length:", jsContent.length);

    editor.setComponents(htmlContent);
    editor.setStyle(cssContent);

    const frame = editor.Canvas.getFrameEl();
    const doc = frame?.contentDocument;

    // Remove previous JS
    doc.querySelectorAll("script[data-custom-js]").forEach((s) => s.remove());
    if (jsContent.trim()) {
      const script = doc.createElement("script");
      script.dataset.customJs = "true";
      script.innerHTML = jsContent;
      doc.body.appendChild(script);
    }
    toast.success("Preview Updated!");
  };

  // 📌 Save Page to Database
  const handleSave = async () => {
    if (!editorRef.current) {
      toast.error("Editor not ready!");
      return;
    }

    console.log("📌 Before Save");
    console.log("HTML Length:", htmlContent.length);
    console.log("CSS Length:", cssContent.length);
    console.log("JS Length:", jsContent.length);

    const payload = {
      ...formData,
      html: htmlContent,
      css: cssContent,
      js: jsContent,
    };

    setIsSaving(true);

    try {
      const res = await axios.put(`/pages/${slug}`, payload);

      console.log("📌 After Save (DB Response)");
      console.log("DB HTML Length:", res.data?.html?.length);
      console.log("DB CSS Length:", res.data?.css?.length);
      console.log("DB JS Length:", res.data?.js?.length);

      setPages((prev) => prev.map((p) => (p.slug === slug ? res.data : p)));
      toast.success("Page saved successfully!");
      navigate("/admin/pages");
    } catch (error) {
      toast.error("Save failed!");
      console.error("❌ Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!page)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-xl text-gray-300">
        Page not found
      </div>
    );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="flex items-center justify-between px-5 py-3">
          <button
            onClick={() => navigate("/admin/pages")}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            <ChevronLeft size={20} />
          </button>

          <h1 className="text-lg font-semibold">{formData.title}</h1>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 ${
              isSaving ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <Save size={16} />
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </header>

      {/* GrapesJS Canvas */}
      <div
        className="overflow-hidden"
        style={{
          height: codePanelExpanded ? "55vh" : "calc(100vh - 70px)",
        }}
      >
        <StudioEditor
          key={slug}
          options={{
            storageManager: false,
            allowScripts: true,
            enableScripting: true,
            canvas: {
              scripts: [
                "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js",
              ],
            },
            plugins: [
              googleFontsAssetProvider.init({ apiKey: "GOOGLE_FONTS_API_KEY" }),
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
            applyToCanvas();
          }}
        />
      </div>

      {/* Code Editor Panel */}
      <div className="bg-white border-t shadow-inner">
        <div
          className="flex justify-between items-center px-5 py-3 bg-gray-50 border-b cursor-pointer"
          onClick={() => setCodePanelExpanded(!codePanelExpanded)}
        >
          <h3 className="font-semibold flex items-center gap-2">
            <Code size={18} /> Code Editor (HTML / CSS / JS)
          </h3>
          {codePanelExpanded ? <ChevronDown /> : <ChevronUp />}
        </div>

        {codePanelExpanded && (
          <>
            {/* Tabs + Apply Button */}
            <div className="flex justify-between items-center bg-gray-50 border-b px-3">
              <div className="flex gap-1">
                {[
                  { id: "html", label: "HTML", icon: Code },
                  { id: "css", label: "CSS", icon: FileText },
                  { id: "js", label: "JS", icon: Zap },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    className={`flex items-center gap-2 px-4 py-2 text-sm border-b-2 ${
                      expandedSection === id
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-600"
                    }`}
                    onClick={() => setExpandedSection(id)}
                  >
                    <Icon size={14} /> {label}
                  </button>
                ))}
              </div>

              {/* Apply Button */}
              <button
                onClick={applyToCanvas}
                className="px-4 py-1.5 rounded-md text-white bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                <Zap size={14} /> Apply Changes
              </button>
            </div>

            {/* Editors */}
            <div className="p-4 max-h-[45vh] overflow-auto">
              {expandedSection === "html" && (
                <CodeMirror
                  value={htmlContent}
                  height="300px"
                  extensions={[html()]}
                  onChange={(value) => setHtmlContent(value)}
                />
              )}
              {expandedSection === "css" && (
                <CodeMirror
                  value={cssContent}
                  height="300px"
                  extensions={[css()]}
                  onChange={(value) => setCssContent(value)}
                />
              )}
              {expandedSection === "js" && (
                <CodeMirror
                  value={jsContent}
                  height="300px"
                  extensions={[javascript()]}
                  onChange={(value) => setJsContent(value)}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EditorPage;
