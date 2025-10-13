import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000/api";

const FooterPublic = () => {
  const [menus, setMenus] = useState([]);
  const [customContent, setCustomContent] = useState({
    html: "",
    css: "",
    js: "",
  });
  const [settings, setSettings] = useState({
    bg: "#f3f4f6",
    text: "#111",
    hoverText: "#1d4ed8",
    linkGap: "16px",
  });

  // Build tree for nested menus
  const buildTree = (list) => {
    if (!Array.isArray(list)) return [];
    const map = {};
    const roots = [];
    list.forEach((i) => (map[i.id || i._id] = { ...i, children: [] }));
    list.forEach((i) => {
      if (i.parent_id) map[i.parent_id]?.children.push(map[i.id || i._id]);
      else roots.push(map[i.id || i._id]);
    });

    const sortTree = (items) => {
      items.sort((a, b) => (a.order || 0) - (b.order || 0));
      items.forEach((item) => item.children && sortTree(item.children));
    };
    sortTree(roots);

    return roots;
  };

  // Fetch menus and custom content
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, contentRes] = await Promise.all([
          axios.get(`${API}/menus/location/footer`),
          axios.get(`${API}/menus/custom-content?section=footer`),
        ]);

        setMenus(buildTree(menuRes.data?.menus || menuRes.data || []));
        setCustomContent(
          contentRes.data?.content || { html: "", css: "", js: "" }
        );

        if (contentRes.data?.settings)
          setSettings((prev) => ({ ...prev, ...contentRes.data.settings }));
      } catch (err) {
        console.error("❌ Footer load failed:", err);
      }
    };

    fetchData();
  }, []);

  // Execute custom JS if any
  useEffect(() => {
    if (!customContent.js) return;
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.text = customContent.js;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, [customContent.js]);

  const renderMenu = (menu) => {
    const href = menu.page_id
      ? `/pages/${menu.slug || menu.page_id}`
      : menu.url || "#";
    const textColor = menu.textColor || settings.text;
    const hoverColor = menu.hoverText || settings.hoverText;

    return (
      <li key={menu.id || menu._id} className={menu.customClass || ""}>
        {menu.page_id ? (
          <Link
            to={href}
            className="transition-colors duration-200"
            style={{ color: textColor }}
            onMouseEnter={(e) => (e.currentTarget.style.color = hoverColor)}
            onMouseLeave={(e) => (e.currentTarget.style.color = textColor)}
          >
            {menu.title}
          </Link>
        ) : (
          <a
            href={href}
            className="transition-colors duration-200"
            style={{ color: textColor }}
            onMouseEnter={(e) => (e.currentTarget.style.color = hoverColor)}
            onMouseLeave={(e) => (e.currentTarget.style.color = textColor)}
          >
            {menu.title}
          </a>
        )}

        {menu.children?.length > 0 && (
          <ul className="ml-4 mt-1 flex flex-col gap-1">
            {menu.children.map(renderMenu)}
          </ul>
        )}
      </li>
    );
  };

  return (
    <footer
      className="py-6 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: settings.bg }}
    >
      {/* Inject custom CSS */}
      {customContent.css && <style>{customContent.css}</style>}

      {/* Render custom HTML if present */}
      {customContent.html ? (
        <div dangerouslySetInnerHTML={{ __html: customContent.html }} />
      ) : (
        <ul
          className="flex flex-wrap justify-center"
          style={{ gap: settings.linkGap }}
        >
          {menus.map(renderMenu)}
        </ul>
      )}
    </footer>
  );
};

export default FooterPublic;
