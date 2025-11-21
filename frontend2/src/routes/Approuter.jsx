import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";

// Layout
import Navbar from "../components/Navbar";

// Context
import CmsContext from "../context/CmsContext";

// Admin Pages
import Login from "../Pages/Login";
import Dashboard from "../Pages/Dashboard";
import AddPageForm from "../Pages/AddPageForm";
import ComponentBuilder from "../Pages/Components";
import PageManager from "../Pages/PageManager";
import EditorAdd from "../Pages/EditorAdd";
import EditorPage from "../Pages/Editorpage";
import AdminSettings from "../Pages/AdminSettings";
import Navbarmenu from "../Pages/Navbarmenu";
import BlogPage from "../Pages/BlogPage";
import AddBlog from "../Pages/AddBlog";
import Footermenu from "../Pages/Footermenu";

// Blog View
import ViewBlog from "../components/Blogpage/ViewBlog";

// Public
import PublicPage from "../componentsPublic/PublicPage";
import BlogEditor from "../Pages/AddBlog";

/* ------------------- Admin Layout -------------------- */
const AdminLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <div className="flex-grow">{children}</div>
  </div>
);

/* ------------------- Protected Route ------------------ */
const ProtectedRoute = ({ children }) => {
  const { loggedIn, authChecked } = useContext(CmsContext);

  if (!authChecked) return null;

  return loggedIn ? children : <Navigate to="/admin/login" />;
};

/* ------------------- All Routes ----------------------- */
function AppRouter() {
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
      {/* <Route
        path="/admin/blog"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <BlogPage />
            </AdminLayout> */}
          {/* </ProtectedRoute>
        }
      />

      {/* Add Blog */}
      {/* <Route
        path="/admin/blog/add"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <AddBlog />
            </AdminLayout>
          </ProtectedRoute>
        }
      /> */} 

      {/* Edit Blog */}
      {/* <Route
        path="/admin/blog/edit/:id"
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
      /> */}

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

      {/* Add Blog */}
      <Route
        path="/admin/blog/add"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <BlogEditor />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Edit Blog */}
      <Route
        path="/admin/blog/edit/:id"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <BlogEditor/>
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
<Route path="/admin/blog" element={<AdminLayout><BlogPage /></AdminLayout>} />

<Route path="/admin/blog/add" element={<AdminLayout><BlogEditor /></AdminLayout>} />

<Route path="/admin/blog/edit/:id" element={<AdminLayout><BlogEditor /></AdminLayout>} />
<Route path="/admin/blog/view/:slug" element={<AdminLayout><ViewBlog /></AdminLayout>} />

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

      {/* Settings */}
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

      <Route path="/pages/blog/:slug" element={<ViewBlog />} />

      {/* PUBLIC SITE PAGES */}
      <Route path="/pages/:slug" element={<PublicPage />} />

      {/* Default home */}
      <Route path="/" element={<Navigate to="/pages/home" />} />

      {/* 404 */}
      <Route path="*" element={<p className="p-4">Page not found</p>} />
    </Routes>
  );
}

export default AppRouter;
