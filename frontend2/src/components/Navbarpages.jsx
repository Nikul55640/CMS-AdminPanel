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
    console.log("Toggling submenu:", id, "Current state:", submenuOpenIds[id]);
    setSubmenuOpenIds((prev) => {
      const newState = { ...prev, [id]: !prev[id] };
      console.log("New submenu state:", newState);
      return newState;
    });
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

    console.log("Built menu tree:", roots);
    return roots;
  };

  // Filter only active menus (recursively)
  const filterActiveMenus = (menuList) => {
    return menuList
      .map((menu) => {
        const filteredChildren = menu.children
          ? filterActiveMenus(menu.children)
          : [];
        if (
          activeMenuIds.includes(String(menu.id)) ||
          filteredChildren.length
        ) {
          return { ...menu, children: filteredChildren };
        }
        return null;
      })
      .filter(Boolean);
  };

  // Fetch menus and custom content
  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching menus and custom content for:", menuType);
      try {
        const [menuRes, contentRes] = await Promise.all([
          axios.get(`${API}/menus/location/${menuType}`),
          axios.get(`${API}/menus/custom-content?section=${menuType}`),
        ]);

        const flatMenus = menuRes.data.menus || [];
        console.log("Flat menus fetched:", flatMenus);

        const nestedMenus = buildTree(flatMenus);

        // Get active menu IDs from backend
        let fetchedActiveIds = (menuRes.data.activeMenuIds || []).map(String);

        // Only include 'custom' if backend explicitly marked it as active
        const contentHtml = contentRes.data?.content?.html?.trim() || "";
        if (!fetchedActiveIds.includes("custom")) {
          console.log(
            "Custom menu is not active according to backend, ignoring it."
          );
        }

        console.log("Active menu IDs:", fetchedActiveIds);
        console.log("Custom content fetched:", contentRes.data?.content);

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

    console.log("Executing custom JS:", customContent.js);

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.text = customContent.js;
    document.body.appendChild(script);

    return () => {
      console.log("Removing custom JS script");
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

  const isAnyChildActive = (menu) => {
    if (activeMenuIds.includes(String(menu.id))) return true;
    if (menu.children?.length)
      return menu.children.some((child) => isAnyChildActive(child));
    return false;
  };

  // Render menu recursively
  const renderMenu = (menu) => {
    const active = isMenuActive(menu);
    const submenuOpen = !!submenuOpenIds[menu.id] || isAnyChildActive(menu);

    console.log(
      "Rendering menu:",
      menu.title,
      "Active:",
      active,
      "Submenu open:",
      submenuOpen
    );

    return (
      <li key={menu.id} className="relative">
        <div className="">
          <Link to={menu.url || ""}>{menu.title}</Link>

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
      {/* Only show custom menu if it's explicitly active */}
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
          {filterActiveMenus(menus).map(renderMenu)}
        </ul>
      )}
    </nav>
  );
};

export default NavbarPublic;
