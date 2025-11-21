import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import PublicBlogList from "./PublicBlogList"; // ⭐ Add this

const PublicPage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  const urlParams = new URLSearchParams(window.location.search);
  const isPreview = urlParams.get("preview") === "1";

  /* -------------------------------------------
    🟦 1. SPECIAL CASE → "blog" PAGE
  ------------------------------------------- */
  if (slug === "blog") {
    return <PublicBlogList />; // ⭐ Show blog list instead of CMS HTML
  }

  /* -------------------------------------------
    🟦 2. Fetch CMS Page
  ------------------------------------------- */
  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/pages/public/${slug}?preview=${isPreview}`
        );
        setPage(res.data);
      } catch (err) {
        setPage(null);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug, isPreview]);

  /* -------------------------------------------
    🟦 3. Inject Javascript
  ------------------------------------------- */
  useEffect(() => {
    if (!page?.js) return;

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.innerHTML = page.js;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [page]);

  /* -------------------------------------------
    🟦 4. Loading
  ------------------------------------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl">
        Loading...
      </div>
    );
  }

  /* -------------------------------------------
    🟦 5. Not Found
  ------------------------------------------- */
  if (!page) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <img
          src="https://cdn-icons-png.flaticon.com/512/7486/7486802.png"
          alt="Not Found"
          className="w-40"
        />
        <h1 className="text-3xl font-bold mt-4">Oops! Page not found</h1>
        <p className="text-gray-600">
          This page is not published or doesn’t exist.
        </p>
        <a
          href="/"
          className="mt-5 px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          Back to Home
        </a>
      </div>
    );
  }

  /* -------------------------------------------
    🟦 6. Render normal CMS page
  ------------------------------------------- */
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow p-4 bg-white rounded shadow min-h-[500px]">
        <div dangerouslySetInnerHTML={{ __html: page.html }} />
        <style dangerouslySetInnerHTML={{ __html: page.css }} />
      </main>
    </div>
  );
};

export default PublicPage;
