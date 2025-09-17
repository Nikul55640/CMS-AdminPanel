import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import PageContext from "../context/PageContext";
const Navbar = () => {
  const navigate = useNavigate();
  const {   loggedIn , setLoggedIn } = useContext(PageContext);

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem("cmsLoggedIn");
    navigate("/admin/login");
  };

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <Link to="/">My CMS</Link>
      {loggedIn && (
        <div className="flex gap-4">
          <Link to="/admin">Dashboard</Link>
          <button
            onClick={handleLogout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
