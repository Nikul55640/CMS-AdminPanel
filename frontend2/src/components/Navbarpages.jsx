import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ChevronDown, ChevronRight } from "lucide-react";
import Navbar from "./Navbar";

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
  const [hasChildren, sethasChildrenOpen] = useState(false);

  const toggleSubmenu = (id) => {
    console.log(`📂 Toggling submenu for menu ID: ${id}`);
    setSubmenuOpenIds((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      console.log("➡️ Updated submenuOpenIds:", updated);
      return updated;
    });
  };

  const filterActiveMenus = (menuList) => {
    const filtered = menuList
      .map((menu) => {
        const filteredChildren = menu.children
          ? filterActiveMenus(menu.children)
          : [];
        const isActive =
          activeMenuIds.includes(String(menu.id || menu._id)) ||
          filteredChildren.length > 0;
        if (isActive) {
          return { ...menu, children: filteredChildren };
        } else {
          return null;
        }
      })
      .filter(Boolean);
    return filtered;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, contentRes] = await Promise.all([
          axios.get(`${API}/menus/location/${menuType}`),
          axios.get(`${API}/menus/custom-content?section=${menuType}`),
        ]);

        if (!menuRes.data || !menuRes.data.menus) {
          console.error(`❌ No menus found for ${menuType}`);
          return;
        }

        const flatMenus = menuRes.data.menus || [];
        const nestedMenus = menuRes.data.menus || [];
        const fetchedActiveIds = (menuRes.data.activeMenuIds || []).map(String);

        setMenus(nestedMenus);
        setActiveMenuIds(fetchedActiveIds);
        setCustomContent(
          contentRes.data?.content || { html: "", css: "", js: "" }
        );
      } catch (err) {
        console.error(`❌ Failed to load ${menuType} menus:`, err);
      }
    };

    fetchData();
  }, [menuType]);

  useEffect(() => {
    if (!customContent.js?.trim()) return;

    try {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.text = `(function(){ const navbar = document.querySelector('.custom-navbar'); ${customContent.js} })();`;
      document.body.appendChild(script);
      console.log("✅ Custom JS appended to document.");
      return () => {
        document.body.removeChild(script);
        console.log(" Custom JS script removed from DOM.");
      };
    } catch (error) {
      console.error(` Error executing ${menuType} JS:`, error);
    }
  }, [customContent.js]);

  const isMenuActive = (menu) => {
    const active = activeMenuIds.includes(String(menu.id));
    const childActive = menu.children?.some((child) => isMenuActive(child));
    console.log(
      `🔎 Checking active state for: ${menu.title} (${menu.id}) -> ${
        active || childActive
      }`
    );
    return active || childActive;
  };

  const logoUrl =  NavbarPublic.logoUrl || Navbarmenu.logoUrl || null;
  const renderMenu = (menu) => {
    const submenuOpen = !!submenuOpenIds[menu.id];
    const hasChildren = menu.children && menu.children.length > 0;
    console.log(`🧱 Rendering menu:`, menu);
    console.log(
      `📁 ${menu.title} (${menu.id}) has children: ${hasChildren}, submenuOpen: ${submenuOpen}`
    );

    return (
      <li
        key={menu.id}
        className="relative group md:static"
        style={{ listStyle: "none" }}
      >
        <div className="flex items-center justify-between">
          <Link
            to={menu.url || "#"}
            onMouseEnter={() => {
              if (hasChildren) console.log(`🖱️ Hover enter on ${menu.title}`);
              sethasChildrenOpen(!hasChildren);
              console.log(hasChildren);
            }}
            onMouseLeave={() => {
              if (hasChildren) console.log(`🖱️ Hover leave on ${menu.title}`);
              sethasChildrenOpen(!hasChildren);
            }}
            className={`block px-3 py-2 hover:text-blue-600 ${
              isMenuActive(menu) ? "text-blue-600 font-semibold" : ""
            }`}
          >
            {menu.title}
          </Link>
          {hasChildren && (
            <div className="md:hidden">
              <button
                onClick={() => toggleSubmenu(menu.id)}
                aria-label="Toggle submenu"
                className="p-1 rounded hover:bg-gray-200 transition"
              >
                {submenuOpen ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
            </div>
          )}
        </div>
        {hasChildren && (
          <ul
            className={`ml-6 mt-1 flex flex-col gap-1
              ${submenuOpen ? "block" : "hidden"} 
              md:block md:group-hover:block`}
            style={{ minWidth: "160px", listStyle: "none", zIndex: 50 }}
          >
            {menu.children.map(renderMenu)}
          </ul>
        )}
      </li>
    );
  };

  return (
    <nav className="custom-navbar  bg-gray-100 md:bg-transparent p-2 md:p-0">
      {activeMenuIds.includes("custom") && customContent.html?.trim() ? (
        <>
          {customContent.css && (
            <style>{`.custom-navbar { /* Scoped CSS */ }\n${customContent.css}`}</style>
          )}
          <div
            dangerouslySetInnerHTML={{ __html: customContent.html }}
            onLoad={() => console.log("🧩 Custom HTML loaded")}
          />
        </>
      ) : (
        <ul>
          <li className="flex flex-col md:flex-row gap-2  md:gap-2 md:p-0">
            <div className="flex flex-col md:flex-row gap-2 md:gap-2 md:p-0">
              {logoUrl && (
                <Link to="/">
                  <img src={logoUrl} alt="Logo" className="h-8 w-auto" />
                </Link>
              )}
            </div>
            <div className="flex-grow" />
            <div className="flex flex-col md:flex-row gap-2 md:gap-2 md:p-0">
              </div>
            {filterActiveMenus(menus).map(renderMenu)}
          </li>
        </ul>
      )}
    </nav>
  );
};

export default NavbarPublic;
