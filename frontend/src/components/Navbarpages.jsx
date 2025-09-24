// NavbarPublic.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const NavbarPublic = () => {
  const [menus, setMenus] = useState([]);
  useEffect(() => {
    axios.get("http://localhost:5000/api/menus/location/navbar")
      .then(res => setMenus(res.data))
      .catch(console.error);
  }, []);
  const renderMenu = (menu) => (
    <li key={menu._id} className="relative group">
      {menu.pageId ? <Link to={`/pages/${menu.slug}`} className="px-3 py-2 block hover:bg-gray-700">{menu.title}</Link>
      : <a href={menu.url || "#"} className="px-3 py-2 block hover:bg-gray-700">{menu.title}</a>}
      {menu.children?.length > 0 && <ul className="absolute left-0 top-full hidden group-hover:block bg-gray-800 shadow-lg rounded mt-1 z-10">{menu.children.map(renderMenu)}</ul>}
    </li>
  );
  return <nav className="bg-gray-800 text-white p-4"><ul className="flex gap-4">{menus.map(renderMenu)}</ul></nav>;
};

export default NavbarPublic;
