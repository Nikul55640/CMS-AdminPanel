import { useContext, useState } from "react";
import CmsContext from "../context/CmsContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const PageManager = () => {
  const { pages, setPages, token } = useContext(CmsContext);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPages, setSelectedPages] = useState([]);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const itemsPerPage = 5;

  // Filter pages
  const filteredPages = pages.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPagesCount = Math.ceil(filteredPages.length / itemsPerPage);
  const paginatedPages = filteredPages.slice(
    (currentPageNumber - 1) * itemsPerPage,
    currentPageNumber * itemsPerPage
  );

  const toggleSelect = (slug) => {
    setSelectedPages((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedPages.length} pages?`)) return;
    try {
      await Promise.all(
        selectedPages.map((slug) =>
          fetch(`http://localhost:5000/api/pages/${slug}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      setPages(pages.filter((p) => !selectedPages.includes(p.slug)));
      setSelectedPages([]);
      toast("✅ Selected pages deleted!");
    } catch {
      toast("Failed to delete selected pages");
    }
  };

  const handleDelete = async (slug) => {
    if (!window.confirm("Are you sure you want to delete this page?")) return;
    try {
      await fetch(`http://localhost:5000/api/pages/${slug}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setPages(pages.filter((p) => p.slug !== slug));
      toast("✅ Page deleted!");
    } catch {
      toast("Failed to delete page");
    }
  };

  const handleEdit = (slug) => {
    navigate(`/admin/editor/${slug}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Pages</h2>

      {/* Search & Bulk Actions */}
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search pages..."
          className="px-3 py-2 border rounded w-1/3"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          onClick={handleBulkDelete}
          disabled={selectedPages.length === 0}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
        >
          Delete Selected
        </button>
      </div>

      {paginatedPages.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 divide-y divide-gray-200 bg-white rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedPages.length === paginatedPages.length &&
                      paginatedPages.length > 0
                    }
                    onChange={() => {
                      if (selectedPages.length === paginatedPages.length) {
                        setSelectedPages([]);
                      } else {
                        setSelectedPages(paginatedPages.map((p) => p.slug));
                      }
                    }}
                  />
                </th>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Slug</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Created</th>
                <th className="px-4 py-2 text-left">Updated</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedPages.map((p) => (
                <tr key={p._id || p.slug}>
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedPages.includes(p.slug)}
                      onChange={() => toggleSelect(p.slug)}
                    />
                  </td>
                  <td className="px-4 py-2">{p.title || "Untitled"}</td>
                  <td className="px-4 py-2">{p.slug}</td>
                  <td className="px-4 py-2">{p.status || "draft"}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {p.createdAt ? new Date(p.createdAt).toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {p.updatedAt ? new Date(p.updatedAt).toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-2 flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(p.slug)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => window.open(`/pages/${p.slug}`, "_blank")}
                      className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 text-sm"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleDelete(p.slug)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No pages available.</p>
      )}

      {/* Pagination */}
      {totalPagesCount > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          <button
            disabled={currentPageNumber === 1}
            onClick={() => setCurrentPageNumber((prev) => prev - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-2 py-1">
            {currentPageNumber} / {totalPagesCount}
          </span>
          <button
            disabled={currentPageNumber === totalPagesCount}
            onClick={() => setCurrentPageNumber((prev) => prev + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PageManager;

