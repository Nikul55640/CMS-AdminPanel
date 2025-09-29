// FooterPublic.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const FooterPublic = () => {
  const [menus, setMenus] = useState([]);
  useEffect(() => {
    axios.get("http://localhost:8000/api/menus/location/footer")
      .then(res => setMenus(res.data))
      .catch(console.error);
  }, []);
  const renderMenu = (menu) => (
    <li key={menu._id}>
      {menu.pageId ? <Link to={`/pages/${menu.slug}`} className="hover:underline">{menu.title}</Link>
      : <a href={menu.url || "#"} className="hover:underline">{menu.title}</a>}
      {menu.children?.length > 0 && <ul>{menu.children.map(renderMenu)}</ul>}
    </li>
  );
  return <footer className="bg-gray-900 text-white p-6"><ul className="flex flex-wrap gap-4 justify-center">{menus.map(renderMenu)}</ul><p className="text-center mt-4">&copy; {new Date().getFullYear()} My Website</p></footer>;
};

export default FooterPublic;
