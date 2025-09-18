import { useContext, useState, useEffect } from "react";
import PageContext from "../context/PageContext";
import axios from "axios";
import StudioEditor from "@grapesjs/studio-sdk/react";
import "@grapesjs/studio-sdk/style";
import { layoutSidebarButtons } from "@grapesjs/studio-sdk-plugins";
import Navbar from "./Navbar";
import toast from "react-hot-toast";

const PageManager = () => {
  const { pages, setPages, token } = useContext(PageContext);

  const [currentPage, setCurrentPage] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [deletingPage, setDeletingPage] = useState(null);
  const [editorInstance, setEditorInstance] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPages, setSelectedPages] = useState([]);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const itemsPerPage = 5;

  // Filter pages by search
  const filteredPages = pages.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPagesCount = Math.ceil(filteredPages.length / itemsPerPage);
  const paginatedPages = filteredPages.slice(
    (currentPageNumber - 1) * itemsPerPage,
    currentPageNumber * itemsPerPage
  );

  const page = pages.find((p) => p.slug === currentPage);

  useEffect(() => {
    if (!editorInstance || !page) return;
    editorInstance.DomComponents.clear();
    editorInstance.CssComposer.clear();
    editorInstance.setComponents(page.html || "<div>Start editing...</div>");
    editorInstance.setStyle(page.css || "");
  }, [editorInstance, page]);

  const handleEdit = (slug) => {
    setCurrentPage(slug);
    setShowEditor(true);
  };

  const handleDelete = async (slug) => {
    if (!window.confirm("Are you sure you want to delete this page?")) return;
    try {
      setDeletingPage(slug);
      await axios.delete(`http://localhost:8000/api/pages/${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPages(pages.filter((p) => p.slug !== slug));
      toast("✅ Page deleted successfully");
    } catch (err) {
      console.error(err);
      toast("Failed to delete page");
    } finally {
      setDeletingPage(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedPages.length} pages?`)) return;
    try {
      await Promise.all(
        selectedPages.map((slug) =>
          axios.delete(`http://localhost:8000/api/pages/${slug}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      setPages(pages.filter((p) => !selectedPages.includes(p.slug)));
      setSelectedPages([]);
      toast("✅ Selected pages deleted!");
    } catch (err) {
      console.error(err);
      toast("Failed to delete selected pages");
    }
  };

  const handlePreview = (slug) => {
    window.open(`/pages/${slug}`, "_blank");
  };

  const handleSave = async () => {
    if (!editorInstance || !page) return toast("Editor not ready!");

    const html = editorInstance.getHtml();
    const css = editorInstance.getCss();

    if (!html.trim()) return toast("⚠️ Page content cannot be empty!");

    setIsSaving(true);
    try {
      const res = await axios.put(
        `http://localhost:8000/api/pages/${page.slug}`,
        { html, css },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPages(pages.map((p) => (p.slug === page.slug ? res.data : p)));
      toast("✅ Page updated successfully!");
      setShowEditor(false);
      setCurrentPage(null);
    } catch (err) {
      console.error(err);
      toast("Failed to save page");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSelect = (slug) => {
    setSelectedPages((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const toggleStatus = async (slug, currentStatus) => {
    const newStatus = currentStatus === "draft" ? "published" : "draft";
    try {
      const res = await axios.put(
        `http://localhost:8000/api/pages/${slug}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPages(pages.map((p) => (p.slug === slug ? res.data : p)));
      toast(`✅ Status changed to ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast("Failed to change status");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
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
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
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
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                      Title
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                      Slug
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                      Created
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                      Updated
                    </th>
                    <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                      Actions
                    </th>
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
                      <td className="px-4 py-2">
                        <button
                          onClick={() => toggleStatus(p.slug, p.status)}
                          className={`px-2 py-1 rounded text-white ${
                            p.status === "published"
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-yellow-500 hover:bg-yellow-600"
                          }`}
                        >
                          {p.status || "draft"}
                        </button>
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
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handlePreview(p.slug)}
                          className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 text-sm"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => handleDelete(p.slug)}
                          disabled={deletingPage === p.slug}
                          className={`bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm ${
                            deletingPage === p.slug
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {deletingPage === p.slug ? "Deleting..." : "Delete"}
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

          {/* Pagination Controls */}
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

        {/* CMS EDITOR MODAL */}
        {showEditor && page && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
            <div className="bg-white w-[95%] h-[95%] rounded-lg shadow-lg flex flex-col">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-bold">
                  {page.title || "Untitled Page"}
                </h2>
                <button
                  onClick={() => setShowEditor(false)}
                  className="text-gray-500 hover:text-black"
                >
                  ✖
                </button>
              </div>
              <div className="flex-grow">
                <StudioEditor
                  key={currentPage}
                  options={{
                    initialHtml: page.html || "<div>Start editing...</div>",
                    initialCss: page.css || "",
                    style: { height: "100%", width: "100%" },
                    plugins: [
                      layoutSidebarButtons.init({
                        sidebarButton({ id, buttonProps }) {
                          if (id === "panelGlobalStyles") return null;
                          return buttonProps;
                        },
                      }),
                    ],
                  }}
                  onReady={(editor) => {
                    setEditorInstance(editor);

                    // === BASIC BLOCKS ===
                    editor.Blocks.add("text-block", {
                      label: "Text",
                      content:
                        '<p style="padding:10px;">Insert your text here</p>',
                      category: "Basic",
                    });

                    editor.Blocks.add("image-block", {
                      label: "Image",
                      content:
                        '<img src="https://via.placeholder.com/600x300" style="max-width:100%"/>',
                      category: "Basic",
                    });

                    editor.Blocks.add("button-block", {
                      label: "Button",
                      content:
                        '<button style="padding:10px 20px; background:#2563eb; color:white; border:none; border-radius:6px;">Click Me</button>',
                      category: "Basic",
                    });

                    // === LAYOUT BLOCKS ===
                    editor.Blocks.add("2-columns", {
                      label: "2 Columns",
                      content: `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
          <div style="background:#f3f4f6; padding:20px;">Column 1</div>
          <div style="background:#f3f4f6; padding:20px;">Column 2</div>
        </div>
      `,
                      category: "Layout",
                    });

                    editor.Blocks.add("hero-section", {
                      label: "Hero Section",
                      content: `
        <section style="padding:60px; text-align:center; background:#f9fafb;">
          <h1 style="font-size:2.5rem; font-weight:bold;">Welcome to My Website</h1>
          <p style="margin:20px 0; color:#555;">This is a hero section with a call-to-action</p>
          <button style="padding:12px 24px; background:#16a34a; color:white; border:none; border-radius:6px;">Get Started</button>
        </section>
      `,
                      category: "Layout",
                    });

                    // === COMPONENT BLOCK ===
                    editor.Blocks.add("card-block", {
                      label: "Card",
                      content: `
        <div style="border:1px solid #e5e7eb; border-radius:8px; padding:20px; text-align:center; background:white;">
          <img src="https://via.placeholder.com/150" style="border-radius:50%; margin-bottom:15px;" />
          <h3 style="font-size:1.25rem; font-weight:bold;">Card Title</h3>
          <p style="color:#6b7280;">This is a simple card description.</p>
        </div>
      `,
                      category: "Components",
                    });

                    // === FORM BLOCK ===
                    editor.Blocks.add("form-block", {
                      label: "Form",
                      content: `
        <form style="display:flex; flex-direction:column; gap:12px; max-width:400px; margin:auto;">
          <input type="text" placeholder="Your name" style="padding:10px; border:1px solid #ccc; border-radius:4px;"/>
          <input type="email" placeholder="Your email" style="padding:10px; border:1px solid #ccc; border-radius:4px;"/>
          <textarea placeholder="Your message" style="padding:10px; border:1px solid #ccc; border-radius:4px;"></textarea>
          <button type="submit" style="padding:12px; background:#2563eb; color:white; border:none; border-radius:4px;">Send</button>
        </form>
      `,
                      category: "Forms",
                    });

                    // === FOOTER BLOCK ===
                    editor.Blocks.add("footer-block", {
                      label: "Footer",
                      content: `
        <footer style="padding:20px; background:#111827; color:white; text-align:center;">
          <p>&copy; 2025 My Website. All rights reserved.</p>
        </footer>
      `,
                      category: "Layout",
                    });
                  }}
                />
              </div>
              <div className="p-4 border-t flex justify-end gap-2 bg-gray-100">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`px-4 py-2 rounded text-white ${
                    isSaving
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PageManager;
