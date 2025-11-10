// src/context/CmsContext.jsx
import { createContext, useState, useEffect } from "react";
import axios from "axios";

const CmsContext = createContext();

const API_BASE = "http://localhost:5000/api";

export const CmsProvider = ({ children }) => {
  // Auth
  const [loggedIn, setLoggedIn] = useState(false);
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

  // Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // Components
  const [components, setComponents] = useState([]);

  // --- API calls ---
  const fetchPages = async () => {
    try {
      const res = await axios.get(`${API_BASE}/pages`, {
        withCredentials: true,
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



  const fetchComponents = async () => {
    try {
      const res = await axios.get(`${API_BASE}/components`, {
        withCredentials: true,
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

  const fetchMenus = async (location) => {
    try {
      const res = await axios.get(`${API_BASE}/menus/location/${location}`, {
        withCredentials: true,
      });
      setMenus(res.data);
    } catch (err) {
      console.error(
        "❌ Failed to fetch menus:",
        err.response?.data || err.message
      );
    }
  };

  const addComponent = (component) =>
    setComponents((prev) => [...prev, component]);
  const removeComponent = (id) =>
    setComponents((prev) => prev.filter((c) => c.id !== id));

  // --- Effects ---
  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get(`${API_BASE}/auth/me`, { withCredentials: true });
        setLoggedIn(true);
        fetchPages();
        fetchComponents();
        fetchMenus();
      } catch {
        setLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await axios.post(
        `${API_BASE}/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("❌ Logout failed:", err.response?.data || err.message);
    } finally {
      setLoggedIn(false);
      setPages([]);
      setComponents([]);
      setCurrentPage(null);
      setShowEditor(false);
    }
  };

  return (
    <CmsContext.Provider
      value={{
        loggedIn,
        setLoggedIn,
        logout,
        isSidebarOpen,
        toggleSidebar,
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
