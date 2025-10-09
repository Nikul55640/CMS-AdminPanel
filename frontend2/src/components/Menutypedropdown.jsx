import { useState } from "react";
import axios from "axios";

export default function MenuTypeDropdown({ menuId, currentType }) {
  const [menuType, setMenuType] = useState(currentType || "none");

  const handleChange = async (e) => {
    const newType = e.target.value;
    setMenuType(newType);
    try {
      await axios.put(`http://localhost:5000/api/menus/${menuId}`, { location: newType });
      alert("Menu updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update menu.");
    }
  };

  return (
    <select value={menuType} onChange={handleChange} className="border rounded px-2 py-1 text-sm">
      <option value="none">None</option>
      <option value="navbar">Navbar</option>
      <option value="footer">Footer</option>
    </select>
  );
}
