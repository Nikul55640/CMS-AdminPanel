// src/context/CmsContext.jsx
import { createContext, useState, useEffect } from "react";
import axios from "axios";

const CmsContext = createContext();

export const CmsProvider = ({ children }) => {
  // Pages
  const [pages, setPages] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("cmsToken") || "");
  const [loggedIn, setLoggedIn] = useState(!!token);
  const [showEditor, setShowEditor] = useState(false);
  const [currentPage, setCurrentPage] = useState(null);

  // Editor content
  const [pageContent, setPageContent] = useState({ html: "", css: "", js: "" });

  // Form fields
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    slug: "",
  });

  // Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // Components (reusable)
  const [components, setComponents] = useState([]);

  // Fetch reusable components from backend
  const fetchComponents = async () => {
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:8000/api/components", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComponents(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch components:", err);
    }
  };

  // Add new component to state
  const addComponent = (component) => {
    setComponents((prev) => [...prev, component]);
  };

  // Remove component from state
  const removeComponent = (id) => {
    setComponents((prev) => prev.filter((c) => c._id !== id));
  };

  // Token sync with localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("cmsToken", token);
      setLoggedIn(true);
    } else {
      localStorage.removeItem("cmsToken");
      setLoggedIn(false);
    }
  }, [token]);

  // Fetch pages from backend
  useEffect(() => {
    if (!token) return;
    const fetchPages = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/pages", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPages(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch pages:", err);
      }
    };
    fetchPages();
  }, [token]);

  // Fetch components whenever token changes
  useEffect(() => {
    if (token) fetchComponents();
    else setComponents([]);
  }, [token]);

  // Logout
  const logout = () => {
    setToken("");
    setPages([]);
    setCurrentPage(null);
    setShowEditor(false);
    setLoggedIn(false);
    setPageContent({ html: "", css: "", js: "" });
    setFormData({ title: "", description: "", slug: "" });
    setComponents([]);
  };

  return (
    <CmsContext.Provider
      value={{
        // Pages
        pages,
        setPages,
        loggedIn,
        setLoggedIn,
        token,
        setToken,
        showEditor,
        setShowEditor,
        currentPage,
        setCurrentPage,
        isSidebarOpen,
        toggleSidebar,
        logout,
        pageContent,
        setPageContent,
        formData,
        setFormData,

        // Components
        components,
        setComponents,
        addComponent,
        removeComponent,
        fetchComponents,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
};

export default CmsContext;
