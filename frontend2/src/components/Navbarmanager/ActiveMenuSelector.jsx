import React from "react";

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

export default ActiveMenuSelector;
