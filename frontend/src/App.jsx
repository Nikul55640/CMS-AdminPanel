import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import PageEditor from "./components/PageEditor";
import PublicPage from "./components/PublicPage";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";

const App = () => {
  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("cmsLoggedIn") === "true"
  );
  const [pages, setPages] = useState(
    JSON.parse(localStorage.getItem("cmsPages")) || [
      {
        slug: "home",
        title: "Home",
        description: "Welcome to Home Page",
        content: null,
      },
    ]
  );
  const [currentPage, setCurrentPage] = useState("home");
  const [showEditor, setShowEditor] = useState(false);

  return (
    <BrowserRouter>
      {/* Show Navbar only if logged in */}
      {loggedIn && <Navbar loggedIn={loggedIn} setLoggedIn={setLoggedIn} />}

      <Routes>
        {/* Admin login */}
        <Route
          path="/admin/login"
          element={<Login setLoggedIn={setLoggedIn} />}
        />

        {/* Admin dashboard */}
        <Route
          path="/admin"
          element={
            loggedIn ? (
              <Dashboard
                pages={pages}
                setPages={setPages}
                setCurrentPage={setCurrentPage}
                setShowEditor={setShowEditor}
              />
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />

        {/* Page editor */}
        <Route
          path="/admin/editor"
          element={
            loggedIn && showEditor ? (
              <PageEditor
                pages={pages}
                setPages={setPages}
                currentPage={currentPage}
              />
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />

        {/* Public page */}
        <Route path="/:slug" element={<PublicPage pages={pages} />} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/home" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
