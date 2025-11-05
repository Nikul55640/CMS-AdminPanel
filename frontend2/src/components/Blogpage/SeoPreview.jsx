const SEOPreview = ({ title, description, url }) => {
  const displayTitle = title || "Untitled post";
  const displayDescription = description || "No description provided";
  const displayUrl = url || "your-store.myshopify.com/blogs/news/untitled";

  return (
    <div className="p-4 border rounded-lg bg-muted/30">
      <p className="text-xs text-muted-foreground mb-3">
        Google search result preview
      </p>
      <div className="space-y-1">
        <div className="text-blue-600 hover:underline cursor-pointer">
          {displayTitle}
        </div>
        <div className="text-xs text-green-700">{displayUrl}</div>
        <div className="text-sm text-muted-foreground line-clamp-2">
          {displayDescription}
        </div>
      </div>
    </div>
  );
};

export default SEOPreview;
