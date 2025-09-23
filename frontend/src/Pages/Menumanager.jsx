import { useState, useEffect, useCallback } from "react";
import axios from "axios";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import MenuTypeDropdown from "../components/Menutypedropdown.jsx";

// Sortable Menu Item Component
function SortableMenuItem({ menu, level = 0, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: menu._id });

  return (
    <li
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        marginLeft: `${level * 16}px`,
      }}
      className="border p-2 mb-2 flex justify-between items-center"
    >
      <span>
        {menu.title} ({menu.url})
      </span>
      <div className="flex gap-2">
        <MenuTypeDropdown menuId={menu._id} currentType={menu.location} />
        <button
          onClick={() => onEdit(menu)}
          className="bg-yellow-400 px-2 rounded"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(menu._id)}
          className="bg-red-500 px-2 rounded text-white"
        >
          Delete
        </button>
      </div>

      {/* Render children recursively */}
      {menu.children?.length > 0 && (
        <SortableContext
          items={menu.children}
          strategy={verticalListSortingStrategy}
        >
          <ul className="mt-2">
            {menu.children.map((child) => (
              <SortableMenuItem
                key={child._id}
                menu={child}
                level={level + 1}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </ul>
        </SortableContext>
      )}
    </li>
  );
}

// Main Menu Manager Component
export default function MenuManager() {
  const [menus, setMenus] = useState([]);
  const [form, setForm] = useState({
    title: "",
    url: "",
    location: "none",
    parentId: null,
    _id: null,
  });

  const fetchMenus = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/menus");
      setMenus(res.data.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error("Failed to fetch menus:", error);
    }
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const handleSave = async () => {
    try {
      if (form._id) {
        await axios.put(`http://localhost:8000/api/menus/${form._id}`, form);
      } else {
        const order = menus.length ? menus[menus.length - 1].order + 1 : 0;
        await axios.post("http://localhost:8000/api/menus", { ...form, order });
      }
      setForm({
        title: "",
        url: "",
        location: "none",
        parentId: null,
        _id: null,
      });
      fetchMenus();
    } catch (error) {
      console.error("Failed to save menu:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/menus/${id}`);
      fetchMenus();
    } catch (error) {
      console.error("Failed to delete menu:", error);
    }
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event)  => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = menus.findIndex((m) => m._id === active.id);
    const newIndex = menus.findIndex((m) => m._id === over.id);
    const newMenus = arrayMove(menus, oldIndex, newIndex);

    setMenus(newMenus);

    try {
      await axios.put("http://localhost:8000/api/menus/reorder", {
        menus: newMenus,
      });
    } catch (error) {
      console.error("Failed to reorder menus:", error);
    }
  };

  return (
    <div className="p-4">
      {/* Form */}
      <div className="mb-4 flex gap-2 flex-wrap">
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="border p-1"
        />
        <input
          placeholder="URL"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          className="border p-1"
        />
        <select
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          className="border p-1"
        >
          <option value="none">None</option>
          <option value="navbar">Navbar</option>
          <option value="footer">Footer</option>
        </select>
        <select
          value={form.parentId || ""}
          onChange={(e) =>
            setForm({ ...form, parentId: e.target.value || null })
          }
          className="border p-1"
        >
          <option value="">No Parent</option>
          {menus.map((m) => (
            <option key={m._id} value={m._id}>
              {m.title}
            </option>
          ))}
        </select>
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          {form._id ? "Update" : "Add"} Menu
        </button>
      </div>

      {/* Drag-and-drop list */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={menus} strategy={verticalListSortingStrategy}>
          <ul>
            {menus.map((menu) => (
              <SortableMenuItem
                key={menu._id}
                menu={menu}
                onEdit={setForm}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}
