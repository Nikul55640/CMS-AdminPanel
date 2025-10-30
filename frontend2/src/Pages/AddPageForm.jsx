import { useContext, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import CmsContext from "../context/CmsContext";
import { PencilLine , Save ,Earth } from "lucide-react";

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
        "http://localhost:5000/api/pages",
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
    <div
      className="max-w-3xl mx-auto mt-12 bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <h1 className="text-3xl font-bold text-center">Create New Page</h1>
        <p className="text-center text-blue-100 mt-1">
          Define your page details and open the editor to design it visually
        </p>
      </div>

      <div className="p-8 space-y-6 border-1 rounded-br-2xl rounded-bl-2xl">
    
        <div>
          <label className="block text-gray-700 font-bold mb-2">
            Title *
          </label>
          <input
            type="text"
            placeholder="About Us"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500  transition"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-gray-700  font-bold mb-2">
            Slug (URL) *
          </label>
          <input
            type="text"
            placeholder="about-us"
            value={formData.slug}
            onChange={(e) => handleChange("slug", e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition"
          />
          <p className="text-sm text-gray-500 mt-1">
            Automatically generated from title if left blank.
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 font-bold mb-2">
            Description
          </label>
          <textarea
            placeholder="Write a short description for this page..."
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 min-h-[100px] transition"
          />
        </div>

        {/* SEO Section */}
        <div className="border-t pt-6 mt-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex gap-1 items-center ">
            <Earth /> SEO Settings
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value={formData.metaTitle || ""}
                onChange={(e) => handleChange("metaTitle", e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500  transition"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Meta Description
              </label>
              <input
                type="text"
                value={formData.metaDescription || ""}
                onChange={(e) =>
                  handleChange("metaDescription", e.target.value)
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-gray-700 font-bold mb-2">
              Keywords
            </label>
            <input
              type="text"
              placeholder="about, company, team"
              value={formData.keywords || ""}
              onChange={(e) => handleChange("keywords", e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500  transition"
            />
          </div>
        </div>
      </div>

    
      <div className="px-8 py-6 flex justify-between sm:justify-end gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={openEditor}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white flex gap-1 rounded-xl font-semibold shadow-md transition"
        >
          <PencilLine  /> Open Editor
        </motion.button>

        <motion.button
          whileHover={!isSaving ? { scale: 1.05 } : {}}
          disabled={isSaving}
          onClick={handleSavePage}
          className={`px-5 py-3 rounded-xl font-semibold text-white shadow-md flex gap-1 transition duration-200 ${
            isSaving
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          <Save /> Save Page
        </motion.button>
      </div>
    </div>
  );
};

export default AddPageForm;
