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

  // CLEANUP ON UNMOUNT
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

  /* ----------------------------------------
     SAVE AS COMPONENT
  ----------------------------------------- */
  const handleSaveAsComponent = async () => {
    if (!editorRef.current) return;

    const html = editorRef.current.getHtml();
    const css = editorRef.current.getCss();

    // Extract JS blocks
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const jsBlocks = doc.querySelectorAll(".js-block textarea");

    const jsContent = Array.from(jsBlocks)
      .map((t) => t.value)
      .join("\n");

    const name = prompt("Component name?");
    if (!name) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/components",
        { name, html, css, js: jsContent, category: "Reusable" },
        { withCredentials: true }
      );

      const bm = editorRef.current.BlockManager;
      bm.add(res.data.name, {
        label: res.data.name,
        category: res.data.category || "Reusable",
        content: `
          <div>${res.data.html}</div>
          <style>${res.data.css}</style>
          <script>${res.data.js}</script>
        `,
      });

      toast.success("Component saved!");
    } catch (err) {
      toast.error("Failed to save component");
    }
  };

  /* ----------------------------------------
     SAVE PAGE CONTENT
  ----------------------------------------- */
  const handleSaveContent = () => {
    if (!editorRef.current) return;

    const html = editorRef.current.getHtml();
    const css = editorRef.current.getCss();

    // Extract JS blocks
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const jsBlocks = doc.querySelectorAll(".js-block textarea");

    const jsContent = Array.from(jsBlocks)
      .map((t) => t.value)
      .join("\n");

    setPageContent({ html, css, js: jsContent });
    toast.success("Saved!");
    navigate("/admin/addPage");
  };

  /* ----------------------------------------
     LOAD EXISTING SAVED COMPONENTS
  ----------------------------------------- */
  const loadSavedComponents = async () => {
    if (!editorRef.current) return;
    try {
      const bm = editorRef.current.BlockManager;
      const res = await axios.get("http://localhost:5000/api/components", {
        withCredentials: true,
      });

      res.data.forEach((cmp) => {
        bm.add(cmp.name, {
          label: cmp.name,
          category: cmp.category || "Custom",
          content: `
            <div>${cmp.html}</div>
            <style>${cmp.css}</style>
            ${cmp.js ? `<script>${cmp.js}</script>` : ""}
          `,
        });
      });
    } catch (err) {
      console.error("Could not load components", err);
    }
  };

  /* ----------------------------------------
      RUN JS BLOCKS
  ----------------------------------------- */
  const runJsBlock = (component) => {
    if (!editorRef.current) return;

    if (component.attributes?.classes?.includes("js-block")) {
      const iframe = editorRef.current.Canvas.getFrameEl();
      const iframeDoc = iframe.contentDocument;

      const textarea = component.view.el.querySelector(".js-code");
      if (textarea) {
        const script = iframeDoc.createElement("script");
        script.innerHTML = textarea.value;
        iframeDoc.body.appendChild(script);
      }
    }
  };

  /* ----------------------------------------
      RENDER
  ----------------------------------------- */
  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b bg-white shadow gap-2">
          <h1 className="text-xl font-bold">Editor PRO</h1>
          <div className="flex gap-2">
            <button
              onClick={handleSaveAsComponent}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
        </div>

        {/* EDITOR */}
        <div className="flex-1 min-h-0">
          <StudioEditor
            key={editorKey}
            options={{
              storageManager: { autoload: false, autosave: false },
              initialHtml: "<div>Start editing your page...</div>",
              initialCss: "",
              style: { width: "100%", height: "100%" },
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

              const bm = editor.BlockManager;

              /* ----------------------------------------
                  DEFAULT BLOCKS
              ----------------------------------------- */
              bm.add("custom-js-block", {
                label: "Custom JS",
                category: "Extra",
                content: `
                  <div class="js-block">
                    <strong>JS Block</strong>
                    <textarea class="js-code" style="width:100%;height:100px;">console.log('JS Block')</textarea>
                  </div>`,
              });

              bm.add("section", {
                label: "Section",
                content: `
                  <section style="padding:20px;">
                    <h2>Section Title</h2>
                  </section>
                `,
              });

              bm.add("text", {
                label: "Text",
                content:
                  '<div data-gjs-type="text">Insert your text here</div>',
              });

              bm.add("image", {
                label: "Image",
                content: { type: "image" },
              });

              /* ----------------------------------------
                  ⭐ DYNAMIC BLOG COMPONENTS
              ----------------------------------------- */

              // BLOG LIST
              bm.add("blog-list", {
                label: "Blog List",
                category: "Dynamic",
                content: `
                  <div data-blog="list" style="padding:20px;border:1px dashed #bbb;">
                    <h3>Blog List (Dynamic)</h3>
                    <p>Blogs will load automatically...</p>
                  </div>
                `,
              });

              // FEATURED BLOG
              bm.add("featured-blog", {
                label: "Featured Blog",
                category: "Dynamic",
                content: `
                  <div data-blog="featured" style="padding:20px;border:1px dashed #bbb;">
                    <h3>Featured Blog</h3>
                    <p>Latest blog loads automatically...</p>
                  </div>
                `,
              });

              // SINGLE BLOG READER
              bm.add("single-blog", {
                label: "Single Blog View",
                category: "Dynamic",
                content: `
                  <div data-blog="single" style="padding:20px;border:1px dashed #bbb;">
                    <h3>Blog Viewer</h3>
                    <p>Full blog content loads based on URL...</p>
                  </div>
                `,
              });

              /* ----------------------------------------
                  JS BLOCK EXECUTION
              ----------------------------------------- */
              editor.on("component:add", runJsBlock);
              editor.on("component:update", runJsBlock);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EditorAdd;


// import { useRef, useEffect, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import grapesjs from "grapesjs";
// import "grapesjs/dist/css/grapes.min.css";
// import "grapesjs-preset-webpage";
// import "grapesjs-custom-code";
// import "grapesjs-blocks-basic";
// import "grapesjs-code-manager";

// import CmsContext from "../context/CmsContext";
// import axios from "axios";
// import toast from "react-hot-toast";

// const EditorAdd = () => {
//   const editorRef = useRef(null);
//   const editorContainer = useRef(null);
//   const { setPageContent } = useContext(CmsContext);
//   const navigate = useNavigate();

//   const extractScripts = (html) => {
//     const scripts = [];
//     const div = document.createElement("div");
//     div.innerHTML = html;
//     div.querySelectorAll("script").forEach((s) => {
//       scripts.push(s.innerText);
//       s.remove();
//     });
//     return { cleanHtml: div.innerHTML, scripts };
//   };

//   const loadSavedComponents = async (editor) => {
//     try {
//       const res = await axios.get("http://localhost:5000/api/components", {
//         withCredentials: true,
//       });
//       const bm = editor.BlockManager;
//       res.data.forEach((cmp) => {
//         bm.add(cmp.name, {
//           label: cmp.name,
//           category: cmp.category || "Saved Components",
//           content: `
//             ${cmp.html}
//             <style>${cmp.css}</style>
//             ${cmp.js ? `<script>${cmp.js}</script>` : ""}
//           `,
//         });
//       });
//     } catch (err) {
//       console.error("Component load failed", err);
//     }
//   };

//   const handleSaveAsComponent = async () => {
//     const editor = editorRef.current;
//     if (!editor) return;
//     const rawHtml = editor.getHtml();
//     const css = editor.getCss();
//     const { cleanHtml, scripts } = extractScripts(rawHtml);
//     const name = prompt("Enter component name:");
//     if (!name) return;
//     try {
//       await axios.post(
//         "http://localhost:5000/api/components",
//         {
//           name,
//           html: cleanHtml,
//           css,
//           js: scripts.join("\n"),
//           category: "Reusable",
//         },
//         { withCredentials: true }
//       );
//       toast.success("Component saved!");
//     } catch (err) {
//       toast.error("Saving failed");
//     }
//   };

//   const handleSaveContent = () => {
//     const editor = editorRef.current;
//     if (!editor) return;
//     const rawHtml = editor.getHtml();
//     const css = editor.getCss();
//     const { cleanHtml, scripts } = extractScripts(rawHtml);
//     setPageContent({ html: cleanHtml, css, js: scripts.join("\n") });
//     toast.success("Page saved!");
//     navigate("/admin/addPage");
//   };

//   useEffect(() => {
//     const editor = grapesjs.init({
//       container: editorContainer.current,
//       height: "100vh",
//       storageManager: false,
//       plugins: [
//         "grapesjs-preset-webpage",
//         "grapesjs-custom-code",
//         "grapesjs-blocks-basic",
//         "grapesjs-code-manager",
//       ],
//       canvas: { styles: [] },
//       assetManager: {
//         upload: "http://localhost:5000/api/upload/image",
//         uploadName: "image",
//         multiUpload: true,
//         headers: { "Access-Control-Allow-Origin": "*" },
//       },
//       panels: {
//         defaults: [
//           {
//             id: "main-panel",
//             buttons: [
//               { id: "undo", command: "core:undo", className: "fa fa-undo" },
//               { id: "redo", command: "core:redo", className: "fa fa-repeat" },
//               {
//                 id: "clear",
//                 command: "core:canvas-clear",
//                 className: "fa fa-trash",
//               },
//               {
//                 id: "export",
//                 command: "export-template",
//                 className: "fa fa-code",
//               },
//               {
//                 id: "fullscreen",
//                 command: "fullscreen",
//                 className: "fa fa-arrows-alt",
//               },
//               { id: "preview", command: "preview", className: "fa fa-eye" },
//               {
//                 id: "open-code",
//                 command: "open-code",
//                 className: "fa fa-terminal",
//               },
//             ],
//           },
//         ],
//       },
//       layerManager: { appendTo: ".layers-container" },
//       styleManager: {
//         appendTo: ".styles-container",
//         sectors: [
//           {
//             name: "General",
//             open: false,
//             buildProps: [
//               "float",
//               "display",
//               "position",
//               "top",
//               "right",
//               "left",
//               "bottom",
//             ],
//           },
//           {
//             name: "Typography",
//             open: false,
//             buildProps: [
//               "font-family",
//               "font-size",
//               "font-weight",
//               "color",
//               "line-height",
//               "letter-spacing",
//             ],
//           },
//           {
//             name: "Decorations",
//             open: false,
//             buildProps: [
//               "background-color",
//               "border-radius",
//               "border",
//               "box-shadow",
//             ],
//           },
//           {
//             name: "Extra",
//             open: false,
//             buildProps: [
//               "width",
//               "height",
//               "max-width",
//               "min-height",
//               "margin",
//               "padding",
//             ],
//           },
//         ],
//       },
//       traitManager: { appendTo: ".traits-container" },
//       deviceManager: {
//         devices: [
//           { name: "Desktop", width: "" },
//           { name: "Tablet", width: "768px" },
//           { name: "Mobile", width: "375px" },
//         ],
//       },
//       codeManager: {
//         appendTo: ".code-editor-container",
//         codeViewOptions: {
//           open: true,
//         },
//       },
//     });

//     editorRef.current = editor;

//     const bm = editor.BlockManager;
//     bm.add("hero-section", {
//       label: "Hero Section",
//       category: "Layouts",
//       content: `<section style="background-color:#1a1a1a; color:white; padding:50px; text-align:center;">
//                   <h1 style="font-size:36px; font-weight:bold;">Welcome to Our Website</h1>
//                   <p style="margin-top:10px; font-size:18px;">Build anything visually with our CMS.</p>
//                   <button style="margin-top:20px; background-color:#007BFF; color:white; padding:10px 20px; border:none; border-radius:5px;">Get Started</button>
//                 </section>`,
//     });
//     bm.add("card-layout", {
//       label: "Card Grid",
//       category: "Layouts",
//       content: `<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:20px; padding:40px;">
//                   <div style="padding:20px; border:1px solid #ccc; border-radius:5px; box-shadow:0 2px 5px rgba(0,0,0,0.1);">Card 1</div>
//                   <div style="padding:20px; border:1px solid #ccc; border-radius:5px; box-shadow:0 2px 5px rgba(0,0,0,0.1);">Card 2</div>
//                   <div style="padding:20px; border:1px solid #ccc; border-radius:5px; box-shadow:0 2px 5px rgba(0,0,0,0.1);">Card 3</div>
//                 </div>`,
//     });
//     bm.add("footer", {
//       label: "Footer",
//       category: "Layouts",
//       content: `<footer style="background-color:black; color:white; text-align:center; padding:20px;">
//                   <p>© 2025 My Website</p>
//                 </footer>`,
//     });

//     loadSavedComponents(editor);

//     return () => editor.destroy();
//   }, []);

//   return (
//     <div style={{ display: "flex", height: "100vh" }}>
//       {/* Sidebar panels */}
//       <div
//         style={{
//           width: "300px",
//           borderRight: "1px solid #ddd",
//           display: "flex",
//           flexDirection: "column",
//         }}
//       >
//         <div
//           style={{ flex: 1, overflow: "auto" }}
//           className="layers-container"
//         />
//         <div
//           style={{ flex: 1, overflow: "auto" }}
//           className="styles-container"
//         />
//         <div
//           style={{ flex: 1, overflow: "auto" }}
//           className="traits-container"
//         />
//         <div
//           style={{ flex: 1, overflow: "auto" }}
//           className="code-editor-container"
//         />
//       </div>

//       {/* Main editor */}
//       <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
//         <div
//           style={{
//             padding: "10px",
//             borderBottom: "1px solid #ddd",
//             background: "#f5f5f5",
//             display: "flex",
//             gap: "10px",
//           }}
//         >
//           <button
//             onClick={handleSaveAsComponent}
//             style={{
//               padding: "8px 16px",
//               backgroundColor: "#007BFF",
//               color: "white",
//               border: "none",
//               borderRadius: "5px",
//             }}
//           >
//             Save as Component
//           </button>
//           <button
//             onClick={handleSaveContent}
//             style={{
//               padding: "8px 16px",
//               backgroundColor: "#28A745",
//               color: "white",
//               border: "none",
//               borderRadius: "5px",
//             }}
//           >
//             Save Page
//           </button>
//         </div>
//         <div ref={editorContainer} style={{ flexGrow: 1 }} />
//       </div>
//     </div>
//   );
// };

// export default EditorAdd;
