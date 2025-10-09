import { useContext, useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CmsContext from "../context/CmsContext";
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
import axios from "axios";

const EditorPage = () => {
  const { slug } = useParams();
  const { pages, setPages, token } = useContext(CmsContext);
  const page = pages.find((p) => p.slug === slug);
  const navigate = useNavigate();

  const editorRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: page?.title || "",
    slug: page?.slug || "",
    description: page?.description || "",
    metaTitle: page?.metaTitle || "",
    metaDescription: page?.metaDescription || "",
    keywords: page?.keywords || "",
    status: page?.status || "draft",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!editorRef.current || !page) return toast("Editor not ready!");

    const html = editorRef.current.getHtml();
    const css = editorRef.current.getCss();

    if (!html.trim()) return toast("⚠️ Page content cannot be empty!");

    console.log("Payload:", { ...formData, html, css });
    setIsSaving(true);
    try {
      const res = await axios.put(
        `http://localhost:5000/api/pages/${page.slug}`,
        { ...formData, html, css },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPages(pages.map((p) => (p.slug === page.slug ? res.data : p)));
      toast.success("✅ Page updated successfully!");
      navigate("/admin/pages");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save page");
    } finally {
      setIsSaving(false);
    }
  };

  const loadSavedComponents = async () => {
    if (!editorRef.current) return;

    try {
      const res = await axios.get("http://localhost:5000/api/components", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const bm = editorRef.current.BlockManager;
      res.data.forEach((cmp) => {
        bm.add(cmp.name, {
          label: cmp.name,
          category: cmp.category || "Reusable",
          content: `<div>${cmp.html}</div><style>${cmp.css}</style>`,
        });
      });
    } catch (err) {
      console.error("Failed to load components:", err);
    }
  };

  useEffect(() => {
    return () => {
      if (editorRef.current?.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  if (!page) return <p>Page not found</p>;
console.log(loadSavedComponents)
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}

      <div className="flex flex-1 overflow-hidden">
        {/* Right panel - GrapesJS Editor */}
        <div className="w-3/4 p-4 bg-gray-50 overflow-y-auto border-r">
          <StudioEditor
            key={slug}
            options={{
              initialHtml: page.html || "<div>Start editing...</div>",
              initialCss: page.css || "",
              style: { height: "100%", width: "100%" },
              plugins: [
                googleFontsAssetProvider.init({
                  apiKey: "GOOGLE_FONTS_API_KEY",
                }),
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
            }}
            onReady={(editor) => {
              editorRef.current = editor;

              // Reset existing components
              editor.DomComponents.clear();
              editor.CssComposer.clear();
              editor.setComponents(page.html || "<div>Start editing...</div>");
              editor.setStyle(page.css || "");

              loadSavedComponents();

              // Add blocks (same as your modal code)
              const addBlock = (id, opts) => {
                if (!editor.Blocks.get(id)) editor.Blocks.add(id, opts);
              };

              // BASIC
              addBlock("text-block", {
                label: "Text",
                content: '<p style="padding:10px;">Insert your text here</p>',
                category: "Basic",
              });
              addBlock("heading-block", {
                label: "Heading",
                content:
                  '<h2 style="font-size:2rem; font-weight:bold;">Heading Text</h2>',
                category: "Basic",
              });
              addBlock("image-block", {
                label: "Image",
                content:
                  '<img src="https://via.placeholder.com/600x300" style="max-width:100%"/>',
                category: "Basic",
              });

              // LAYOUT
              addBlock("2-columns", {
                label: "2 Columns",
                content: `
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                  <div style="background:#f3f4f6; padding:20px;">Column 1</div>
                  <div style="background:#f3f4f6; padding:20px;">Column 2</div>
                </div>`,
                category: "Layout",
              });

              // COMPONENTS
              addBlock("card-block", {
                label: "Card",
                content: `
                <div style="border:1px solid #e5e7eb; border-radius:8px; padding:20px; text-align:center; background:white;">
                  <img src="https://via.placeholder.com/150" style="border-radius:50%; margin-bottom:15px;" />
                  <h3 style="font-size:1.25rem; font-weight:bold;">Card Title</h3>
                  <p style="color:#6b7280;">This is a simple card description.</p>
                </div>`,
                category: "Components",
              });

              // You can continue adding other blocks exactly like in your modal code
            }}
          />
        </div>
        <div className="w-1/4 p-4 bg-gray-50 overflow-y-auto border-r">
          <h2 className="text-lg font-semibold mb-2">Page Info</h2>
          <input
            type="text"
            placeholder="Title"
            className="border p-2 rounded mb-2 w-full"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
          <input
            type="text"
            placeholder="Slug"
            className="border p-2 rounded mb-2 w-full"
            value={formData.slug}
            onChange={(e) => handleChange("slug", e.target.value)}
          />
          <textarea
            placeholder="Description"
            className="border p-2 rounded mb-2 w-full"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />

          <h2 className="text-lg font-semibold mt-4 mb-2">SEO</h2>
          <input
            type="text"
            placeholder="Meta Title"
            className="border p-2 rounded mb-2 w-full"
            value={formData.metaTitle}
            onChange={(e) => handleChange("metaTitle", e.target.value)}
          />
          <textarea
            placeholder="Meta Description"
            className="border p-2 rounded mb-2 w-full"
            value={formData.metaDescription}
            onChange={(e) => handleChange("metaDescription", e.target.value)}
          />
          <input
            type="text"
            placeholder="Keywords"
            className="border p-2 rounded mb-2 w-full"
            value={formData.keywords}
            onChange={(e) => handleChange("keywords", e.target.value)}
          />

          <h2 className="text-lg font-semibold mt-4 mb-2">Status</h2>
          <select
            className="border p-2 rounded w-full"
            value={formData.status}
            onChange={(e) => handleChange("status", e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-4 py-2 rounded text-white ${
              isSaving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isSaving ? "Saving..." : "Save & Close"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
