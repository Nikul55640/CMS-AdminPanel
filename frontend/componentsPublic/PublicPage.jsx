import { useParams } from "react-router-dom";
import { useContext } from "react";
import CmsContext from "../src/context/CmsContext";

const PublicPage = () => {
  const { pages } = useContext(CmsContext);
  const { slug } = useParams();

  const page = pages?.find(p => p.slug === slug);

  if (!page) return <p className="p-4">Page not found</p>;

  const iframeContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        ${page.css ? `<style>${page.css}</style>` : ""}

        <!-- ✅ Optional: Add external libraries your editor uses -->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@9/swiper-bundle.min.css" />
        <script src="https://cdn.jsdelivr.net/npm/swiper@9/swiper-bundle.min.js"></script>
      </head>
      <body>
        ${page.html || ""}
        ${page.js ? `<script>${page.js}</script>` : ""}
      </body>
    </html>
  `;

  return (
    <div className="p-4 bg-white rounded shadow min-h-[500px]">
      <iframe
        srcDoc={iframeContent}
        title={page.title || "Public Page"}
        style={{
          width: "100%",
          height: "100vh",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      />
    </div>
  );
};

export default PublicPage;
