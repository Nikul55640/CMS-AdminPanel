import { useState } from "react";

const AddPageForm = ({ pages, setPages, setCurrentPage, setShowEditor }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');

  const handleAddPage = () => {
    if (!slug.trim()) {
      alert('URL Slug is required');
      return;
    }

    if (pages.find(p => p.slug === slug)) {
      alert('Slug already exists');
      return;
    }

    const newPage = { slug, title, description, content: null };
    const updatedPages = [...pages, newPage];
    setPages(updatedPages);
    localStorage.setItem('cmsPages', JSON.stringify(updatedPages));

    setCurrentPage(slug);
    setShowEditor(true);
    alert('Page added! Now edit the content.');
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Add New Page</h2>
      <input className="w-full mb-2 p-2 border rounded" placeholder="Page Title" value={title} onChange={e => setTitle(e.target.value)} />
      <input className="w-full mb-2 p-2 border rounded" placeholder="Page Description" value={description} onChange={e => setDescription(e.target.value)} />
      <input className="w-full mb-2 p-2 border rounded" placeholder="Page URL Slug (e.g., about-us)" value={slug} onChange={e => setSlug(e.target.value)} />
      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={handleAddPage}>
        Add Page
      </button>
    </div>
  );
};

export default AddPageForm;
