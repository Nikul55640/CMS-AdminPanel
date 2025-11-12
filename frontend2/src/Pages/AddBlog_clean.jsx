import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

// Helper function to generate URL slug
const generateSlug = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

// CSS Styles for better UI
const blogFormStyles = `
  .blog-input {
    transition: all 0.2s ease;
    border-color: #e5e7eb;
  }
  
  .blog-input:hover {
    border-color: #d1d5db;
  }
  
  .blog-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .blog-card {
    background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid #e5e7eb;
  }
  
  .blog-card:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
    border-color: #d1d5db;
  }
  
  .blog-header {
    background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
  }
  
  .blog-btn-primary {
    background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
    transition: all 0.3s ease;
  }
  
  .blog-btn-primary:hover {
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
  
  .blog-btn-success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    transition: all 0.3s ease;
  }
  
  .blog-btn-success:hover {
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }
`;

const AddEditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API = "http://localhost:5000/api/blogs";
  const UPLOAD_API = `${API}/upload`;

  // Form state
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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({ title: "", content: "" });
  const [showSeo, setShowSeo] = useState(false);

  const isEdit = Boolean(id);

  // Load existing blog if editing
  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    axios
      .get(`${API}/id/${id}`)
      .then((res) => {
        const data = res.data;
        setTitle(data.title || "");
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
      .catch((err) => {
        toast.error("Failed to load blog for editing");
      })
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  // Word count
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
    const wc = text.split(/\s+/).filter(Boolean).length;
    setWordCount(wc);
  }, [content]);

  // Auto-generate URL handle
  useEffect(() => {
    if (!title) return;
    if (!urlHandle) {
      const slug = generateSlug(title);
      setUrlHandle(slug);
    }
  }, [title]);

  // Upload image
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
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Save blog
  const handleSave = async (type) => {
    const newErrors = { title: "", content: "" };
    if (!title.trim()) newErrors.title = "Title is required";
    if (!content || (typeof content === "string" && !content.trim()))
      newErrors.content = "Content is required";
    setErrors(newErrors);
    if (newErrors.title || newErrors.content) {
      toast.error("Please fix validation errors before saving");
      return;
    }
    setSaving(true);
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
      if (isEdit) {
        await axios.put(`${API}/${id}`, payload);
        toast.success("Blog updated successfully!");
      } else {
        await axios.post(API, payload);
        toast.success("Blog created successfully!");
      }
      navigate("/admin/blog");
    } catch (err) {
      toast.error("Failed to save blog");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <style>{blogFormStyles}</style>
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading blog data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 pt-8 pb-12">
      <style>{blogFormStyles}</style>

      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {isEdit ? "✏️ Edit Blog Post" : "✨ Create New Blog Post"}
              </h1>
              <p className="text-blue-100 text-base">
                {isEdit
                  ? "Update your blog post with new content and details"
                  : "Write and publish your thoughts to the world"}
              </p>
            </div>
            <div className="hidden md:block text-6xl opacity-20">📝</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800">
                  📌 Blog Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg bg-white transition-all duration-200 text-base font-medium placeholder-gray-400 focus:outline-none ${
                    errors.title
                      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 hover:border-gray-300"
                  }`}
                  placeholder="Enter an engaging blog title..."
                />
                {errors.title && (
                  <p className="text-red-500 text-sm font-medium flex items-center gap-1">
                    <span>⚠️</span> {errors.title}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800">
                  📋 Short Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 h-32 text-base placeholder-gray-400 transition-all duration-200 hover:border-gray-300 resize-none"
                  placeholder="Write a compelling short description for your blog (2-3 sentences)..."
                />
                <div className="text-xs text-gray-500 text-right">
                  {description.length} characters
                </div>
              </div>
            </div>

            {/* Content Editor */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-bold text-gray-800">
                    ✍️ Blog Content <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                    📊 {wordCount} words
                  </span>
                </div>
                <div
                  className={`border-2 rounded-lg overflow-hidden bg-white transition-all duration-200 ${
                    errors.content
                      ? "border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-200"
                      : "border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 hover:border-gray-300"
                  }`}
                >
                  <SimpleEditor value={content} setContent={setContent} />
                </div>
                {errors.content && (
                  <p className="text-red-500 text-sm font-medium flex items-center gap-1">
                    <span>⚠️</span> {errors.content}
                  </p>
                )}
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800">
                  🖼️ Featured Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpload(e.target.files[0])}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors duration-200 text-sm file:mr-4 file:px-4 file:py-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={uploading}
                />
                {uploading && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                    <span className="text-sm font-medium">Uploading image...</span>
                  </div>
                )}
                {imageUrl && (
                  <div className="relative group">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-72 object-cover rounded-lg border-2 border-gray-200 shadow-lg transition-transform duration-200 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200"></div>
                    <p className="text-xs text-gray-500 mt-2">✓ Image uploaded successfully</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800">
                  🏷️ Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Enter tags separated by commas (e.g., React, JavaScript, Web Development)"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-base placeholder-gray-400 transition-all duration-200 hover:border-gray-300"
                />
                <p className="text-xs text-gray-500">
                  💡 Separate tags with commas for better searchability
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 space-y-6 sticky top-20 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Author & Category */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                  👤 Author & Category
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">
                      Author
                    </label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm transition-all duration-200 hover:border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">
                      Category
                    </label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g., Technology, Business"
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm transition-all duration-200 hover:border-gray-300"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Publishing */}
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                  📅 Status & Publishing
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm transition-all duration-200 hover:border-gray-300 cursor-pointer"
                    >
                      <option value="draft">📝 Draft</option>
                      <option value="published">🚀 Published</option>
                      <option value="scheduled">⏰ Scheduled</option>
                    </select>
                  </div>
                  {status === "scheduled" && (
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">
                        Publish Date
                      </label>
                      <input
                        type="date"
                        value={publishDate.toISOString().substring(0, 10)}
                        onChange={(e) => setPublishDate(new Date(e.target.value))}
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm transition-all duration-200 hover:border-gray-300 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* SEO Settings */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowSeo((s) => !s)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all duration-200"
                >
                  <span className="font-bold text-gray-800 flex items-center gap-2">
                    🔍 SEO Settings
                  </span>
                  <span
                    className={`text-gray-600 transition-transform duration-300 ${
                      showSeo ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>
                {showSeo && (
                  <div className="mt-4 p-4 rounded-lg bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-1 block">
                        SEO Title
                      </label>
                      <input
                        type="text"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        placeholder="Optimized title for search engines"
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm transition-all duration-200 hover:border-gray-300"
                      />
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-600">
                          {seoTitle.length > 0 && (
                            <span
                              className={
                                seoTitle.length > 60
                                  ? "text-orange-600 font-semibold"
                                  : "text-green-600 font-semibold"
                              }
                            >
                              {seoTitle.length}/60 characters
                            </span>
                          )}
                        </p>
                        {seoTitle.length > 0 && seoTitle.length <= 60 && (
                          <span className="text-green-600">✓</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-1 block">
                        SEO Description
                      </label>
                      <textarea
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        placeholder="Compelling description for search results"
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 h-20 text-sm transition-all duration-200 hover:border-gray-300 resize-none"
                      />
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-600">
                          {seoDescription.length > 0 && (
                            <span
                              className={
                                seoDescription.length > 160
                                  ? "text-orange-600 font-semibold"
                                  : "text-green-600 font-semibold"
                              }
                            >
                              {seoDescription.length}/160 characters
                            </span>
                          )}
                        </p>
                        {seoDescription.length > 0 && seoDescription.length <= 160 && (
                          <span className="text-green-600">✓</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-1 block">
                        URL Handle
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={urlHandle}
                          onChange={(e) => setUrlHandle(e.target.value)}
                          placeholder="custom-url-slug"
                          className="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm transition-all duration-200 hover:border-gray-300 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setUrlHandle(generateSlug(title));
                            toast.success("URL generated!");
                          }}
                          className="px-3 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold text-sm shadow-md hover:shadow-lg"
                          title="Generate URL from title"
                        >
                          ✨
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t-2 border-gray-100 space-y-3">
                <button
                  type="button"
                  onClick={() => handleSave("draft")}
                  disabled={saving || uploading}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-bold shadow-lg transition-all duration-200 ${
                    saving || uploading
                      ? "opacity-50 cursor-not-allowed bg-gray-600"
                      : "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 hover:shadow-xl active:scale-95"
                  }`}
                >
                  {saving ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>Save as Draft</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSave("published")}
                  disabled={saving || uploading}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-bold shadow-lg transition-all duration-200 ${
                    saving || uploading
                      ? "opacity-50 cursor-not-allowed bg-green-600"
                      : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-xl active:scale-95"
                  }`}
                >
                  {saving ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      <span>Publish Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AddEditBlog;
