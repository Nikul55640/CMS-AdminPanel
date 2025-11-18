import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const PublicCmsContext = createContext();
const API_BASE = "http://localhost:5000/api";

const PublicCmsProvider = ({ children }) => {
  const [menus, setMenus] = useState({ navbar: [], footer: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMenus = async () => {
      try {
        const [nav, foot] = await Promise.all([
          axios.get(`${API_BASE}/menus/location/navbar`),
          axios.get(`${API_BASE}/menus/location/footer`),
        ]);

        setMenus({
          navbar: nav.data || [],
          footer: foot.data || [],
        });
      } catch (err) {
        console.error("❌ Public CMS menu load fail:", err);
        setMenus({ navbar: [], footer: [] }); // fallback
      } finally {
        setLoading(false);
      }
    };

    loadMenus();
  }, []);

  return (
    <PublicCmsContext.Provider value={{ menus, loading }}>
      {children}
    </PublicCmsContext.Provider>
  );
};

export default PublicCmsProvider;
