import { useContext, useState } from "react";
import CmsContext from "../context/CmsContext";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const generateSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

const AddPageForm = () => {
  const {
    pages = [],
    setPages,
    token,
    pageContent,
    setPageContent,
    formData,
    setFormData,
  } = useContext(CmsContext);
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const openEditor = () => {
    if (!formData.title || !formData.slug)
      return toast.error("⚠️ Fill Title & Slug first!");
    navigate("/admin/editor");
  };

  const handleSavePage = async () => {
    const title = (formData?.title || "").trim();
    const slug = (formData?.slug || generateSlug(title)).trim();

    if (!title || !slug) return toast.error("⚠️ Title and Slug are required!");
    if (!pageContent.html) return toast.error("⚠️ Save editor content first!");
    if (pages.find((p) => p.slug === slug))
      return toast.error("⚠️ Slug already exists!");

    setIsSaving(true);
    try {
      const res = await axios.post(
        "http://localhost:8000/api/pages",
        {
          ...formData,
          title,
          slug,
          html: pageContent.html,
          css: pageContent.css,
          js: pageContent.js,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPages([...pages, res.data]);
      toast.success("✅ Page created successfully!");
      setFormData({
        title: "",
        description: "",
        slug: "",
        metaTitle: "",
        metaDescription: "",
        keywords: "",
      });
      setPageContent({ html: "", css: "", js: "" });
      navigate("/admin/pages");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to create page.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl  mt-10 bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
 
      <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
        <h1 className="text-3xl font-bold text-center  tracking-wide">Create a New Page</h1>
      
      </div>

      {/* Form */}
      <div className="p-8 space-y-6">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            placeholder="About Us"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Slug (URL) *
          </label>
          <input
            type="text"
            placeholder="about-us"
            value={formData.slug}
            onChange={(e) => handleChange("slug", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
          />
          <p className="text-xs text-gray-500 mt-1">
            Automatically generated from title if left blank.
          </p>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            placeholder="Short page description..."
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none min-h-[100px] transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Meta Title
            </label>
            <input
              type="text"
              value={formData.metaTitle || ""}
              onChange={(e) => handleChange("metaTitle", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Meta Description
            </label>
            <input
              type="text"
              value={formData.metaDescription || ""}
              onChange={(e) => handleChange("metaDescription", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Keywords
          </label>
          <input
            type="text"
            value={formData.keywords || ""}
            onChange={(e) => handleChange("keywords", e.target.value)}
            placeholder="about, company, team"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
          />
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="px-8 py-5 bg-gray-50 flex justify-end gap-4 border-t border-gray-200">
        <button
          onClick={openEditor}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow transition duration-200"
        >
          ✏️ Open Editor
        </button>
        <button
          onClick={handleSavePage}
          disabled={isSaving}
          className={`px-5 py-3 rounded-lg font-semibold text-white shadow transition duration-200 ${
            isSaving
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isSaving ? "Saving..." : "💾 Save Page"}
        </button>
      </div>
    </div>
  );
};

export default AddPageForm;
