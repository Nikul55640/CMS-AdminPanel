import { useParams } from "react-router-dom";
import { useContext } from "react";
import CmsContext from "../src/context/CmsContext";


const PublicPage = () => {
  const { pages } = useContext(CmsContext);
  const { slug } = useParams();

  const urlParams = new URLSearchParams(window.location.search);
  const isPreview = urlParams.get("preview") === "1";

  const page = pages?.find((p) =>
    isPreview ? p.slug === slug : p.slug === slug && p.status === "published"
  );

  if (!page)
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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
    
      {/* Page Content */}
      <main className="flex-grow p-4 bg-white rounded shadow min-h-[500px]">
        <div dangerouslySetInnerHTML={{ __html: page.html }} />
        <style dangerouslySetInnerHTML={{ __html: page.css }} />
        <script dangerouslySetInnerHTML={{ __html: page.js }} />
      </main>

      {/* Footer */}
    </div>
  );
};

export default PublicPage;




// import { useParams } from "react-router-dom";
// import { useEffect, useState } from "react";
// import axios from "axios";

// const API_BASE = "http://localhost:5000/api";

// const PublicPage = () => {
//   const { slug } = useParams();
//   const [page, setPage] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // 1️⃣ Fetch page
//   useEffect(() => {
//     let isMounted = true;

//     const fetchPage = async () => {
//       try {
//         const res = await axios.get(`${API_BASE}/pages/${slug}`);
//         if (isMounted) setPage(res.data);
//       } catch {
//         if (isMounted) setPage(null);
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     };

//     fetchPage();

//     return () => {
//       isMounted = false;
//     };
//   }, [slug]);

//   // 2️⃣ Inject JS NON-BLOCKING way
//   useEffect(() => {
//     const old = document.getElementById("dynamic-script");
//     if (old) old.remove();

//     if (page?.js) {
//       const script = document.createElement("script");
//       script.id = "dynamic-script";
//       script.textContent = page.js;

//       // Make JS load AFTER screen renders
//       setTimeout(() => document.body.appendChild(script), 0);
//     }

//     return () => {
//       const s = document.getElementById("dynamic-script");
//       if (s) s.remove();
//     };
//   }, [page?.js]);

//   // 3️⃣ Inject CSS in <head> (MUCH faster)
//   useEffect(() => {
//     const old = document.getElementById("dynamic-style");
//     if (old) old.remove();

//     if (page?.css) {
//       const styleEl = document.createElement("style");
//       styleEl.id = "dynamic-style";
//       styleEl.textContent = page.css;
//       document.head.appendChild(styleEl);
//     }

//     return () => {
//       const s = document.getElementById("dynamic-style");
//       if (s) s.remove();
//     };
//   }, [page?.css]);

//   if (loading) return <p className="p-4">Loading...</p>;
//   if (!page) return <p className="p-4">Page not found</p>;

//   return (
//     <div className="min-h-screen">
//       {/* HTML renders instantly */}
//       <div dangerouslySetInnerHTML={{ __html: page.html }} />

//     </div>
//   );
// };

// export default PublicPage;
