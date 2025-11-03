// src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import PageContext from "../context/CmsContext";
import {
  UserPen,
  Menu,
  X,
  LayoutDashboard,
  Plus,
  SquareChartGantt,
  LogOut,
  ChevronDown,
  ChevronRight, // ✅ Added
} from "lucide-react";
import { RxComponent2 } from "react-icons/rx";
import { IoDocumentsOutline } from "react-icons/io5";

const Navbar = () => {
  const navigate = useNavigate();
  const { loggedIn, logout } = useContext(PageContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // ✅ Added dropdown state
  const sidebarRef = useRef(null);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setMenuOpen(false); // ✅ Optional: close dropdown when sidebar closes
  };

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  // Disable body scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  // Close sidebar on Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeSidebar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Top navbar */}
      <nav className="flex items-center justify-between bg-gradient-to-t from-gray-900 to-gray-700 text-white px-6 py-3 shadow-md">
        <div className="flex items-center space-x-4">
          <button
            onClick={openSidebar}
            aria-label="Open menu"
            className="p-2 rounded cursor-pointer hover:bg-gray-700 transition"
          >
            <Menu size={28} />
          </button>
          <Link
            to="/admin"
            className="font-extrabold text-xl hover:text-gray-300"
          >
            ICMS
          </Link>
        </div>

        {loggedIn && (
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 flex items-center gap-1 hover:cursor-pointer rounded hover:bg-red-600 transition"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        )}
      </nav>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className="fixed top-0 left-0 h-full bg-gray-800 text-white p-4 w-56 z-50 shadow-xl rounded-tr-2xl rounded-br-2xl"
        style={{
          transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 300ms ease-in-out",
        }}
        aria-hidden={!isSidebarOpen}
      >
        <button
          aria-label="Close menu"
          className="mb-4 p-1 rounded cursor-pointer hover:bg-gray-700 transition"
          onClick={closeSidebar}
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-6 flex justify-center underline underline-offset-1">
          Admin Panel
        </h2>

        {/* Sidebar navigation */}
        <nav className="flex flex-col gap-2 text-sm">
          <Link
            to="/admin/dashboard"
            onClick={closeSidebar}
            className="p-2 rounded flex items-center gap-2 hover:bg-gray-700 font-semibold transition"
          >
            <LayoutDashboard size={20} /> Dashboard
          </Link>

          <Link
            to="/admin/addPage"
            onClick={closeSidebar}
            className="p-2 rounded flex items-center gap-2 hover:bg-gray-700 font-semibold transition"
          >
            <Plus size={20} /> Add Page
          </Link>

          <Link
            to="/admin/components"
            onClick={closeSidebar}
            className="p-2 rounded flex items-center gap-2 hover:bg-gray-700 font-semibold transition"
          >
            <RxComponent2 size={20} /> Components
          </Link>

          {/* ✅ Dropdown for Menu Management */}
          <div
            onMouseEnter={() => setMenuOpen(!menuOpen)}
            onMouseLeave={() => setMenuOpen(!menuOpen)}
          >
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-full flex items-center justify-between p-2 rounded hover:bg-gray-700 font-semibold transition"
            >
              <span className="flex items-center gap-2">
                <SquareChartGantt size={20} /> Menu Management
              </span>
              {menuOpen ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
            </button>

            {menuOpen && (
              <div className="ml-6 mt-1 flex flex-col gap-1">
                <Link
                  to="/admin/menus/navbar"
                  onClick={closeSidebar}
                  className="p-2 rounded hover:bg-gray-700 transition text-gray-300"
                >
                  Navbar Menu
                </Link>
                <Link
                  to="/admin/menus/footer"
                  onClick={closeSidebar}
                  className="p-2 rounded hover:bg-gray-700 transition text-gray-300"
                >
                  Footer Menu
                </Link>
              </div>
            )}
          </div>

          <Link
            to="/admin/pages"
            onClick={closeSidebar}
            className="p-2 rounded flex items-center gap-2 hover:bg-gray-700 font-semibold transition"
          >
            <IoDocumentsOutline size={20} /> All Pages
          </Link>

          <Link
            to="/admin/settings"
            onClick={closeSidebar}
            className="p-2 rounded flex items-center gap-2 hover:bg-gray-700 font-semibold transition"
          >
            <UserPen size={20} /> Admin
          </Link>
        </nav>
      </aside>
    </>
  );
};

export default Navbar;
