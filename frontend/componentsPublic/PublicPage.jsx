import { useParams } from "react-router-dom";
import { useContext } from "react";
import CmsContext from "../src/context/CmsContext";

const PublicPage = () => {
  const { pages } = useContext(CmsContext); // Get pages from context
  const { slug } = useParams();

  // Safely find the page
  const page = pages?.find(p => p.slug === slug);

  if (!page) return <p className="p-4">Page not found</p>;

  return (
    <div className="p-4 bg-white rounded shadow min-h-[500px]">
    
      <div dangerouslySetInnerHTML={{ __html: page.html }}></div>
        {page.css && <style>{page.css}</style>}
        {page.js && <script dangerouslySetInnerHTML={{ __html: page.js }} />}

    </div>
  );
};

export default PublicPage;
