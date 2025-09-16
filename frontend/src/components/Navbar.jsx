import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ loggedIn, setLoggedIn }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove login state
    localStorage.removeItem('cmsLoggedIn');
    setLoggedIn(false);

    // Redirect to login
    navigate('/admin/login');
  };

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="text-xl font-bold">
        <Link to="/">My CMS</Link>
      </div>

      {loggedIn && (
        <div className="flex gap-4">
          <Link to="/admin" className="hover:underline">Dashboard</Link>
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
