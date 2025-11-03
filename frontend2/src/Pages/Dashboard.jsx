import { useEffect, useState, useContext } from "react";
import axios from "axios";
import {
  FileText,
  FilePlus,
  CheckCircle,
  PlusCircle,
  Edit,
  Eye,
  Square,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import CmsContext from "../context/CmsContext";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";

const Dashboard = () => {
  const { token } = useContext(CmsContext);
  const [stats, setStats] = useState({
    totalPages: 0,
    drafts: 0,
    published: 0,
  });
  const [recentPages, setRecentPages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/pages/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch stats", err);
      }
    };

    const fetchRecentPages = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/pages?limit=5&sort=recent",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // Sequelize returns 'id' instead of '_id'
        const pages = res.data.map((p) => ({
          ...p,
          _id: p.id,
        }));
        setRecentPages(pages);
      } catch (err) {
        console.error("❌ Failed to fetch recent pages", err);
      }
    };

    fetchStats();
    fetchRecentPages();
  }, [token]);

  const filteredPages = recentPages.filter((page) =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const widgetsData = [
    {
      title: "Total Pages",
      value: stats.totalPages,
      icon: FileText,
      bg: "bg-blue-100",
      text: "text-blue-700",
    },
    {
      title: "Drafts",
      value: stats.drafts,
      icon: FilePlus,
      bg: "bg-yellow-100",
      text: "text-yellow-700",
    },
    {
      title: "Published",
      value: stats.published,
      icon: CheckCircle,
      bg: "bg-green-100",
      text: "text-green-700",
    },
  ];

  const pieData = [
    { name: "Drafts", value: stats.drafts },
    { name: "Published", value: stats.published },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6 bg-gradient-to-l">
      {/* Welcome */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Welcome back, Admin!</h2>
        <p className="text-gray-600">Here's a quick overview of your site.</p>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <Link
          to="/admin/addPage"
          className="flex items-center bg-white text-blue-500 px-6 py-3 rounded-lg shadow hover:scale-105 transition"
        >
          <PlusCircle className="mr-2" /> Add Page
        </Link>
        <Link
          to="/admin/pages"
          className="flex items-center bg-white text-gray-600 px-6 py-3 rounded-lg shadow hover:scale-105 transition"
        >
          <Edit className="mr-2" /> Edit Pages
        </Link>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center bg-white text-green-500 px-6 py-3 rounded-lg shadow hover:scale-105 transition"
        >
          <Eye className="mr-2" /> View Site
        </a>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full max-w-6xl">
        {widgetsData.map((w, i) => {
          const Icon = w.icon;
          return (
            <div
              key={i}
              className={`shadow rounded-lg p-6 flex items-center justify-center flex-col ${w.bg}`}
            >
              <Icon className={`w-12 h-12 ${w.text} mb-3`} />
              <h3 className="text-lg font-semibold mb-1">{w.title}</h3>
              <p className={`text-3xl font-bold ${w.text}`}>{w.value}</p>
            </div>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="mb-6 w-full max-w-3xl">
        <input
          type="text"
          placeholder="Search recent pages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-3 border rounded w-full"
        />
      </div>

      {/* Recent Pages + Chart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {/* Recent Pages */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4 text-center underline underline-offset-2">
            Recent Pages
          </h3>
          <ul className="divide-y divide-gray-200">
            {filteredPages.length > 0 ? (
              filteredPages.map((page) => (
                <li
                  key={page._id}
                  className="py-3 flex justify-between items-center"
                >
                  <span>{page.title}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(page.updatedAt).toLocaleDateString()}
                  </span>
                </li>
              ))
            ) : (
              <li className="py-3 text-gray-500 text-center">
                No pages found.
              </li>
            )}
          </ul>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center justify-center">
          <h3 className="text-xl font-semibold mb-4 text-center underline underline-offset-2">
            Draft vs Published
          </h3>

          <span className="flex justify-start w-full">
            <Square fill="#f59e0b" /> Draft{" "}
          </span>
          <span className="flex justify-start w-full">
            <Square fill="#16a34a" /> Published{" "}
          </span>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                >
                  <Cell fill="#f59e0b" />
                  <Cell fill="#16a34a" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;















































// import { useEffect, useState, useContext } from "react";
// import axios from "axios";
// import {
//   FileText,
//   FilePlus,
//   CheckCircle,
//   PlusCircle,
//   Edit,
//   Eye,
//   Square,
// } from "lucide-react";
// import { Link } from "react-router-dom";
// import CmsContext from "../context/CmsContext";
// import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";

// const Dashboard = () => {
//   const { token } = useContext(CmsContext);
//   const [stats, setStats] = useState({
//     totalPages: 0,
//     drafts: 0,
//     published: 0,
//   });
//   const [recentPages, setRecentPages] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const res = await axios.get("http://localhost:5000/api/pages/stats", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setStats(res.data);
//       } catch (err) {
//         console.error("❌ Failed to fetch stats", err);
//       }
//     };

//     const fetchRecentPages = async () => {
//       try {
//         const res = await axios.get(
//           "http://localhost:5000/api/pages?limit=5&sort=recent",
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         setRecentPages(res.data.map((p) => ({ ...p, _id: p.id })));
//       } catch (err) {
//         console.error("❌ Failed to fetch recent pages", err);
//       }
//     };

//     fetchStats();
//     fetchRecentPages();
//   }, [token]);

//   const filteredPages = recentPages.filter((page) =>
//     page.title.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const widgetsData = [
//     {
//       title: "Total Pages",
//       value: stats.totalPages,
//       icon: FileText,
//       bg: "bg-blue-100",
//       text: "text-blue-700",
//     },
//     {
//       title: "Drafts",
//       value: stats.drafts,
//       icon: FilePlus,
//       bg: "bg-yellow-100",
//       text: "text-yellow-700",
//     },
//     {
//       title: "Published",
//       value: stats.published,
//       icon: CheckCircle,
//       bg: "bg-green-100",
//       text: "text-green-700",
//     },
//   ];

//   const pieData = [
//     { name: "Drafts", value: stats.drafts },
//     { name: "Published", value: stats.published },
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 p-6 flex flex-col items-center">
//       {/* Welcome */}
//       <div className="text-center mb-10">
//         <h2 className="text-4xl font-bold text-gray-800 mb-2">
//           Welcome back, Admin!
//         </h2>
//         <p className="text-gray-600 text-lg">
//           Here's a quick overview of your site.
//         </p>
//       </div>

//       {/* Quick Action Buttons */}
//       <div className="flex flex-wrap justify-center gap-6 mb-10">
//         <Link
//           to="/admin/addPage"
//           className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform font-semibold"
//         >
//           <PlusCircle /> Add Page
//         </Link>
//         <Link
//           to="/admin/pages"
//           className="flex items-center gap-2 bg-gray-50 text-gray-800 px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform font-semibold"
//         >
//           <Edit /> Edit Pages
//         </Link>
//         <a
//           href="/"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform font-semibold"
//         >
//           <Eye /> View Site
//         </a>
//       </div>

//       {/* Widgets */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 w-full max-w-6xl">
//         {widgetsData.map((w, i) => {
//           const Icon = w.icon;
//           return (
//             <div
//               key={i}
//               className={`bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center ${w.bg}`}
//             >
//               <Icon className={`w-12 h-12 mb-3 ${w.text}`} />
//               <h3 className="text-xl font-semibold mb-1">{w.title}</h3>
//               <p className={`text-3xl font-bold ${w.text}`}>{w.value}</p>
//             </div>
//           );
//         })}
//       </div>

//       {/* Search Bar */}
//       <div className="mb-8 w-full max-w-3xl">
//         <input
//           type="text"
//           placeholder="Search recent pages..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
//         />
//       </div>

//       {/* Recent Pages + Pie Chart */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
//         {/* Recent Pages */}
//         <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-lg flex flex-col">
//           <h3 className="text-xl font-bold mb-4 text-center underline underline-offset-4">
//             Recent Pages
//           </h3>
//           <ul className="divide-y divide-gray-200">
//             {filteredPages.length > 0 ? (
//               filteredPages.map((page) => (
//                 <li
//                   key={page._id}
//                   className="py-3 flex justify-between items-center hover:bg-gray-50 rounded-lg px-2 transition"
//                 >
//                   <span className="font-medium text-gray-700">
//                     {page.title}
//                   </span>
//                   <span className="text-sm text-gray-500">
//                     {new Date(page.updatedAt).toLocaleDateString()}
//                   </span>
//                 </li>
//               ))
//             ) : (
//               <li className="py-3 text-gray-400 text-center">
//                 No pages found.
//               </li>
//             )}
//           </ul>
//         </div>

//         {/* Pie Chart */}
//         <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center">
//           <h3 className="text-xl font-bold mb-4 underline underline-offset-4">
//             Draft vs Published
//           </h3>
//           <div className="flex gap-4 mb-4">
//             <span className="flex items-center gap-1 text-gray-700">
//               <Square fill="#f59e0b" /> Draft
//             </span>
//             <span className="flex items-center gap-1 text-gray-700">
//               <Square fill="#16a34a" /> Published
//             </span>
//           </div>
//           <div className="w-full h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={pieData}
//                   dataKey="value"
//                   nameKey="name"
//                   outerRadius={80}
//                   innerRadius={30}
//                 >
//                   <Cell fill="#f59e0b" />
//                   <Cell fill="#16a34a" />
//                 </Pie>
//                 <Tooltip />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
