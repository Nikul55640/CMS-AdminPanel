import { useRef, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import navigate
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


const EditorAdd = () => {
  const editorRef = useRef(null);
  const [editorKey] = useState(Date.now());
  const { setPageContent } = useContext(CmsContext);
  const navigate = useNavigate();

  // Cleanup on unmount
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

  const handleSaveContent = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.getHtml();
    const css = editorRef.current.getCss();

    setPageContent({ html, css });
    toast.success("✅ Content saved!");
    navigate("/admin/addPage");
  };

  return (
    <div className="flex h-screen">
      {/* Components panel */}


      {/* Main editor */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b bg-white shadow">
          <h1 className="text-xl font-bold">Studio Editor Pro</h1>
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
              googleFontsAssetProvider.init({ apiKey: "GOOGLE_FONTS_API_KEY" }),
              (editor) => {
                editor.onReady(() => {
                  const textCmp = editor.getWrapper().find("p")[0];
                  editor.select(textCmp);
                });
              },
              canvasGridMode?.init({
                styleableGrid: true,
              }),
              rteTinyMce.init({
                enableOnClick: true,
                // Custom TinyMCE configuration
                loadConfig: ({ component, config }) => {
                  const demoRte = component.get("demorte");
                  if (demoRte === "fixed") {
                    return {
                      toolbar:
                        "bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | link image media",
                      fixed_toolbar_container_target:
                        document.querySelector(".rteContainer"),
                    };
                  } else if (demoRte === "quickbar") {
                    return {
                      plugins: `${config.plugins} quickbars`,
                      toolbar: false,
                      quickbars_selection_toolbar:
                        "bold italic underline strikethrough | quicklink image",
                    };
                  }
                  return {};
                },
              }),
              animationComponent.init({
                animations({ items }) {
                  return [
                    ...items, // Keep existing animations
                    // Add your custom animations here
                    {
                      id: "customWiggle",
                      name: "Custom Wiggle",
                      css: `
                @keyframes customWiggle {
                  0% { transform: rotate(0deg); }
                  15% { transform: rotate(-5deg); }
                  30% { transform: rotate(5deg); }
                  45% { transform: rotate(-5deg); }
                  60% { transform: rotate(3deg); }
                  75% { transform: rotate(-2deg); }
                  100% { transform: rotate(0deg); }
                }`,
                    },
                  ];
                },
              }),
              accordionComponent.init({
                block: { category: "My Accordions" },
                blockGroup: { category: "My Accordions" },
              }),
              iconifyComponent.init({
                block: { category: "Extra", label: "Iconify" },
              }),
              swiperComponent?.init({
                block: false, // Skip default block
              }),
              // Add custom blocks for the swiper
              (editor) => {
                editor.Blocks.add("swiper", {
                  label: "Swiper Slider",
                  category: "Swiper example",
                  media:
                    '<svg viewBox="0 0 24 24"><path d="M22 7.6c0-1-.5-1.6-1.3-1.6H3.4C2.5 6 2 6.7 2 7.6v9.8c0 1 .5 1.6 1.3 1.6h17.4c.8 0 1.3-.6 1.3-1.6V7.6zM21 18H3V7h18v11z" fill-rule="nonzero"/><path d="M4 12.5L6 14v-3zM20 12.5L18 14v-3z"/></svg>',
                  content: `<div class="swiper" style="height: 200px">
              <div class="swiper-wrapper">
                <div class="swiper-slide"><div>Slide 1</div></div>
                <div class="swiper-slide"><div>Slide 2</div></div>
                <div class="swiper-slide"><div>Slide 3</div></div>
              </div>
              <div class="swiper-button-next"></div>
              <div class="swiper-button-prev"></div>
            </div>`,
                });
              },
              lightGalleryComponent?.init({
                block: false, // Skip default block
              }),
              // Add custom gallery blocks
              (editor) => {
                editor.Blocks.add("gallery-images", {
                  label: "Gallery Images",
                  category: "LightGallery examples",
                  media:
                    '<svg viewBox="0 0 24 24"><path d="M5,14L8.5,9.5L11,12.5L14.5,8L19,14M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4C22,2.89 21.1,2 20,2Z" /></svg>',
                  content: {
                    type: "lightGallery",
                    components: [
                      {
                        type: "lightGallery-item",
                        attributes: {
                          href: "https://placehold.co/1500/777/white.png?text=Image+1+(Open)",
                        },
                        components: {
                          type: "image",
                          src: "https://placehold.co/100/777/white.png?text=Image+1",
                        },
                      },
                      {
                        type: "lightGallery-item",
                        attributes: {
                          href: "https://placehold.co/1500/777/white.png?text=Image+2+(Open)",
                        },
                        components: {
                          type: "image",
                          src: "https://placehold.co/100/777/white.png?text=Image+2",
                        },
                      },
                    ],
                  },
                });
                editor.Blocks.add("gallery-videos", {
                  label: "Gallery Video",
                  category: "LightGallery examples",
                  media:
                    '<svg viewBox="0 0 24 24"><path d="M18,14L14,10.8V14H6V6H14V9.2L18,6M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4C22,2.89 21.1,2 20,2Z" /></svg>',
                  content: {
                    type: "lightGallery",
                    components: [
                      {
                        type: "lightGallery-item",
                        attributes: {
                          "data-src":
                            "https://www.youtube.com/watch?v=EIUJfXk3_3w",
                          "data-sub-html": "Video Caption 1",
                        },
                        components: {
                          type: "image",
                          src: "https://img.youtube.com/vi/EIUJfXk3_3w/maxresdefault.jpg",
                          style: { width: "200px" },
                        },
                      },
                      {
                        type: "lightGallery-item",
                        attributes: {
                          "data-src": "https://vimeo.com/112836958",
                          "data-sub-html": "Video Caption 2",
                        },
                        components: {
                          type: "image",
                          src: "https://i.vimeocdn.com/video/506427660-2e93a42675715090a52de8e6645d592c5f58c1a7e388231d801072c9b2d9843d-d?mw=300",
                          style: { width: "200px" },
                        },
                      },
                    ],
                  },
                });
              },
              listPagesComponent?.init({
                block: { category: "Extra", label: "My List Pages" },
              }),
              tableComponent.init({
                block: { category: "Extra", label: "My Table" },
              }),
              dialogComponent.init({
                block: { category: "Extra", label: "My Dialog" },
              }),
              layoutSidebarButtons.init({
                sidebarButton({ id, buttonProps }) {
                  if (id === "panelGlobalStyles") return null;
                  return buttonProps;
                },
              }),
            ],

            project: {
              default: {
                pages: [
                  {
                    id: "id-home-page",
                    name: "Home",
                    component: `
                <h1>Auto-generated</h1>
                <ul data-gjs-type="list-pages"></ul>
    
                <h1>Statically defined, with custom styles</h1>
                <ul class="list-pages" data-gjs-type="list-pages">
                  <li data-gjs-type="list-pages-item">
                    <a data-gjs-type="list-pages-link" href="page://id-home-page">
                      Home
                    </a>
                  </li>
                  <li data-gjs-type="list-pages-item">
                    <a data-gjs-type="list-pages-link" href="page://id-about-page">
                      About
                    </a>
                  </li>
                  <li data-gjs-type="list-pages-item">
                    <a data-gjs-type="list-pages-link" href="page://id-contact-page">
                      Contact FIX ME
                    </a>
                  </li>
                </ul>
    
                <style>
                  body {
                    font-family: system-ui;
                  }
                  .list-pages {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    gap: 1rem;
                  }
                  .list-pages a {
                    display: block;
                    color: red;
                    text-decoration: none;
                    border: 1px solid;
                    padding: 0.5rem 1rem;
                    border-radius: 1rem;
                  }
                </style>
              `,
                  },
                  {
                    id: "id-about-page",
                    name: "About",
                    component: "<h1>About page</h1>",
                  },
                  {
                    id: "id-contact-page",
                    name: "Contact",
                    component: "<h1>Contact page</h1>",
                  },
                ],
              },
            },
            project1: {
              default: {
                pages: [
                  {
                    name: "Home",
                    component: `
                <h1>Table plugin</h1>
                <table>
                  <tbody>
                    <tr>
                      <td>Cell 0:0</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td></td>
                      <td>Cell 1:1</td>
                    </tr>
                  </tbody>
                </table>
            `,
                  },
                ],
              },
            },
          }}
          onReady={(editor) => {
            editorRef.current = editor;

            // Reset editor content
            editor.DomComponents.clear();
            editor.CssComposer.clear();
            editor.setComponents("<div>Start editing...</div>");
            editor.setStyle("");

            // Blocks
            const bm = editor.BlockManager;
            bm.add("sample input field", {
              label: "input-field",
              category: "sample",
              content: {
                script: "my script",
              },
            });
            bm.add("text-block", {
              label: "Text",
              content: '<p style="padding:10px;">Insert your text here</p>',
              category: "Basic",
            });
            bm.add("image-block", {
              label: "Image",
              content:
                '<img src="https://via.placeholder.com/600x300" style="max-width:100%"/>',
              category: "Basic",
            });
            bm.add("button-block", {
              label: "Button",
              content:
                '<button style="padding:10px 20px; background:#2563eb; color:white; border:none; border-radius:6px;">Click Me</button>',
              category: "Basic",
            });
            bm.add("hero-section", {
              label: "Hero Section",
              content: `<section style="padding:60px; text-align:center; background:#f9fafb;">
                          <h1 style="font-size:2.5rem; font-weight:bold;">Welcome</h1>
                          <p style="margin:20px 0; color:#555;">Hero description</p>
                          <button style="padding:12px 24px; background:#16a34a; color:white; border:none; border-radius:6px;">Get Started</button>
                        </section>`,
              category: "Layout",
            });
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
            bm.add("footer-block", {
              label: "Footer",
              content: `<footer style="padding:20px; background:#111827; color:white; text-align:center;">
                          <p>&copy; 2025 My Website. All rights reserved.</p>
                        </footer>`,
              category: "Layout",
            });
          }}
        />
      </div>
      </div>
    </div>
  );
};

export default EditorAdd;
