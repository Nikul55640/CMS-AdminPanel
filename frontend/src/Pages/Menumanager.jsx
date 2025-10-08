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

// Sortable Item with per-item style & hover overrides
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
    background: item.style?.bgColor || "#fff",
    color: item.style?.textColor || "#111",
    fontSize: item.style?.fontSize || "14px",
    fontWeight: item.style?.fontWeight || "500",
    boxShadow: item.style?.shadow || "0 1px 3px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
  };

  // Hover style stored in data attributes
  const hoverStyle = {
    "--hover-bg": item.style?.hoverBgColor || "#3b82f6",
    "--hover-text": item.style?.hoverTextColor || "#fff",
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, ...hoverStyle }}
      {...attributes}
      className="hover-effect"
    >
      <div
        {...listeners}
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
          <span>{item.title}</span>
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
          className="ml-6 mt-2 overflow-hidden transition-all duration-300"
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

const MenuManager = () => {
  const [menus, setMenus] = useState([]);
  const [menuType, setMenuType] = useState("navbar");
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customHTML, setCustomHTML] = useState("");
  const [customCSS, setCustomCSS] = useState("");

  const [globalStyle, setGlobalStyle] = useState({
    alignment: "flex-start",
    gap: "12px",
    fontSize: "14px",
    fontWeight: "500",
    textColor: "#111",
    bgColor: "#fff",
    hoverColor: "#3b82f6",
    hoverBgColor: "#e0f2fe",
  });

  const token = localStorage.getItem("token");
  const sensors = useSensors(useSensor(PointerSensor));

  const fetchMenus = async () => {
    try {
      const res = await axios.get(`${API}/menus/location/${menuType}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenus(res.data.menus || res.data);
      setCustomHTML(res.data.customContent?.html || "");
      setCustomCSS(res.data.customContent?.css || "");
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
    if (!Array.isArray(items)) return [];
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
      await axios.post(
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

  const handleSaveCustomContent = async () => {
    try {
      await axios.post(
        `${API}/menus/custom-content`,
        {
          section: menuType,
          html: customHTML,
          css: customCSS,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Custom HTML/CSS saved!");
      setCustomDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to save custom content"
      );
    }
  };

  return (
    <>
      {/* Menu Type Selector */}
      <div className="flex justify-center gap-5 mb-4">
        <button
          onClick={() => setMenuType("navbar")}
          className={`px-4 py-2 rounded ${
            menuType === "navbar" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Navbar Menus
        </button>
        <button
          onClick={() => setMenuType("footer")}
          className={`px-4 py-2 rounded ${
            menuType === "footer" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Footer Menus
        </button>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          Add Menu
        </button>
      </div>

      {/* Global Style Panel */}
      <div className="flex justify-center gap-4 mb-4 flex-wrap">
        <label>
          Alignment:
          <select
            value={globalStyle.alignment}
            onChange={(e) =>
              setGlobalStyle({ ...globalStyle, alignment: e.target.value })
            }
            className="ml-2 p-1 border rounded"
          >
            <option value="flex-start">Left</option>
            <option value="center">Center</option>
            <option value="flex-end">Right</option>
          </select>
        </label>
        <label>
          Gap(px):
          <input
            type="number"
            value={parseInt(globalStyle.gap)}
            onChange={(e) =>
              setGlobalStyle({ ...globalStyle, gap: e.target.value + "px" })
            }
            className="ml-2 p-1 border rounded w-16"
          />
        </label>
      </div>

      {/* Menu List */}
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

      {/* Menu Form */}
      {selectedMenu && (
        <MenuForm
          menu={selectedMenu}
          menus={menus}
          pages={[]}
          onSave={handleSave}
          onCancel={() => setSelectedMenu(null)}
        />
      )}

      {/* Custom HTML/CSS */}
      <div className="flex justify-center gap-5 mb-4">
        <button
          className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-500 hover:text-white hover:cursor-pointer transition"
          onClick={() => setCustomDialogOpen(true)}
        >
          Edit HTML/CSS
        </button>
      </div>

      {customDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-11/12 max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              Edit {menuType} HTML & CSS
            </h2>
            <label className="block mb-2 font-medium">HTML:</label>
            <textarea
              value={customHTML}
              onChange={(e) => setCustomHTML(e.target.value)}
              className="w-full h-40 border rounded p-2 mb-4"
            />
            <label className="block mb-2 font-medium">CSS:</label>
            <textarea
              value={customCSS}
              onChange={(e) => setCustomCSS(e.target.value)}
              className="w-full h-40 border rounded p-2 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCustomDialogOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomContent}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Preview */}
      <div className="mt-10">
        <h2 className="text-lg font-bold mb-2">Navbar Preview</h2>
        <nav
          className="flex flex-wrap border p-4 rounded"
          style={{
            justifyContent: globalStyle.alignment,
            gap: globalStyle.gap,
            background: globalStyle.bgColor,
          }}
        >
          {menus.map((item) => (
            <div key={item.id} className="relative group">
              <a
                href={item.link || "#"}
                style={{
                  color: item.style?.textColor || globalStyle.textColor,
                  fontSize: item.style?.fontSize || globalStyle.fontSize,
                  fontWeight: item.style?.fontWeight || globalStyle.fontWeight,
                  padding: "6px 12px",
                  borderRadius: "4px",
                }}
                className="transition hover-effect"
              >
                {item.title}
              </a>
              {item.children && item.children.length > 0 && (
                <div className="absolute top-full left-0 bg-white border rounded shadow-lg mt-1 opacity-0 group-hover:opacity-100 transition-opacity min-w-[150px] z-10">
                  {item.children.map((child) => (
                    <a
                      key={child.id}
                      href={child.link || "#"}
                      style={{
                        color: child.style?.textColor || globalStyle.textColor,
                        background: child.style?.bgColor || "#fff",
                      }}
                      className="block px-3 py-1 hover:bg-blue-500 hover:text-white transition"
                    >
                      {child.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {customHTML && (
          <div
            className="mt-4"
            dangerouslySetInnerHTML={{ __html: customHTML }}
          />
        )}
        {customCSS && <style>{customCSS}</style>}
        {/* Global hover CSS */}
        <style>{`
          .hover-effect:hover {
            background: var(--hover-bg);
            color: var(--hover-text);
          }
        `}</style>
      </div>
    </>
  );
};

export default MenuManager;
