import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Trash2,
  Edit2,
  SwitchCamera,

} from "lucide-react";
import { useState } from "react";
import { Switch } from "../ui/switch.jsx";


const ActiveMenuSelector = ({
  menus,
  customHTML,
  activeMenus,
  onToggle,
  onSave,
}) => {
  const renderCheckboxes = (items, level = 0) => (
    <div style={{ marginLeft: `${level * 16}px` }}>
      {items.map((item) => (
        <div key={item.id} className="my-1">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={activeMenus.includes(String(item.id))}
              onChange={() => onToggle(String(item.id))}
            />
            <span className="text-gray-700 font-medium">{item.title}</span>
          </label>
          {item.children?.length > 0 && renderCheckboxes(item.children, level + 1)}
        </div>
      ))}
    </div>
  );

  return (
    <div className="mt-8 border-t pt-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">
        Active Menu Visibility
      </h3>

      {menus.length > 0 ? (
        renderCheckboxes(menus)
      ) : (
        <p className="text-gray-500  text-sm">No menus available.</p>
      )}

      {customHTML?.trim() && (
        <div className="mt-3">
          <label className="flex justify-center gap-2">
            <input
              type="checkbox"
              checked={activeMenus.includes("custom")}
              onChange={() => onToggle("custom")}
            />
            <span className="text-gray-700 font-medium">Custom Navbar Content</span>
          </label>
        </div>
      )}

      <div className="mt-4">
        <button
          onClick={onSave}
          className="px-5 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
        >
          Save Active Menus
        </button>
      </div>
    </div>
  );
};
const SortableItem = ({ item, onEdit, onDelete, level = 0, onDrop }) => {
  // Make this item draggable
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  // Make this item droppable (so it can accept nested children)
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop-${item.id}`,
  });

  const [isOpen, setIsOpen] = useState(true);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginLeft: `${level * 20}px`,
    border: isOver ? "2px dashed #60a5fa" : "1px solid #e5e7eb",
    background: isOver ? "#eff6ff" : "white",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg shadow-sm p-2 mb-2"
    >
      {/* ITEM HEADER */}
      <div   className="flex items-center gap-2 justify-between group   bg-gray-100 p-2 rounded-md">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsOpen(!isOpen)}>
            {item.children?.length > 0 ? (
              isOpen ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )
            ) : (
              <span className="w-4" />
            )}
          </button>
          <div {...attributes} {...listeners} className="cursor-grab">
            <GripVertical size={16} className="text-gray-500" />
          </div>
          <span className="font-medium text-gray-700">{item.title}</span>
        </div>

        <div className="group-hover:flex hidden items-center gap-3 ">
          <button
            onClick={() => onEdit(item)}
            className=" bg-white h-6  w-6 flex items-center justify-center hover:bg-gray-300  rounded-full  text-blue-500 hover:text-blue-600 transition"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(item)}
            className="bg-white h-6  w-6 flex items-center justify-center  rounded-full text-red-500 hover:text-red-600 transition"
          >
            <Trash2 size={16} />
          </button>
          <Switch />
        </div>

      </div>

      {/* DROPPABLE AREA FOR NESTED ITEMS */}
      <div ref={setDropRef} className="ml-4 mt-2">
        {isOpen && item.children?.length > 0 && (
          <div>
            {item.children.map((child) => (
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
        {isOver && (
          <div className="h-8 border-2 border-dashed border-blue-400 bg-blue-50 rounded-md mt-1" />
        )}
      </div>
    </div>
  );
};

export default SortableItem;
