// import { useState, useEffect, useCallback } from "react";
// import axios from "axios";
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
//   useSortable,
//   verticalListSortingStrategy,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import MenuTypeDropdown from "../components/Menutypedropdown.jsx";

// // Sortable Menu Item Component
// const SortableMenuItem = ({ menu, level = 0, onEdit, onDelete }) => {
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({ id: menu._id });

//   return (
//     <li
//       ref={setNodeRef}
//       {...attributes}
//       {...listeners}
//       style={{
//         transform: CSS.Transform.toString(transform),
//         transition,
//         marginLeft: `${level * 16}px`,
//       }}
//       className="border p-2 mb-2 flex justify-between items-center rounded shadow-sm bg-white"
//     >
//       <span>
//         {menu.title}{" "}
//         {menu.url && <span className="text-gray-500">({menu.url})</span>}
//         {menu.pageId && (
//           <span className="text-blue-500 ml-1">[Linked Page]</span>
//         )}
//       </span>
//       <div className="flex gap-2">
//         <MenuTypeDropdown menuId={menu._id} currentType={menu.location} />
//         <button
//           onClick={() => onEdit(menu)}
//           className="bg-yellow-400 px-2 rounded hover:bg-yellow-500"
//         >
//           Edit
//         </button>
//         <button
//           onClick={() => onDelete(menu._id)}
//           className="bg-red-500 px-2 rounded text-white hover:bg-red-600"
//         >
//           Delete
//         </button>
//       </div>

//       {/* Render children recursively */}
//       {menu.children?.length > 0 && (
//         <SortableContext
//           items={menu.children}
//           strategy={verticalListSortingStrategy}
//         >
//           <ul className="mt-2">
//             {menu.children.map((child) => (
//               <SortableMenuItem
//                 key={child._id}
//                 menu={child}
//                 level={level + 1}
//                 onEdit={onEdit}
//                 onDelete={onDelete}
//               />
//             ))}
//           </ul>
//         </SortableContext>
//       )}
//     </li>
//   );
// };

// // Main Menu Manager Component
// export default function MenuManager() {
//   const [menus, setMenus] = useState([]);
//   const [pages, setPages] = useState([]);
//   const [form, setForm] = useState({
//     title: "",
//     url: "",
//     location: "none",
//     parentId: null,
//     pageId: null,
//     _id: null,
//   });

//   // Fetch menus
//   const fetchMenus = useCallback(async () => {
//     try {
//       const res = await axios.get("http://localhost:8000/api/menus");
//       setMenus(res.data.sort((a, b) => a.order - b.order));
//     } catch (error) {
//       console.error("Failed to fetch menus:", error);
//     }
//   }, []);

//   useEffect(() => {
//     fetchMenus();
//   }, [fetchMenus]);

//   // Fetch pages
//   useEffect(() => {
//     const fetchPages = async () => {
//       try {
//         const res = await axios.get("http://localhost:8000/api/pages");
//         setPages(res.data);
//       } catch (error) {
//         console.error("Failed to fetch pages:", error);
//       }
//     };
//     fetchPages();
//   }, []);

//   // Save / update menu
//   const handleSave = async () => {
//     try {
//       if (form._id) {
//         await axios.put(`http://localhost:8000/api/menus/${form._id}`, form);
//       } else {
//         const order = menus.length ? menus[menus.length - 1].order + 1 : 0;
//         await axios.post("http://localhost:8000/api/menus", { ...form, order });
//       }
//       setForm({
//         title: "",
//         url: "",
//         location: "none",
//         parentId: null,
//         pageId: null,
//         _id: null,
//       });
//       fetchMenus();
//     } catch (error) {
//       console.error("Failed to save menu:", error);
//     }
//   };

//   // Delete menu
//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`http://localhost:8000/api/menus/${id}`);
//       fetchMenus();
//     } catch (error) {
//       console.error("Failed to delete menu:", error);
//     }
//   };

//   // DnD setup
//   const sensors = useSensors(useSensor(PointerSensor));

//   const handleDragEnd = async (event) => {
//     const { active, over } = event;
//     if (!over || active.id === over.id) return;

//     const oldIndex = menus.findIndex((m) => m._id === active.id);
//     const newIndex = menus.findIndex((m) => m._id === over.id);
//     const newMenus = arrayMove(menus, oldIndex, newIndex);

//     setMenus(newMenus);

//     try {
//       await axios.put("http://localhost:8000/api/menus/reorder", {
//         menus: newMenus,
//       });
//     } catch (error) {
//       console.error("Failed to reorder menus:", error);
//     }
//   };

//   return (
//     <div className="p-4">
//       {/* Form */}
//       <div className="mb-4 flex gap-2 flex-wrap">
//         <input
//           placeholder="Title"
//           value={form.title}
//           onChange={(e) => setForm({ ...form, title: e.target.value })}
//           className="border p-1 rounded"
//         />

//         {/* URL input */}
//         <input
//           placeholder="URL (optional)"
//           value={form.url}
//           onChange={(e) =>
//             setForm({ ...form, url: e.target.value, pageId: null })
//           }
//           disabled={!!form.pageId}
//           className="border p-1 rounded disabled:bg-gray-200"
//         />

//         {/* Page linking dropdown */}
//         <select
//           value={form.pageId || ""}
//           onChange={(e) =>
//             setForm({ ...form, pageId: e.target.value || null, url: "" })
//           }
//           className="border p-1 rounded"
//         >
//           <option value="">Link to Page (optional)</option>
//           {pages.map((p) => (
//             <option key={p._id} value={p._id}>
//               {p.title}
//             </option>
//           ))}
//         </select>

//         {/* Location dropdown */}
//         <select
//           value={form.location}
//           onChange={(e) => setForm({ ...form, location: e.target.value })}
//           className="border p-1 rounded"
//         >
//           <option value="none">None</option>
//           <option value="navbar">Navbar</option>
//           <option value="footer">Footer</option>
//         </select>

//         {/* Parent menu dropdown */}
//         <select
//           value={form.parentId || ""}
//           onChange={(e) =>
//             setForm({ ...form, parentId: e.target.value || null })
//           }
//           className="border p-1 rounded"
//         >
//           <option value="">No Parent</option>
//           {menus.map((m) => (
//             <option key={m._id} value={m._id}>
//               {m.title}
//             </option>
//           ))}
//         </select>

//         <button
//           onClick={handleSave}
//           className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
//         >
//           {form._id ? "Update" : "Add"} Menu
//         </button>
//       </div>

//       {/* Drag-and-drop list */}
//       <DndContext
//         sensors={sensors}
//         collisionDetection={closestCenter}
//         onDragEnd={handleDragEnd}
//       >
//         <SortableContext items={menus} strategy={verticalListSortingStrategy}>
//           <ul>
//             {menus.map((menu) => (
//               <SortableMenuItem
//                 key={menu._id}
//                 menu={menu}
//                 onEdit={setForm}
//                 onDelete={handleDelete}
//               />
//             ))}
//           </ul>
//         </SortableContext>
//       </DndContext>
//     </div>
//   );
// }

import React from 'react'

const Menumanager = () => {
  return (
    <div>
      
    </div>
  )
}

export default Menumanager
