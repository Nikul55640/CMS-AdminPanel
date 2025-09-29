// src/components/NavbarPublic.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8000/api";

const NavbarPublic = () => {
  const [menus, setMenus] = useState([]);
  const [settings, setSettings] = useState({
    logo: "",
    bg: "#1f2937",
    text: "#ffffff",
    hover: "#facc15",
    fontSize: "16px",
    align: "left",
    customClass: "",
    sticky: false,
    showLogin: false,
    showSearch: false,
  });

  const location = useLocation();
  const menuRefs = useRef({});

  // --- Build nested menu tree from flat list ---
  const buildTree = (list) => {
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

  // --- Fetch menus + settings from backend ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, settingRes] = await Promise.all([
          axios.get(`${API}/menus/location/navbar`),
          axios.get(`${API}/navbar/settings`),
        ]);

        setMenus(buildTree(menuRes.data || []));
        setSettings((prev) => ({ ...prev, ...(settingRes?.data || {}) }));
      } catch (err) {
        console.error("❌ Navbar load failed:", err);
      }
    };

    fetchData();
  }, []);

  const justifyMap = {
    left: "flex-start",
    center: "center",
    right: "flex-end",
  };

  // --- Keyboard navigation ---
  const handleKeyDown = (e, menu, siblings) => {
    const index = siblings.findIndex((m) => m.id === menu.id);
    switch (e.key) {
      case "ArrowRight":
        siblings[index + 1] &&
          menuRefs.current[siblings[index + 1].id]?.focus();
        break;
      case "ArrowLeft":
        siblings[index - 1] &&
          menuRefs.current[siblings[index - 1].id]?.focus();
        break;
      case "ArrowDown":
        menu.children?.length > 0 &&
          menuRefs.current[menu.children[0].id]?.focus();
        break;
      case "Enter":
      case " ":
        e.currentTarget.click();
        break;
      case "Escape":
        e.currentTarget.blur();
        break;
      default:
        break;
    }
  };

  // --- Recursive menu rendering ---
  const renderMenu = (menu, siblings = []) => {
    const href = menu.pageId
      ? `/pages/${menu.slug || menu.pageId}`
      : menu.link || "#";
    const isActive = location.pathname === href;

    return (
      <li
        key={menu.id}
        className={`relative group ${menu.customClass || ""}`}
        style={{
          fontSize: menu.fontSize || settings.fontSize,
          textAlign: menu.align || settings.align,
        }}
      >
        <Link
          ref={(el) => (menuRefs.current[menu.id] = el)}
          to={href}
          tabIndex={0}
          className={`px-4 py-2 flex items-center gap-2 ${
            isActive ? "font-bold" : ""
          }`}
          style={{
            color: menu.textColor || settings.text,
            transition: "color 0.3s",
          }}
          onKeyDown={(e) => handleKeyDown(e, menu, siblings)}
          onMouseEnter={(e) => (e.currentTarget.style.color = settings.hover)}
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
            className="absolute left-0 top-full hidden group-hover:block bg-gray-800 shadow-lg rounded mt-1 z-10 min-w-[150px]"
            style={{ backgroundColor: menu.bgColor || settings.bg }}
          >
            {menu.children.map((child) => renderMenu(child, menu.children))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <nav
      className={`p-4 shadow ${settings.customClass || ""} ${
        settings.sticky ? "sticky top-0 z-50" : ""
      }`}
      style={{ backgroundColor: settings.bg, color: settings.text }}
    >
      <div
        className="flex items-center gap-6 w-full"
        style={{ justifyContent: justifyMap[settings.align] }}
      >
        {settings.logo && (
          <img
            src={settings.logo}
            alt="logo"
            className="h-12 w-auto object-contain"
          />
        )}

        <ul
          className="flex gap-6 list-none m-0 p-0 flex-1"
          style={{ fontSize: settings.fontSize, color: settings.text }}
        >
          {menus.map((menu) => renderMenu(menu, menus))}
        </ul>

        {settings.showLogin && (
          <button className="ml-4 px-3 py-1 bg-blue-600 text-white rounded">
            Login / Signup
          </button>
        )}

        {settings.showSearch && (
          <input
            type="text"
            placeholder="Search..."
            className="ml-4 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        )}
      </div>
    </nav>
  );
};

export default NavbarPublic;
