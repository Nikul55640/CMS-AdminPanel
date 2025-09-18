import { useParams } from "react-router-dom";
import { useContext } from "react";
import PageContext from "../context/PageContext";

const PublicPage = () => {
  const { pages } = useContext(PageContext); // Get pages from context
  const { slug } = useParams();

  // Safely find the page
  const page = pages?.find(p => p.slug === slug);

  if (!page) return <p className="p-4">Page not found</p>;

  return (
    <div className="p-4 bg-white rounded shadow min-h-[500px]">
    
      <div dangerouslySetInnerHTML={{ __html: page.html }}></div>
        {page.css && <style>{page.css}</style>}

    </div>
  );
};

export default PublicPage;
