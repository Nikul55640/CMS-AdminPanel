// src/context/ComponentContext.jsx
import { createContext, useState, useEffect } from "react";
import axios from "axios";

const ComponentContext = createContext();

export const ComponentProvider = ({ children }) => {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch components
  const fetchComponents = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/api/components", {
        headers: { Authorization: `Bearer ${localStorage.getItem("cmsToken")}` },
      });
      setComponents(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch components:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add component
  const addComponent = async (component) => {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/components",
        component,
        { headers: { Authorization: `Bearer ${localStorage.getItem("cmsToken")}` } }
      );
      setComponents((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("❌ Failed to add component:", err);
    }
  };

  // Update component
  const updateComponent = async (id, component) => {
    try {
      const res = await axios.put(
        `http://localhost:8000/api/components/${id}`,
        component,
        { headers: { Authorization: `Bearer ${localStorage.getItem("cmsToken")}` } }
      );
      setComponents((prev) =>
        prev.map((c) => (c._id === id ? res.data : c))
      );
    } catch (err) {
      console.error("❌ Failed to update component:", err);
    }
  };

  // Delete component
  const deleteComponent = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/components/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("cmsToken")}` },
      });
      setComponents((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error("❌ Failed to delete component:", err);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  return (
    <ComponentContext.Provider
      value={{
        components,
        loading,
        fetchComponents,
        addComponent,
        updateComponent,
        deleteComponent,
      }}
    >
      {children}
    </ComponentContext.Provider>
  );
};

export default ComponentContext;
