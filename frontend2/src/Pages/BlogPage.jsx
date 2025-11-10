import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Trash, Edit2, Search, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch all blogs from backend
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/blogs");
      setBlogs(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      toast.error("Failed to load blogs.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete blog
  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this blog?"
    );
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:5000/api/blogs/${id}`);
      toast.success("Blog deleted successfully");
      setBlogs(blogs.filter((b) => b.id !== id));
      setFiltered(filtered.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error("Failed to delete blog.");
    }
  };

  // ✅ Search filter
  useEffect(() => {
    if (search.trim() === "") {
      setFiltered(blogs);
    } else {
      const result = blogs.filter((b) =>
        b.title.toLowerCase().includes(search.toLowerCase())
      );
      setFiltered(result);
    }
  }, [search, blogs]);

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <div className="max-w-5xl mx-auto mt-12 shadow-2xl rounded-2xl bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-t-2xl text-white flex justify-center">
        <h1 className="text-3xl font-bold tracking-wide">Blog Management</h1>
      </div>

      {/* Toolbar */}
      <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-b">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute top-3 left-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search blogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <Link
          to="/admin/blog/addblog"
          className="bg-blue-600 flex items-center gap-1 text-white px-4 py-2 rounded-lg shadow-lg hover:scale-105 transition-transform"
        >
          <Plus size={20} /> Add
        </Link>
      </div>

      {/* Blog List */}
      <div className="p-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((blog) => (
            <div
              key={blog.id}
              className="p-4 border rounded-lg hover:shadow-lg transition flex flex-col md:flex-row justify-between items-start md:items-center"
            >
              <div>
                <h2 className="text-xl font-semibold">{blog.title}</h2>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {blog.description}
                </p>
                <div className="flex gap-2 mt-1 text-sm text-gray-400">
                  <span>{blog.category || "Uncategorized"}</span>•
                  <span>
                    {blog.publishedAt
                      ? new Date(blog.publishedAt).toLocaleDateString()
                      : "Draft"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-3 md:mt-0">
                <Link
                  to={`/admin/blogs/addblog/${blog.id}`}
                  className="bg-yellow-500 text-white px-3 py-2 rounded-lg hover:scale-105 transition"
                >
                  <Edit2 size={18} />
                </Link>
                <button
                  onClick={() => handleDelete(blog.id)}
                  className="bg-red-600 text-white px-3 py-2 rounded-lg hover:scale-105 transition"
                >
                  <Trash size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No blogs found.</p>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
