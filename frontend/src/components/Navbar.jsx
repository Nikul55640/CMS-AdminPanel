// src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import PageContext from "../context/PageContext";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const { loggedIn, logout } = useContext(PageContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  // Lock body scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isSidebarOpen]);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") closeSidebar(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Top navbar */}
      <nav className="flex items-center justify-between bg-gray-800 text-white p-4">
        <div className="flex items-center space-x-4">
          <button onClick={openSidebar} aria-label="Open menu" className="p-2">
            <Menu size={28} />
          </button>

          <Link to="/admin" className="font-bold text-2xl hover:text-gray-300">
            MYCMS
          </Link>
        </div>

        {loggedIn && (
          <div className="flex items-center gap-4">
            <Link to="/admin" className="hover:text-gray-300">Dashboard</Link>
            <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* Overlay - click to close */}
      {isSidebarOpen && (
        <div
          className="md:fixed inset-0  bg-zinc-300 bg-opacity-50 z-40"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar drawer (inline transform for reliability) */}
      <aside
        ref={sidebarRef}
        className="fixed top-0 left-0 h-full bg-gray-800 text-white p-4 w-64 z-50"
        style={{
          transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 300ms ease-in-out",
        }}
        aria-hidden={!isSidebarOpen}
      >
        <button aria-label="Close menu" className="mb-4" onClick={closeSidebar}>
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

        <nav className="flex flex-col space-y-3">
          <Link to="/admin/addPage" onClick={closeSidebar} className="hover:bg-gray-700 p-2 rounded">
            Pages
          </Link>
          <Link to="/admin/content" onClick={closeSidebar} className="hover:bg-gray-700 p-2 rounded">
            Content
          </Link>
          <Link to="/admin/components" onClick={closeSidebar} className="hover:bg-gray-700 p-2 rounded">
            Components
          </Link>
          <Link to="/admin/pages" onClick={closeSidebar} className="hover:bg-gray-700 p-2 rounded">
            All Pages
          </Link>
        </nav>
      </aside>
    </>
  );
};

export default Navbar;
