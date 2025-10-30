import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
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
} from "@dnd-kit/sortable";

import SortableItem from "../components/Navbarmanager/SortableItem";
import CustomContentDialog from "../components/Navbarmanager/CustomContentDialog";
import ActiveMenuSelector from "../components/Navbarmanager/ActiveMenuSelector";
import MenuForm from "../Components/Navbarmanager/Navmenuform.jsx";
import { moveItemInTree, findMenuById, getAllMenuIds } from "../components//Navbarmanager/menuTreeUtils";

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

  const token = localStorage.getItem("token");
  const menuType = "navbar";

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
          <a href="${item.url || "#"}" target="${
          item.openInNewTab ? "_blank" : "_self"
        }" style="text-decoration:none;color:${
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
    ({ menus, customContent, activeMenus }) => {
      if (activeMenus.includes("custom") && customContent?.html?.trim()) {
        setPreviewHTML(`
        <style>${customContent?.css || ""}</style>
        ${customContent?.html || "<p style='color:#999;'>No custom HTML</p>"}
        <script>${customContent?.js || ""}<\/script>
      `);
      } else {
        setPreviewHTML(buildPreviewHTML(menus, activeMenus));
      }
    },
    [buildPreviewHTML]
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

  // ✅ When an item is dropped inside another
  const handleDrop = async (parentId, childId) => {
    const toastId = toast.loading("Updating hierarchy...");
    try {
      const newMenus = moveItemInTree(menus, childId, parentId);
      setMenus(newMenus);

      await axios.post(
        `${API}/menus/hierarchy`,
        { menuTree: newMenus, location: menuType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Item nested successfully", { id: toastId });
    } catch {
      toast.error("Failed to update hierarchy", { id: toastId });
      fetchMenus();
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Menu order updated");
    } catch {
      toast.error("Failed to update order");
      fetchMenus();
    }
  };

  const handleToggleActiveMenu = (id) => {
    const menuItem =
      id === "custom" ? { id: "custom" } : findMenuById(menus, id);
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
    const toastId = toast.loading("Saving active menus...");
    try {
      const idsToSend = activeMenus.filter(
        (id) => id !== "custom" || customHTML.trim() !== ""
      );
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto mt-8 px-8 py-6 rounded-t-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
        <h1 className="text-3xl font-bold tracking-wide">
          Navbar Menu Manager
        </h1>
        <p className="mt-2 text-sm opacity-90">
          Build and organize your navigation menus.
        </p>
      </div>

      <div className="p-6 max-w-6xl mx-auto bg-white border border-gray-200 rounded-b-2xl shadow-lg">
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
            className={`px-5 py-2 rounded-lg border ${
              activeMenus.includes("custom")
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-600"
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
                  onDrop={handleDrop}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}

        {/* <ActiveMenuSelector
          menus={menus}
          customHTML={customHTML}
          activeMenus={activeMenus}
          onToggle={handleToggleActiveMenu}
          onSave={handleSaveActiveMenus}
        /> */}

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
