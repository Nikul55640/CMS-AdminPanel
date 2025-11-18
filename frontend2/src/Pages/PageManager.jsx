import { useContext, useState } from "react";
import CmsContext from "../context/CmsContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const PageManager = () => {
  const { pages, setPages } = useContext(CmsContext);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPages, setSelectedPages] = useState([]);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const itemsPerPage = 5;

  // Filter pages
  const filteredPages = pages.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort pages
  const sortedPages = [...filteredPages].sort((a, b) => {
    const aVal = a[sortBy] || "";
    const bVal = b[sortBy] || "";
    if (sortBy === "createdAt" || sortBy === "updatedAt") {
      return sortOrder === "asc"
        ? new Date(aVal) - new Date(bVal)
        : new Date(bVal) - new Date(aVal);
    }
    return sortOrder === "asc"
      ? aVal.localeCompare(bVal)
      : bVal.localeCompare(aVal);
  });

  const totalPagesCount = Math.ceil(sortedPages.length / itemsPerPage);
  const paginatedPages = sortedPages.slice(
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
            credentials: "include", // <-- THIS sends cookies!
          })
        )
      );
      setPages(pages.filter((p) => !selectedPages.includes(p.slug)));
      setSelectedPages([]);
      toast.success("✅ Selected pages deleted!");
    } catch {
      toast.error("Failed to delete selected pages");
    }
  };

  const handleDelete = async (slug) => {
    if (!window.confirm("Are you sure you want to delete this page?")) return;

    try {
      await fetch(`http://localhost:5000/api/pages/${slug}`, {
        method: "DELETE",
        credentials: "include", // <-- THIS sends cookies!
      });

      setPages(pages.filter((p) => p.slug !== slug));
      toast.success("✅ Page deleted!");
    } catch {
      toast.error("Failed to delete page");
    }
  };

  const handleEdit = (slug) => {
    navigate(`/admin/editor/${slug}`);
  };

  const handleExportSelected = () => {
    if (selectedPages.length === 0) return;

    const exportData = pages.filter((p) => selectedPages.includes(p.slug));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = selectedPages.join(",") + ".json";
    link.click();
    toast.success("✅ Selected pages exported as Json file!");
  };

  const toggleSort = (column) => {
    if (sortBy === column) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mt-6 text-center text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-2xl   h-18  ">
        <h2 className="text-4xl font-bold text-center  w-auto  ">Pages</h2>
        <p className="mt-1 text-sm opacity-90">
          Build reusable components for your website. Clean, fast, and
          intuitive.
        </p>
      </div>
      <div className="  p-6 border rounded-b-2xl  ">
        {/* Search & Bulk Actions */}
        <div className="mb-4  flex flex-col md:flex-row justify-between items-center gap-2">
          <input
            type="text"
            placeholder="Search pages..."
            className="px-3 py-2 border rounded w-full md:w-1/3"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={handleBulkDelete}
              disabled={selectedPages.length === 0}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
            >
              Delete Selected
            </button>
            <button
              onClick={handleExportSelected}
              disabled={selectedPages.length === 0}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Export Selected
            </button>
          </div>
        </div>

        {paginatedPages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 divide-y divide-gray-200 bg-white rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2">
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
                  {["title", "slug", "status", "createdAt", "updatedAt"].map(
                    (col) => (
                      <th
                        key={col}
                        className="px-4 py-2 text-left cursor-pointer"
                        onClick={() => toggleSort(col)}
                      >
                        {col.charAt(0).toUpperCase() + col.slice(1)}
                        {sortBy === col &&
                          (sortOrder === "asc" ? " 🔼" : " 🔽")}
                      </th>
                    )
                  )}
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedPages.map((p) => {
                  const recentlyUpdated =
                    new Date() - new Date(p.updatedAt) < 24 * 60 * 60 * 1000; // last 24h
                  return (
                    <tr
                      key={p._id || p.slug}
                      className={`hover:bg-gray-50 ${
                        recentlyUpdated ? "bg-yellow-50" : ""
                      }`}
                    >
                      <td className="px-4 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={selectedPages.includes(p.slug)}
                          onChange={() => toggleSelect(p.slug)}
                        />
                      </td>
                      <td className="px-4 py-2">{p.title || "Untitled"}</td>
                      <td className="px-4 py-2">{p.slug}</td>
                      <td className="px-4 py-2">
                        <select
                          value={p.status || "draft"}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            try {
                              await fetch(
                                `http://localhost:5000/api/pages/${p.slug}`,
                                {
                                  method: "PUT",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  credentials: "include", // <-- fix here
                                  body: JSON.stringify({ status: newStatus }),
                                }
                              );

                              setPages((prev) =>
                                prev.map((page) =>
                                  page.slug === p.slug
                                    ? { ...page, status: newStatus }
                                    : page
                                )
                              );
                              toast.success("Status updated!");
                            } catch {
                              toast.error("Failed to update status");
                            }
                          }}
                          className={`px-2 py-1 rounded text-white ${
                            p.status === "draft"
                              ? "bg-gray-500"
                              : p.status === "published"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                        </select>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {p.updatedAt
                          ? new Date(p.updatedAt).toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-4 py-2 flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(p.slug)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700 cursor-pointer text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            const url =
                              p.status === "published"
                                ? `/pages/${p.slug}`
                                : `/pages/${p.slug}?preview=1`;
                            window.open(url, "_blank");
                          }}
                          className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-700 cursor-pointer text-sm"
                        >
                          Preview
                        </button>

                        <button
                          onClick={() => handleDelete(p.slug)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 cursor-pointer text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No pages available.</p>
        )}

        {/* Pagination */}
        {totalPagesCount > 1 && (
          <div className="flex flex-col md:flex-row justify-center mt-4 gap-2 items-center">
            <div className="flex gap-2">
              <button
                disabled={currentPageNumber === 1}
                onClick={() => setCurrentPageNumber((prev) => prev - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <button
                disabled={currentPageNumber === totalPagesCount}
                onClick={() => setCurrentPageNumber((prev) => prev + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div>
              Jump to page:{" "}
              <input
                type="number"
                min={1}
                max={totalPagesCount}
                value={currentPageNumber}
                onChange={(e) =>
                  setCurrentPageNumber(
                    Math.min(
                      Math.max(Number(e.target.value), 1),
                      totalPagesCount
                    )
                  )
                }
                className="px-2 py-1 border rounded w-16 text-center"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageManager;
