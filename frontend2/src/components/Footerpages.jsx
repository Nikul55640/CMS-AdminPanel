import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8000/api";

const FooterPublic = () => {
  const [menus, setMenus] = useState([]);
  const [customContent, setCustomContent] = useState({ html: "", css: "" });
  const [settings, setSettings] = useState({});

  const buildTree = (list) => {
    if (!Array.isArray(list)) return [];
    const map = {};
    const roots = [];
    list.forEach((i) => (map[i.id || i._id] = { ...i, children: [] }));
    list.forEach((i) => {
      if (i.parent_id) {
        map[i.parent_id]?.children.push(map[i.id || i._id]);
      } else {
        roots.push(map[i.id || i._id]);
      }
    });

    const sortTree = (items) => {
      items.sort((a, b) => (a.order || 0) - (b.order || 0));
      items.forEach((item) => item.children && sortTree(item.children));
    };
    sortTree(roots);

    return roots;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, contentRes] = await Promise.all([
          axios.get(`${API}/menus/location/footer`),
          axios.get(`${API}/menus/custom-content?section=footer`),
        ]);

        setMenus(buildTree(menuRes.data?.menus || menuRes.data || []));
        setCustomContent(contentRes.data?.content || { html: "", css: "" });
        if (contentRes.data?.settings) setSettings(contentRes.data.settings);
      } catch (err) {
        console.error("❌ Footer load failed:", err);
      }
    };
    fetchData();
  }, []);

  const renderMenu = (menu) => {
    const href = menu.page_id
      ? `/pages/${menu.slug || menu.page_id}`
      : menu.url || menu.link || "#";

    return (
      <li key={menu.id || menu._id} className={menu.customClass || ""}>
        {menu.page_id ? (
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
      {customContent.css && <style>{customContent.css}</style>}

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
