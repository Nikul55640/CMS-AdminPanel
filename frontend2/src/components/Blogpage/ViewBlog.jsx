// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useParams, useNavigate } from "react-router-dom";
// import { renderToReactElement } from "@tiptap/static-renderer";
// import StarterKit from "@tiptap/starter-kit";

// const ViewBlog = () => {
//   const { slug } = useParams();
//   const navigate = useNavigate();
//   const API = "http://localhost:5000/api/blogs";

//   const [blog, setBlog] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!slug) {
//       setError("No blog slug provided.");
//       setLoading(false);
//       return;
//     }

//     setLoading(true);

//     axios
//       .get(`${API}/slug/${slug}`)
//       .then((res) => {
//         setBlog(res.data);
//         setError("");
//       })
//       .catch((err) => {
//         if (err.response?.status === 404) setError("Blog not found.");
//         else setError("Failed to fetch blog data.");
//       })
//       .finally(() => setLoading(false));
//   }, [slug]);

//   if (loading)
//     return <p className="text-center mt-20 text-gray-500">Loading blog...</p>;

//   if (error)
//     return (
//       <div className="text-center mt-20 text-red-600">
//         <p>{error}</p>
//         <button
//           className="mt-4 px-4 py-2 bg-gray-700 text-white rounded"
//           onClick={() => navigate(-1)}
//         >
//           ← Back
//         </button>
//       </div>
//     );

//   // -----------------------------
//   // SAFE TipTap JSON parsing
//   // -----------------------------
//   let parsedContent = blog.content;

//   try {
//     if (typeof parsedContent === "string") {
//       parsedContent = JSON.parse(parsedContent);
//     }

//     // Invalid JSON fallback
//     if (!parsedContent || !parsedContent.type) {
//       throw new Error("Invalid content");
//     }
//   } catch (err) {
//     console.warn("⚠️ Invalid TipTap content:", err);
//     parsedContent = null;
//   }

//   // Render TipTap content OR fallback
//   const reactNode = parsedContent ? (
//     renderToReactElement({
//       extensions: [StarterKit],
//       content: parsedContent,
//     })
//   ) : (
//     <p className="text-gray-500">No content available.</p>
//   );

//   return (
//     <div className="max-w-5xl mx-auto p-6 space-y-6 bg-gray-50 min-h-screen">
//       {/* Back button */}
//       <button
//         className="px-4 py-2 bg-gray-700 text-white rounded"
//         onClick={() => navigate(-1)}
//       >
//         ← Back
//       </button>

//       {/* Blog Title */}
//       <h1 className="text-3xl font-bold">{blog.title}</h1>

//       {/* Description */}
//       <p className="text-gray-600">{blog.description}</p>

//       {/* Main Image */}
//       {blog.imageUrl && (
//         <img
//           src={blog.imageUrl}
//           alt={blog.title}
//           className="w-full max-h-[500px] object-contain"

//         />
//       )}

//       {/* Blog Content */}
//       <div className="mt-6">
//         <h2 className="text-xl font-semibold mb-2">Content</h2>
//         <div className="prose max-w-full">{reactNode}</div>
//       </div>

//       {/* Author + Category */}
//       <div className="grid grid-cols-2 gap-4 mt-6">
//         <div>
//           <h3 className="font-semibold">Author</h3>
//           <p>{blog.author}</p>
//         </div>
//         <div>
//           <h3 className="font-semibold">Category</h3>
//           <p>{blog.category}</p>
//         </div>
//       </div>

//       {/* Tags */}
//       {blog.tags?.length > 0 && (
//         <div className="mt-4">
//           <h3 className="font-semibold">Tags</h3>
//           <div className="flex flex-wrap gap-2 mt-1">
//             {blog.tags.map((tag, idx) => (
//               <span key={idx} className="bg-gray-200 px-2 py-1 rounded text-sm">
//                 {tag}
//               </span>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Status */}
//       <div className="mt-4">
//         <h3 className="font-semibold">Status</h3>
//         <p>{blog.status}</p>
//       </div>

//       {/* Scheduled Publish Date */}
//       {blog.status === "scheduled" && blog.publishedAt && (
//         <div className="mt-2">
//           <h3 className="font-semibold">Scheduled Publish Date</h3>
//           <p>{new Date(blog.publishedAt).toLocaleDateString()}</p>
//         </div>
//       )}

//       {/* SEO */}
//       <div className="mt-6">
//         <h3 className="text-xl font-semibold">SEO</h3>

//         <p>
//           <strong>SEO Title:</strong> {blog.seoTitle || "N/A"}
//         </p>

//         <p>
//           <strong>SEO Description:</strong> {blog.seoDescription || "N/A"}
//         </p>

//         <p>
//           <strong>URL Handle:</strong> {blog.urlHandle || "N/A"}
//         </p>
//       </div>
//     </div>
//   );
// };

// export default ViewBlog;


import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const BlogView = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/blogs/slug/${slug}`)
      .then((res) => setBlog(res.data))
      .catch(() => setBlog(null));
  }, [slug]);

  if (!blog) return <p>Blog Not Found</p>;

  return (
    <div>
      <h1 className="text-4xl font-bold text-center mt-6">{blog.title}</h1>

      <div dangerouslySetInnerHTML={{ __html: blog.html }} />

      <style>{blog.css}</style>
    </div>
  );
};

export default BlogView;
