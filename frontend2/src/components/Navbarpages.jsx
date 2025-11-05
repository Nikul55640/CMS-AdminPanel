import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const API = "http://localhost:5000/api";

const NavbarPublic = ({ menuType = "navbar" }) => {
  const [menus, setMenus] = useState([]);
  const [customContent, setCustomContent] = useState({
    html: "",
    css: "",
    js: "",
  });
  const [activeMenuIds, setActiveMenuIds] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [submenuOpenIds, setSubmenuOpenIds] = useState({});

  /* ---------------- Fetch Menus + Custom Content ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, contentRes] = await Promise.all([
          axios.get(`${API}/menus/location/${menuType}`),
          axios.get(`${API}/menus/custom-content?section=${menuType}`),
        ]);

        const nestedMenus = menuRes.data?.menus || [];
        const fetchedActiveIds = (menuRes.data?.activeMenuIds || []).map(
          String
        );

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

  /* ---------------- Inject Custom JS ---------------- */
  useEffect(() => {
    if (!customContent.js?.trim()) return;
    const script = document.createElement("script");
    script.text = `(function(){ const navbar = document.querySelector('.custom-navbar'); ${customContent.js} })();`;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, [customContent.js]);

  /* ---------------- Recursive Filter for Active Menus ---------------- */
  const filterActiveMenus = (menuList) =>
    menuList
      .map((menu) => {
        const children = menu.children ? filterActiveMenus(menu.children) : [];
        const isActive =
          activeMenuIds.includes(String(menu.id)) || children.length > 0;
        return isActive ? { ...menu, children } : null;
      })
      .filter(Boolean);

  const toggleSubmenu = (id) => {
    setSubmenuOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isMenuActive = (menu) => {
    const active = activeMenuIds.includes(String(menu.id));
    const childActive = menu.children?.some((child) => isMenuActive(child));
    return active || childActive;
  };

  /* ---------------- Recursive Render ---------------- */
  const renderMenu = (menu, level = 0) => {
    const hasChildren = menu.children && menu.children.length > 0;
    const submenuOpen = submenuOpenIds[menu.id];

    return (
      <li key={menu.id} className="relative list-none">
        <div
          className={`flex items-center justify-between py-2 px-4 ${
            level === 0 ? "hover:bg-gray-100 rounded-lg" : ""
          }`}
        >
          <Link
            to={menu.url || "#"}
            className={`text-sm font-medium ${
              isMenuActive(menu)
                ? "text-blue-600 font-semibold"
                : "text-gray-700 hover:text-blue-600"
            }`}
          >
            {menu.title}
          </Link>
          {hasChildren && (
            <button
              onClick={() => toggleSubmenu(menu.id)}
              className="p-1 ml-2 rounded-md hover:bg-gray-200 transition md:hidden"
            >
              {submenuOpen ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </button>
          )}
        </div>

        {/* Dropdown (mobile + desktop) */}
        {hasChildren && (
          <ul
            className={`${
              submenuOpen ? "block" : "hidden"
            } md:absolute md:left-0 md:top-full md:mt-2 md:shadow-lg md:bg-white md:rounded-lg md:border md:w-48 md:hidden group-hover:md:block transition-all`}
          >
            {menu.children.map((child) => renderMenu(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  /* ---------------- Custom HTML Mode ---------------- */
  if (activeMenuIds.includes("custom") && customContent.html?.trim()) {
    return (
      <nav className="custom-navbar">
        {customContent.css && (
          <style>{`.custom-navbar { all: unset; }\n${customContent.css}`}</style>
        )}
        <div dangerouslySetInnerHTML={{ __html: customContent.html }} />
      </nav>
    );
  }

  /* ---------------- Standard Navbar ---------------- */
  return (
    <nav className="custom-navbar w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-blue-600">
          {Logo}
        </Link>

        {/* Hamburger (mobile) */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-gray-700 hover:text-blue-600 transition"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <NavigationMenu>
            <NavigationMenuList className="flex gap-4">
              {filterActiveMenus(menus).map((menu) => (
                <NavigationMenuItem key={menu.id}>
                  {menu.children && menu.children.length > 0 ? (
                    <>
                      <NavigationMenuTrigger className="text-gray-700 hover:text-blue-600 font-medium">
                        {menu.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 mt-1">
                        <ul className="flex flex-col gap-1">
                          {menu.children.map((child) => (
                            <li key={child.id}>
                              <Link
                                to={child.url || "#"}
                                className="block px-3 py-1 text-sm rounded-md hover:bg-gray-100"
                              >
                                {child.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <Link
                      to={menu.url || "#"}
                      className={`text-gray-700 hover:text-blue-600 font-medium px-3 py-2 rounded-md ${
                        isMenuActive(menu)
                          ? "text-blue-600 font-semibold"
                          : "text-gray-700"
                      }`}
                    >
                      {menu.title}
                    </Link>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div
        className={`md:hidden bg-white border-t border-gray-200 transition-all duration-300 overflow-hidden ${
          mobileOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >.
        <ul className="flex flex-col p-2 space-y-1">
          {filterActiveMenus(menus).map((menu) => renderMenu(menu))}
        </ul>
      </div>
    </nav>
  );
};

export default NavbarPublic;
