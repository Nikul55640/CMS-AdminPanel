import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import slugify from "slugify";
import ImageUploader from "@/components/ImageUploader";
import {
  ChevronLeft,
  Save,
  Eye,
  Calendar,
  User,
  Folder,
  Tag,
  FileText,
  Image as ImageIcon,
  BarChart3,
  Clock,
  CheckCircle,
} from "lucide-react";

const AddBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const API = "http://localhost:5000/api/blogs";

  // States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState(null);
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
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("content");

  // Auto slug
  useEffect(() => {
    if (!title.trim()) return;
    const slug = slugify(title, { lower: true, strict: true });
    setUrlHandle(slug);

    if (!seoTitle) setSeoTitle(title);
    if (!seoDescription) setSeoDescription(description);
  }, [title]);

// Load Blog for Edit
useEffect(() => {
  if (!id) return;

  axios
    .get(`${API}/id/${id}`)
    .then((res) => {
      const data = res.data;

      setTitle(data.title);
      setDescription(data.description || "");

      // --- FIXED TIPTAP CONTENT LOADING ---
      let parsedContent = null;

      try {
        if (typeof data.content === "string") {
          parsedContent = JSON.parse(data.content);
        } else if (typeof data.content === "object" && data.content !== null) {
          parsedContent = data.content;
        }
      } catch (err) {
        console.warn("❌ Failed to parse content:", err);
      }

      // If empty → create default empty Tiptap document
      if (!parsedContent || !parsedContent.type) {
        parsedContent = {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "" }],
            },
          ],
        };
      }

      setContent(parsedContent);

      // --- OTHER FIELDS ---
      setAuthor(data.author || "Admin");
      setCategory(data.category || "General");
      setTags(data.tags?.join(", ") || "");
      setStatus(data.status || "draft");
      setPublishDate(
        data.publishedAt ? new Date(data.publishedAt) : new Date()
      );
      setImageUrl(data.imageUrl);
      setSeoTitle(data.seoTitle);
      setSeoDescription(data.seoDescription);
      setUrlHandle(data.urlHandle);
    })
    .catch((err) => {
      console.error(err);
      toast.error("Error loading blog data");
    });
}, [id]);


  // Word Count
  useEffect(() => {
    const extract = (node) => {
      if (!node) return "";
      if (typeof node === "string") return node;
      if (Array.isArray(node)) return node.map(extract).join(" ");
      if (typeof node === "object" && node.content)
        return extract(node.content);
      return "";
    };

    const text = extract(content);
    setWordCount(text.split(/\s+/).filter(Boolean).length);
  }, [content]);

  // Save / Publish
  const handleSave = async (saveType) => {
    if (!title) return toast.error("Title required");
    if (!content) return toast.error("Content required");

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
      status: saveType === "draft" ? "draft" : "published",
      publishedAt: publishDate,
      imageUrl,
      seoTitle,
      seoDescription,
      urlHandle,
    };

    setIsSaving(true);

    try {
      if (id) {
        await axios.put(`${API}/${id}`, payload);
        toast.success("Blog updated successfully!");
      } else {
        await axios.post(API, payload);
        toast.success("Blog created successfully!");
      }
      navigate("/admin/blog");
    } catch (err) {
      toast.error("Save failed: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={() => navigate("/admin/blog")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              title="Back to blogs"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg lg:text-2xl font-bold text-gray-900 truncate">
                {id ? "Edit Blog Post" : "Create New Blog"}
              </h1>
              <p className="text-xs lg:text-sm text-gray-500">
                {id
                  ? "Update and refine your content"
                  : "Start writing your story"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave("draft")}
              disabled={isSaving}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium transition-colors"
            >
              <Save size={16} />
              {isSaving ? "Saving..." : "Save Draft"}
            </button>
            <button
              onClick={() => handleSave("published")}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <CheckCircle size={16} />
              {isSaving ? "Publishing..." : id ? "Update" : "Publish"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-lg shadow-sm p-1 border border-gray-200">
          {[
            { id: "content", label: "Content", icon: FileText },
            { id: "settings", label: "Settings", icon: Eye },
            { id: "seo", label: "SEO", icon: BarChart3 },
          ].map(({ id: tabId, label, icon: Icon }) => (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-medium transition-all ${
                activeTab === tabId
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* CONTENT TAB */}
        {activeTab === "content" && (
          <div className="space-y-6">
            {/* Title */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Blog Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter an engaging title for your blog post..."
                className="w-full px-4 py-3 text-2xl font-bold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">
                {title.length} characters
              </p>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Short Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a concise summary of your blog post..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="3"
              />
              <p className="text-xs text-gray-500 mt-2">
                {description.length} characters
              </p>
            </div>

            {/* Featured Image */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon size={20} className="text-blue-600" />
                <label className="text-sm font-bold text-gray-900">
                  Featured Image
                </label>
              </div>
              <ImageUploader onChange={(url) => setImageUrl(url)} />
            {imageUrl && (
  <div className="mt-4 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50 p-3">
    <div className="w-full flex justify-center">
      <img
        src={imageUrl}
        alt="Featured"
        className="max-w-full max-h-[600px] object-contain rounded-lg shadow-sm"
      />
    </div>

    {/* Remove Button on Hover */}
    <div className="flex justify-end mt-3">
      <button
        type="button"
        onClick={() => setImageUrl("")}
        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
      >
        Remove Image
      </button>
    </div>
  </div>
)}

            </div>

            {/* Editor */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-bold text-gray-900">
                  Blog Content
                </label>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <SimpleEditor value={content} setContent={setContent} />
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            {/* Author & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <User size={18} className="text-blue-600" />
                  <label className="text-sm font-bold text-gray-900">
                    Author
                  </label>
                </div>
                <input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Enter author name..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Folder size={18} className="text-blue-600" />
                  <label className="text-sm font-bold text-gray-900">
                    Category
                  </label>
                </div>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Select or enter category..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Tag size={18} className="text-blue-600" />
                <label className="text-sm font-bold text-gray-900">Tags</label>
              </div>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Enter tags separated by commas..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">
                {tags.split(",").filter((t) => t.trim()).length} tag(s)
              </p>
            </div>

            {/* Status & Publish Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Eye size={18} className="text-blue-600" />
                  <label className="text-sm font-bold text-gray-900">
                    Status
                  </label>
                </div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              {status === "scheduled" && (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar size={18} className="text-blue-600" />
                    <label className="text-sm font-bold text-gray-900">
                      Publish Date
                    </label>
                  </div>
                  <input
                    type="date"
                    value={publishDate.toISOString().slice(0, 10)}
                    onChange={(e) => setPublishDate(new Date(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* SEO TAB */}
        {activeTab === "seo" && (
          <div className="space-y-6">
            {/* URL Handle */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <label className="text-sm font-bold text-gray-900 mb-2 block">
                URL Handle (Slug)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">/blog/</span>
                <input
                  type="text"
                  value={urlHandle}
                  onChange={(e) => setUrlHandle(e.target.value)}
                  placeholder="url-handle"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Auto-generated from title
              </p>
            </div>

            {/* SEO Title */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <label className="text-sm font-bold text-gray-900 mb-2 block">
                SEO Title
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Enter SEO optimized title (50-60 characters)..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-900">
                  <strong>Preview:</strong> {seoTitle.slice(0, 60)}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {seoTitle.length} characters (Recommended: 50-60)
              </p>
            </div>

            {/* SEO Description */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <label className="text-sm font-bold text-gray-900 mb-2 block">
                SEO Meta Description
              </label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Enter meta description (150-160 characters)..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="3"
              />
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-900">
                  <strong>Preview:</strong> {seoDescription.slice(0, 160)}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {seoDescription.length} characters (Recommended: 150-160)
              </p>
            </div>
          </div>
        )}

        {/* Mobile Action Buttons */}
        <div className="md:hidden flex gap-2 fixed bottom-0  left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-xl">
          <button
            onClick={() => handleSave("draft")}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            Draft
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium transition-all disabled:opacity-50"
          >
            <CheckCircle size={16} />
            {id ? "Update" : "Publish"}
          </button>
        </div>

        {/* Spacer for mobile buttons */}
        <div className="md:hidden h-2"></div>
      </div>
    </div>
  );
};

export default AddBlog;



// import { useRef, useState, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import StudioEditor from "@grapesjs/studio-sdk/react";
// import "@grapesjs/studio-sdk/style";
// import {
//   layoutSidebarButtons,
//   dialogComponent,
//   tableComponent,
//   listPagesComponent,
//   lightGalleryComponent,
//   swiperComponent,
//   iconifyComponent,
//   accordionComponent,
//   animationComponent,
//   rteTinyMce,
//   canvasGridMode,
//   googleFontsAssetProvider,
// } from "@grapesjs/studio-sdk-plugins";
// import axios from "axios";
// import toast from "react-hot-toast";

// const BlogEditor = () => {
//   const editorRef = useRef(null);
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const [editorKey] = useState(Date.now());

//   const API = "http://localhost:5000/api/blogs";

//   // Blog Info
//   const [title, setTitle] = useState("");
//   const [slug, setSlug] = useState("");
//   const [seoTitle, setSeoTitle] = useState("");
//   const [seoDescription, setSeoDescription] = useState("");
//   const [status, setStatus] = useState("draft");

//   // Load Existing Blog (EDIT)
//   useEffect(() => {
//     if (!id) return;

//     axios.get(`${API}/id/${id}`).then((res) => {
//       const blog = res.data;
//       setTitle(blog.title);
//       setSlug(blog.slug);
//       setSeoTitle(blog.seoTitle || blog.title);
//       setSeoDescription(blog.seoDescription || "");

//       // Load content into editor
//       setTimeout(() => {
//         if (editorRef.current) {
//           editorRef.current.setComponents(blog.html || "");
//           editorRef.current.setStyle(blog.css || "");
//         }
//       }, 800);
//     });
//   }, [id]);

//   // Auto slug
//   useEffect(() => {
//     if (!title.trim()) return;
//     setSlug(title.toLowerCase().replace(/\s+/g, "-"));
//   }, [title]);

//   // Save Blog
//   const saveBlog = async (isPublish = false) => {
//     const html = editorRef.current.getHtml();
//     const css = editorRef.current.getCss();

//     if (!title.trim()) return toast.error("Title is required");

//     const payload = {
//       title,
//       slug,
//       html,
//       css,
//       seoTitle,
//       seoDescription,
//       status: isPublish ? "published" : "draft",
//     };

//     try {
//       if (id) {
//         await axios.put(`${API}/${id}`, payload);
//       } else {
//         await axios.post(API, payload);
//       }

//       toast.success(isPublish ? "Blog published!" : "Draft saved!");
//       navigate("/admin/blog");
//     } catch (err) {
//       toast.error("Failed to save blog");
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col">
//       {/* Header */}
//       <div className="p-4 bg-white border-b flex justify-between items-center">
//         <div>
//           <h1 className="text-xl font-bold">{id ? "Edit Blog" : "Create Blog"}</h1>
//           <p className="text-gray-500 text-sm">
//             Design your blog post visually using drag & drop
//           </p>
//         </div>

//         <div className="flex gap-3">
//           <button
//             onClick={() => saveBlog(false)}
//             className="px-4 py-2 bg-gray-700 text-white rounded-lg"
//           >
//             Save Draft
//           </button>

//           <button
//             onClick={() => saveBlog(true)}
//             className="px-4 py-2 bg-green-600 text-white rounded-lg"
//           >
//             Publish
//           </button>
//         </div>
//       </div>

//       {/* Blog Info */}
//       <div className="p-4 bg-white shadow grid grid-cols-1 md:grid-cols-3 gap-4 border-b">
//         <div>
//           <label className="font-medium">Blog Title</label>
//           <input
//             className="w-full border p-2 rounded mt-1"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             placeholder="Amazing Blog Title"
//           />
//         </div>

//         <div>
//           <label className="font-medium">Slug (URL)</label>
//           <input
//             className="w-full border p-2 rounded mt-1"
//             value={slug}
//             onChange={(e) => setSlug(e.target.value)}
//             placeholder="amazing-blog-title"
//           />
//         </div>

//         <div>
//           <label className="font-medium">SEO Title</label>
//           <input
//             className="w-full border p-2 rounded mt-1"
//             value={seoTitle}
//             onChange={(e) => setSeoTitle(e.target.value)}
//             placeholder="Best blog for SEO"
//           />
//         </div>

//         <div className="md:col-span-3">
//           <label className="font-medium">SEO Description</label>
//           <textarea
//             className="w-full border p-2 rounded mt-1 h-20"
//             value={seoDescription}
//             onChange={(e) => setSeoDescription(e.target.value)}
//             placeholder="Short SEO-friendly description"
//           ></textarea>
//         </div>
//       </div>

//       {/* GrapesJS Editor */}
//       <div className="flex-1 min-h-0">
//         <StudioEditor
//           key={editorKey}
//           options={{
//             storageManager: { autoload: false, autosave: false },
//             initialHtml: "<div>Start writing your blog...</div>",
//             initialCss: "",
//             plugins: [
//               googleFontsAssetProvider.init({ apiKey: "GOOGLE_FONTS_API_KEY" }),
//               canvasGridMode?.init({ styleableGrid: true }),
//               rteTinyMce.init({ enableOnClick: true }),
//               animationComponent.init(),
//               accordionComponent.init(),
//               iconifyComponent.init(),
//               swiperComponent?.init({ block: true }),
//               lightGalleryComponent?.init({ block: true }),
//               listPagesComponent?.init(),
//               tableComponent.init(),
//               dialogComponent.init(),
//               layoutSidebarButtons.init(),
//             ],
//           }}
//           onReady={(editor) => (editorRef.current = editor)}
//         />
//       </div>
//     </div>
//   );
// };

// export default BlogEditor;
