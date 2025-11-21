import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const PublicBlogList = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/blogs")
      .then((res) => setBlogs(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-4xl font-bold">Latest Blogs</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <Link
            key={blog._id}
            to={`/pages/blog/${blog.urlHandle}`}
            className="rounded-xl border shadow hover:shadow-lg transition p-4 bg-white"
          >
            {blog.imageUrl && (
              <img
                src={blog.imageUrl}
                className="w-full h-48 object-cover rounded-md mb-4"
                alt={blog.title}
              />
            )}

            <h2 className="text-xl font-semibold">{blog.title}</h2>
            <p className="text-gray-600 mt-2 line-clamp-3">
              {blog.description}
            </p>

            <p className="text-sm text-gray-500 mt-3">
              {new Date(blog.publishedAt).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PublicBlogList;
