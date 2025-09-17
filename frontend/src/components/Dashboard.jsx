import { useContext,useState} from "react";
import PageContext from "../context/PageContext";
import CMSEditor from "./CMSEditor";
import PageList from "./PageList.jsx";
import AddPageForm from "./AddPageForm.jsx";
import Navbar from "./Navbar.jsx";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Dashboard = () => {
  const { showEditor } = useContext(PageContext);
   const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      <div className="flex">
        {/* Sidebar */}
        <div
          className={`fixed top-0 left-0 h-full bg-gray-800 text-white p-4 transition-transform ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 md:w-64`}
        >
          <button className="md:hidden mb-4" onClick={toggleSidebar}>
            <X size={24} />
          </button>

          <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

          <nav className="flex flex-col space-y-3">
            <Link to="/admin/pages" className="hover:bg-gray-700 p-2 rounded">
              Pages
            </Link>
            <Link to="/admin/content" className="hover:bg-gray-700 p-2 rounded">
              Content
            </Link>
            <Link
              to="/admin/settings"
              className="hover:bg-gray-700 p-2 rounded"
            >
              Settings
            </Link>
            <Link to="/admin/profile" className="hover:bg-gray-700 p-2 rounded">
              Profile
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-0 md:ml-64 p-6">
          <button
            className="md:hidden mb-4 p-2 bg-gray-800 text-white rounded"
            onClick={toggleSidebar}
          >
            <Menu size={24} />
          </button>

          <div>
            {/* Your main dashboard content goes here */}
            <h1 className="text-3xl font-bold">
              Welcome to the Admin Dashboard
            </h1>
          </div>
        </div>
      </div>
      <div className="p-4">
        <Navbar />
        <AddPageForm />
        <PageList />
        {showEditor ? <CMSEditor /> : <PageList />}
      </div>
    </>
  );
};

export default Dashboard;
