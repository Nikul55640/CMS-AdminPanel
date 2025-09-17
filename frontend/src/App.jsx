import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PageProvider } from "./context/PageContext";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import PublicPage from "./components/PublicPage";
import AddPageForm from "./components/AddPageForm";

function App() {
  return (
    <PageProvider>
      <BrowserRouter>
        <Routes>
           <Route path="/admin/pages" element={<AddPageForm />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/:slug" element={<PublicPage />} />
          <Route path="/" element={<Navigate to="/home" />} />
        </Routes>
      </BrowserRouter>
    </PageProvider>
  );
}

export default App;
