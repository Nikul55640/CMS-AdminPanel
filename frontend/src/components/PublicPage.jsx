import { useParams } from 'react-router-dom';

const PublicPage = ({ pages }) => {
  const { slug } = useParams();
  const page = pages.find(p => p.slug === slug);

  if (!page) return <p className="p-4">Page not found</p>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">{page.title}</h1>
      <p className="mb-4">{page.description}</p>
      <div dangerouslySetInnerHTML={{ __html: page.content }}></div>
    </div>
  );
};

export default PublicPage;
