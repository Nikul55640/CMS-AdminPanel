import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CmsProvider } from "./context/CmsContext"; 
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import PublicPage from "./components/PublicPage";
import AddPageForm from "./Pages/AddPageForm";
import ComponentBuilder from "./Pages/Components"; // ✅ renamed properly
import PageManager from "./Pages/PageManager";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import Content from "./Pages/Content";
import EditorAdd from "./Pages/EditorAdd";
import EditorPage from "./Pages/Editorpage";
import MenuManager from "./Pages/Menumanager";

function AdminLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">{children}</div>
    </div>
  );
}

function App() {
  return (
    <CmsProvider>
      
        <BrowserRouter>
          <Routes>
            {/* Admin routes wrapped in fixed navbar layout */}
            <Route
              path="/admin/pages"
              element={
                <AdminLayout>
                  <PageManager />
                </AdminLayout>
              }
            />
             <Route
              path="/admin/menus"
              element={
                <AdminLayout>
                  <MenuManager />
                </AdminLayout>
              }
            />
            <Route path="/pages/:slug" element={<PublicPage />} />
            <Route
              path="/admin/addPage"
              element={
                <AdminLayout>
                  <AddPageForm />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/content"
              element={
                <AdminLayout>
                  <Content />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/components"
              element={
                <AdminLayout>
                  <ComponentBuilder /> {/* ✅ use the new ComponentsPage */}
                </AdminLayout>
              }
            />

            <Route
              path="/admin"
              element={
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/editor"
              element={
                <AdminLayout>
                  <EditorAdd />
                </AdminLayout>
              }
            />
            {/* Login without fixed navbar */}
            <Route path="/admin/login" element={<Login />} />
            <Route
              path="/admin/editor/:slug"
              element={
                <AdminLayout>
                  <EditorPage />
                </AdminLayout>
              }
            />
            <Route path="/" element={<Navigate to="/pages/home" />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
  
    </CmsProvider>
  );
}

export default App;
