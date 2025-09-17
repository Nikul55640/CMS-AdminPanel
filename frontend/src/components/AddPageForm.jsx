import { useState, useContext } from "react";
import PageContext from "../context/PageContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddPageForm = ({ setShowEditor, setCurrentPage }) => {
  const { pages, setPages, loggedIn, token } = useContext(PageContext);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const navigate = useNavigate();

  const handleAddPage = async () => {
    // Check if admin is logged in
    if (!loggedIn) {
      alert("❌ You must be logged in to add a page.");
      navigate("/admin/login");
      return;
    }
    if (!slug.trim()) return alert("URL Slug is required");
    if (pages.find((p) => p.slug === slug)) {
      return alert("Slug already exists");
    }
    try {
      // Send new page to backend with Authorization header
      const res = await axios.post(
        "http://localhost:8000/api/pages",
        { slug, title, description, html: "", css: "" },
        { headers: { Authorization: `Bearer ${token}` } } // use JWT token
      );
      // Update local context
      console.log(res)
      const updatedPages = [...pages, res.data];
      setPages(updatedPages);
      // Open editor for new page
      setCurrentPage(res.data.slug);
      setShowEditor(true);
      alert("✅ Page added! Now edit the content.");
    } catch (err) {
      console.error("❌ Error adding page:", err);
      alert("Failed to add page.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Add New Page</h2>
      <input
        className="w-full mb-2 p-2 border rounded"
        placeholder="Page Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        className="w-full mb-2 p-2 border rounded"
        placeholder="Page Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        className="w-full mb-2 p-2 border rounded"
        placeholder="Page URL Slug (e.g., about-us)"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
      />
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={handleAddPage}
      >
        Add Page
      </button>
    </div>
  );
};

export default AddPageForm;
