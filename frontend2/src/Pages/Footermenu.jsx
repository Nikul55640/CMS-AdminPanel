// src/Pages/FooterMenuManager.jsx
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import MenuForm from "../components/Navbarmanager/Navmenuform.jsx"; 
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const API = "http://localhost:5000/api";

const SortableItem = ({ item, onEdit, onDelete, level = 0 }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const [expanded, setExpanded] = useState(true);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    marginBottom: "8px",
    marginLeft: `${level * 20}px`,
    background: isDragging ? "#fef3f2" : "#fff",
    display: "flex",
    flexDirection: "column",
    opacity: item.hiddenInFrontend ? 0.5 : 1,
    cursor: isDragging ? "grabbing" : "grab",
    boxShadow: isDragging ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div {...listeners} className="flex justify-between items-center w-full">
        <div
          className="flex items-center gap-2 flex-1 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          {item.children && item.children.length > 0 && (
            <span
              className={`transition-transform duration-200 text-gray-500 ${
                expanded ? "rotate-90" : "rotate-0"
              }`}
            >
              ▶
            </span>
          )}
          <span className="font-medium text-gray-700">{item.title}</span>
          {item.hiddenInFrontend && (
            <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded">
              Hidden
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onMouseDown={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
            className="px-3 py-1 bg-indigo-500 text-white text-sm rounded hover:bg-indigo-600 transition-colors"
          >
            Edit
          </button>
          <button
            onMouseDown={(e) => {
              e.stopPropagation();
              onDelete(item);
            }}
            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {item.children && item.children.length > 0 && expanded && (
        <div className="mt-3 pl-4 border-l-2 border-gray-200">
          <SortableContext
            items={item.children.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {item.children.map((child) => (
              <SortableItem
                key={child.id}
                item={child}
                onEdit={onEdit}
                onDelete={onDelete}
                level={level + 1}
              />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  );
};

const moveItemInTree = (tree, itemId, overId) => {
  let itemToMove;

  const removeItem = (nodes) =>
    nodes
      .map((node) => {
        if (node.id === itemId) {
          itemToMove = node;
          return null;
        }
        if (node.children) {
          node.children = removeItem(node.children).filter(Boolean);
        }
        return node;
      })
      .filter(Boolean);

  const insertItem = (nodes) =>
    nodes.map((node) => {
      if (node.id === overId) {
        node.children = node.children || [];
        node.children.push(itemToMove);
      } else if (node.children) {
        node.children = insertItem(node.children);
      }
      return node;
    });

  let newTree = removeItem([...tree]);
  newTree = insertItem(newTree);
  return newTree;
};

const getAllMenuIds = (menu) => {
  let ids = [String(menu.id)];
  if (menu.children?.length) {
    menu.children.forEach((child) => {
      ids = ids.concat(getAllMenuIds(child));
    });
  }
  return ids;
};

const findMenuById = (items, id) => {
  for (const item of items) {
    if (String(item.id) === String(id)) return item;
    if (item.children) {
      const found = findMenuById(item.children, id);
      if (found) return found;
    }
  }
  return null;
};

const FooterMenuManager = () => {
  const [menus, setMenus] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customHTML, setCustomHTML] = useState("");
  const [customCSS, setCustomCSS] = useState("");
  const [customJS, setCustomJS] = useState("");
  const [activeMenus, setActiveMenus] = useState([]);
  const [previewHTML, setPreviewHTML] = useState("");
  const [customActiveTab, setCustomActiveTab] = useState("HTML");
  const [isLoading, setIsLoading] = useState(false);

  const menuType = "footer";
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const buildPreviewHTML = useCallback((items, activeIds) => {
    if (!items?.length) return "";
    return `<ul style="list-style:none;display:flex;flex-wrap:wrap;gap:1rem;padding:0;margin:0;">${items
      .filter((item) => !item.hiddenInFrontend)
      .map(
        (item) => `<li style="position:relative;">
          <a href="${item.url || "#"}" target="${
          item.openInNewTab ? "_blank" : "_self"
        }"
            style="text-decoration:none;color:${
              activeIds.includes(String(item.id)) ? "#fff" : "#111"
            }; background:${
          activeIds.includes(String(item.id)) ? "#6366f1" : "transparent"
        }; padding:8px 12px; border-radius:6px; display:inline-block; transition:all 0.2s; font-weight:500;">
            ${item.title}
          </a>
          ${
            item.children?.length
              ? `<div style="margin-top:8px;">${buildPreviewHTML(item.children, activeIds)}</div>`
              : ""
          }
        </li>`
      )
      .join("")}</ul>`;
  }, []);

  const generatePreview = useCallback(({ menus, customContent, activeMenus }) => {
    if (activeMenus.includes("custom") && customContent?.html?.trim()) {
      setPreviewHTML(`
        <style>${customContent?.css || ""}</style>
        ${customContent?.html || "<p style='color:#999;'>No custom HTML</p>"}
        <script>${customContent?.js || ""}<\/script>
      `);
    } else {
      setPreviewHTML(buildPreviewHTML(menus, activeMenus));
    }
  }, [buildPreviewHTML]);

  const fetchMenus = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API}/menus/location/${menuType}`, {
        withCredentials: true,  
      });
      const data = res.data;

      setMenus(data.menus || []);
      setCustomHTML(data.customContent?.html || "");
      setCustomCSS(data.customContent?.css || "");
      setCustomJS(data.customContent?.js || "");

      let fetchedActiveMenus = (data.activeMenuIds || []).map(String);
      if (
        !fetchedActiveMenus.includes("custom") ||
        !data.customContent?.html?.trim()
      ) {
        fetchedActiveMenus = fetchedActiveMenus.filter((id) => id !== "custom");
      }

      setActiveMenus(fetchedActiveMenus);

      generatePreview({
        menus: data.menus,
        customContent: data.customContent,
        activeMenus: fetchedActiveMenus,
      });
    } catch (err) {
      console.error("Fetch menus error:", err);
      toast.error(err.response?.data?.message || "Failed to fetch menus");
    } finally {
      setIsLoading(false);
    }
  }, [ generatePreview]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const handleAdd = () => setSelectedMenu({ location: menuType });
  
  const handleEdit = (item) => etSelectedMenu(item);
  
  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.title}"? This action cannot be undone.`)) return;
    
    const loadingToast = toast.loading("Deleting menu...");
    try {
      await axios.delete(`${API}/menus/${item.id}`, {
        withCredentials: true,
      });
      toast.success("Menu deleted successfully", { id: loadingToast });
      fetchMenus();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete menu", { id: loadingToast });
    }
  };

  const handleSave = async (menuData) => {
    const loadingToast = toast.loading("Saving menu...");
    try {
      if (menuData.id) {
        await axios.put(`${API}/menus/${menuData.id}`, menuData, {
          withCredentials: true,
        });
      } else {
        await axios.post(`${API}/menus`, menuData, {
          withCredentials: true,
        });
      }
      toast.success("Menu saved successfully", { id: loadingToast });
      setSelectedMenu(null);
      fetchMenus();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save menu", { id: loadingToast });
    }
  };

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const newMenus = moveItemInTree(menus, active.id, over.id);
    setMenus(newMenus);

    try {
      await axios.post(
        `${API}/menus/hierarchy`,
        { menuTree: newMenus, location: menuType },
        { withCredentials: true, }
      );
      toast.success("Menu order updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update order");
      fetchMenus();
    }
  };

  const handleToggleActiveMenu = (id) => {
    const menuItem = id === "custom" ? { id: "custom" } : findMenuById(menus, id);
    if (!menuItem) return;

    const idsToToggle = getAllMenuIds(menuItem);

    setActiveMenus((prev) => {
      const isActive = idsToToggle.every((i) => prev.includes(i));
      const newState = isActive
        ? prev.filter((i) => !idsToToggle.includes(i))
        : [...prev, ...idsToToggle.filter((i) => !prev.includes(i))];

      generatePreview({
        menus,
        customContent: { html: customHTML, css: customCSS, js: customJS },
        activeMenus: newState,
      });

      return newState;
    });
  };

  const handleSaveActiveMenus = async () => {
    const loadingToast = toast.loading("Saving active menus...");
    try {
      const idsToSend = activeMenus.filter(
        (id) => id !== "custom" || customHTML.trim() !== ""
      );

      await axios.post(
        `${API}/menus/set-active`,
        { menuIds: idsToSend, section: menuType },
        { withCredentials: true, }
      );

      toast.success("Active menus updated successfully!", { id: loadingToast });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save active menus", { id: loadingToast });
    }
  };

  const handleSaveCustomContent = async () => {
    const loadingToast = toast.loading("Saving custom content...");
    try {
      await axios.post(
        `${API}/menus/custom-content`,
        { section: menuType, html: customHTML, css: customCSS, js: customJS },
        { withCredentials: true, }
      );
      toast.success("Custom content saved successfully!", { id: loadingToast });
      setCustomDialogOpen(false);
      fetchMenus();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save custom content", { id: loadingToast });
    }
  };

  const handleDeleteCustomContent = async () => {
    if (!window.confirm("Are you sure you want to delete all custom content? This action cannot be undone.")) return;
    
    const loadingToast = toast.loading("Deleting custom content...");
    try {
      await axios.delete(`${API}/menus/custom-content/${menuType}`, {
        withCredentials: true,
      });
      toast.success("Custom content deleted successfully!", { id: loadingToast });
      setCustomHTML("");
      setCustomCSS("");
      setCustomJS("");
      setCustomDialogOpen(false);
      
      const newActiveMenus = activeMenus.filter((id) => id !== "custom");
      setActiveMenus(newActiveMenus);
      
      generatePreview({
        menus,
        customContent: { html: "", css: "", js: "" },
        activeMenus: newActiveMenus,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete custom content", { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto mt-8 px-8 py-6 rounded-t-2xl bg-gradient-to-r from-indigo-500 to-pink-600 text-white shadow-lg">
        <h1 className="text-3xl font-bold tracking-wide">Footer Menu Manager</h1>
        <p className="mt-2 text-sm opacity-90">
          Build and organize footer menus for your website with drag-and-drop support.
        </p>
      </div>

      <div className="p-6 max-w-6xl mx-auto bg-white border border-gray-200 rounded-b-2xl shadow-lg">
        <div className="mb-6 flex justify-end gap-3">
          <button
            onClick={handleAdd}
            disabled={isLoading}
            className="px-5 py-2 bg-indigo-500 text-white rounded-lg shadow hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Add Menu
          </button>
          <button
            onClick={() => setCustomDialogOpen(true)}
            disabled={isLoading}
            className={`px-5 py-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              activeMenus.includes("custom")
                ? "bg-pink-500 text-white shadow hover:bg-pink-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Custom Menu
          </button>
        </div>

        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading menus...</p>
          </div>
        )}

        {!isLoading && (
          <div className="mb-6">
            {menus.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 text-lg">No footer menus created yet</p>
                <p className="text-gray-400 text-sm mt-1">Click "Add Menu" to get started</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={menus.map((m) => m.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {menus.map((item) => (
                    <SortableItem
                      key={item.id}
                      item={item}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>
        )}

        {!isLoading && menus.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Active Footer Menus</h3>
            <p className="text-sm text-gray-600 mb-3">Select which menus to display in the footer</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {menus
                .filter((item) => !item.hiddenInFrontend)
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleToggleActiveMenu(item.id)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      activeMenus.includes(String(item.id))
                        ? "bg-pink-500 text-white shadow-md scale-105"
                        : "bg-white text-gray-600 hover:bg-gray-100 hover:border-gray-400"
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              
              {(customHTML.trim() || activeMenus.includes("custom")) && (
                <button
                  onClick={() => handleToggleActiveMenu("custom")}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    activeMenus.includes("custom")
                      ? "bg-pink-500 text-white shadow-md scale-105"
                      : "bg-white text-gray-600 hover:bg-gray-100 hover:border-gray-400"
                  }`}
                >
                  Custom
                </button>
              )}
            </div>
            
            <button
              onClick={handleSaveActiveMenus}
              className="px-5 py-2 bg-indigo-500 text-white rounded-lg shadow hover:bg-indigo-600 transition-colors"
            >
              Save Active Menus
            </button>
          </div>
        )}

        {selectedMenu && (
          <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <MenuForm
              menu={selectedMenu}
              menus={menus}
              onSave={handleSave}
              onCancel={() => setSelectedMenu(null)}
            />
          </div>
        )}

        {!isLoading && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">
              Live Footer Preview
            </h2>
            <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-800 overflow-auto max-h-[400px] shadow-inner">
              {previewHTML ? (
                <div dangerouslySetInnerHTML={{ __html: previewHTML }} />
              ) : (
                <p className="text-center text-gray-400">No active menus to preview</p>
              )}
            </div>
          </div>
        )}

        {customDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">
                    Edit Footer Custom Content
                  </h2>
                  <button
                    onClick={() => setCustomDialogOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex border-b border-gray-200 bg-gray-50 px-6">
                {["HTML", "CSS", "JS"].map((tab) => (
                  <button
                    key={tab}
                    className={`px-6 py-3 font-medium transition-colors relative ${
                      tab === customActiveTab
                        ? "text-indigo-600"
                        : "text-gray-600 hover:text-indigo-500"
                    }`}
                    onClick={() => setCustomActiveTab(tab)}
                  >
                    {tab}
                    {tab === customActiveTab && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex flex-1 gap-4 p-6 overflow-hidden">
                <div className="flex-1 flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-2">
                    {customActiveTab} Editor
                  </label>
                  <textarea
                    value={
                      customActiveTab === "HTML"
                        ? customHTML
                        : customActiveTab === "CSS"
                        ? customCSS
                        : customJS
                    }
                    onChange={(e) => {
                      if (customActiveTab === "HTML") setCustomHTML(e.target.value);
                      if (customActiveTab === "CSS") setCustomCSS(e.target.value);
                      if (customActiveTab === "JS") setCustomJS(e.target.value);
                    }}
                    placeholder={`Enter ${customActiveTab} code here...`}
                    className="flex-1 border border-gray-300 rounded-lg p-4 font-mono text-sm resize-none shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex-1 flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-2">Live Preview</label>
                  <iframe
                    className="flex-1 border border-gray-300 rounded-lg shadow-sm bg-white"
                    sandbox="allow-scripts"
                    title="Custom Content Preview"
                    srcDoc={`<!DOCTYPE html><html><head><style>${customCSS}</style></head><body>${customHTML}<script>${customJS}<\/script></body></html>`}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={handleDeleteCustomContent}
                  className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete Custom Content
                </button>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setCustomDialogOpen(false)}
                    className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCustomContent}
                    className="px-5 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FooterMenuManager;