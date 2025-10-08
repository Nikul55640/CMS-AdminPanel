import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8000/api";

const FooterPublic = () => {
  const [menus, setMenus] = useState([]);
  const [customContent, setCustomContent] = useState({ html: "", css: "" });
  const [settings, setSettings] = useState({});

  // Convert flat list to tree
  const buildTree = (list) => {
    if (!Array.isArray(list)) return [];
    const map = {};
    const roots = [];
    list.forEach((i) => (map[i.id || i._id] = { ...i, children: [] }));
    list.forEach((i) =>
      i.parentId
        ? map[i.parentId]?.children.push(map[i.id || i._id])
        : roots.push(map[i.id || i._id])
    );
    return roots;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, contentRes] = await Promise.all([
          axios.get(`${API}/menus/location/footer`),
          axios.get(`${API}/menus/custom-content?section=footer`),
        ]);

        // Build menu tree
        const menuTree = buildTree(menuRes.data?.menus || menuRes.data || []);
        setMenus(menuTree);

        // Load custom HTML/CSS
        setCustomContent(contentRes.data?.content || { html: "", css: "" });

        // Optional settings
        if (contentRes.data?.settings) setSettings(contentRes.data.settings);
      } catch (err) {
        console.error("❌ Footer load failed:", err);
      }
    };
    fetchData();
  }, []);

  // Recursive renderer
  const renderMenu = (menu) => {
    const href = menu.pageId
      ? `/pages/${menu.slug || menu.pageId}`
      : menu.url || menu.link || "#";

    return (
      <li key={menu.id || menu._id} className={menu.customClass || ""}>
        {menu.pageId ? (
          <Link
            to={href}
            className="hover:underline"
            style={{ color: menu.textColor || settings.text }}
          >
            {menu.title}
          </Link>
        ) : (
          <a
            href={href}
            className="hover:underline"
            style={{ color: menu.textColor || settings.text }}
          >
            {menu.title}
          </a>
        )}

        {menu.children?.length > 0 && (
          <ul className="ml-4 mt-1">
            {menu.children.map((child) => renderMenu(child))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <footer
      className="py-6"
      style={{ backgroundColor: settings.bg || "#f3f4f6" }}
    >
      {/* Inject custom CSS */}
      {customContent.css && <style>{customContent.css}</style>}

      {/* Render custom HTML if exists, else default menu */}
      {customContent.html ? (
        <div dangerouslySetInnerHTML={{ __html: customContent.html }} />
      ) : (
        <ul className="flex flex-wrap gap-4 justify-center">
          {menus.map(renderMenu)}
        </ul>
      )}
    </footer>
  );
};

export default FooterPublic;
