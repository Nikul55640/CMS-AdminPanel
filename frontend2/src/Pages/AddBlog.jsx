import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

const AddBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API = "http://localhost:5000/api/blogs";
  const UPLOAD_API = "http://localhost:5000/api/blogs/upload";

  // State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("Admin");
  const [category, setCategory] = useState("General");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("draft");
  const [publishDate, setPublishDate] = useState(new Date());
  const [imageUrl, setImageUrl] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [urlHandle, setUrlHandle] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Load Blog if Editing
  useEffect(() => {
    if (!id) return;

    axios
      .get(`${API}/id/${id}`)
      .then((res) => {
        const data = res.data;
        setTitle(data.title);
        setDescription(data.description || "");
        setContent(data.content || "");
        setAuthor(data.author || "Admin");
        setCategory(data.category || "General");
        setTags(data.tags?.join(", ") || "");
        setStatus(data.status || "draft");
        setPublishDate(
          data.publishedAt ? new Date(data.publishedAt) : new Date()
        );
        setImageUrl(data.imageUrl || "");
        setSeoTitle(data.seoTitle || "");
        setSeoDescription(data.seoDescription || "");
        setUrlHandle(data.urlHandle || "");
      })
      .catch(() => toast.error("Error loading blog data"));
  }, [id]);

  // Word Count
  useEffect(() => {
    const extractText = (node) => {
      if (!node) return "";
      if (typeof node === "string") return node;
      if (Array.isArray(node)) return node.map(extractText).join(" ");
      if (typeof node === "object" && node.content)
        return extractText(node.content);
      return "";
    };
    const text = extractText(content);
    setWordCount(text.split(/\s+/).filter(Boolean).length);
  }, [content]);

  // Upload Image
  const handleUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      setUploading(true);
      const res = await axios.post(UPLOAD_API, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImageUrl(res.data.imageUrl);
      toast.success("Image uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Save or Publish Blog
  const handleSave = async (type) => {
    const payload = {
      title,
      description,
      content,
      author,
      category,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      status: type === "draft" ? "draft" : "published",
      publishedAt: publishDate,
      imageUrl,
      seoTitle,
      seoDescription,
      urlHandle,
    };

    try {
      if (id) {
        await axios.put(`${API}/${id}`, payload);
        toast.success("Blog updated successfully!");
      } else {
        await axios.post(API, payload);
        toast.success("Blog created successfully!");
      }
      navigate("/admin/blog");
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save blog");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 mt-10">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800">
          {id ? "Edit Blog Post" : "Create Blog Post"}
        </h1>
        <p className="text-gray-500 mt-2">
          Use the form below to {id ? "update" : "create"} your blog content.
        </p>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block font-medium mb-2 text-gray-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter blog title"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium mb-2 text-gray-700">
            Short Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none h-28"
            placeholder="Short description"
          />
        </div>

        {/* Editor */}
        <div>
          <label className="block font-medium mb-2 text-gray-700">
            Content ({wordCount} words)
          </label>
          <div className="border border-gray-300 rounded-md overflow-hidden">
            <SimpleEditor value={content} setContent={setContent} />
          </div>
        </div>

        {/* Featured Image */}
        <div>
          <label className="block font-medium mb-2 text-gray-700">
            Featured Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleUpload(e.target.files[0])}
            className="w-full mb-2"
          />
          {uploading && <p className="text-blue-500">Uploading...</p>}
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Preview"
              className="mt-2 w-full h-64 object-cover rounded-md border"
            />
          )}
        </div>

        {/* SEO */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-2">
            SEO Settings
          </h2>
          <div>
            <label className="block font-medium mb-2 text-gray-700">
              SEO Title
            </label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium mb-2 text-gray-700">
              SEO Description
            </label>
            <textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none h-24"
            />
          </div>

          <div>
            <label className="block font-medium mb-2 text-gray-700">
              URL Handle
            </label>
            <input
              type="text"
              value={urlHandle}
              onChange={(e) => setUrlHandle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="custom-url-handle"
            />
          </div>
        </div>

        {/* Author & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-2 text-gray-700">
              Author
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium mb-2 text-gray-700">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block font-medium mb-2 text-gray-700">
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Status & Publish Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-2 text-gray-700">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>

          {status === "scheduled" && (
            <div>
              <label className="block font-medium mb-2 text-gray-700">
                Publish Date
              </label>
              <input
                type="date"
                value={publishDate.toISOString().substring(0, 10)}
                onChange={(e) => setPublishDate(new Date(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-4 mt-6">
          <button
            onClick={() => handleSave("draft")}
            className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-md transition"
          >
            💾 Save Draft
          </button>
          <button
            onClick={() => handleSave("published")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md transition"
          >
            🚀 Publish
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBlog;
