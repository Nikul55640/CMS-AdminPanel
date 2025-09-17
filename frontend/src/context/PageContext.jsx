import { createContext, useState, useEffect } from "react";
import axios from "axios";

const PageContext = createContext();

export const PageProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  // Fetch pages from backend
  useEffect(() => {
    if (!token) return;
    console.log(token)
    const fetchPages = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/pages", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPages(res.data);
        if (!currentPage && res.data.length > 0) setCurrentPage(res.data[0].slug);
      } catch (err) {
        console.error("❌ Failed to fetch pages:", err);
      }
    };
    fetchPages();
  }, []);

  return (
    <PageContext.Provider
      value={{
        loggedIn,
        setLoggedIn,
        token,
        setToken,
        pages,
        setPages,
        currentPage,
        setCurrentPage,
        showEditor,
        setShowEditor,
      }}
    >
      {children}
    </PageContext.Provider>
  );
};

export default PageContext;
