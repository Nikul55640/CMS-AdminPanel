import { useNavigate } from 'react-router-dom';

const PageList = ({ pages, setCurrentPage, setShowEditor }) => {
  const navigate = useNavigate();

  const handleEdit = (slug) => {
    setCurrentPage(slug);
    setShowEditor(true);
    navigate('/admin/editor');
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-bold mb-2">Pages</h3>
      <ul>
        {pages.map((page) => (
          <li key={page.slug} className="flex justify-between items-center border-b py-2">
            <span>{page.title}</span>
            <button
              onClick={() => handleEdit(page.slug)}
              className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PageList;
