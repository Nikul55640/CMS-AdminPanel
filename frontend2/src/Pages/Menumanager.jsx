// src/Pages/Menumanager.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import MenuForm from "./Navmenuform";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const API = "http://localhost:5000/api";

// ---------------- Sortable Item ----------------
const SortableItem = ({ item, onEdit, onDelete, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });
  const [expanded, setExpanded] = useState(true);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    marginBottom: "8px",
    background: "",
    display: "flex",
    flexDirection: "column",
    opacity: item.hiddenInFrontend ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div
        {...listeners}
        className="flex justify-between items-center w-full cursor-grab"
      >
        <div
          className="flex items-center gap-2"
          onClick={() => setExpanded(!expanded)}
        >
          {children && children.length > 0 && (
            <span
              className={`transition-transform duration-300 ${
                expanded ? "rotate-90" : "rotate-0"
              }`}
            >
              ▶
            </span>
          )}
          <span>{item.title}</span>
          {item.hiddenInFrontend && (
            <span className="text-xs ml-2 text-red-500">(hidden)</span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onMouseDown={() => onEdit(item)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Edit
          </button>
          <button
            onMouseDown={() => onDelete(item)}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      </div>

      {children && children.length > 0 && (
        <div
          className="ml-4 mt-2 overflow-hidden transition-all duration-300"
          style={{ maxHeight: expanded ? `${children.length * 60}px` : "0px" }}
        >
          {children.map((child) => (
            <SortableItem
              key={child.id}
              item={child}
              onEdit={onEdit}
              onDelete={onDelete}
              children={child.children}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ---------------- Menu Manager ----------------
const MenuManager = () => {
  const [menus, setMenus] = useState([]);
  const [menuType, setMenuType] = useState("navbar");
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customHTML, setCustomHTML] = useState("");
  const [customCSS, setCustomCSS] = useState("");
  const [customJS, setCustomJS] = useState("");
  const [activeMenus, setActiveMenus] = useState([]);
  const [previewHTML, setPreviewHTML] = useState("");
  const [customActiveTab, setCustomActiveTab] = useState("HTML");

  const token = localStorage.getItem("token");
  const sensors = useSensors(useSensor(PointerSensor));

  // ---------------- Fetch Menus ----------------
  const fetchMenus = async () => {
    try {
      const res = await axios.get(`${API}/menus/location/${menuType}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;

      setMenus(data.menus || []);
      setCustomHTML(data.customContent?.html || "");
      setCustomCSS(data.customContent?.css || "");
      setCustomJS(data.customContent?.js || "");

      // Only include "custom" if it is in activeMenuIds AND has HTML content
      let fetchedActiveMenus = (data.activeMenuIds || []).map(String);
      if (
        !fetchedActiveMenus.includes("custom") ||
        !data.customContent?.html?.trim()
      ) {
        fetchedActiveMenus = fetchedActiveMenus.filter((id) => id !== "custom");
      }

      console.log("Active menus after filtering custom:", fetchedActiveMenus);

      setActiveMenus(fetchedActiveMenus);

      generatePreview({
        menus: data.menus,
        customContent: data.customContent,
        activeMenus: fetchedActiveMenus,
      });
    } catch (err) {
      console.error("Fetch menus error:", err);
      toast.error("Failed to fetch menus");
    }
  };

  useEffect(() => {
    fetchMenus();
  }, [menuType]);

  // ---------------- Build Preview HTML ----------------
  const buildPreviewHTML = (items, activeIds) => {
    if (!items?.length) return "";
    return `<ul style="list-style:none;display:flex;flex-wrap:wrap;gap:1rem;">${items
      .filter((item) => !item.hiddenInFrontend)
      .map(
        (item) => `<li>
          <a href="${item.url || "#"}" target="${
          item.openInNewTab ? "_blank" : "_self"
        }"
            style="text-decoration:none;color:${
              activeIds.includes(String(item.id)) ? "#fff" : "#111"
            }; background:${
          activeIds.includes(String(item.id)) ? "#2563eb" : "transparent"
        }; padding:4px 8px; border-radius:4px;">
            ${item.title}
          </a>
          ${
            item.children?.length
              ? buildPreviewHTML(item.children, activeIds)
              : ""
          }
        </li>`
      )
      .join("")}</ul>`;
  };

  const generatePreview = ({ menus, customContent, activeMenus }) => {
    if (activeMenus.includes("custom") && customContent?.html?.trim()) {
      setPreviewHTML(`
        <style>${customContent?.css || ""}</style>
        ${customContent?.html || "<p>No custom HTML</p>"}
        <script>${customContent?.js || ""}<\/script>
      `);
    } else {
      setPreviewHTML(buildPreviewHTML(menus, activeMenus));
    }
  };

  // ---------------- Helper: Get All Nested IDs ----------------
  const getAllMenuIds = (menu) => {
    let ids = [String(menu.id)];
    if (menu.children?.length) {
      menu.children.forEach((child) => {
        ids = ids.concat(getAllMenuIds(child));
      });
    }
    return ids;
  };

  // ---------------- Handlers ----------------
  const handleAdd = () => setSelectedMenu({ location: menuType });
  const handleEdit = (item) => setSelectedMenu(item);
  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    try {
      await axios.delete(`${API}/menus/${item.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Menu deleted");
      fetchMenus();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleSave = async (menuData) => {
    try {
      if (menuData.id)
        await axios.put(`${API}/menus/${menuData.id}`, menuData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      else
        await axios.post(`${API}/menus`, menuData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      toast.success("Menu saved");
      setSelectedMenu(null);
      fetchMenus();
    } catch (err) {
      toast.error("Failed to save menu");
    }
  };

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const newMenus = arrayMove(
      [...menus],
      menus.findIndex((m) => m.id === active.id),
      menus.findIndex((m) => m.id === over.id)
    );
    setMenus(newMenus);

    try {
      await axios.post(
        `${API}/menus/hierarchy`,
        { menuTree: newMenus, location: menuType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Menu order updated");
    } catch (err) {
      toast.error("Failed to update order");
    }
  };

  // ---------------- Toggle Active Menu ----------------
  const handleToggleActiveMenu = (id) => {
    console.log("Toggle called for ID:", id);

    const findMenuById = (items, id) => {
      for (const item of items) {
        if (String(item.id) === String(id)) {
          console.log("Menu found:", item);
          return item;
        }
        if (item.children) {
          const found = findMenuById(item.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const menuItem =
      id === "custom" ? { id: "custom" } : findMenuById(menus, id);

    if (!menuItem) {
      console.warn("Menu not found for ID:", id);
      return;
    }

    const idsToToggle = getAllMenuIds(menuItem);
    console.log("IDs to toggle:", idsToToggle);

    setActiveMenus((prev) => {
      console.log("Previous activeMenus:", prev);
      const isActive = idsToToggle.every((i) => prev.includes(i));
      console.log("Is currently active:", isActive);

      const newState = isActive
        ? prev.filter((i) => !idsToToggle.includes(i))
        : [...prev, ...idsToToggle.filter((i) => !prev.includes(i))];

      console.log("New activeMenus state:", newState);

      generatePreview({
        menus,
        customContent: { html: customHTML, css: customCSS, js: customJS },
        activeMenus: newState,
      });

      return newState;
    });

    console.log("Toggle complete for IDs:", idsToToggle);
  };

  // ---------------- Save Active Menus ----------------
  const handleSaveActiveMenus = async () => {
    console.log("Saving active menus:", activeMenus);

    try {
      const idsToSend = activeMenus.filter(
        (id) => id !== "custom" || customHTML.trim() !== ""
      );
      console.log("IDs to send to backend:", idsToSend);

      const res = await axios.post(
        `${API}/menus/set-active`,
        { menuIds: idsToSend, section: menuType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Backend response:", res.data);
      toast.success("Active menus updated!");
    } catch (err) {
      console.error("Failed to save active menus:", err);
      toast.error("Failed to save active menus");
    }
  };

  // ---------------- Save Custom Content ----------------
  const handleSaveCustomContent = async () => {
    try {
      await axios.post(
        `${API}/menus/custom-content`,
        { section: menuType, html: customHTML, css: customCSS, js: customJS },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Custom HTML/CSS/JS saved!");
      setCustomDialogOpen(false);
    } catch (err) {
      toast.error("Failed to save custom content");
    }
  };

  // ---------------- Delete Custom Content ----------------
  const handleDeleteCustomContent = async () => {
    if (!window.confirm("Delete custom content?")) return;
    try {
      await axios.delete(`${API}/menus/custom-content/${menuType}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Custom content deleted!");
      setCustomHTML("");
      setCustomCSS("");
      setCustomJS("");
      setCustomDialogOpen(false);
      setActiveMenus((prev) => prev.filter((id) => id !== "custom"));
      generatePreview({
        menus,
        customContent: { html: "", css: "", js: "" },
        activeMenus: activeMenus.filter((id) => id !== "custom"),
      });
    } catch (err) {
      toast.error("Failed to delete custom content");
    }
  };

  // ---------------- Render ----------------
  return (
    <>
      {/* Header */}
      <div className=" max-w-5xl mx-auto mt-6 px-8 py-6 border  border-gray-900 rounded-tr-2xl rounded-tl-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <h1 className="text-2xl font-bold tracking-wide">Menu Manager</h1>
        <p className="mt-1 text-sm opacity-90">
          Build menus for your website. Clean, fast, and intuitive.
        </p>
      </div>

      <div className="p-4 max-w-5xl mx-auto  border border-gray-900 rounded-br-2xl rounded-bl-2xl shadow-lg mb-10">
        {/* Menu Type Buttons */}
        
          <div className=" gap-3">
            <h3 className="font-semibold text-lg mb-2 text-center">Menu Types:</h3>
            {["navbar", "footer"].map((type) => (
              <button
                key={type}
                onClick={() => setMenuType(type)}
                className={`px-4 py-2  w-1/2 cursor-pointer  mb-2 rounded ${
                  menuType === type ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Add Menu
            </button>
            <button
              onClick={() => setCustomDialogOpen(true)}
              className={`px-4 py-2 rounded border ${
                activeMenus.includes("custom")
                  ? "bg-green-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              Custom Menu
            </button>
          </div>
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Set Active Menus:</h3>
          
            <div className="flex flex-wrap gap-2">
              {menus
                .filter((item) => !item.hiddenInFrontend)
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleToggleActiveMenu(item.id)}
                    className={`px-3 py-1 cursor-pointer rounded border ${
                      activeMenus.includes(String(item.id))
                        ? "bg-green-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
            <button
              onClick={() => handleToggleActiveMenu("custom")}
              className={`px-3 py-1 cursor-pointer rounded border ${
                activeMenus.includes("custom")
                  ? "bg-green-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              Custom
            </button>
          </div>
          <div className="mt-2">
            <button
              onClick={handleSaveActiveMenus}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Save Active Menus
            </button>
          </div>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={menus} strategy={verticalListSortingStrategy}>
            {menus.map((item) => (
              <SortableItem
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                children={item.children}
              />
            ))}
          </SortableContext>
        </DndContext>

        {/* Menu Form */}
        {selectedMenu && (
          <MenuForm
            menu={selectedMenu}
            menus={menus}
            onSave={handleSave}
            onCancel={() => setSelectedMenu(null)}
          />
        )}

        {/* Preview */}
        <div className="mt-10 border-t pt-6">
          <h2 className="text-xl font-semibold mb-3 text-center">
            Live {menuType.toUpperCase()} Preview
          </h2>
          <div
            className="border rounded-lg p-4 bg-gray-50 overflow-auto max-h-[400px]"
            dangerouslySetInnerHTML={{ __html: previewHTML }}
          />
        </div>
        {customDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded shadow-lg w-full max-w-4xl p-4 overflow-hidden max-h-[90vh] flex flex-col">
              <h2 className="text-xl font-bold mb-4">
                Edit {menuType} HTML/CSS/JS
              </h2>

              {/* Tabs */}
              <div className="flex border-b mb-2">
                {["HTML", "CSS", "JS"].map((tab) => (
                  <button
                    key={tab}
                    className={`px-4 py-2 font-medium ${
                      tab === customActiveTab
                        ? "border-b-2 border-blue-500 text-blue-500"
                        : "text-gray-600 hover:text-blue-500"
                    }`}
                    onClick={() => setCustomActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Editor and Live Preview */}
              <div className="flex flex-1  gap-4 overflow-y-scroll">
                {/* Editor */}
                <textarea
                  value={
                    customActiveTab === "HTML"
                      ? customHTML
                      : customActiveTab === "CSS"
                      ? customCSS
                      : customJS
                  }
                  onChange={(e) => {
                    if (customActiveTab === "HTML")
                      setCustomHTML(e.target.value);
                    if (customActiveTab === "CSS") setCustomCSS(e.target.value);
                    if (customActiveTab === "JS") setCustomJS(e.target.value);
                  }}
                  className="flex-1 border rounded p-2  h-full font-mono text-sm"
                />

                {/* Live Preview */}
                <iframe
                  className="flex-1 border rounded h-full"
                  sandbox="allow-scripts"
                  srcDoc={`
                    <html>
                      <head>
                        <style>${customCSS}</style>
                      </head>
                      <body>
                        ${customHTML}
                        <script>${customJS}<\/script>
                      </body>
                    </html>
                  `}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-3">
                <button
                  onClick={handleDeleteCustomContent}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                >
                  Delete
                </button>
                <button
                  onClick={handleSaveCustomContent}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MenuManager;
































/// src/Pages/Menumanager.jsx
// import { useState, useEffect } from "react";
// import axios from "axios";
// import toast from "react-hot-toast";
// import MenuForm from "./Navmenuform";
// import {
//   DndContext,
//   closestCenter,
//   PointerSensor,
//   useSensor,
//   useSensors,
// } from "@dnd-kit/core";
// import {
//   arrayMove,
//   SortableContext,
//   verticalListSortingStrategy,
//   useSortable,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// const API = "http://localhost:5000/api";

// // ---------- Sortable Item ----------
// const SortableItem = ({ item, onEdit, onDelete, children }) => {
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({ id: item.id });
//   const [expanded, setExpanded] = useState(true);

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     padding: "12px",
//     border: "1px solid #e2e8f0",
//     borderRadius: "8px",
//     marginBottom: "8px",
//     background: "#fff",
//     display: "flex",
//     flexDirection: "column",
//     opacity: item.hiddenInFrontend ? 0.5 : 1,
//   };

//   return (
//     <div ref={setNodeRef} style={style} {...attributes}>
//       <div
//         {...listeners}
//         className="flex justify-between items-center w-full cursor-grab"
//       >
//         <div
//           className="flex items-center gap-2"
//           onClick={() => setExpanded(!expanded)}
//         >
//           {children && children.length > 0 && (
//             <span
//               className={`transition-transform duration-300 ${
//                 expanded ? "rotate-90" : "rotate-0"
//               }`}
//             >
//               ▶
//             </span>
//           )}
//           <span>{item.title}</span>
//           {item.hiddenInFrontend && (
//             <span className="text-xs ml-2 text-red-500">(hidden)</span>
//           )}
//         </div>

//         <div className="flex gap-2">
//           <button
//             onMouseDown={() => onEdit(item)}
//             className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
//           >
//             Edit
//           </button>
//           <button
//             onMouseDown={() => onDelete(item)}
//             className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
//           >
//             Delete
//           </button>
//         </div>
//       </div>

//       {children && children.length > 0 && (
//         <div
//           className="ml-6 mt-2 overflow-hidden transition-all duration-300"
//           style={{ maxHeight: expanded ? `${children.length * 60}px` : "0px" }}
//         >
//           {children.map((child) => (
//             <SortableItem
//               key={child.id}
//               item={child}
//               onEdit={onEdit}
//               onDelete={onDelete}
//               children={child.children}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// // ---------- Menu Manager ----------
// const MenuManager = () => {
//   const [menus, setMenus] = useState([]);
//   const [menuType, setMenuType] = useState("navbar");
//   const [selectedMenu, setSelectedMenu] = useState(null);
//   const [customDialogOpen, setCustomDialogOpen] = useState(false);
//   const [customHTML, setCustomHTML] = useState("");
//   const [customCSS, setCustomCSS] = useState("");
//   const [customJS, setCustomJS] = useState("");
//   const [activeMenus, setActiveMenus] = useState([]);
//   const [previewHTML, setPreviewHTML] = useState("");

//   const token = localStorage.getItem("token");
//   const sensors = useSensors(useSensor(PointerSensor));

//   // ---------------- Fetch Menus ----------------
//   const fetchMenus = async () => {
//     try {
//       const res = await axios.get(`${API}/menus/location/${menuType}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = res.data;

//       setMenus(data.menus || []);
//       setCustomHTML(data.customContent?.html || "");
//       setCustomCSS(data.customContent?.css || "");
//       setCustomJS(data.customContent?.js || "");
//       setActiveMenus((data.activeMenuIds || []).map(String));

//       generatePreview({
//         menus: data.menus,
//         customContent: data.customContent,
//         activeMenus: (data.activeMenuIds || []).map(String),
//       });
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to fetch menus");
//     }
//   };

//   useEffect(() => {
//     fetchMenus();
//   }, [menuType]);

//   // ---------------- Build Preview ----------------
//   const buildPreviewHTML = (items, activeIds) => {
//     if (!items?.length) return "";
//     return `<ul style="list-style:none;display:flex;gap:1rem;">${items
//       .filter((item) => !item.hiddenInFrontend)
//       .map(
//         (item) => `<li>
//           <a href="${item.url || "#"}" target="${
//           item.openInNewTab ? "_blank" : "_self"
//         }"
//             style="text-decoration:none;color:${
//               activeIds.includes(String(item.id)) ? "#fff" : "#111"
//             }; background:${
//           activeIds.includes(String(item.id)) ? "#2563eb" : "transparent"
//         }; padding:4px 8px; border-radius:4px;">
//             ${item.title}
//           </a>
//           ${
//             item.children?.length
//               ? buildPreviewHTML(item.children, activeIds)
//               : ""
//           }
//         </li>`
//       )
//       .join("")}</ul>`;
//   };

//   const generatePreview = ({ menus, customContent, activeMenus }) => {
//     if (activeMenus.includes("custom") && customContent?.html?.trim()) {
//       setPreviewHTML(`
//         <style>${customContent?.css || ""}</style>
//         ${customContent?.html || "<p>No custom HTML</p>"}
//         <script>${customContent?.js || ""}</script>
//       `);
//     } else {
//       setPreviewHTML(buildPreviewHTML(menus, activeMenus));
//     }
//   };

//   // ---------------- Handlers ----------------
//   const handleAdd = () => setSelectedMenu({ location: menuType });
//   const handleEdit = (item) => setSelectedMenu(item);

//   const handleDelete = async (item) => {
//     if (!window.confirm(`Delete "${item.title}"?`)) return;
//     try {
//       await axios.delete(`${API}/menus/${item.id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       toast.success("Menu deleted");
//       fetchMenus();
//     } catch {
//       toast.error("Delete failed");
//     }
//   };

//   const handleSave = async (menuData) => {
//     try {
//       if (menuData.id)
//         await axios.put(`${API}/menus/${menuData.id}`, menuData, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//       else
//         await axios.post(`${API}/menus`, menuData, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//       toast.success("Menu saved");
//       setSelectedMenu(null);
//       fetchMenus();
//     } catch {
//       toast.error("Failed to save menu");
//     }
//   };

//   const handleDragEnd = async ({ active, over }) => {
//     if (!over || active.id === over.id) return;

//     const newMenus = arrayMove(
//       [...menus],
//       menus.findIndex((m) => m.id === active.id),
//       menus.findIndex((m) => m.id === over.id)
//     );
//     setMenus(newMenus);

//     try {
//       await axios.post(
//         `${API}/menus/hierarchy`,
//         { menuTree: newMenus, location: menuType },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       toast.success("Menu order updated");
//     } catch {
//       toast.error("Failed to update order");
//     }
//   };

//   const handleToggleActiveMenu = (id) => {
//     const stringId = String(id);
//     setActiveMenus((prev) => {
//       const newState = prev.includes(stringId)
//         ? prev.filter((i) => i !== stringId)
//         : [...prev, stringId];
//       generatePreview({
//         menus,
//         customContent: { html: customHTML, css: customCSS, js: customJS },
//         activeMenus: newState,
//       });
//       return newState;
//     });
//   };

//   const handleSaveActiveMenus = async () => {
//     try {
//       const idsToSend = activeMenus.filter(
//         (id) => id !== "custom" || customHTML.trim() !== ""
//       );

//       await axios.post(
//         `${API}/menus/set-active`,
//         { menuIds: idsToSend, section: menuType },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       toast.success("Active menus updated!");
//     } catch {
//       toast.error("Failed to save active menus");
//     }
//   };

//   const handleSaveCustomContent = async () => {
//     try {
//       await axios.post(
//         `${API}/menus/custom-content`,
//         { section: menuType, html: customHTML, css: customCSS, js: customJS },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       toast.success("Custom HTML/CSS/JS saved!");
//       setCustomDialogOpen(false);
//     } catch {
//       toast.error("Failed to save custom content");
//     }
//   };

//   const handleDeleteCustomContent = async () => {
//     if (!window.confirm("Delete custom content?")) return;

//     try {
//       await axios.delete(`${API}/menus/custom-content/${menuType}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       toast.success("Custom content deleted!");

//       // Clear local state
//       setCustomHTML("");
//       setCustomCSS("");
//       setCustomJS("");
//       setCustomDialogOpen(false);

//       // Remove "custom" from active menus & update preview
//       setActiveMenus((prev) => {
//         const updatedActive = prev.filter((id) => id !== "custom");
//         generatePreview({
//           menus,
//           customContent: { html: "", css: "", js: "" },
//           activeMenus: updatedActive,
//         });
//         return updatedActive;
//       });
//     } catch {
//       toast.error("Failed to delete custom content");
//     }
//   };

//   return (
//     <div className="p-4 max-w-7xl mx-auto">
//       <h1 className="text-2xl font-bold mb-4 flex justify-center underline underline-offset-4">
//         Menu Manager
//       </h1>

//       {/* Menu Types */}

//       <div className="flex gap-3 mb-6">
//       <div className="flex justify-start items-center gap-3">
//         <h3 className="font-semibold text-lg  mb-2">Menu Types:</h3>
//         {["navbar", "footer"].map((type) => (
//           <button
//             key={type}
//             onClick={() => setMenuType(type)}
//             className={`px-4 py-2 cursor-pointer rounded ${
//               menuType === type ? "bg-blue-500 text-white" : "bg-gray-200"
//             }`}
//           >
//             {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
//           </button>
//         ))}
//       </div>

//       <div className="flex justify-end gap-3">
//         <button
//           onClick={handleAdd}
//           className="px-4 py-2 bg-green-500 flex justify-between  text-white rounded"
//         >
//           Add Menu
//         </button>
//         <button
//           onClick={() => setCustomDialogOpen(true)}
//           className={`px-4 py-2 rounded border ${
//             activeMenus.includes("custom")
//               ? "bg-green-500 text-white"
//               : "bg-gray-200"
//           }`}
//         >
//           Custom Menu
//         </button>
//       </div>
//       </div>
//       {/* Active Menus */}
//       <div className="mb-6">
//         <h3 className="font-semibold mb-2">Set Active Menus:</h3>
//         <div className="flex flex-wrap gap-2">
//           {menus
//             .filter((item) => !item.hiddenInFrontend)
//             .map((item) => (
//               <button
//                 key={item.id}
//                 onClick={() => handleToggleActiveMenu(item.id)}
//                 className={`px-3 py-1 rounded border ${
//                   activeMenus.includes(String(item.id))
//                     ? "bg-green-500 text-white"
//                     : "bg-gray-200"
//                 }`}
//               >
//                 {item.title}
//               </button>
//             ))}
//         </div>

//         <button
//           onClick={() => handleToggleActiveMenu("custom")}
//           className={`px-3 py-1 rounded border mt-2 ${
//             activeMenus.includes("custom")
//               ? "bg-green-500 text-white"
//               : "bg-gray-200"
//           }`}
//         >
//           Custom
//         </button>

//         <div className="mt-2">
//           <button
//             onClick={handleSaveActiveMenus}
//             className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
//           >
//             Save Active Menus
//           </button>
//         </div>
//       </div>

//       {/* Menu List */}
//       <DndContext
//         sensors={sensors}
//         collisionDetection={closestCenter}
//         onDragEnd={handleDragEnd}
//       >
//         <SortableContext items={menus} strategy={verticalListSortingStrategy}>
//           {menus.map((item) => (
//             <SortableItem
//               key={item.id}
//               item={item}
//               onEdit={handleEdit}
//               onDelete={handleDelete}
//               children={item.children}
//             />
//           ))}
//         </SortableContext>
//       </DndContext>

//       {selectedMenu && (
//         <MenuForm
//           menu={selectedMenu}
//           menus={menus}
//           onSave={handleSave}
//           onCancel={() => setSelectedMenu(null)}
//         />
//       )}

//       {/* Preview */}
//       <div className="mt-10 border-t pt-6">
//         <h2 className="text-xl font-semibold mb-3 text-center">
//           Live {menuType.toUpperCase()} Preview
//         </h2>
//         <div
//           className="border rounded-lg p-4 bg-gray-50"
//           dangerouslySetInnerHTML={{ __html: previewHTML }}
//         />
//       </div>

//       {/* Custom Content Dialog */}
//       {customDialogOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
//           <div className="bg-white rounded shadow-lg w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh]">
//             <h2 className="text-xl font-bold mb-4">
//               Edit {menuType} HTML/CSS/JS
//             </h2>
//             <label className="block mb-2 font-medium">HTML:</label>
//             <textarea
//               value={customHTML}
//               onChange={(e) => setCustomHTML(e.target.value)}
//               className="w-full h-40 border rounded p-2 mb-4 resize-none"
//             />
//             <label className="block mb-2 font-medium">CSS:</label>
//             <textarea
//               value={customCSS}
//               onChange={(e) => setCustomCSS(e.target.value)}
//               className="w-full h-40 border rounded p-2 mb-4 resize-none"
//             />
//             <label className="block mb-2 font-medium">JS:</label>
//             <textarea
//               value={customJS}
//               onChange={(e) => setCustomJS(e.target.value)}
//               className="w-full h-40 border rounded p-2 mb-4 resize-none"
//             />
//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={handleDeleteCustomContent}
//                 className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
//               >
//                 Delete
//               </button>
//               <button
//                 onClick={handleSaveCustomContent}
//                 className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MenuManager;
