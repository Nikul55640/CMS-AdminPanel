import { useContext, useState } from "react";
import CmsContext from "../context/CmsContext";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// Helper to generate slug from title
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

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const openEditor = () => {
    if (!formData.title || !formData.slug) {
      toast.error("⚠️ Please fill Title & Slug first!");
      return;
    }
    navigate("/admin/editor");
  };

  const handleSavePage = async () => {
    // Trim inputs
    const title = formData.title.trim();
    const slug = (formData.slug || generateSlug(title)).trim();
    const description = formData.description.trim();
    const metaTitle = formData.metaTitle.trim() || title;
    const metaDescription = formData.metaDescription.trim() || description;
    const keywords = formData.keywords.trim();

    if (!title || !slug) return toast.error("⚠️ Title and Slug are required!");
    if (!pageContent.html)
      return toast.error("⚠️ Please save editor content first!");
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
          description,
          html: pageContent.html,
          css: pageContent.css,
          js: pageContent.js,
          metaTitle,
          metaDescription,
          keywords,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPages([...pages, res.data]);
      toast.success("✅ Page created successfully!");
      // Reset form & editor
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
      console.error("❌ Error creating page:", err);
      toast.error("Failed to create page.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-120 mx-auto mt-2 border-2 bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-3xl font-extrabold mb-6 text-center">Add New Page</h2>

      <div className="flex flex-col gap-4 mb-6">
        <label className="text-xl font-semibold">Title</label>
        <input
          className="border rounded p-2"
          placeholder="Page Title"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
        />

        <label className="text-xl font-semibold">Description</label>
        <input
          className="border rounded p-2"
          placeholder="Page Description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />

        <label className="text-xl font-semibold">Slug</label>
        <input
          className="border rounded p-2"
          placeholder="Slug (e.g., about-us)"
          value={formData.slug}
          onChange={(e) => handleChange("slug", e.target.value)}
        />

        {/* SEO Fields */}
        <label className="text-xl font-semibold">Meta Title</label>
        <input
          className="border rounded p-2"
          placeholder="Meta Title (for SEO)"
          value={formData.metaTitle || ""}
          onChange={(e) => handleChange("metaTitle", e.target.value)}
        />

        <label className="text-xl font-semibold">Meta Description</label>
        <textarea
          className="border rounded p-2"
          placeholder="Meta Description (for SEO)"
          value={formData.metaDescription || ""}
          onChange={(e) => handleChange("metaDescription", e.target.value)}
        />

        <label className="text-xl font-semibold">Keywords</label>
        <input
          className="border rounded p-2"
          placeholder="Comma-separated keywords"
          value={formData.keywords || ""}
          onChange={(e) => handleChange("keywords", e.target.value)}
        />

        <button
          onClick={openEditor}
          className="flex justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-800"
        >
          Open Editor
        </button>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={handleSavePage}
          disabled={isSaving}
          className={`px-6 py-2 rounded text-white ${
            isSaving
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {isSaving ? "Saving..." : "Save Page"}
        </button>
      </div>
    </div>
  );
};

export default AddPageForm;
