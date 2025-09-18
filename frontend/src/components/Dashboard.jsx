import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { FileText, FilePlus, CheckCircle, PlusCircle, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import PageContext from "../context/PageContext";
import Navbar from "./Navbar";

const Dashboard = () => {
  const { token } = useContext(PageContext);
  const [stats, setStats] = useState({ totalPages: 0, drafts: 0, published: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/pages/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch stats", err);
      }
    };
    fetchStats();
  }, [token]);

  const widgetsData = [
    { title: "Total Pages", value: stats.totalPages, icon: FileText, bg: "bg-blue-100", text: "text-blue-700" },
    { title: "Drafts", value: stats.drafts, icon: FilePlus, bg: "bg-yellow-100", text: "text-yellow-700" },
    { title: "Published", value: stats.published, icon: CheckCircle, bg: "bg-green-100", text: "text-green-700" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6">
        {/* Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {widgetsData.map((w, i) => {
            const Icon = w.icon;
            return (
              <div key={i} className={`shadow rounded-lg p-4 flex items-center ${w.bg}`}>
                <Icon className={`w-10 h-10 ${w.text} mr-4`} />
                <div>
                  <h3 className="text-lg font-semibold">{w.title}</h3>
                  <p className={`text-2xl font-bold ${w.text}`}>{w.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-4">
          <Link
            to="/admin/addPage"
            className="flex items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition"
          >
            <PlusCircle className="mr-2" /> Add Page
          </Link>
          <Link
            to="/admin/pages"
            className="flex items-center bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition"
          >
            <Edit className="mr-2" /> Edit Pages
          </Link>
        </div>

        {/* Add your other components like AddPageForm or PageList below */}
      </div>
    </div>
  );
};

export default Dashboard;
