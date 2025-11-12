// src/context/CmsContext.jsx
import { createContext, useState, useEffect, useRef } from "react";
import axios from "axios";

const CmsContext = createContext();
const API_BASE = "http://localhost:5000/api";

export const CmsProvider = ({ children }) => {
  // --- Auth ---
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  console.log(
    "🧩 [CmsProvider] Initial state -> loggedIn:",
    loggedIn,
    "user:",
    user,
    "authChecked:",
    authChecked
  );

  // --- Menus ---
  const [menus, setMenus] = useState([]);

  // --- Pages ---
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  // --- Page content for editor ---
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
  const toggleSidebar = () => {
    console.log("🧩 [CmsProvider] Sidebar toggled ->", !isSidebarOpen);
    setIsSidebarOpen((prev) => !prev);
  };

  // --- Components ---
  const [components, setComponents] = useState([]);
  const addComponent = (component) => {
    console.log("🧩 [CmsProvider] Adding component:", component);
    setComponents((prev) => [...prev, component]);
  };
  const removeComponent = (id) => {
    console.log("🧩 [CmsProvider] Removing component with id:", id);
    setComponents((prev) => prev.filter((c) => c.id !== id));
  };

  // --- Fetch functions ---
  const fetchPages = async () => {
    console.log("🔹 [CmsProvider] Fetching pages...");
    try {
      const res = await axios.get(`${API_BASE}/pages`, {
        withCredentials: true,
      });
      setPages(res.data);
      console.log("✅ [CmsProvider] Pages fetched:", res.data.length);
    } catch (err) {
      console.error(
        "❌ [CmsProvider] Failed to fetch pages:",
        err.response?.data || err.message
      );
    }
  };

  const fetchComponents = async () => {
    console.log("🔹 [CmsProvider] Fetching components...");
    try {
      const res = await axios.get(`${API_BASE}/components`, {
        withCredentials: true,
      });
      setComponents(res.data);
      console.log("✅ [CmsProvider] Components fetched:", res.data.length);
    } catch (err) {
      console.error(
        "❌ [CmsProvider] Failed to fetch components:",
        err.response?.data || err.message
      );
    }
  };

  const fetchMenus = async (location) => {
    console.log(`🔹 [CmsProvider] Fetching menus for location: ${location}...`);
    try {
      const res = await axios.get(`${API_BASE}/menus/location/${location}`, {
        withCredentials: true,
      });
      setMenus(res.data);
      console.log(
        `✅ [CmsProvider] Menus fetched for location: ${location}`,
        res.data.length
      );
    } catch (err) {
      console.error(
        "❌ [CmsProvider] Failed to fetch menus:",
        err.response?.data || err.message
      );
    }
  };

  const authCheckedRef = useRef(false); // prevent double execution in Strict Mode

  useEffect(() => {
    if (authCheckedRef.current) return;
    authCheckedRef.current = true;

    const checkAuth = async () => {
      console.log("🔹 [Auth] Checking login status on app load...");
      let isLoggedIn = false;

      try {
        console.log("🔹 [Auth] Attempting GET /auth/me ...");
        const res = await axios.get(`${API_BASE}/auth/me`, {
          withCredentials: true,
        });
        setUser(res.data);
        setLoggedIn(true);
        isLoggedIn = true;
        console.log("✅ [Auth] Logged in via cookie, user:", res.data.username);
      } catch (err) {
        console.warn(
          "⚠️ [Auth] /auth/me failed:",
          err.response?.data || err.message
        );

        try {
          console.log("🔹 [Auth] Attempting POST /auth/refresh-token ...");
          await axios.post(
            `${API_BASE}/auth/refresh-token`,
            {},
            { withCredentials: true }
          );

          console.log(
            "✅ [Auth] Refresh token succeeded, retrying /auth/me ..."
          );
          const res = await axios.get(`${API_BASE}/auth/me`, {
            withCredentials: true,
          });
          setUser(res.data);
          setLoggedIn(true);
          isLoggedIn = true;
          console.log(
            "✅ [Auth] Logged in after refresh, user:",
            res.data.username
          );
        } catch (refreshErr) {
          console.error(
            "❌ [Auth] Refresh token failed:",
            refreshErr.response?.data || refreshErr.message
          );
          setLoggedIn(false);
          setUser(null);
          console.log("🔹 [Auth] Not logged in after refresh attempt");
        }
      }

      if (isLoggedIn) {
        console.log("🔹 [Auth] Fetching pages, components, menus...");
        await fetchPages();
        await fetchComponents();
        await fetchMenus("navbar");
        await fetchMenus("footer");
      } else {
        console.log("🔹 [Auth] Skipping fetch because user is not logged in");
      }

      setAuthChecked(true); // mark auth check complete
      console.log("🔹 [Auth] Auth check completed -> loggedIn:", isLoggedIn);
    };
    checkAuth();
  }, []);

  // --- Logout ---
  const logout = async () => {
    console.log("🔹 [CmsProvider] Logging out user:", user?.username);
    try {
      await axios.post(
        `${API_BASE}/auth/logout`,
        {},
        { withCredentials: true }
      );
      console.log("✅ [CmsProvider] Logout request sent");
    } catch (err) {
      console.error("❌ Logout failed:", err.response?.data || err.message);
    } finally {
      setLoggedIn(false);
      setUser(null);
      setPages([]);
      setComponents([]);
      setMenus([]);
      setCurrentPage(null);
      setShowEditor(false);
      console.log("🔹 [CmsProvider] State reset after logout");
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
