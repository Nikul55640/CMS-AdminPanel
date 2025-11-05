import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem.jsx";

// 🔧 Helper to remove an item recursively
const removeItem = (items, id) => {
  for (let i = 0; i < items.length; i++) {
    if (items[i].id === id) return items.splice(i, 1)[0];
    if (items[i].children?.length) {
      const found = removeItem(items[i].children, id);
      if (found) return found;
    }
  }
};

// 🔧 Helper to find parent
const findParent = (items, id) => {
  for (let item of items) {
    if (item.children?.some((child) => child.id === id)) return item;
    const deep = findParent(item.children || [], id);
    if (deep) return deep;
  }
  return null;
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

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id === over.id) return;

    setItems((prevItems) => {
      const cloned = JSON.parse(JSON.stringify(prevItems));
      const draggedItem = removeItem(cloned, active.id);

      if (!draggedItem) return prevItems;

      const parent = findParent(cloned, over.id);

      if (parent) {
        // 🟢 dropped inside → become child
        parent.children.push(draggedItem);
      } else {
        // 🔵 dropped outside → become root
        cloned.push(draggedItem);
      }

      return cloned;
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Nested Drag & Drop Menu</h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
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
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default DnDContainer;
