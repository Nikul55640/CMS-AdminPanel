import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000/api";

const FooterPublic = ({ menuType = "footer" }) => {
  const [menus, setMenus] = useState([]);
  const [customContent, setCustomContent] = useState({
    html: "",
    css: "",
    js: "",
  });
  const [activeMenuIds, setActiveMenuIds] = useState([]);
  const [settings, setSettings] = useState({
    
  });

  // Build nested menu tree
  const buildTree = (list) => {
    if (!Array.isArray(list)) return [];
    const map = {};
    const roots = [];

    list.forEach((i) => (map[i.id || i._id] = { ...i, children: [] }));

    list.forEach((i) => {
      if (i.parent_id) map[i.parent_id]?.children.push(map[i.id || i._id]);
      else roots.push(map[i.id || i._id]);
    });

    // Sort recursively
    const sortTree = (items) => {
      items.sort((a, b) => (a.order || 0) - (b.order || 0));
      items.forEach((item) => item.children && sortTree(item.children));
    };
    sortTree(roots);

    console.log("Built footer menu tree:", roots);
    return roots;
  };

  // Filter only active menus recursively
  const filterActiveMenus = (menuList) => {
    return menuList
      .map((menu) => {
        const filteredChildren = menu.children
          ? filterActiveMenus(menu.children)
          : [];
        if (
          activeMenuIds.includes(String(menu.id || menu._id)) ||
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
      try {
        const [menuRes, contentRes] = await Promise.all([
          axios.get(`${API}/menus/location/${menuType}`),
          axios.get(`${API}/menus/custom-content?section=${menuType}`),
        ]);

        const flatMenus = menuRes.data?.menus || menuRes.data || [];
        console.log("Flat footer menus fetched:", flatMenus);

        const nestedMenus = buildTree(flatMenus);
        const fetchedActiveIds = (menuRes.data.activeMenuIds || []).map(String);
        console.log("Active footer menu IDs:", fetchedActiveIds);

        setMenus(nestedMenus);
        setActiveMenuIds(fetchedActiveIds);
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
  }, [menuType]);

  // Execute custom JS safely
  useEffect(() => {
    if (!customContent.js?.trim()) return;
    console.log("Executing footer custom JS:", customContent.js);

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.text = customContent.js;
    document.body.appendChild(script);

    return () => {
      console.log("Removing footer custom JS script");
      document.body.removeChild(script);
    };
  }, [customContent.js]);

  // Render menu recursively
  const renderMenu = (menu) => {
    const href = menu.page_id
      ? `/pages/${menu.slug || menu.page_id}`
      : menu.url || "#";
    const textColor = menu.textColor || settings.text;
    const hoverColor = menu.hoverText || settings.hoverText;

    console.log("Rendering footer menu:", menu.title);

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
      className=""
      style={{ backgroundColor: settings.bg }}
    >
      {customContent.css && <style>{customContent.css}</style>}
      {customContent.html?.trim() ? (
        <div dangerouslySetInnerHTML={{ __html: customContent.html }} />
      ) : (
        <ul
          className="flex flex-wrap justify-center"
          style={{ gap: settings.linkGap }}
        >
          {filterActiveMenus(menus).map(renderMenu)}
        </ul>
      )}
    </footer>
  );
};

export default FooterPublic;
