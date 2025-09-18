import { createContext, useState, useEffect } from "react";
import axios from "axios";

const PageContext = createContext();

export const PageProvider = ({ children }) => {
  const [pages, setPages] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("cmsToken") || "");
  const [loggedIn, setLoggedIn] = useState(!!token);
  const [showEditor, setShowEditor] = useState(false);
  const [currentPage, setCurrentPage] = useState(null);

  // ✅ Sidebar state globally
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  // Keep localStorage in sync whenever token changes
  useEffect(() => {
    if (token) {
      localStorage.setItem("cmsToken", token);
      setLoggedIn(true);
    } else {
      localStorage.removeItem("cmsToken");
      setLoggedIn(false);
    }
  }, [token]);

  // Fetch pages when logged in
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

  // Logout handler
  const logout = () => {
    setToken("");
    setPages([]);
    setCurrentPage(null);
    setShowEditor(false);
    setLoggedIn(false);
  };

  return (
    <PageContext.Provider
      value={{
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
      }}
    >
      {children}
    </PageContext.Provider>
  );
};

export default PageContext;
