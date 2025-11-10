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
import MenuForm from "../Components/Navbarmanager/Navmenuform.jsx";
import {
  findMenuById,
  getAllMenuIds,
} from "../components/Navbarmanager/MenuTreeUtils.jsx";
import MenuStyleEditor from "@/components/Navbarmanager/MenustyleChanger";


const API = "http://localhost:5000/api";

const NavbarManager = () => {
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

  const [activeId, setActiveId] = useState(null); // <-- active drag id

  const token = localStorage.getItem("token");
  const menuType = "navbar";

  const [logoPreview, setLogoPreview] = useState(null);
  const [showSearch, setShowSearch] = useState(true); // toggle for search bar

  // const handleLogoUpload = (e) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;
  //   const reader = new FileReader();
  //   reader.onload = () => setLogoPreview(reader.result);
  //   reader.readAsDataURL(file);
  // };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const localURL = URL.createObjectURL(file);
    setLogoPreview(localURL);

    try {
      const formData = new FormData();
      formData.append("logo", file);

      const res = await axios.post(
        "http://localhost:5000/api/menus/logo/navbar",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const serverURL = res.data?.logoUrl || localURL;
      setLogoPreview(serverURL);
      localStorage.setItem("menu_logo", serverURL);
    } catch (err) {
      console.error("❌ Logo upload failed:", err);
      alert("Logo upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Utility: find item and its parent by ID recursively
  const findItemAndParent = (items, id, parent = null) => {
    for (const item of items) {
      if (String(item.id) === String(id)) {
        return { item, parent };
      }
      if (item.children?.length) {
        const found = findItemAndParent(item.children, id, item);
        if (found.item) return found;
      }
    }
    return { item: null, parent: null };
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );
  // Build HTML preview
  const buildPreviewHTML = useCallback((items, activeIds) => {
    if (!items?.length) return "";
    return `<ul style="list-style:none;display:flex;flex-wrap:wrap;gap:1rem;padding:0;margin:0;">${items
      .filter((item) => !item.hiddenInFrontend)
      .map(
        (item) => `<li style="position:relative;">
          <a href="${item.url || "#"}" \
        style="text-decoration:none;color:${
          activeIds.includes(String(item.id)) ? "#fff" : "#111"
        }; background:${
          activeIds.includes(String(item.id)) ? "#2563eb" : "transparent"
        }; padding:8px 12px; border-radius:6px; display:inline-block; transition:all 0.2s; font-weight:500;">
            ${item.title}
          </a>
          ${
            item.children?.length
              ? `<div style="margin-top:8px;">${buildPreviewHTML(
                  item.children,
                  activeIds
                )}</div>`
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
        fontSize = "16",
        fontFamily = "Arial, sans-serif",
        alignment = "left",
        sticky = false,
      } = menuStyle || {};

      const justify =
        alignment === "center"
          ? "center"
          : alignment === "right"
          ? "flex-end"
          : "flex-start";

      // ✅ Include logo + search bar in preview
      const styleBlock = `
      <style>
        .navbar-container {
          background: ${backgroundColor};
          display: flex;
          align-items: center;
          justify-content: ${justify};
          gap: 1rem;
          padding: 10px 20px;
          font-family: ${fontFamily};
          font-size: ${fontSize}px;
          position: ${sticky ? "sticky" : "relative"};
          top: ${sticky ? "0" : "auto"};
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .navbar-container a {
          color: ${textColor};
          text-decoration: none;
          transition: color 0.2s;
          font-weight: 500;
        }
        .navbar-container a:hover {
          color: ${hoverColor};
        }
        .navbar-logo img {
          height: 40px;
          object-fit: contain;
        }
        .navbar-search {
          margin-left: auto;
        }
        .navbar-search input {
          padding: 6px 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }
      </style>
    `;

      const menuItemsHTML = buildPreviewHTML(menus, activeMenus);

      const logoHTML = logoPreview
        ? `<div class="navbar-logo"><img src="${logoPreview}" alt="Logo" /></div>`
        : "";

      const searchHTML = showSearch
        ? `<div class="navbar-search"><input type="text" placeholder="Search..." /></div>`
        : "";

      // Combine all in correct order
      const menuHTML = `
      <nav class="navbar-container">
        ${
          alignment === "left" ? `${logoHTML}${menuItemsHTML}${searchHTML}` : ""
        }
        ${
          alignment === "center"
            ? `${logoHTML}<div style="flex:1;text-align:center;">${menuItemsHTML}</div>${searchHTML}`
            : ""
        }
        ${
          alignment === "right"
            ? `${searchHTML}${menuItemsHTML}${logoHTML}`
            : ""
        }
      </nav>
    `;

      setPreviewHTML(styleBlock + menuHTML);
    },
    [buildPreviewHTML, logoPreview, showSearch]
  );

  // Fetch Menus
  const fetchMenus = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API}/menus/location/${menuType}`, {
        headers: { Authorization: `Bearer ${token}` },
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
      toast.error(err.response?.data?.message || "Failed to fetch menus");
    } finally {
      setIsLoading(false);
    }
  }, [token, generatePreview]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  useEffect(() => {
    generatePreview({
      menus,
      customContent: { html: customHTML, css: customCSS, js: customJS },
      activeMenus,
      menuStyle, // ✅ include this
    });
  }, [
    menus,
    customHTML,
    customCSS,
    customJS,
    activeMenus,
    menuStyle,
    generatePreview,
  ]);

  // Handlers
  const handleAdd = () => setSelectedMenu({ location: menuType });
  const handleEdit = (item) => setSelectedMenu(item);

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    const toastId = toast.loading("Deleting...");
    try {
      await axios.delete(`${API}/menus/${item.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
        await axios.put(`${API}/menus/${menuData.id}`, menuData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API}/menus`, menuData, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
      // Optimistically update UI
      setMenus(newMenus);

      await axios.post(
        `${API}/menus/hierarchy`,
        { menuTree: newMenus, location: menuType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Menu structure updated", { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update structure", {
        id: toastId,
      });
      // On failure, revert the optimistic update by refetching
      fetchMenus();
    }
  };

  // onDragStart + onDragEnd integration
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    // No drop target or dropping on itself
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const newMenus = JSON.parse(JSON.stringify(menus)); // Deep copy for mutation

    // Find the dragged item and its original parent
    const { item: draggedItem, parent: originalParent } = findItemAndParent(
      newMenus,
      active.id
    );

    if (!draggedItem) {
      setActiveId(null);
      return;
    }

    // Remove item from its original position
    const sourceContainer = originalParent ? originalParent.children : newMenus;
    const itemIndex = sourceContainer.findIndex(
      (i) => String(i.id) === String(active.id)
    );
    sourceContainer.splice(itemIndex, 1);

    let targetParent = null;
    let targetIndex = -1;

    // Case 1: Dropping into a droppable area (nesting)
    if (String(over.id).startsWith("drop-")) {
      const parentId = String(over.id).replace("drop-", "");
      const { item: newParent } = findItemAndParent(newMenus, parentId);
      if (newParent) {
        targetParent = newParent;
        if (!targetParent.children) {
          targetParent.children = [];
        }
        // Add to the end of the new parent's children
        targetIndex = targetParent.children.length;
      }
    }
    // Case 2: Dropping onto another sortable item (reordering)
    else {
      const { item: overItem, parent: overParent } = findItemAndParent(
        newMenus,
        over.id
      );
      if (overItem) {
        targetParent = overParent;
        const destContainer = targetParent ? targetParent.children : newMenus;
        targetIndex = destContainer.findIndex(
          (i) => String(i.id) === String(over.id)
        );
      }
    }

    // Insert item into its new position
    if (targetIndex !== -1) {
      const destContainer = targetParent ? targetParent.children : newMenus;
      destContainer.splice(targetIndex, 0, draggedItem);
    } else {
      // Fallback: if something went wrong, add to the root to prevent item loss
      newMenus.push(draggedItem);
    }

    handleHierarchyChange(newMenus);
    setActiveId(null);
  };



const handleToggleActiveMenu = (id) => {
  if (!id) return; // Safety check

  const menuItem =
    id === "custom"
      ? { id: "custom", title: "Custom Section" }
      : findMenuById(menus, id);

  if (!menuItem) {
    console.warn("⚠️ Menu not found for ID:", id);
    return;
  }

  // Get all IDs for this menu and its children (and clean them)
  const idsToToggle = getAllMenuIds([menuItem])
    .filter((i) => i !== undefined && i !== null)
    .map(String);

    console.log("🟡 Menu item found:", menuItem);


  setActiveMenus((prev) => {
    const isActive = idsToToggle.every((i) => prev.includes(i));

    const newState = isActive
      ? prev.filter((i) => !idsToToggle.includes(i))
      : [...prev, ...idsToToggle.filter((i) => !prev.includes(i))];



    console.log("🟢 Menu Toggled:", menuItem.title);
    console.log("🧭 Cleaned Active Menus →", newState);
    console.log("🧾 IDs toggled:", idsToToggle);

    generatePreview({
      menus,
      customContent: { html: customHTML, css: customCSS, js: customJS },
      activeMenus: newState,
    });

    return newState;
  });
};



  const handleSaveActiveMenus = async () => {
    const toastId = toast.loading("Saving active menus...");
    try {
      const idsToSend = activeMenus.filter(
        (id) => id !== "custom" || customHTML.trim() !== ""
      );
      console.log("Active menu IDs sent to backend :",idsToSend)
      await axios.post(
        `${API}/menus/set-active`,
        { menuIds: idsToSend, section: menuType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Active menus updated", { id: toastId });
    } catch {
      toast.error("Failed to save active menus", { id: toastId });     
    }
  };

  const handleSaveCustomContent = async () => {
    const toastId = toast.loading("Saving custom content...");
    try {
      await axios.post(
        `${API}/menus/custom-content`,
        { section: menuType, html: customHTML, css: customCSS, js: customJS },
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
      await axios.delete(`${API}/menus/custom-content/${menuType}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Deleted custom content", { id: toastId });
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
    } catch {
      toast.error("Failed to delete custom content", { id: toastId });
    }
  };

  // active item for overlay
  const activeItem = activeId ? findMenuById(menus, activeId) : null;


  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto mt-8 px-8 py-6 rounded-t-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
        <h1 className="text-3xl font-bold tracking-wide">
          Navbar Menu Manager
        </h1>
        <p className="mt-2 text-sm opacity-90">
          Build and organize your navigation menus.
        </p>
      </div>

      <div className="p-6 max-w-6xl mx-auto bg-white border border-gray-400 rounded-b-2xl shadow-lg">
        <div className="mb-6 flex justify-end gap-3">
          <button
            onClick={handleAdd}
            disabled={isLoading}
            className="px-5 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600"
          >
            + Add Menu
          </button>
          <button
            onClick={() => setCustomDialogOpen(true)}
            disabled={isLoading}
            className={`px-5 py-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              activeMenus.includes("custom")
                ? "bg-green-500 text-white shadow hover:bg-green-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Custom Menu
          </button>
        </div>
        {isLoading ? (
          <div className="text-center py-8">Loading menus...</div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {/* flatten all IDs so nested items are recognized by SortableContext */}
            <SortableContext
              items={getAllMenuIds(menus)}
              strategy={verticalListSortingStrategy}
            >
              {menus.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggle={handleToggleActiveMenu}
                  onSave={handleSaveActiveMenus} // ✅ this triggers your backend save
                  activeMenus={activeMenus}
                  customHTML={customHTML}
                />
              ))}
            </SortableContext>

            <DragOverlay>
              {activeItem ? (
                <div className="p-2 bg-white shadow-lg border rounded-md">
                  {activeItem.title}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
        <div className="flex justify-between items-center gap-4 mb-4">
      
          <div>
            <label className="flex items-center gap-2 text-gray-600">
              <input
                type="checkbox"
                checked={showSearch}
                onChange={(e) => setShowSearch(e.target.checked)}
              />
              Show Search Bar
            </label>
          </div>
        </div>
        <MenuStyleEditor onStyleChange={setMenuStyle} />

        {selectedMenu && (
          <MenuForm
            menu={selectedMenu}
            menus={menus}
            onSave={handleSave}
            onCancel={() => setSelectedMenu(null)}
          />
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">
            Live Navbar Preview
          </h2>
          <div className="border-2 border-gray-200 rounded-xl p-6 bg-white overflow-auto max-h-[400px] shadow-inner">
            {previewHTML ? (
              <div dangerouslySetInnerHTML={{ __html: previewHTML }} />
            ) : (
              <p className="text-center text-gray-400">
                No active menus to preview
              </p>
            )}
          </div>
        </div>

        <CustomContentDialog
          open={customDialogOpen}
          onClose={() => setCustomDialogOpen(false)}
          customHTML={customHTML}
          customCSS={customCSS}
          customJS={customJS}
          setCustomHTML={setCustomHTML}
          setCustomCSS={setCustomCSS}
          setCustomJS={setCustomJS}
          customActiveTab={customActiveTab}
          setCustomActiveTab={setCustomActiveTab}
          onSave={handleSaveCustomContent}
          onDelete={handleDeleteCustomContent}
        />
      </div>
    </div>
  );
};

export default NavbarManager;
