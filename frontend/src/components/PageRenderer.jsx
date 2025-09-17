import { useEffect, useState } from "react";
import axios from "axios";

const PageRenderer = ({ currentPageSlug }) => {
  const [page, setPage] = useState(null);

  useEffect(() => {
    const fetchPage = async () => {
      if (!currentPageSlug) return;

      try {
        const res = await axios.get(`http://localhost:8000/api/pages/${currentPageSlug}`);
        setPage(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch page content", err);
      }
    };

    fetchPage();
  }, [currentPageSlug]);

  if (!page) return <p>Loading page...</p>;

  return (
    <div className="p-4 bg-white rounded shadow min-h-[500px]">
      <h1 className="text-3xl font-bold mb-4">{page.title}</h1>
      <p className="mb-4">{page.description}</p>
      <div dangerouslySetInnerHTML={{ __html: page.content }}></div>
    </div>
  );
};

export default PageRenderer;
