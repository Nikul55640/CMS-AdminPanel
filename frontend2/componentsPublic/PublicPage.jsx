import { useParams } from "react-router-dom";
import { useContext } from "react";
import CmsContext from "../src/context/CmsContext";

const PublicPage = () => {
  const { pages } = useContext(CmsContext);
  const { slug } = useParams();

  const page = pages?.find(p => p.slug === slug);

  if (!page) return <p className="p-4">Page not found</p>;



  return (
      <div className="p-4 bg-white rounded shadow min-h-[500px]">
     

      {/* Render saved HTML */}
      <div dangerouslySetInnerHTML={{ __html: page.html }}></div>

      {/* Inject saved CSS */}
      <style dangerouslySetInnerHTML={{ __html: page.css }}></style>

      {/* Inject saved JS */}

      <script dangerouslySetInnerHTML={{ __html: page.js }}></script>
    </div>
  );
  
};

export default PublicPage;
