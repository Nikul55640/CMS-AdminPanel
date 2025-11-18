import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CmsProvider } from "./context/CmsContext";
import { Toaster } from "react-hot-toast";
import { useContext } from "react";

// Pages
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import AddPageForm from "./Pages/AddPageForm";
import ComponentBuilder from "./Pages/Components";
import PageManager from "./Pages/PageManager";
import Navbar from "./components/Navbar";
import EditorAdd from "./Pages/EditorAdd";
import EditorPage from "./Pages/Editorpage";
import AdminSettings from "./Pages/AdminSettings";
import PublicPage from "../componentsPublic/PublicPage";
import Navbarmenu from "./Pages/Navbarmenu";
import BlogPage from "./Pages/BlogPage";
import AddBlog from "./Pages/AddBlog";
import Footermenu from "./Pages/Footermenu";
import ViewBlog from "./components/Blogpage/ViewBlog";
import CmsContext from "./context/CmsContext";

/* ------------------- Admin Layout -------------------- */
function AdminLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">{children}</div>
    </div>
  );
}

/* ------------------- Protected Route ------------------ */
const ProtectedRoute = ({ children }) => {
  const { loggedIn, authChecked } = useContext(CmsContext);

  if (!authChecked) return null;
  return loggedIn ? children : <Navigate to="/admin/login" />;
};

/* ------------------- All Routes ----------------------- */
function AppRoutes() {
  return (
    <Routes>
      {/* Dashboard */}
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

      {/* Pages Manager */}
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

      {/* Blog */}
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
        path="/admin/blog/new"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <AddBlog />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/blog/:id"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <AddBlog />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/blog/view/:slug"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <ViewBlog />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Menus */}
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

      {/* Add Page Form */}
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

      {/* Components */}
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

      {/* Editor */}
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
        path="/admin/settings"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <AdminSettings />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Redirect admin root */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />

      {/* Login */}
      <Route path="/admin/login" element={<Login />} />

      {/* PUBLIC SITE PAGES */}
      <Route path="/pages/:slug" element={<PublicPage />} />

      {/* Default home → loads published home page */}
      <Route path="/" element={<Navigate to="/pages/home" />} />

      {/* 404 */}
      <Route path="*" element={<p className="p-4">Page not found</p>} />
    </Routes>
  );
}

/* ------------------- App Wrapper --------------------- */
function App() {
  return (
      <BrowserRouter>
        <AppRoutes />
        <Toaster />
      </BrowserRouter>
  );
}

export default App;
