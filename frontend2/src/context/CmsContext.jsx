// src/context/CmsContext.jsx
import { createContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CmsContext = createContext();
const API_BASE = "http://localhost:5000/api";

export const CmsProvider = ({ children }) => {
  const navigate = useNavigate();

  // --- Auth ---
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // --- Menus, Pages, Components ---
  const [menus, setMenus] = useState([]);
  const [pages, setPages] = useState([]);
  const [components, setComponents] = useState([]);

  // --- Current page / editor ---
  const [currentPage, setCurrentPage] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [pageContent, setPageContent] = useState({ html: "", css: "", js: "" });
  const [jsCode, setJsCode] = useState("// Write custom JS here...");

  // --- Form data ---
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
    keywords: "",
  });

  // --- Sidebar ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // --- Components management ---
  const addComponent = (component) =>
    setComponents((prev) => [...prev, component]);
  const removeComponent = (id) =>
    setComponents((prev) => prev.filter((c) => c.id !== id));

  // --- Fetch functions with safe array checks ---
  const fetchPages = async () => {
    try {
      const res = await axios.get(`${API_BASE}/pages`, {
        withCredentials: true,
      });
      setPages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(
        "Failed to fetch pages:",
        err.response?.data || err.message
      );
      setPages([]);
    }
  };

  const fetchComponents = async () => {
    try {
      const res = await axios.get(`${API_BASE}/components`, {
        withCredentials: true,
      });
      setComponents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(
        "Failed to fetch components:",
        err.response?.data || err.message
      );
      setComponents([]);
    }
  };

  const fetchMenus = async (location) => {
    try {
      const res = await axios.get(`${API_BASE}/menus/location/${location}`, {
        withCredentials: true,
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setMenus((prev) => [
        ...prev.filter((m) => m.location !== location),
        ...data,
      ]);
    } catch (err) {
      console.error(
        `Failed to fetch menus (${location}):`,
        err.response?.data || err.message
      );
    }
  };

  // --- Auth check ---
  const authCheckedRef = useRef(false); // prevent double execution in Strict Mode

  useEffect(() => {
    if (authCheckedRef.current) return;
    authCheckedRef.current = true;

    const checkAuth = async () => {
      let isLoggedIn = false;

      try {
        const res = await axios.get(`${API_BASE}/auth/me`, {
          withCredentials: true,
        });
        setUser(res.data);
        setLoggedIn(true);
        isLoggedIn = true;
      } catch (err) {
        console.warn("Auth check failed:", err.response?.data || err.message);

        // Try refresh token
        try {
          await axios.post(
            `${API_BASE}/auth/refresh-token`,
            {},
            { withCredentials: true }
          );
          const res = await axios.get(`${API_BASE}/auth/me`, {
            withCredentials: true,
          });
          setUser(res.data);
          setLoggedIn(true);
          isLoggedIn = true;
        } catch {
          // Failed refresh → redirect to login
          setLoggedIn(false);
          setUser(null);
          navigate("/admin/login", { replace: true });
          return;
        }
      }

      if (isLoggedIn) {
        // Fetch everything in parallel for fast performance
        await Promise.all([
          fetchPages(),
          fetchComponents(),
          fetchMenus("navbar"),
          fetchMenus("footer"),
        ]);
      }

      setAuthChecked(true);
    };

    checkAuth();
  }, []);

  // --- Logout ---
  const logout = async () => {
    try {
      await axios.post(
        `${API_BASE}/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Logout failed:", err.response?.data || err.message);
    } finally {
      setLoggedIn(false);
      setUser(null);
      setPages([]);
      setComponents([]);
      setMenus([]);
      setCurrentPage(null);
      setShowEditor(false);
      navigate("/admin/login", { replace: true });
    }
  };

  return (
    <CmsContext.Provider
      value={{
        loggedIn,
        setLoggedIn,
        user,
        setUser,
        authChecked,
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
