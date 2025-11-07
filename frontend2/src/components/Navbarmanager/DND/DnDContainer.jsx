import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import ActiveMenuSelector from "./ActiveMenuSelector";

// 🔧 --- Helper: Find item path recursively ---
const findItemPath = (items, id, path = []) => {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.id === id) return [...path, i];
    if (item.children?.length) {
      const result = findItemPath(item.children, id, [...path, i, "children"]);
      if (result) return result;
    }
  }
  return null;
};

// 🔧 --- Helper: Get item by path ---
const getItemByPath = (items, path) =>
  path.reduce((acc, key) => acc[key], items);

// 🔧 --- Helper: Remove item by path ---
const removeItemByPath = (items, path) => {
  const lastKey = path.pop();
  const parent = path.length ? getItemByPath(items, path) : items;
  return parent.splice(lastKey, 1)[0];
};

const DnDContainer = () => {
  const [items, setItems] = useState([
    {
      id: "1",
      title: "Home",
      children: [
        { id: "1-1", title: "Overview", children: [] },
        { id: "1-2", title: "Stats", children: [] },
      ],
    },
    {
      id: "2",
      title: "About",
      children: [
        { id: "2-1", title: "Team", children: [] },
        { id: "2-2", title: "History", children: [] },
      ],
    },
  ]);

  const [activeMenus, setActiveMenus] = useState(["1"]);
  const [activeDragItem, setActiveDragItem] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor));

  // 🟢 Toggle menu active
  const handleToggleActiveMenu = (id) => {
    setActiveMenus((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  // 🔵 Handle drag start
  const handleDragStart = (event) => {
    const { active } = event;
    const path = findItemPath(items, active.id);
    if (!path) return;
    const draggedItem = getItemByPath(items, [...path]);
    setActiveDragItem(draggedItem);
  };

  // 🟣 Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      setActiveDragItem(null);
      return;
    }

    setItems((prev) => {
      const updated = structuredClone(prev);

      // 1️⃣ Remove dragged item
      const fromPath = findItemPath(updated, active.id);
      const draggedItem = removeItemByPath(updated, [...fromPath]);

      // 2️⃣ Find drop target
      const toPath = findItemPath(updated, over.id);

      if (!toPath) {
        // Drop to root level
        updated.push(draggedItem);
      } else {
        // Drop *before* or *after* over item (same level)
        const parentPath = [...toPath];
        const overIndex = parentPath.pop();
        const parent = parentPath.length
          ? getItemByPath(updated, parentPath)
          : updated;

        parent.splice(overIndex + 1, 0, draggedItem);
      }

      return updated;
    });

    setActiveDragItem(null);
  };

  const handleSaveActiveMenus = () => {
    console.log("✅ Saved Active Menus:", activeMenus);
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Navbar Manager</h2>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => (
            <SortableItem
              key={item.id}
              item={item}
              onEdit={() => console.log("Edit", item.id)}
              onDelete={() => console.log("Delete", item.id)}
              onToggleActiveMenu={handleToggleActiveMenu}
              activeMenus={activeMenus}
            />
          ))}
        </SortableContext>

        <DragOverlay>
          {activeDragItem ? (
            <div className="p-2 bg-blue-100 border border-blue-400 rounded-lg shadow">
              {activeDragItem.title}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Active menu section */}
      <ActiveMenuSelector
        menus={items}
        activeMenus={activeMenus}
        onToggle={handleToggleActiveMenu}
        onSave={handleSaveActiveMenus}
      />
    </div>
  );
};

export default DnDContainer;
