import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PageProvider } from "./context/PageContext";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import PublicPage from "./components/PublicPage";
import AddPageForm from "./components/AddPageForm";
import Components from "./components/Components";
import PageManager from "./components/PageList";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";

function AdminLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
<Navbar/>
      <div className="flex-grow">{children}</div>
    </div>
  );
}

function App() {
  return (
    <PageProvider>
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
            path="/admin/addPage"
            element={
              <AdminLayout>
                <AddPageForm />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/components"
            element={
              <AdminLayout>
                <Components />
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

          {/* Login without fixed navbar */}
          <Route path="/admin/login" element={<Login />} />

          {/* Public pages */}
          <Route path="/pages/:slug" element={<PublicPage />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/home" />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </PageProvider>
  );
}

export default App;
