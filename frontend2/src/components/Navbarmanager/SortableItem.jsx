import React, { useRef, useState, useEffect, memo } from "react";
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

/* ------------------------------------------------------
   ✅ Menu Switch Component
------------------------------------------------------ */
const MenuSwitch = memo(({ active, onToggle }) => {
  const knobRef = useRef(null);
  const trackRef = useRef(null);
  const [switchId] = useState(() => `menu-switch-${Math.random()}`);

  const handleChange = (e) => {
    const checked = e.target.checked;
    console.log("🟢 Toggle Changed:", checked);
    onToggle?.(checked);
  };

  return (
    <div className="flex items-center justify-center">
      <input
        type="checkbox"
        id={switchId}
        checked={active}
        onChange={handleChange}
        className="hidden"
      />
      <label
        htmlFor={switchId}
        ref={trackRef}
        className={`relative inline-block w-14 h-8 cursor-pointer rounded-full transition-colors duration-300 ${
          active ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        <span
          ref={knobRef}
          className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
            active ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </label>
    </div>
  );
});

/* ------------------------------------------------------
   ✅ Sortable Item Component
------------------------------------------------------ */
const SortableItem = memo(({ item, onEdit, onDelete, onDrop, level = 0 }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop-${item.id}`,
  });

  const [isOpen, setIsOpen] = useState(true);
  const [isActive, setIsActive] = useState(false);

  // Style for drag animation and visual feedback
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginLeft: `${level * 20}px`,
    border: isOver ? "2px dashed #3b82f6" : "1px solid #e5e7eb",
    backgroundColor: isOver ? "#eff6ff" : isActive ? "#f0fdf4" : "white",
    cursor: "grab",
  };

  const handleToggle = (checked) => {
    console.log(`🔄 ${item.title} Active: ${checked}`);
    setIsActive(checked);
  };

  const handleDrop = (draggedItem) => {
    console.log(`📦 Dropped ${draggedItem.title} into ${item.title}`);
    onDrop?.(draggedItem, item);
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
              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
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
          <MenuSwitch active={isActive} onToggle={handleToggle} />
        </div>
      </div>

      {/* --- Children --- */}
      {isOpen && (
        <div ref={setDropRef} className="ml-4 mt-2">
          {item.children?.map((child) => (
            <SortableItem
              key={child.id}
              item={child}
              onEdit={onEdit}
              onDelete={onDelete}
              onDrop={onDrop}
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
});

export default SortableItem;


