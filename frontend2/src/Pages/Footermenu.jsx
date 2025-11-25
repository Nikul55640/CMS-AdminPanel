// src/Pages/FooterMenuManager.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import SortableItem from "../components/Navbarmanager/DND/SortableItem";
import CustomContentDialog from "../components/Navbarmanager/CustomContentDialog";
import MenuForm from "../components/Navbarmanager/Navmenuform.jsx";
import { findMenuById, getAllMenuIds } from "../components/Navbarmanager/MenuTreeUtils.jsx";
import MenuStyleEditor from "@/components/Navbarmanager/MenustyleChanger";

const API = "http://localhost:5000/api";

const FooterMenuManager = () => {
  const [menus, setMenus] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customHTML, setCustomHTML] = useState("");
  const [customCSS, setCustomCSS] = useState("");
  const [customJS, setCustomJS] = useState("");
  const [activeMenus, setActiveMenus] = useState([]);
  const [previewHTML, setPreviewHTML] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [customActiveTab, setCustomActiveTab] = useState("HTML");
  const [menuStyle, setMenuStyle] = useState({});

  const [activeId, setActiveId] = useState(null);

  const menuType = "footer";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
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

  const generatePreview = useCallback(
    ({ menus, customContent, activeMenus, menuStyle }) => {
      if (activeMenus.includes("custom") && customContent?.html?.trim()) {
        setPreviewHTML(`
        <style>${customContent?.css || ""}</style>
        ${customContent?.html || "<p style='color:#999;'>No custom HTML</p>"}
        <script>${customContent?.js || ""}<\/script>
      `);
        return;
      }

      const {
        backgroundColor = "#ffffff",
        textColor = "#000000",
        hoverColor = "#1d4ed8",
        fontSize = "14",
        fontFamily = "Arial, sans-serif",
        alignment = "left",
      } = menuStyle || {};

      const justify = alignment === "center" ? "center" : alignment === "right" ? "flex-end" : "flex-start";

      const styleBlock = `
      <style>
        .footer-container { background: ${backgroundColor}; padding: 12px 16px; font-family: ${fontFamily}; font-size: ${fontSize}px; }
        .footer-container ul { list-style:none; padding:0; margin:0; display:flex; gap:12px; flex-wrap:wrap; }
        .footer-container a { color: ${textColor}; text-decoration:none; padding:6px 10px; border-radius:6px; }
        .footer-container a:hover { color: ${hoverColor}; }
      </style>
    `;

      const menuItemsHTML = buildPreviewHTML(menus, activeMenus);

      const menuHTML = `
      <footer class="footer-container" style="text-align:${alignment}">
        ${menuItemsHTML}
      </footer>
    `;

      setPreviewHTML(styleBlock + menuHTML);
    },
    [buildPreviewHTML]
  );

  const fetchMenus = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API}/menus/location/${menuType}`, { withCredentials: true });
      const data = res.data;

      setMenus(data.menus || []);
      setCustomHTML(data.customContent?.html || "");
      setCustomCSS(data.customContent?.css || "");
      setCustomJS(data.customContent?.js || "");

      let fetchedActiveMenus = (data.activeMenuIds || []).map(String);
      if (!fetchedActiveMenus.includes("custom") || !data.customContent?.html?.trim()) {
        fetchedActiveMenus = fetchedActiveMenus.filter((id) => id !== "custom");
      }

      setActiveMenus(fetchedActiveMenus);

      generatePreview({ menus: data.menus, customContent: data.customContent, activeMenus: fetchedActiveMenus, menuStyle });
    } catch (err) {
      console.error("Fetch menus error:", err);
      toast.error(err.response?.data?.message || "Failed to fetch menus");
    } finally {
      setIsLoading(false);
    }
  }, [generatePreview, menuStyle]);

  useEffect(() => { fetchMenus(); }, [fetchMenus]);

  useEffect(() => {
    generatePreview({ menus, customContent: { html: customHTML, css: customCSS, js: customJS }, activeMenus, menuStyle });
  }, [menus, customHTML, customCSS, customJS, activeMenus, menuStyle, generatePreview]);

  // Handlers
  const handleAdd = () => setSelectedMenu({ location: menuType });
  const handleEdit = (item) => setSelectedMenu(item);

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.title}"?`)) return;
    const toastId = toast.loading("Deleting...");
    try {
      await axios.delete(`${API}/menus/${item.id}`, { withCredentials: true });
      toast.success("Deleted", { id: toastId });
      fetchMenus();
    } catch {
      toast.error("Failed to delete", { id: toastId });
    }
  };

  const handleSave = async (menuData) => {
    const toastId = toast.loading("Saving...");
    try {
      if (menuData.id) {
        await axios.put(`${API}/menus/${menuData.id}`, menuData, { withCredentials: true });
      } else {
        await axios.post(`${API}/menus`, menuData, { withCredentials: true });
      }
      toast.success("Saved successfully", { id: toastId });
      setSelectedMenu(null);
      fetchMenus();
    } catch {
      toast.error("Failed to save", { id: toastId });
    }
  };

  const handleHierarchyChange = async (newMenus) => {
    const toastId = toast.loading("Updating menu structure...");
    try {
      setMenus(newMenus);
      await axios.post(`${API}/menus/hierarchy`, { menuTree: newMenus, location: menuType }, { withCredentials: true });
      toast.success("Menu structure updated", { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update structure", { id: toastId });
      fetchMenus();
    }
  };

  // drag handlers
  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) { setActiveId(null); return; }

    const newMenus = JSON.parse(JSON.stringify(menus));

    const findItemAndParent = (items, id, parent = null) => {
      for (const item of items) {
        if (String(item.id) === String(id)) return { item, parent };
        if (item.children?.length) {
          const found = findItemAndParent(item.children, id, item);
          if (found.item) return found;
        }
      }
      return { item: null, parent: null };
    };

    const { item: draggedItem, parent: originalParent } = findItemAndParent(newMenus, active.id);
    if (!draggedItem) { setActiveId(null); return; }

    const sourceContainer = originalParent ? originalParent.children : newMenus;
    const itemIndex = sourceContainer.findIndex((i) => String(i.id) === String(active.id));
    sourceContainer.splice(itemIndex, 1);

    let targetParent = null;
    let targetIndex = -1;

    if (String(over.id).startsWith("drop-")) {
      const parentId = String(over.id).replace("drop-", "");
      const { item: newParent } = findItemAndParent(newMenus, parentId);
      if (newParent) { targetParent = newParent; if (!targetParent.children) targetParent.children = []; targetIndex = targetParent.children.length; }
    } else {
      const { item: overItem, parent: overParent } = findItemAndParent(newMenus, over.id);
      if (overItem) { targetParent = overParent; const destContainer = targetParent ? targetParent.children : newMenus; targetIndex = destContainer.findIndex((i) => String(i.id) === String(over.id)); }
    }

    if (targetIndex !== -1) {
      const destContainer = targetParent ? targetParent.children : newMenus;
      destContainer.splice(targetIndex, 0, draggedItem);
    } else {
      newMenus.push(draggedItem);
    }

    handleHierarchyChange(newMenus);
    setActiveId(null);
  };

  const handleToggleActiveMenu = (id) => {
    const menuItem = id === "custom" ? { id: "custom" } : findMenuById(menus, id);
    if (!menuItem) return;

    const idsToToggle = getAllMenuIds(menuItem);

    setActiveMenus((prev) => {
      const isActive = idsToToggle.every((i) => prev.includes(i));
      const newState = isActive ? prev.filter((i) => !idsToToggle.includes(i)) : [...prev, ...idsToToggle.filter((i) => !prev.includes(i))];

      generatePreview({ menus, customContent: { html: customHTML, css: customCSS, js: customJS }, activeMenus: newState, menuStyle });
      return newState;
    });
  };

  const handleSaveActiveMenus = async () => {
    const toastId = toast.loading("Saving active menus...");
    try {
      const idsToSend = activeMenus.filter((id) => id !== "custom" || customHTML.trim() !== "");
      await axios.post(`${API}/menus/set-active`, { menuIds: idsToSend, section: menuType }, { withCredentials: true });
      toast.success("Active menus updated", { id: toastId });
    } catch {
      toast.error("Failed to save active menus", { id: toastId });
    }
  };

  const handleSaveCustomContent = async () => {
    const toastId = toast.loading("Saving custom content...");
    try {
      await axios.post(`${API}/menus/custom-content`, { section: menuType, html: customHTML, css: customCSS, js: customJS }, { withCredentials: true });
      toast.success("Saved custom content", { id: toastId });
      setCustomDialogOpen(false);
      fetchMenus();
    } catch {
      toast.error("Failed to save custom content", { id: toastId });
    }
  };

  const handleDeleteCustomContent = async () => {
    if (!window.confirm("Delete all custom content?")) return;
    const toastId = toast.loading("Deleting custom content...");
    try {
      await axios.delete(`${API}/menus/custom-content/${menuType}`, { withCredentials: true });
      toast.success("Deleted custom content", { id: toastId });
      setCustomHTML(""); setCustomCSS(""); setCustomJS(""); setCustomDialogOpen(false);
      const newActiveMenus = activeMenus.filter((id) => id !== "custom");
      setActiveMenus(newActiveMenus);
      generatePreview({ menus, customContent: { html: "", css: "", js: "" }, activeMenus: newActiveMenus, menuStyle });
    } catch {
      toast.error("Failed to delete custom content", { id: toastId });
    }
  };

  const activeItem = activeId ? findMenuById(menus, activeId) : null;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto mt-8 px-8 py-6 rounded-t-2xl bg-gradient-to-r from-indigo-500 to-pink-600 text-white shadow-lg">
        <h1 className="text-3xl font-bold tracking-wide">Footer Menu Manager</h1>
        <p className="mt-2 text-sm opacity-90">Build and organize footer menus for your website with drag-and-drop support.</p>
      </div>

      <div className="p-6 max-w-6xl mx-auto bg-white border border-gray-200 rounded-b-2xl shadow-lg">
        <div className="mb-6 flex justify-end gap-3">
          <button onClick={handleAdd} disabled={isLoading} className="px-5 py-2 bg-indigo-500 text-white rounded-lg shadow hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">+ Add Menu</button>
          <button onClick={() => setCustomDialogOpen(true)} disabled={isLoading} className={`px-5 py-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${activeMenus.includes("custom") ? "bg-pink-500 text-white shadow hover:bg-pink-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Custom Menu</button>
          <button onClick={handleSaveActiveMenus} disabled={isLoading || activeMenus.length === 0} className="px-5 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">Save Active Menus</button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading menus...</div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <SortableContext items={getAllMenuIds(menus)} strategy={verticalListSortingStrategy}>
              {menus.map((item, index) => (
                <SortableItem key={item.id} item={item} onEdit={handleEdit} onDelete={handleDelete} onToggle={handleToggleActiveMenu} activeMenus={activeMenus} level={0} isFirstRoot={index === 0} />
              ))}
            </SortableContext>

            <DragOverlay>{activeItem ? <div className="p-2 bg-white shadow-lg border rounded-md">{activeItem.title}</div> : null}</DragOverlay>
          </DndContext>
        )}

        <MenuStyleEditor onStyleChange={setMenuStyle} />

        {selectedMenu && (
          <MenuForm menu={selectedMenu} menus={menus} onSave={handleSave} onCancel={() => setSelectedMenu(null)} />
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">Live Footer Preview</h2>
          <div className="border-2 border-gray-200 rounded-xl p-6 bg-white overflow-auto max-h-[400px] shadow-inner">
            {previewHTML ? <div dangerouslySetInnerHTML={{ __html: previewHTML }} /> : <p className="text-center text-gray-400">No active menus to preview</p>}
          </div>
        </div>

        <CustomContentDialog open={customDialogOpen} onClose={() => setCustomDialogOpen(false)} customHTML={customHTML} customCSS={customCSS} customJS={customJS} setCustomHTML={setCustomHTML} setCustomCSS={setCustomCSS} setCustomJS={setCustomJS} customActiveTab={customActiveTab} setCustomActiveTab={setCustomActiveTab} onSave={handleSaveCustomContent} onDelete={handleDeleteCustomContent} />
      </div>
    </div>
  );
};

export default FooterMenuManager;