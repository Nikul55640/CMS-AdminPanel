import { useEffect, useState } from "react";
import axios from "axios";

export default function Navbar() {
  const [menus, setMenus] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/menus/location/navbar")
      .then(res => setMenus(res.data));
  }, []);

  const renderMenu = (menu) => (
    <li key={menu._id} className="relative group">
      <a href={menu.url} className="px-3 py-2 block hover:bg-gray-700">{menu.title}</a>
      {menu.children && menu.children.length > 0 && (
        <ul className="absolute left-0 hidden group-hover:block bg-gray-800">
          {menu.children.map(child => renderMenu(child))}
        </ul>
      )}
    </li>
  );

  return (
    <nav className="bg-gray-800 text-white p-4">
      <ul className="flex gap-4">{menus.map(renderMenu)}</ul>
    </nav>
  );
}
