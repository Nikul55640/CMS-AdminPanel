import { useEffect, useState } from "react";
import axios from "axios";

const PageRenderer = ({ currentPageId }) => {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      if (!currentPageId) return;

      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:8000/api/pages/${currentPageId}`
        );
        setPage(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch page content", err);
        setPage(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [currentPageId]);

  if (loading) return <p>Loading page...</p>;
  if (!page) return <p>Page not found.</p>;

  return (
    <div className="p-4 bg-white rounded shadow min-h-[500px]">
      <h1 className="text-3xl font-bold mb-4">{page.title}</h1>
      <p className="mb-4">{page.description}</p>

      {/* Render saved HTML */}
      <div dangerouslySetInnerHTML={{ __html: page.html }}></div>

      {/* Inject saved CSS */}
      {page.css && <style>{page.css}</style>}

      {/* Inject saved JS */}
      {page.js && (
        <script dangerouslySetInnerHTML={{ __html: page.js }}></script>
      )}
    </div>
  );
};

export default PageRenderer;
