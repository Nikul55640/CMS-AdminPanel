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

  // Token sync
  useEffect(() => {
    if (token) {
      localStorage.setItem("cmsToken", token);
      setLoggedIn(true);
    } else {
      localStorage.removeItem("cmsToken");
      setLoggedIn(false);
    }
  }, [token]);

  // Fetch pages
  useEffect(() => {
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

    if (token) fetchPages();
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
      }}
    >
      {children}
    </CmsContext.Provider>
  );
};

export default CmsContext;
