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

export const getMenusByLocation = async (req, res, next) => {
  try {
    const { location } = req.params;

    // Fetch all menus for the given location
    const menus = await Menu.findAll({
      where: { location },
      order: [["order", "ASC"]],
      raw: true,
      nest: true,
    });

    // Build a map of all menus for easy lookup
    const map = {};
    menus.forEach(menu => {
      map[menu.id] = { ...menu, children: [] };
    });

    // Build hierarchy (attach children to parents)
    const roots = [];
    menus.forEach(menu => {
      if (menu.parentId) {
        if (map[menu.parentId]) {
          map[menu.parentId].children.push(map[menu.id]);
        }
      } else {
        roots.push(map[menu.id]);
      }
    });

    // Fetch custom HTML/CSS/JS content for this section (navbar/footer)
    const customContent = await CustomContent.findOne({
      where: { section: location },
    });

    // Get all active menus (used by frontend)
    

    res.json({
      menus: roots,
      customContent: customContent || { html: "", css: "", js: "" },
      activeMenuIds,
    });
  } catch (error) {
    console.error("❌ Error fetching menus by location:", error);
    next(error);
  }
};



// import { useState, useEffect, useCallback } from "react";
// import axios from "axios";
// import toast from "react-hot-toast";
// import MenuForm from "../components/Navbarmanager/Navmenuform";
// import {
//   DndContext,
//   closestCenter,
//   PointerSensor,
//   useSensor,
//   useSensors,
// } from "@dnd-kit/core";
// import {
//   SortableContext,
//   verticalListSortingStrategy,
//   useSortable,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// const API = "http://localhost:5000/api";

// // ---------------- Sortable Item ----------------
// const SortableItem = ({ item, onEdit, onDelete, level = 0 }) => {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({ id: item.id });
//   const [expanded, setExpanded] = useState(true);

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     padding: "12px",
//     border: "1px solid #e2e8f0",
//     borderRadius: "8px",
//     marginBottom: "8px",
//     marginLeft: `${level * 20}px`,
//     background: isDragging ? "#f0f9ff" : "#fff",
//     display: "flex",
//     flexDirection: "column",
//     opacity: item.hiddenInFrontend ? 0.5 : 1,
//     cursor: isDragging ? "grabbing" : "grab",
//     boxShadow: isDragging ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
//   };

//   return (
//     <div ref={setNodeRef} style={style} {...attributes}>
//       <div {...listeners} className="flex justify-between items-center w-full">
//         <div
//           className="flex items-center gap-2 flex-1 cursor-pointer"
//           onClick={() => {
//             console.log("Toggling expand for:", item.title);
//             setExpanded(!expanded);
//           }}
//         >
//           {item.children && item.children.length > 0 && (
//             <span
//               className={`transition-transform duration-200 text-gray-500 ${
//                 expanded ? "rotate-90" : "rotate-0"
//               }`}
//             >
//               ▶
//             </span>
//           )}
//           <span className="font-medium text-gray-700">{item.title}</span>
//           {item.hiddenInFrontend && (
//             <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded">
//               Hidden
//             </span>
//           )}
//         </div>

//         <div className="flex gap-2">
//           <button
//             onMouseDown={(e) => {
//               e.stopPropagation();
//               console.log("Editing menu:", item);
//               onEdit(item);
//             }}
//             className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
//           >
//             Edit
//           </button>
//           <button
//             onMouseDown={(e) => {
//               e.stopPropagation();
//               console.log("Deleting menu:", item);
//               onDelete(item);
//             }}
//             className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
//           >
//             Delete
//           </button>
//         </div>
//       </div>

//       {item.children && item.children.length > 0 && expanded && (
//         <div className="mt-3 pl-4 border-l-2 border-gray-200">
//           <SortableContext
//             items={item.children.map((c) => c.id)}
//             strategy={verticalListSortingStrategy}
//           >
//             {item.children.map((child) => (
//               <SortableItem
//                 key={child.id}
//                 item={child}
//                 onEdit={onEdit}
//                 onDelete={onDelete}
//                 level={level + 1}
//               />
//             ))}
//           </SortableContext>
//         </div>
//       )}
//     </div>
//   );
// };

// // ---------------- Helper Functions ----------------
// const moveItemInTree = (tree, itemId, overId) => {
//   console.log("moveItemInTree called:", { itemId, overId });
//   let itemToMove;

//   const removeItem = (nodes) =>
//     nodes
//       .map((node) => {
//         if (node.id === itemId) {
//           itemToMove = node;
//           return null;
//         }
//         if (node.children) {
//           node.children = removeItem(node.children).filter(Boolean);
//         }
//         return node;
//       })
//       .filter(Boolean);

//   const insertItem = (nodes) =>
//     nodes.map((node) => {
//       if (node.id === overId) {
//         node.children = node.children || [];
//         node.children.push(itemToMove);
//       } else if (node.children) {
//         node.children = insertItem(node.children);
//       }
//       return node;
//     });

//   let newTree = removeItem([...tree]);
//   newTree = insertItem(newTree);
//   console.log("New menu tree:", newTree);
//   return newTree;
// };

// const getAllMenuIds = (menu) => {
//   let ids = [String(menu.id)];
//   if (menu.children?.length) {
//     menu.children.forEach((child) => {
//       ids = ids.concat(getAllMenuIds(child));
//     });
//   }
//   return ids;
// };

// const findMenuById = (items, id) => {
//   for (const item of items) {
//     if (String(item.id) === String(id)) return item;
//     if (item.children) {
//       const found = findMenuById(item.children, id);
//       if (found) return found;
//     }
//   }
//   return null;
// };

// // ---------------- Navbar Manager ----------------
// const NavbarManager = () => {
//   const [menus, setMenus] = useState([]);
//   const [selectedMenu, setSelectedMenu] = useState(null);
//   const [customDialogOpen, setCustomDialogOpen] = useState(false);
//   const [customHTML, setCustomHTML] = useState("");
//   const [customCSS, setCustomCSS] = useState("");
//   const [customJS, setCustomJS] = useState("");
//   const [activeMenus, setActiveMenus] = useState([]);
//   const [previewHTML, setPreviewHTML] = useState("");
//   const [customActiveTab, setCustomActiveTab] = useState("HTML");
//   const [isLoading, setIsLoading] = useState(false);

//   const token = localStorage.getItem("token");
//   const menuType = "navbar";

//   const sensors = useSensors(
//     useSensor(PointerSensor, {
//       activationConstraint: {
//         distance: 8,
//       },
//     })
//   );

//   // ---------------- Build Preview HTML ----------------
//   const buildPreviewHTML = useCallback((items, activeIds) => {
//     console.log(
//       "Building preview HTML for items:",
//       items,
//       "activeIds:",
//       activeIds
//     );
//     if (!items?.length) return "";
//     return `<ul style="list-style:none;display:flex;flex-wrap:wrap;gap:1rem;padding:0;margin:0;">${items
//       .filter((item) => !item.hiddenInFrontend)
//       .map(
//         (item) => `<li style="position:relative;">
//           <a href="${item.url || "#"}" target="${
//           item.openInNewTab ? "_blank" : "_self"
//         }"
//             style="text-decoration:none;color:${
//               activeIds.includes(String(item.id)) ? "#fff" : "#111"
//             }; background:${
//           activeIds.includes(String(item.id)) ? "#2563eb" : "transparent"
//         }; padding:8px 12px; border-radius:6px; display:inline-block; transition:all 0.2s; font-weight:500;">
//             ${item.title}
//           </a>
//           ${
//             item.children?.length
//               ? `<div style="margin-top:8px;">${buildPreviewHTML(
//                   item.children,
//                   activeIds
//                 )}</div>`
//               : ""
//           }
//         </li>`
//       )
//       .join("")}</ul>`;
//   }, []);

//   const generatePreview = useCallback(
//     ({ menus, customContent, activeMenus }) => {
//       console.log("Generating preview with:", {
//         menus,
//         customContent,
//         activeMenus,
//       });
//       if (activeMenus.includes("custom") && customContent?.html?.trim()) {
//         setPreviewHTML(`
//         <style>${customContent?.css || ""}</style>
//         ${customContent?.html || "<p style='color:#999;'>No custom HTML</p>"}
//         <script>${customContent?.js || ""}<\/script>
//       `);
//       } else {
//         setPreviewHTML(buildPreviewHTML(menus, activeMenus));
//       }
//     },
//     [buildPreviewHTML]
//   );

//   // ---------------- Fetch Menus ----------------
//   const fetchMenus = useCallback(async () => {
//     console.log("Fetching menus for location:", menuType);
//     setIsLoading(true);
//     try {
//       const res = await axios.get(`${API}/menus/location/${menuType}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = res.data;
//       console.log("Fetched menus:", data);

//       setMenus(data.menus || []);
//       setCustomHTML(data.customContent?.html || "");
//       setCustomCSS(data.customContent?.css || "");
//       setCustomJS(data.customContent?.js || "");

//       let fetchedActiveMenus = (data.activeMenuIds || []).map(String);
//       if (
//         !fetchedActiveMenus.includes("custom") ||
//         !data.customContent?.html?.trim()
//       ) {
//         fetchedActiveMenus = fetchedActiveMenus.filter((id) => id !== "custom");
//       }

//       console.log("Active menus after fetch:", fetchedActiveMenus);
//       setActiveMenus(fetchedActiveMenus);

//       generatePreview({
//         menus: data.menus,
//         customContent: data.customContent,
//         activeMenus: fetchedActiveMenus,
//       });
//     } catch (err) {
//       console.error("Fetch menus error:", err);
//       toast.error(err.response?.data?.message || "Failed to fetch menus");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [token, generatePreview]);

//   useEffect(() => {
//     fetchMenus();
//   }, [fetchMenus]);

//   // ---------------- Handlers ----------------
//   const handleAdd = () => {
//     console.log("Adding new menu");
//     setSelectedMenu({ location: menuType });
//   };

//   const handleEdit = (item) => {
//     console.log("Editing menu item:", item);
//     setSelectedMenu(item);
//   };

//   const handleDelete = async (item) => {
//     console.log("Deleting menu item:", item);
//     if (!window.confirm(`Are you sure you want to delete "${item.title}"?`))
//       return;

//     const loadingToast = toast.loading("Deleting menu...");
//     try {
//       await axios.delete(`${API}/menus/${item.id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       console.log("Menu deleted successfully");
//       toast.success("Menu deleted successfully", { id: loadingToast });
//       fetchMenus();
//     } catch (err) {
//       console.error("Delete menu error:", err);
//       toast.error(err.response?.data?.message || "Failed to delete menu", {
//         id: loadingToast,
//       });
//     }
//   };

//   const handleSave = async (menuData) => {
//     console.log("Saving menu data:", menuData);
//     const loadingToast = toast.loading("Saving menu...");
//     try {
//       if (menuData.id) {
//         await axios.put(`${API}/menus/${menuData.id}`, menuData, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         console.log("Menu updated:", menuData);
//       } else {
//         await axios.post(`${API}/menus`, menuData, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         console.log("Menu created:", menuData);
//       }
//       toast.success("Menu saved successfully", { id: loadingToast });
//       setSelectedMenu(null);
//       fetchMenus();
//     } catch (err) {
//       console.error("Save menu error:", err);
//       toast.error(err.response?.data?.message || "Failed to save menu", {
//         id: loadingToast,
//       });
//     }
//   };

//   const handleDragEnd = async ({ active, over }) => {
//     console.log("Drag ended:", { active, over });
//     if (!over || active.id === over.id) return;

//     const newMenus = moveItemInTree(menus, active.id, over.id);
//     setMenus(newMenus);

//     try {
//       await axios.post(
//         `${API}/menus/hierarchy`,
//         { menuTree: newMenus, location: menuType },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       console.log("Menu hierarchy updated");
//       toast.success("Menu order updated");
//     } catch (err) {
//       console.error("Hierarchy update error:", err);
//       toast.error(err.response?.data?.message || "Failed to update order");
//       fetchMenus();
//     }
//   };

  

//   const handleToggleActiveMenu = (id) => {
//     console.log("Toggling active menu ID:", id);
//     const menuItem =
//       id === "custom" ? { id: "custom" } : findMenuById(menus, id);
//     if (!menuItem) return;

//     const idsToToggle = getAllMenuIds(menuItem);
//     console.log("Menu IDs to toggle:", idsToToggle);

//     setActiveMenus((prev) => {
//       const isActive = idsToToggle.every((i) => prev.includes(i));
//       const newState = isActive
//         ? prev.filter((i) => !idsToToggle.includes(i))
//         : [...prev, ...idsToToggle.filter((i) => !prev.includes(i))];
//       console.log("New active menus:", newState);

//       generatePreview({
//         menus,
//         customContent: { html: customHTML, css: customCSS, js: customJS },
//         activeMenus: newState,
//       });

//       return newState;
//     });
//   };

//   const handleSaveActiveMenus = async () => {
//     console.log("Saving active menus:", activeMenus);
//     const loadingToast = toast.loading("Saving active menus...");
//     try {
//       const idsToSend = activeMenus.filter(
//         (id) => id !== "custom" || customHTML.trim() !== ""
//       );
//       console.log("Active menu IDs sent to backend:", idsToSend);

//       await axios.post(
//         `${API}/menus/set-active`,
//         { menuIds: idsToSend, section: menuType },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       toast.success("Active menus updated successfully!", { id: loadingToast });
//     } catch (err) {
//       console.error("Save active menus error:", err);
//       toast.error(
//         err.response?.data?.message || "Failed to save active menus",
//         { id: loadingToast }
//       );
//     }
//   };

//   const handleSaveCustomContent = async () => {
//     console.log("Saving custom content:", { customHTML, customCSS, customJS });
//     const loadingToast = toast.loading("Saving custom content...");
//     try {
//       await axios.post(
//         `${API}/menus/custom-content`,
//         { section: menuType, html: customHTML, css: customCSS, js: customJS },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       console.log("Custom content saved successfully");
//       toast.success("Custom content saved successfully!", { id: loadingToast });
//       setCustomDialogOpen(false);
//       fetchMenus();
//     } catch (err) {
//       console.error("Save custom content error:", err);
//       toast.error(
//         err.response?.data?.message || "Failed to save custom content",
//         { id: loadingToast }
//       );
//     }
//   };

//   const handleDeleteCustomContent = async () => {
//     console.log("Deleting custom content...");
//     if (!window.confirm("Are you sure you want to delete all custom content?"))
//       return;

//     const loadingToast = toast.loading("Deleting custom content...");
//     try {
//       await axios.delete(`${API}/menus/custom-content/${menuType}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       console.log("Custom content deleted successfully");
//       toast.success("Custom content deleted successfully!", {
//         id: loadingToast,
//       });
//       setCustomHTML("");
//       setCustomCSS("");
//       setCustomJS("");
//       setCustomDialogOpen(false);

//       const newActiveMenus = activeMenus.filter((id) => id !== "custom");
//       setActiveMenus(newActiveMenus);

//       generatePreview({
//         menus,
//         customContent: { html: "", css: "", js: "" },
//         activeMenus: newActiveMenus,
//       });
//     } catch (err) {
//       console.error("Delete custom content error:", err);
//       toast.error(
//         err.response?.data?.message || "Failed to delete custom content",
//         { id: loadingToast }
//       );
//     }
//   };

//   // ---------------- Render ----------------
//   console.log("Rendering NavbarManager:", {
//     menus,
//     activeMenus,
//     customDialogOpen,
//     selectedMenu,
//   });

//   // ---------------- Render ----------------
//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="max-w-6xl mx-auto mt-8 px-8 py-6 rounded-t-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
//         <h1 className="text-3xl font-bold tracking-wide">
//           Navbar Menu Manager
//         </h1>
//         <p className="mt-2 text-sm opacity-90">
//           Build and organize navigation menus for your website header with
//           drag-and-drop support.
//         </p>
//       </div>

//       <div className="p-6 max-w-6xl mx-auto bg-white border border-gray-200 rounded-b-2xl shadow-lg">
//         {/* Action Buttons */}
//         <div className="mb-6 flex justify-end gap-3">
//           <button
//             onClick={handleAdd}
//             disabled={isLoading}
//             className="px-5 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             + Add Menu
//           </button>
//           <button
//             onClick={() => setCustomDialogOpen(true)}
//             disabled={isLoading}
//             className={`px-5 py-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
//               activeMenus.includes("custom")
//                 ? "bg-green-500 text-white shadow hover:bg-green-600"
//                 : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//             }`}
//           >
//             Custom Menu
//           </button>
//         </div>

//         {/* Loading State */}
//         {isLoading && (
//           <div className="text-center py-8">
//             <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
//             <p className="mt-2 text-gray-600">Loading menus...</p>
//           </div>
//         )}

//         {/* Nested Menu Drag Area */}
//         {!isLoading && (
//           <div className="mb-6">
//             {menus.length === 0 ? (
//               <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
//                 <p className="text-gray-500 text-lg">No menus created yet</p>
//                 <p className="text-gray-400 text-sm mt-1">
//                   Click "Add Menu" to get started
//                 </p>
//               </div>
//             ) : (
//               <DndContext
//                 sensors={sensors}
//                 collisionDetection={closestCenter}
//                 onDragEnd={handleDragEnd}
//               >
//                 <SortableContext
//                   items={menus.map((m) => m.id)}
//                   strategy={verticalListSortingStrategy}
//                 >
//                   {menus.map((item) => (
//                     <SortableItem
//                       key={item.id}
//                       item={item}
//                       onEdit={handleEdit}
//                       onDelete={handleDelete}
//                     />
//                   ))}
//                 </SortableContext>
//               </DndContext>
//             )}
//           </div>
//         )}

//         {/* Active Menus Section */}
//         {!isLoading && menus.length > 0 && (
//           <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
//             <h3 className="text-lg font-semibold mb-3 text-gray-700">
//               Active Menus
//             </h3>
//             <p className="text-sm text-gray-600 mb-3">
//               Select which menus to display on the frontend
//             </p>

//             <div className="flex flex-wrap gap-2 mb-4">
//               {menus
//                 .filter((item) => !item.hiddenInFrontend)
//                 .map((item) => (
//                   <button
//                     key={item.id}
//                     onClick={() => handleToggleActiveMenu(item.id)}
//                     className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
//                       activeMenus.includes(String(item.id))
//                         ? "bg-green-500 text-white shadow-md scale-105"
//                         : "bg-white text-gray-600 hover:bg-gray-100 hover:border-gray-400"
//                     }`}
//                   >
//                     {item.title}
//                   </button>
//                 ))}

//               {(customHTML.trim() || activeMenus.includes("custom")) && (
//                 <button
//                   onClick={() => handleToggleActiveMenu("custom")}
//                   className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
//                     activeMenus.includes("custom")
//                       ? "bg-green-500 text-white shadow-md scale-105"
//                       : "bg-white text-gray-600 hover:bg-gray-100 hover:border-gray-400"
//                   }`}
//                 >
//                   Custom
//                 </button>
//               )}
//             </div>

//             <button
//               onClick={handleSaveActiveMenus}
//               className="px-5 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors"
//             >
//               Save Active Menus
//             </button>
//           </div>
//         )}

//         {/* Menu Form */}
//         {selectedMenu && (
//           <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
//             <MenuForm
//               menu={selectedMenu}
//               menus={menus}
//               onSave={handleSave}
//               onCancel={() => setSelectedMenu(null)}
//             />
//           </div>
//         )}

//         {/* Live Preview */}
//         {!isLoading && (
//           <div className="mt-8">
//             <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">
//               Live Navbar Preview
//             </h2>
//             <div className="border-2 border-gray-200 rounded-xl p-6 bg-white overflow-auto max-h-[400px] shadow-inner">
//               {previewHTML ? (
//                 <div dangerouslySetInnerHTML={{ __html: previewHTML }} />
//               ) : (
//                 <p className="text-center text-gray-400">
//                   No active menus to preview
//                 </p>
//               )}
//             </div>
//           </div>
//         )}

    
//         {customDialogOpen && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
//             <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
//               <div className="p-6 border-b border-gray-200">
//                 <div className="flex justify-between items-center">
//                   <h2 className="text-xl font-bold text-gray-800">
//                     Edit Navbar Custom Content
//                   </h2>
//                   <button
//                     onClick={() => setCustomDialogOpen(false)}
//                     className="text-gray-400 hover:text-gray-600 transition-colors"
//                   >
//                   
//                     <svg
//                       className="w-6 h-6"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path      strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M6 18L18 6M6 6l12 12"
//                       />
//                     </svg>
//                   </button>
//                 </div>
//               </div>

//               <div className="flex border-b border-gray-200 bg-gray-50 px-6">
//                 {["HTML", "CSS", "JS"].map((tab) => (
//                   <button
//                     key={tab}
//                     className={`px-6 py-3 font-medium transition-colors relative ${
//                       tab === customActiveTab
//                         ? "text-blue-600"
//                         : "text-gray-600 hover:text-blue-500"
//                     }`}
//                     onClick={() => setCustomActiveTab(tab)}
//                   >
//                     {tab}
//                     {tab === customActiveTab && (
//                       <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
//                     )}
//                   </button>
//                 ))}
//               </div>

//               <div className="flex flex-1 gap-4 p-6 overflow-hidden">
//                 <div className="flex-1 flex flex-col">
//                   <label className="text-sm font-medium text-gray-700 mb-2">
//                     {customActiveTab} Editor
//                   </label>
//                   <textarea
//                     value={
//                       customActiveTab === "HTML"
//                         ? customHTML
//                         : customActiveTab === "CSS"
//                         ? customCSS
//                         : customJS
//                     }
//                     onChange={(e) => {
//                       if (customActiveTab === "HTML")
//                         setCustomHTML(e.target.value);
//                       if (customActiveTab === "CSS")
//                         setCustomCSS(e.target.value);
//                       if (customActiveTab === "JS") setCustomJS(e.target.value);
//                     }}
//                     placeholder={`Enter ${customActiveTab} code here...`}
//                     className="flex-1 border border-gray-300 rounded-lg p-4 font-mono text-sm resize-none shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </div>

//                 <div className="flex-1 flex flex-col">
//                   <label className="text-sm font-medium text-gray-700 mb-2">
//                     Live Preview
//                   </label>
//                   <iframe
//                     className="flex-1 border border-gray-300 rounded-lg shadow-sm bg-white"
//                     sandbox="allow-scripts"
//                     title="Custom Content Preview"
//                     srcDoc={`<!DOCTYPE html><html><head><style>${customCSS}</style></head><body>${customHTML}<script>${customJS}<\/script></body></html>`}
//                   />
//                 </div>
//               </div>

//               <div className="flex justify-between items-center gap-3 p-6 border-t border-gray-200 bg-gray-50">
//                 <button
//                   onClick={handleDeleteCustomContent}
//                   className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
//                 >
//                   Delete Custom Content
//                 </button>

//                 <div className="flex gap-3">
//                   <button
//                     onClick={() => setCustomDialogOpen(false)}
//                     className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={handleSaveCustomContent}
//                     className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
//                   >
//                     Save Changes
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default NavbarManager;


import React, { useState, memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Trash2,
  Edit2,
} from "lucide-react";
import Checkbox from "../../ui/Checkbox.jsx";

const SortableItem = memo(
  ({
    item,
    onEdit,
    onDelete,
    level = 0,
    onToggleActiveMenu,
    activeMenus = [],
  }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: item.id });

    const { setNodeRef: setDropRef, isOver } = useDroppable({
      id: `drop-${item.id}`,
    });

    const [isOpen, setIsOpen] = useState(true);
    const isActive = activeMenus.includes(String(item.id));

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      marginLeft: `${level * 20}px`,
      border: isOver ? "2px dashed #3b82f6" : "1px solid #e5e7eb",
      backgroundColor: isOver ? "#eff6ff" : isActive ? "#f0fdf4" : "white",
      cursor: "grab",
    };

    const handleToggle = (e) => {
      const checked = e.target.checked;
      console.log("🟢 Toggled item →", {
        title: item.title,
        id: item.id,
        checked,
        level,
      });

      if (!item.id) {
        console.warn(
          `⚠️ Missing ID for menu "${item.title}" at level ${level}. Full item:`,
          item
        );
      }

      onToggle(String(item.id), checked);
    };


    return (
      <div
        ref={setNodeRef}
        style={style}
        className="rounded-lg shadow-sm p-2 mb-2"
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md group">
          <div className="flex items-center gap-2">
            {item.children?.length > 0 ? (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-600 hover:text-gray-800"
              >
                {isOpen ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
            ) : (
              <span className="w-4" />
            )}

            <GripVertical
              size={16}
              className="text-gray-500 active:cursor-grabbing"
            />

            <span
              className={`font-medium ${
                isActive ? "text-green-600" : "text-gray-700"
              }`}
            >
              {item.title}
            </span>
          </div>

          {/* --- Actions --- */}
          <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={() => onEdit(item)}
              className="bg-white p-2 rounded-full text-blue-500 hover:bg-gray-300 transition"
            >
              <Edit2 size={16} />
            </button>

            <button
              onClick={() => onDelete(item)}
              className="bg-white p-2 rounded-full text-red-500 hover:bg-gray-300 transition"
            >
              <Trash2 size={16} />
            </button>

            <Checkbox checked={isActive}
              
              onChange={handleToggle}  className={`font-medium ${
                isActive ? "text-green-600" : "text-gray-700"
              }`} />
          </div>
        </div>

        {/* --- Children --- */}
        {isOpen &&  (
          <div ref={setDropRef} className="ml-4 mt-2">
            {item.children?.map((child) => (
              <SortableItem
                key={child.id}
                item={child}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleActiveMenu={onToggleActiveMenu}
                activeMenus={activeMenus}
                level={level + 1}
              />
            ))}
          </div>
        )}

        {/* Drop indicator */}
        {isOver && (
          <div className="h-8 border-2 border-dashed border-blue-400 bg-blue-50 rounded-md mt-1" />
        )}
      </div>
    );
  }
);

export default SortableItem;




  //  <div className="flex flex-wrap gap-2 mb-2 border-b pb-2">
  //       {/* Undo / Redo */}
  //       <Button
  //         onClick={() => editor.chain().focus().undo().run()}
  //         icon={Undo2}
  //         title="Undo"
  //       />
  //       <Button
  //         onClick={() => editor.chain().focus().redo().run()}
  //         icon={Redo2}
  //         title="Redo"
  //       />
  //       <span className="border-r h-6 mx-1" />

  //       {/* Text styles */}
  //       <Button
  //         onClick={() => editor.chain().focus().toggleBold().run()}
  //         icon={Bold}
  //         active={editor.isActive("bold")}
  //         title="Bold"
  //       />
  //       <Button
  //         onClick={() => editor.chain().focus().toggleItalic().run()}
  //         icon={Italic}
  //         active={editor.isActive("italic")}
  //         title="Italic"
  //       />
  //       <Button
  //         onClick={() => editor.chain().focus().toggleHighlight().run()}
  //         icon={Highlighter}
  //         active={editor.isActive("highlight")}
  //         title="Highlight"
  //       />
  //       <span className="border-r h-6 mx-1" />

  //       {/* Heading / Quote / Lists */}
  //       <Button
  //         onClick={() =>
  //           editor.chain().focus().toggleHeading({ level: 2 }).run()
  //         }
  //         icon={Heading2}
  //         active={editor.isActive("heading", { level: 2 })}
  //         title="Heading"
  //       />
  //       <Button
  //         onClick={() => editor.chain().focus().toggleBulletList().run()}
  //         icon={List}
  //         active={editor.isActive("bulletList")}
  //         title="Bullet List"
  //       />
  //       <Button
  //         onClick={() => editor.chain().focus().toggleTaskList().run()}
  //         icon={ListChecks}
  //         active={editor.isActive("taskList")}
  //         title="Task List"
  //       />
  //       <Button
  //         onClick={() => editor.chain().focus().toggleBlockquote().run()}
  //         icon={Quote}
  //         active={editor.isActive("blockquote")}
  //         title="Quote"
  //       />
  //       <span className="border-r h-6 mx-1" />

  //       {/* Alignment */}
  //       <Button
  //         onClick={() => editor.chain().focus().setTextAlign("left").run()}
  //         icon={AlignLeft}
  //         active={editor.isActive({ textAlign: "left" })}
  //         title="Align Left"
  //       />
  //       <Button
  //         onClick={() => editor.chain().focus().setTextAlign("center").run()}
  //         icon={AlignCenter}
  //         active={editor.isActive({ textAlign: "center" })}
  //         title="Align Center"
  //       />
  //       <Button
  //         onClick={() => editor.chain().focus().setTextAlign("right").run()}
  //         icon={AlignRight}
  //         active={editor.isActive({ textAlign: "right" })}
  //         title="Align Right"
  //       />
  //       <span className="border-r h-6 mx-1" />

  //       {/* Sub/Sup */}
  //       <Button
  //         onClick={() => editor.chain().focus().toggleSubscript().run()}
  //         icon={SubIcon}
  //         active={editor.isActive("subscript")}
  //         title="Subscript"
  //       />
  //       <Button
  //         onClick={() => editor.chain().focus().toggleSuperscript().run()}
  //         icon={SupIcon}
  //         active={editor.isActive("superscript")}
  //         title="Superscript"
  //       />
  //       <span className="border-r h-6 mx-1" />

  //       {/* Divider & Image */}
  //       <Button
  //         onClick={() => editor.chain().focus().setHorizontalRule().run()}
  //         icon={Minus}
  //         title="Divider"
  //       />
  //       <Button onClick={handleImageClick} icon={ImageIcon} title="Add Image" />
  //       <input
  //         type="file"
  //         accept="image/*"
  //         ref={fileInputRef}
  //         onChange={handleImageUpload}
  //         className="hidden"
  //       />
  //     </div>
  //      