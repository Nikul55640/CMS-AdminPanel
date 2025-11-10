import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { CmsProvider, default as CmsContext } from "./context/CmsContext";

import { useContext } from "react";

import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import AddPageForm from "./Pages/AddPageForm";
import ComponentBuilder from "./Pages/Components";
import PageManager from "./Pages/PageManager";
import Navbar from "./components/Navbar";
import EditorAdd from "./Pages/EditorAdd";
import EditorPage from "./Pages/Editorpage";
import NavbarPublic from "./components/Navbarpages";
import FooterPublic from "./components/Footerpages";
import AdminSettings from "./Pages/AdminSettings";
import PublicPage from "../componentsPublic/PublicPage";
import Navbarmenu from "./Pages/Navbarmenu";
import BlogPage from "./Pages/BlogPage";
import AddBlog from "./Pages/AddBlog";
import Footermenu from "./Pages/Footermenu";



function AdminLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">{children}</div>
    </div>
  );
}


// --- Protected Route ---
const ProtectedRoute = ({ children }) => {
  const { loggedIn } = useContext(CmsContext);
  return loggedIn ? children : <Navigate to="/admin/login" />;
};


function AppRoutes() {
  return (
    <Routes>
      {/* Admin Routes */}
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
        path="/admin/blog/addblog"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <AddBlog />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/blog"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <BlogPage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <AdminSettings />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/menus/navbar"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Navbarmenu />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/menus/footer"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Footermenu />
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
            <PublicPage />
            <FooterPublic />
          </>
        }
      />

      {/* Default */}
      <Route path="/" element={<Navigate to="/pages/home" />} />

      {/* 404 */}
      <Route path="*" element={<p className="p-4">Page not found</p>} />
    </Routes>
  );
}

function App() {
  return (

    <CmsProvider>
      <BrowserRouter>
        <AppRoutes />git 
        <Toaster />
      </BrowserRouter>
    </CmsProvider>
  );
}

export default App;
