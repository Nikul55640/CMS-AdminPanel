import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { renderToReactElement } from "@tiptap/static-renderer";
import StarterKit from "@tiptap/starter-kit";
import { ArrowLeft, Calendar, User, Tag, Eye } from "lucide-react";
import Image from "@tiptap/extension-image";

const THEMES = {
  light: {
    name: "Light",
    bg: "bg-white",
    containerBg: "bg-gray-50",
    text: "text-gray-900",
    textMuted: "text-gray-600",
    border: "border-gray-200",
    cardBg: "bg-white",
  },
  dark: {
    name: "Dark",
    bg: "bg-gray-900",
    containerBg: "bg-gray-900",
    text: "text-white",
    textMuted: "text-gray-400",
    border: "border-gray-700",
    cardBg: "bg-gray-800",
  },
  blue: {
    name: "Ocean",
    bg: "bg-blue-50",
    containerBg: "bg-blue-50",
    text: "text-blue-900",
    textMuted: "text-blue-700",
    border: "border-blue-200",
    cardBg: "bg-white",
  },
  purple: {
    name: "Purple",
    bg: "bg-purple-50",
    containerBg: "bg-purple-50",
    text: "text-purple-900",
    textMuted: "text-purple-700",
    border: "border-purple-200",
    cardBg: "bg-white",
  },
};

const ViewBlog = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const API = "http://localhost:5000/api/blogs";
  const SETTINGS_API = "http://localhost:5000/api/settings";

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (!slug) {
      setError("No blog slug provided.");
      setLoading(false);
      return;
    }

    setLoading(true);

    // Fetch theme from backend
    axios
      .get(`${SETTINGS_API}/theme`)
      .then((res) => {
        const themeValue = res.data.theme || "light";
        setTheme(themeValue);
      })
      .catch(() => setTheme("light"));

    // Fetch blog
    axios
      .get(`${API}/slug/${slug}`)
      .then((res) => {
        setBlog(res.data);
        setError("");
      })
      .catch((err) => {
        if (err.response?.status === 404) setError("Blog not found.");
        else setError("Failed to fetch blog data.");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading)
    return (
      <div className={`min-h-screen ${THEMES[theme].containerBg} flex items-center justify-center transition-colors duration-300`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className={THEMES[theme].textMuted}>Loading blog...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className={`min-h-screen ${THEMES[theme].containerBg} flex items-center justify-center transition-colors duration-300`}>
        <div className={`text-center ${THEMES[theme].cardBg} p-8 rounded-lg shadow-lg max-w-md ${THEMES[theme].border} border`}>
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} /> Go Back
          </button>
        </div>
      </div>
    );

  // -----------------------------
  // SAFE TipTap JSON parsing
  // -----------------------------
  let parsedContent = blog.content;

  try {
    if (typeof parsedContent === "string") {
      parsedContent = JSON.parse(parsedContent);
    }

    // Invalid JSON fallback
    if (!parsedContent || !parsedContent.type) {
      throw new Error("Invalid content");
    }
  } catch (err) {
    console.warn("⚠️ Invalid TipTap content:", err);
    parsedContent = null;
  }

  // Render TipTap content OR fallback


const reactNode = parsedContent ? (
  renderToReactElement({
    extensions: [
      StarterKit,
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
    ],
    content: parsedContent,
  })
) : (
  <p className="text-gray-500">No content available.</p>
);


  return (
    <div className={`min-h-screen ${THEMES[theme].containerBg} transition-colors duration-300`}>
      {/* Header with Theme Selector */}
      <div className={`${THEMES[theme].bg} ${THEMES[theme].border} border-b sticky top-0 z-10 shadow-sm`}>
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            className={`flex items-center gap-2 font-medium transition hover:opacity-80 ${THEMES[theme].text}`}
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} /> Back
          </button>
        </div>
      </div>

      {/* Main Content */}
      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="mb-8">
          {blog.imageUrl && (
            <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
              <img
                src={blog.imageUrl}
                alt={blog.title}
                className="w-full h-auto max-h-[600px] object-cover"
              />
            </div>
          )}

          {/* Title */}
          <h1 className={`text-4xl md:text-5xl font-bold ${THEMES[theme].text} leading-tight mb-4`}>
            {blog.title}
          </h1>

          {/* Description */}
          <p className={`text-xl ${THEMES[theme].textMuted} leading-relaxed mb-6`}>
            {blog.description}
          </p>

          {/* Meta Information */}
          <div className={`flex flex-wrap items-center gap-6 py-4 ${THEMES[theme].border} border-t border-b`}>
            {blog.author && (
              <div className={`flex items-center gap-2 ${THEMES[theme].text}`}>
                <User size={18} className="text-blue-600" />
                <span className="font-medium">{blog.author}</span>
              </div>
            )}

            {blog.publishedAt && (
              <div className={`flex items-center gap-2 ${THEMES[theme].text}`}>
                <Calendar size={18} className="text-green-600" />
                <span className="font-medium">
                  {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}

            {blog.category && (
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {blog.category}
              </div>
            )}

            {blog.viewCount !== undefined && (
              <div className={`flex items-center gap-2 ${THEMES[theme].text}`}>
                <Eye size={18} className="text-purple-600" />
                <span className="font-medium">{blog.viewCount.toLocaleString()} views</span>
              </div>
            )}
          </div>
        </div>

        {/* Blog Content */}
        <div className={`mb-12`}>
          <div className={`${THEMES[theme].cardBg} rounded-lg p-8 ${THEMES[theme].border} border`}>
            <div className={`prose max-w-none ${THEMES[theme].text} ${
              theme === "dark"
                ? "prose-invert [&_p]:text-gray-300 [&_h2]:text-white [&_h3]:text-white [&_ul]:text-gray-300 [&_ol]:text-gray-300"
                : "[&_p]:text-gray-700 [&_h2]:text-gray-900 [&_h3]:text-gray-900 [&_ul]:text-gray-700 [&_ol]:text-gray-700"
            }`}>
              {reactNode}
            </div>
          </div>
        </div>

        {/* Tags - Only if present */}
        {blog.tags?.length > 0 && (
          <div className={`mb-12 py-6 ${THEMES[theme].border} border-t`}>
            <h3 className={`text-lg font-semibold ${THEMES[theme].text} mb-4 flex items-center gap-2`}>
              <Tag size={20} className="text-blue-600" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition ${
                    theme === "dark"
                      ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
};

export default ViewBlog;


// import { useParams } from "react-router-dom";
// import { useEffect, useState } from "react";
// import axios from "axios";

// const BlogView = () => {
//   const { slug } = useParams();
//   const [blog, setBlog] = useState(null);

//   useEffect(() => {
//     axios.get(`http://localhost:5000/api/blogs/slug/${slug}`)
//       .then((res) => setBlog(res.data))
//       .catch(() => setBlog(null));
//   }, [slug]);

//   if (!blog) return <p>Blog Not Found</p>;

//   return (
//     <div>
//       <h1 className="text-4xl font-bold text-center mt-6">{blog.title}</h1>

//       <div dangerouslySetInnerHTML={{ __html: blog.html }} />

//       <style>{blog.css}</style>
//     </div>
//   );
// };

// export default BlogView;
