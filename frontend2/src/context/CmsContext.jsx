// src/context/CmsContext.jsx
import { createContext, useState, useEffect } from "react";
import axios from "axios";

const CmsContext = createContext();
const API_BASE = "http://localhost:5000/api";

export const CmsProvider = ({ children }) => {
  // Auth
  const [token, setTokenState] = useState(
    localStorage.getItem("cmsToken") || ""
  );
  const [loggedIn, setLoggedIn] = useState(!!token);

  // Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // Pages & menus
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [menus, setMenus] = useState([]);

  // Components
  const [components, setComponents] = useState([]);

  // Page content for editor
  const [pageContent, setPageContent] = useState({ html: "", css: "", js: "" });
  const [jsCode, setJsCode] = useState("// Write custom JS here...");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
    keywords: "",
  });

  // --- Token handlers ---
  const setToken = (newToken) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem("cmsToken", newToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      setLoggedIn(true);
      fetchPages();
      fetchComponents();
      fetchMenus();
    } else {
      localStorage.removeItem("cmsToken");
      delete axios.defaults.headers.common["Authorization"];
      setLoggedIn(false);
      setPages([]);
      setComponents([]);
      setMenus([]);
      setCurrentPage(null);
      setShowEditor(false);
    }
  };

  const setRefreshToken = (refreshToken) => {
    if (refreshToken) {
      localStorage.setItem("cmsRefreshToken", refreshToken);
      axios.defaults.headers.common["x-refresh-token"] = refreshToken;
    } else {
      localStorage.removeItem("cmsRefreshToken");
      delete axios.defaults.headers.common["x-refresh-token"];
    }
  };

  const logout = () => {
    setToken(null);
    setRefreshToken(null);
  };

  // --- API calls ---
  const fetchPages = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE}/pages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPages(res.data);
      console.log("✅ [fetchPages] Pages fetched:", res.data);
    } catch (err) {
      console.error(
        "❌ Failed to fetch pages:",
        err.response?.data || err.message
      );
    }
  };

  const fetchMenus = async (location) => {
    if (!token) return;
    try {
      const url = location
        ? `${API_BASE}/menus/location/${location}`
        : `${API_BASE}/menus`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenus(res.data);
      console.log("✅ [fetchMenus] Menus fetched:", res.data);
    } catch (err) {
      console.error(
        "❌ Failed to fetch menus:",
        err.response?.data || err.message
      );
    }
  };

  const fetchComponents = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE}/components`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComponents(res.data);
      console.log("✅ [fetchComponents] Components fetched:", res.data);
    } catch (err) {
      console.error(
        "❌ Failed to fetch components:",
        err.response?.data || err.message
      );
    }
  };

  const addComponent = (component) =>
    setComponents((prev) => [...prev, component]);
  const removeComponent = (id) =>
    setComponents((prev) => prev.filter((c) => c.id !== id));

  return (
    <CmsContext.Provider
      value={{
        // Auth
        token,
        setToken,
        setRefreshToken,
        loggedIn,
        setLoggedIn,
        logout,

        // Sidebar
        isSidebarOpen,
        toggleSidebar,

        // Pages
        pages,
        setPages,
        currentPage,
        setCurrentPage,
        showEditor,
        setShowEditor,
        pageContent,
        setPageContent,
        formData,
        setFormData,
        fetchPages,
        menus,
        setMenus,
        fetchMenus,

        // Components
        components,
        setComponents,
        addComponent,
        removeComponent,
        fetchComponents,
        jsCode,
        setJsCode,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
};

export default CmsContext;
