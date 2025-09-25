// src/components/MenuManager.jsx
import { useContext, useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import toast from "react-hot-toast";
import axios from "axios";
import CmsContext from "../context/CmsContext";
import MenuForm from "./Menuform.jsx";

const API = "http://localhost:8000/api";

// ✅ Sortable item
const SortableItem = ({ item, onEdit, onDelete, onAddSubmenu }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        padding: "8px 12px",
        border: "1px solid #ddd",
        marginBottom: "4px",
        borderRadius: "4px",
        background: "#fff",
      }}
      {...attributes}
      {...listeners}
    >
      <div className="flex justify-between items-center">
        <span>{item.title}</span>
        <div className="flex gap-2">
          <button onClick={() => onAddSubmenu(item)} className="px-2 py-1 bg-green-500 text-white rounded">Add Submenu</button>
          <button onClick={() => onEdit(item)} className="px-2 py-1 bg-blue-500 text-white rounded">Edit</button>
          <button onClick={() => onDelete(item)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
        </div>
      </div>

      {item.children?.length > 0 && (
        <div className="ml-6 mt-2">
          <SortableList
            items={item.children}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddSubmenu={onAddSubmenu}
          />
        </div>
      )}
    </div>
  );
};

// ✅ Sortable list
const SortableList = ({ items, onEdit, onDelete, onAddSubmenu }) => (
  <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
    {items.map((item) => (
      <SortableItem
        key={item.id} // ✅ fixed unique key warning
        item={item}
        onEdit={onEdit}
        onDelete={onDelete}
        onAddSubmenu={onAddSubmenu}
      />
    ))}
  </SortableContext>
);

// ✅ Build nested tree from flat menus
const buildTree = (list) => {
  const map = {};
  const roots = [];
  list.forEach((item) => (map[item.id] = { ...item, children: [] }));
  list.forEach((item) => {
    if (item.parentId) {
      map[item.parentId]?.children.push(map[item.id]);
    } else {
      roots.push(map[item.id]);
    }
  });
  return roots;
};

const MenuManager = () => {
  const { token, pages } = useContext(CmsContext);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor));

  // ✅ Fetch menus
  const fetchMenus = async () => {
    try {
      const res = await axios.get(`${API}/menus/location/navbar`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenus(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load menus");
    }
  };

  useEffect(() => {
    fetchMenus();
  }, [token]);

  // ✅ Add new menu or submenu
  const openAddForm = (parent = null) => {
    setEditingMenu({ parentId: parent?.id || null });
    setShowForm(true);
  };

  // ✅ Edit existing
  const openEditForm = (menu) => {
    setEditingMenu(menu);
    setShowForm(true);
  };

  // ✅ Save menu
  const handleSaveMenu = async (data) => {
    try {
      setLoading(true);
      if (data.id) {
        await axios.put(`${API}/menus/${data.id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API}/menus`, { ...data, location: "navbar" }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      toast.success("✅ Menu saved");
      setShowForm(false);
      fetchMenus();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save menu");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete
  const handleDelete = async (menu) => {
    if (!window.confirm(`Delete "${menu.title}" and its submenus?`)) return;
    try {
      await axios.delete(`${API}/menus/${menu.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("✅ Deleted");
      fetchMenus();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    }
  };

  // ✅ Drag reorder
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = menus.findIndex((m) => m.id === active.id);
    const newIndex = menus.findIndex((m) => m.id === over.id);
    const newMenus = arrayMove(menus, oldIndex, newIndex);
    setMenus(newMenus);

    await axios.put(
      `${API}/menus/reorder`,
      { menus: newMenus.map((m, idx) => ({ id: m.id, order: idx })) },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    toast.success("✅ Order updated");
  };

  const nestedMenus = buildTree(menus);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Menu Manager</h2>
      <button
        onClick={() => openAddForm(null)}
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        ➕ Add Menu
      </button>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableList
          items={nestedMenus}
          onEdit={openEditForm}
          onDelete={handleDelete}
          onAddSubmenu={openAddForm}
        />
      </DndContext>

      {showForm && (
        <MenuForm
          menu={editingMenu}
          pages={pages}
          menus={menus}
          onSave={handleSaveMenu}
          onCancel={() => setShowForm(false)}
        />
      )}

      {loading && <p>Loading...</p>}
    </div>
  );
};

export default MenuManager;
