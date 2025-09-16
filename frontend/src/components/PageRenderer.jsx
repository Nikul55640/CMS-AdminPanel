import { useContext } from 'react';
import { PageContext } from '../context/PageContext';

const PageRenderer = () => {
  const { pages, currentPage } = useContext(PageContext);
  const page = pages.find(p => p.slug === currentPage);

  return (
    <div className="p-4 bg-white rounded shadow min-h-[500px]">
      <h1 className="text-3xl font-bold mb-4">{page?.title}</h1>
      <p className="mb-4">{page?.description}</p>
      <div dangerouslySetInnerHTML={{ __html: page?.content }}></div>
    </div>
  );
};

export default PageRenderer;
