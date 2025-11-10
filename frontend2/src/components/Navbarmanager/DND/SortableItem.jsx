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

const SortableItem = memo(
  ({ item, onEdit, onDelete, level = 0, onToggle, activeMenus, onSave }) => {
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
      <>
      <div
        ref={setNodeRef}
        style={style}
        className="rounded-lg shadow-sm p-2 mb-2"
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md group">
          <div className="flex items-center gap-2">
            {/* Expand / Collapse button */}
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

            {/* Checkbox */}
            <input
              type="checkbox"
              checked={isActive}
              
              onChange={handleToggle}
              className="w-4 h-4 text-blue-500 cursor-pointer"
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
          </div>
        </div>

        {/* --- Render children recursively --- */}
        {isOpen &&  (
          <div ref={setDropRef} className="ml-4 mt-2">
            {item.children.map((child) => (
              <SortableItem
                key={child.id}
                item={child}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggle={onToggle}
                onSave={onSave}
                activeMenus={activeMenus}
                level={level + 1}
              />
            ))}
          </div>
        )}

        {/* --- Drop indicator --- */}
        {isOver && (
          <div className="h-8 border-2 border-dashed border-blue-400 bg-blue-50 rounded-md mt-1" />
        )}

        {/* ✅ Save button at each level (optional: only root level) */}

      </div>
              {level === 0 && (
          <div className="mt-2 flex justify-end">
            <button
              onClick={onSave}
              className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition"
            >
              Save Active Menus
            </button>
          </div>
        )}
      </>
    );
  }
);

export default SortableItem;




// import React, { useState, memo } from "react";
// import { useSortable } from "@dnd-kit/sortable";
// import { useDroppable } from "@dnd-kit/core";
// import { CSS } from "@dnd-kit/utilities";
// import {
//   ChevronDown,
//   ChevronRight,
//   GripVertical,
//   Trash2,
//   Edit2,
// } from "lucide-react";
// import Checkbox from "../../ui/Checkbox.jsx";

// const SortableItem = memo(
//   ({
//     item,
//     onEdit,
//     onDelete,
//     level = 0,
//     onToggleActiveMenu,
//     activeMenus = [],
//   }) => {
//     const { attributes, listeners, setNodeRef, transform, transition } =
//       useSortable({ id: item.id });

//     const { setNodeRef: setDropRef, isOver } = useDroppable({
//       id: `drop-${item.id}`,
//     });

//     const [isOpen, setIsOpen] = useState(true);
//     const isActive = activeMenus.includes(String(item.id));

//     const style = {
//       transform: CSS.Transform.toString(transform),
//       transition,
//       marginLeft: `${level * 20}px`,
//       border: isOver ? "2px dashed #3b82f6" : "1px solid #e5e7eb",
//       backgroundColor: isOver ? "#eff6ff" : isActive ? "#f0fdf4" : "white",
//       cursor: "grab",
//     };

//     const handleToggle = (checked) => {
//       onToggleActiveMenu(String(item.id), checked);
//     };

//     return (
//       <div
//         ref={setNodeRef}
//         style={style}
//         className="rounded-lg shadow-sm p-2 mb-2"
//         {...attributes}
//         {...listeners}
//       >
//         <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md group">
//           <div className="flex items-center gap-2">
//             {item.children?.length > 0 ? (
//               <button
//                 onClick={() => setIsOpen(!isOpen)}
//                 className="text-gray-600 hover:text-gray-800"
//               >
//                 {isOpen ? (
//                   <ChevronDown size={16} />
//                 ) : (
//                   <ChevronRight size={16} />
//                 )}
//               </button>
//             ) : (
//               <span className="w-4" />
//             )}

//             <GripVertical
//               size={16}
//               className="text-gray-500 active:cursor-grabbing"
//             />

//             <span
//               className={`font-medium ${
//                 isActive ? "text-green-600" : "text-gray-700"
//               }`}
//             >
//               {item.title}
//             </span>
//           </div>

//           {/* --- Actions --- */}
//           <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition">
//             <button
//               onClick={() => onEdit(item)}
//               className="bg-white p-2 rounded-full text-blue-500 hover:bg-gray-300 transition"
//             >
//               <Edit2 size={16} />
//             </button>

//             <button
//               onClick={() => onDelete(item)}
//               className="bg-white p-2 rounded-full text-red-500 hover:bg-gray-300 transition"
//             >
//               <Trash2 size={16} />
//             </button>

//             <Checkbox  />
//           </div>
//         </div>

//         {/* --- Children --- */}
//         {isOpen && (
//           <div ref={setDropRef} className="ml-4 mt-2">
//             {item.children?.map((child) => (
//               <SortableItem
//                 key={child.id}
//                 item={child}
//                 onEdit={onEdit}
//                 onDelete={onDelete}
//                 onToggleActiveMenu={onToggleActiveMenu}
//                 activeMenus={activeMenus}
//                 level={level + 1}
//               />
//             ))}
//           </div>
//         )}

//         {/* Drop indicator */}
//         {isOver && (
//           <div className="h-8 border-2 border-dashed border-blue-400 bg-blue-50 rounded-md mt-1" />
//         )}
//       </div>
//     );
//   }
// );

// export default SortableItem;
