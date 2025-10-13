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

  // Build nested menu tree
  const buildTree = (list) => {
    if (!Array.isArray(list)) return [];
    const map = {};
    const roots = [];
    list.forEach((i) => (map[i.id] = { ...i, children: [] }));
    list.forEach((i) =>
      i.parentId
        ? map[i.parentId]?.children.push(map[i.id])
        : roots.push(map[i.id])
    );
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

        const fetchedMenus = buildTree(menuRes.data.menus || []);
        let fetchedActiveIds = (menuRes.data.activeMenuIds || []).map(String);

        // Remove "custom" if there's no HTML
        const contentHtml = contentRes.data?.content?.html?.trim() || "";
        if (!contentHtml)
          fetchedActiveIds = fetchedActiveIds.filter((id) => id !== "custom");

        setMenus(fetchedMenus);
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

  // Execute custom JS
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

  const isMenuActive = (menu) => activeMenuIds.includes(String(menu.id));

  const renderMenu = (menu) => {
    if (!menu) return null;
    return (
      <li key={menu.id}>
        <Link
          to={menu.url || "#"}
          style={{
            color: isMenuActive(menu) ? "#fff" : "#111",
            background: isMenuActive(menu) ? "#2563eb" : "transparent",
            padding: "4px 8px",
            borderRadius: "4px",
            textDecoration: "none",
          }}
        >
          {menu.title}
        </Link>
        {menu.children?.length > 0 && (
          <ul
            style={{ listStyle: "none", paddingLeft: "1rem", marginTop: "4px" }}
          >
            {menu.children.map(renderMenu)}
          </ul>
        )}
      </li>
    );
  };

  const getVisibleMenus = () => {
    // Remove "custom" if there's no HTML
    if (activeMenuIds.includes("custom") && !customContent.html?.trim())
      return [];
    if (!activeMenuIds.length) return menus;
    return menus.filter((m) => activeMenuIds.includes(String(m.id)));
  };

  return (
    <nav className="z-[1000]">
      {activeMenuIds.includes("custom") && customContent.html?.trim() ? (
        <>
          {customContent.css && <style>{customContent.css}</style>}
          <div dangerouslySetInnerHTML={{ __html: customContent.html }} />
        </>
      ) : (
        <ul
          style={{
            listStyle: "none",
            display: "flex",
            gap: "1rem",
            padding: 0,
          }}
        >
          {getVisibleMenus().map(renderMenu)}
        </ul>
      )}
    </nav>
  );
};

export default NavbarPublic;
