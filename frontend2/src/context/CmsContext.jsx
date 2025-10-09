// src/context/CmsContext.jsx
import { createContext, useState, useEffect } from "react";
import axios from "axios";

const CmsContext = createContext();

const API_BASE = "http://localhost:5000/api";

export const CmsProvider = ({ children }) => {
  // Auth
  const [token, setToken] = useState(localStorage.getItem("cmsToken") || "");
  const [loggedIn, setLoggedIn] = useState(!!token);
  const [menus, setMenus] = useState([]);
  // Pages
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  // Page content for editor
  const [pageContent, setPageContent] = useState({ html: "", css: "", js: "" });
  const [jsCode, setJsCode] = useState("// Write custom JS here...");
  // Form data for page editing/creation
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
    keywords: "",
  });

  // Fetch menus by location
  const fetchMenus = async (location) => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE}/menus/location/${location}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenus(res.data);
    } catch (err) {
      console.error(
        "❌ Failed to fetch menus:",
        err.response?.data || err.message
      );
    }
  };
  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // Components
  const [components, setComponents] = useState([]);

  // --- API calls ---
  const fetchPages = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE}/pages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPages(res.data);
    } catch (err) {
      console.error(
        "❌ Failed to fetch pages:",
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
    } catch (err) {
      console.error(
        "❌ Failed to fetch components:",
        err.response?.data || err.message
      );
    }
  };

  // Add/remove component
  const addComponent = (component) => {
    setComponents((prev) => [...prev, component]);
  };
  const removeComponent = (id) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
  };

  // --- Effects ---
  // Sync token with localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("cmsToken", token);
      setLoggedIn(true);
      fetchPages();
      fetchComponents();
    } else {
      localStorage.removeItem("cmsToken");
      setLoggedIn(false);
      setPages([]);
      setComponents([]);
      setCurrentPage(null);
      setShowEditor(false);
    }
  }, [token]);

  // Logout function
  const logout = () => setToken("");

  return (
    <CmsContext.Provider
      value={{
        // Auth
        token,
        setToken,
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
