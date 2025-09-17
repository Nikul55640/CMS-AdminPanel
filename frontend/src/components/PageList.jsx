import { useContext } from "react";
import PageContext from "../context/PageContext";

const PageList = () => {
  const { pages, setCurrentPage, setShowEditor } = useContext(PageContext);

  const handleEdit = slug => {
    setCurrentPage(slug);
    setShowEditor(true);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Pages</h2>
      <ul>
        {pages.map(page => (
          <li key={page.id} className="flex justify-between mb-2 border-b p-2">
            <span>{page.title}</span>
            <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={()=>handleEdit(page.slug)}>Edit</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PageList;
