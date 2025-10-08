import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8000/api";

const NavbarPublic = () => {
  const [menus, setMenus] = useState([]);
  const [customContent, setCustomContent] = useState({ html: "", css: "" });
  const [settings, setSettings] = useState({});

  const location = useLocation();

  // Convert flat list to nested tree
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, contentRes] = await Promise.all([
          axios.get(`${API}/menus/location/navbar`),
          axios.get(`${API}/menus/custom-content?section=navbar`),
        ]);

        // Build menu tree
        const menuTree = buildTree(menuRes.data?.menus || menuRes.data || []);
        setMenus(menuTree);

        // Load custom HTML/CSS
        setCustomContent(contentRes.data?.content || { html: "", css: "" });

        // Optional settings
        if (contentRes.data?.settings) {
          setSettings(contentRes.data.settings);
        }
      } catch (err) {
        console.error("❌ Navbar load failed:", err);
      }
    };
    fetchData();
  }, []);

  // Recursive menu renderer
  const renderMenu = (menu) => {
    const href = menu.pageId
      ? `/pages/${menu.slug || menu.pageId}`
      : menu.url || "#";
    const isActive = location.pathname === href;

    return (
      <li
        key={menu.id}
        className={`relative group ${menu.customClass || ""}`}
        style={{ fontSize: menu.fontSize || settings.fontSize }}
      >
        <Link
          to={href}
          className={`px-4 py-2 flex items-center gap-2 ${
            isActive ? "font-bold" : ""
          }`}
          style={{
            color: menu.textColor || settings.text,
            transition: "color 0.3s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = settings.hover || menu.textColor)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = menu.textColor || settings.text)
          }
        >
          {menu.icon && (
            <img
              src={menu.icon}
              alt="icon"
              className="w-5 h-5 object-contain inline-block"
            />
          )}
          {menu.title}
          {menu.children?.length > 0 && <span className="ml-1">▼</span>}
        </Link>

        {menu.children?.length > 0 && (
          <ul
            className="absolute left-0 top-full hidden group-hover:block shadow-lg rounded mt-1 z-20 min-w-[180px]"
            style={{ backgroundColor: menu.bgColor || settings.bg || "#fff" }}
          >
            {menu.children.map((child) => renderMenu(child))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <nav>
      {/* Inject custom CSS */}
      {customContent.css && <style>{customContent.css}</style>}

      <div
        className="flex items-center gap-6 w-full"
        style={{ justifyContent: settings.align || "flex-start" }}
      >
        {/* Render custom HTML if provided */}
        {customContent.html ? (
          <div
            className="flex-1"
            dangerouslySetInnerHTML={{ __html: customContent.html }}
          />
        ) : (
          <ul className="flex gap-6 list-none m-0 p-0 flex-1 relative">
            {menus.map((menu) => renderMenu(menu))}
          </ul>
        )}
      </div>
    </nav>
  );
};

export default NavbarPublic;
