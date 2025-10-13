import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CmsProvider } from "./context/CmsContext";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import AddPageForm from "./Pages/AddPageForm";
import ComponentBuilder from "./Pages/Components";
import PageManager from "./Pages/PageManager";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import EditorAdd from "./Pages/EditorAdd";
import EditorPage from "./Pages/Editorpage";
import MenuManager from "./Pages/Menumanager";
import NavbarPublic from "./components/Navbarpages";
import FooterPublic from "./components/Footerpages";

import PublicPage from "../componentsPublic/PublicPage";



// Admin Layout
function AdminLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">{children}</div>
    </div>
  );
}

// Protected Route
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem("token"); // simple auth check
  return isLoggedIn ? children : <Navigate to="/admin/login" />;
};

function App() {
  return (
    <CmsProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pages"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <PageManager />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/menus"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <MenuManager />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/addPage"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AddPageForm />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/components"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <ComponentBuilder />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/editor"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <EditorAdd />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/editor/:slug"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <EditorPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Login */}
          <Route path="/admin/login" element={<Login />} />

          {/* Public Pages */}
          <Route
            path="/pages/:slug"
            element={
              <>
                <NavbarPublic />
                <PublicPage/>
                <FooterPublic />
              </>
            }
          />
          {/* Default */}
          <Route path="/" element={<Navigate to="/pages/home" />} />

          {/* 404 */}
          <Route path="*" element={<p className="p-4">Page not found</p>} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </CmsProvider>
  );
}

export default App;
