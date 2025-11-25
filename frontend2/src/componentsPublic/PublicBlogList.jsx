import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Calendar, Tag, User, Eye } from "lucide-react";

const THEMES = {
  light: {
    name: "Light",
    bg: "bg-white",
    headerBg: "bg-gray-50",
    cardBg: "bg-white",
    text: "text-gray-900",
    textMuted: "text-gray-600",
    border: "border-gray-200",
  },
  dark: {
    name: "Dark",
    bg: "bg-gray-900",
    headerBg: "bg-gray-800",
    cardBg: "bg-gray-800",
    text: "text-white",
    textMuted: "text-gray-400",
    border: "border-gray-700",
  },
  blue: {
    name: "Ocean",
    bg: "bg-blue-50",
    headerBg: "bg-blue-100",
    cardBg: "bg-white",
    text: "text-blue-900",
    textMuted: "text-blue-700",
    border: "border-blue-200",
  },
  purple: {
    name: "Purple",
    bg: "bg-purple-50",
    headerBg: "bg-purple-100",
    cardBg: "bg-white",
    text: "text-purple-900",
    textMuted: "text-purple-700",
    border: "border-purple-200",
  },
};

const PublicBlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    setLoading(true);
    
    // Fetch theme setting from backend
    axios
      .get("http://localhost:5000/api/settings/theme")
      .then((res) => {
        const themeValue = res.data.theme || "light";
        setTheme(themeValue);
      })
      .catch(() => {
        // Fall back to localStorage if API fails
        const savedTheme = localStorage.getItem("publicBlogTheme") || "light";
        setTheme(savedTheme);
      });

    // Fetch blogs
    axios
      .get("http://localhost:5000/api/blogs")
      .then((res) => {
        // Filter only published blogs
        const published = res.data.filter(blog => blog.status === "published");
        setBlogs(published);
        setError("");
      })
      .catch((err) => {
        setError("Failed to load blogs");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter blogs by search and category
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...new Set(blogs.map((b) => b.category).filter(Boolean))];

  return (
    <div className={`min-h-screen ${THEMES[theme].bg} transition-colors duration-300`}>
      {/* Header */}
      <div className={`${THEMES[theme].headerBg} shadow-sm border-b ${THEMES[theme].border}`}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h1 className={`text-5xl font-bold ${THEMES[theme].text}`}>Blog</h1>
          <p className={`${THEMES[theme].textMuted} mt-2`}>Discover our latest articles and insights</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-4">
        <input
          type="text"
          placeholder="Search blogs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${THEMES[theme].searchBg || THEMES[theme].cardBg} ${THEMES[theme].border} ${THEMES[theme].text}`}
        />

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full capitalize font-medium transition ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white"
                  : `${THEMES[theme].cardBg} ${THEMES[theme].text} border ${THEMES[theme].border}`
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`${THEMES[theme].cardBg} rounded-xl shadow animate-pulse`}>
                <div className={`h-48 rounded-t-xl ${theme === "dark" ? "bg-gray-700" : "bg-gray-300"}`}></div>
                <div className="p-4 space-y-3">
                  <div className={`h-4 rounded w-3/4 ${theme === "dark" ? "bg-gray-700" : "bg-gray-300"}`}></div>
                  <div className={`h-3 rounded ${theme === "dark" ? "bg-gray-700" : "bg-gray-300"}`}></div>
                  <div className={`h-3 rounded w-2/3 ${theme === "dark" ? "bg-gray-700" : "bg-gray-300"}`}></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className={`text-center py-12 ${THEMES[theme].cardBg} rounded-lg shadow`}>
            <p className="text-red-600 text-lg font-medium">{error}</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className={`text-center py-12 ${THEMES[theme].cardBg} rounded-lg shadow`}>
            <p className={`${THEMES[theme].textMuted} text-lg`}>No blogs found</p>
          </div>
        ) : (
          <>
            <p className={`${THEMES[theme].textMuted} mb-6 font-medium`}>
              Showing {filteredBlogs.length} of {blogs.length} articles
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((blog) => (
                <Link
                  key={blog._id}
                  to={`/pages/blog/${blog.urlHandle}`}
                  className={`group ${THEMES[theme].cardBg} rounded-xl shadow hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-105`}
                >
                  {/* Image */}
                  <div className={`relative h-48 overflow-hidden ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}>
                    {blog.imageUrl ? (
                      <img
                        src={blog.imageUrl}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        alt={blog.title}
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${theme === "dark" ? "bg-gradient-to-br from-gray-700 to-gray-600" : "bg-gradient-to-br from-blue-100 to-purple-100"}`}>
                        <span className={`text-4xl ${theme === "dark" ? "opacity-30" : "opacity-40"}`}>📝</span>
                      </div>
                    )}
                    {blog.category && (
                      <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {blog.category}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-3">
                    <h2 className={`text-lg font-bold ${THEMES[theme].text} group-hover:text-blue-600 transition line-clamp-2`}>
                      {blog.title}
                    </h2>

                    <p className={`${THEMES[theme].textMuted} text-sm line-clamp-3`}>
                      {blog.description}
                    </p>

                    {/* Meta */}
                    <div className={`space-y-2 pt-2 border-t ${THEMES[theme].border}`}>
                      <div className={`flex items-center text-xs ${THEMES[theme].textMuted} gap-2`}>
                        <Calendar size={14} />
                        {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>

                      {blog.author && (
                        <div className={`flex items-center text-xs ${THEMES[theme].textMuted} gap-2`}>
                          <User size={14} />
                          {blog.author}
                        </div>
                      )}

                      {blog.viewCount !== undefined && (
                        <div className={`flex items-center text-xs ${THEMES[theme].textMuted} gap-2`}>
                          <Eye size={14} />
                          {blog.viewCount} views
                        </div>
                      )}

                      {blog.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {blog.tags.slice(0, 2).map((tag, idx) => (
                            <span
                              key={idx}
                              className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${
                                theme === "dark"
                                  ? "bg-gray-700 text-gray-300"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              <Tag size={12} />
                              {tag}
                            </span>
                          ))}
                          {blog.tags.length > 2 && (
                            <span className={`text-xs ${THEMES[theme].textMuted} px-2 py-1`}>
                              +{blog.tags.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PublicBlogList;
