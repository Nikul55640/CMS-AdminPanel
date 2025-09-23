import { useEffect, useState } from "react";
import axios from "axios";

export default function Footer() {
  const [menus, setMenus] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/menus/location/footer")
      .then(res => setMenus(res.data));
  }, []);

  const renderMenu = (menu) => (
    <li key={menu._id}>
      <a href={menu.url}>{menu.title}</a>
      {menu.children && menu.children.length > 0 && (
        <ul>{menu.children.map(child => renderMenu(child))}</ul>
      )}
    </li>
  );

  return (
    <footer className="bg-gray-900 text-white p-6 mt-10">
      <ul className="flex gap-4 justify-center">{menus.map(renderMenu)}</ul>
      <p className="text-center mt-4">&copy; {new Date().getFullYear()} My Website</p>
    </footer>
  );
}
