// src/components/MenuManager.jsx
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

const API = "http://localhost:8000/api";

// Sortable item with animated arrow and smooth slide
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
    background: "#fff",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div
        {...listeners} // <-- important
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
          <span className="font-medium text-gray-800">{item.title}</span>
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
          className={`ml-6 mt-2 overflow-hidden transition-all duration-300`}
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

// Main Menu Manager
const MenuManager = () => {
  const [menus, setMenus] = useState([]);
  const [menuType, setMenuType] = useState("navbar");
  const [selectedMenu, setSelectedMenu] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor));
  const token = localStorage.getItem("token");

  const fetchMenus = async () => {
    try {
      const res = await axios.get(`${API}/menus/location/${menuType}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenus(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch menus");
    }
  };

  useEffect(() => {
    fetchMenus();
  }, [menuType]);

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
      console.error(err);
      toast.error("Delete failed");
    }
  };
  const flattenMenu = (items) => {
    let ids = [];
    items.forEach((item) => {
      ids.push(item.id);
      if (item.children && item.children.length > 0) {
        ids = ids.concat(flattenMenu(item.children));
      }
    });
    return ids;
  };

  const handleSave = async (menuData) => {
    try {
      if (menuData.id) {
        await axios.put(`${API}/menus/${menuData.id}`, menuData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Menu updated");
      } else {
        await axios.post(`${API}/menus`, menuData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Menu created");
      }
      setSelectedMenu(null);
      fetchMenus();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save menu");
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = menus.findIndex((m) => m.id === active.id);
    const newIndex = menus.findIndex((m) => m.id === over.id);
    const newMenus = arrayMove([...menus], oldIndex, newIndex);
    setMenus(newMenus);

    try {
      await axios.put(
        `${API}/menus/hierarchy`,
        { menuTree: newMenus, location: menuType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Menu order updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update menu order");
    }
  };

  return (
    <div className=" gap-4 p-4">
      {/* Sidebar */}
      <div className="flex justify-center  ">
        <div className="flex  gap-5 h-auto w-max">
          <button
            onClick={() => setMenuType("navbar")}
            className={`px-4 py-2 mr-2 rounded transition ${
              menuType === "navbar" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Navbar Menus
          </button>
          <button
            onClick={() => setMenuType("footer")}
            className={`px-4 py-2 rounded transition ${
              menuType === "footer" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Footer Menus
          </button>
          <button
            onClick={handleAdd}
            className=" px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            Add Menu
          </button>
        </div>
      </div>
 
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-4 text-gray-700">
          {menuType === "navbar" ? "Navbar Menus" : "Footer Menus"}
        </h2>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={flattenMenu(menus)}
            strategy={verticalListSortingStrategy}
          >
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
      </div>

      {/* Menu Form Modal */}
      {selectedMenu && (
        <MenuForm
          menu={selectedMenu}
          menus={menus}
          pages={[]}
          onSave={handleSave}
          onCancel={() => setSelectedMenu(null)}
        />
      )}
    </div>
  );
};

export default MenuManager;
