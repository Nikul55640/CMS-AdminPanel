import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000/api";

const NavbarPublic = ({ menuType = "navbar" }) => {
  const [menus, setMenus] = useState([]);
  const [customContent, setCustomContent] = useState({
    html: "",
    css: "",
    js: "",
  });
  const [activeMenuIds, setActiveMenuIds] = useState([]);
  const [submenuOpenIds, setSubmenuOpenIds] = useState({});

  // Toggle submenu open/close
  const toggleSubmenu = (id) => {
    setSubmenuOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Build nested menu tree from flat list
  const buildTree = (list) => {
    if (!Array.isArray(list)) return [];
    const map = {};
    const roots = [];

    list.forEach((item) => {
      map[item.id] = { ...item, children: [] };
    });

    list.forEach((item) => {
      if (item.parentId && map[item.parentId]) {
        map[item.parentId].children.push(map[item.id]);
      } else {
        roots.push(map[item.id]);
      }
    });

    return roots;
  };

  // Fetch menus and custom content
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, contentRes] = await Promise.all([
          axios.get(`${API}/menus/location/${menuType}`),
          axios.get(`${API}/menus/custom-content?section=${menuType}`),
        ]);

        const flatMenus = menuRes.data.menus || [];
        const nestedMenus = buildTree(flatMenus);

        let fetchedActiveIds = (menuRes.data.activeMenuIds || []).map(String);
        const contentHtml = contentRes.data?.content?.html?.trim() || "";

        if (!contentHtml)
          fetchedActiveIds = fetchedActiveIds.filter((id) => id !== "custom");

        setMenus(nestedMenus);
        setActiveMenuIds(fetchedActiveIds);
        setCustomContent(
          contentRes.data?.content || { html: "", css: "", js: "" }
        );
      } catch (err) {
        console.error("❌ Navbar load failed:", err);
      }
    };

    fetchData();
  }, [menuType]);

  // Execute custom JS safely
  useEffect(() => {
    if (!customContent.js?.trim()) return;

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.text = customContent.js;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [customContent.js]);

  // Check if menu or any child is active
  const isMenuActive = (menu) => {
    if (activeMenuIds.includes(String(menu.id))) return true;
    if (menu.children?.length)
      return menu.children.some((child) => isMenuActive(child));
    return false;
  };

  // Recursive menu render
  const renderMenu = (menu) => {
    const active = isMenuActive(menu);
    const submenuOpen = !!submenuOpenIds[menu.id];

    return (
      <li key={menu.id} className="relative">
        <div className="flex items-center justify-between">
          <Link
            to={menu.url || "#"}
            style={{
              color: active ? "#fff" : "#111",
              background: active ? "#2563eb" : "transparent",
              padding: "6px 12px",
              borderRadius: "6px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            {menu.title}
          </Link>

          {menu.children?.length > 0 && (
            <button
              onClick={() => toggleSubmenu(menu.id)}
              className="ml-2 md:hidden text-sm px-2 py-1 bg-gray-200 rounded"
            >
              {submenuOpen ? "-" : "+"}
            </button>
          )}
        </div>

        {menu.children?.length > 0 && (
          <ul
            className={`pl-4 mt-1 md:mt-0 md:absolute md:left-0 md:top-full md:bg-white md:shadow-lg md:rounded ${
              submenuOpen ? "block" : "hidden md:block"
            }`}
            style={{ listStyle: "none", minWidth: "150px", zIndex: 100 }}
          >
            {menu.children.map(renderMenu)}
          </ul>
        )}
      </li>
    );
  };

  return (
    <nav className="z-[1000] bg-gray-100 md:bg-transparent p-2 md:p-0">
      {activeMenuIds.includes("custom") && customContent.html?.trim() ? (
        <>
          {customContent.css && <style>{customContent.css}</style>}
          <div dangerouslySetInnerHTML={{ __html: customContent.html }} />
        </>
      ) : (
        <ul
          className="flex flex-col md:flex-row gap-2 md:gap-4 p-2 md:p-0"
          style={{ listStyle: "none" }}
        >
          {menus.map(renderMenu)}
        </ul>
      )}
    </nav>
  );
};

export default NavbarPublic;
