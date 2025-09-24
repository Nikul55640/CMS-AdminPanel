import React, { useRef, useEffect, useState } from "react";

const Content = ({ html = "", css = "", js = "" }) => {
  const iframeRef = useRef(null);
  const [height, setHeight] = useState(500); // default height

  useEffect(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow.document;

    // Reset iframe
    doc.open();
    doc.write("<!DOCTYPE html><html><head></head><body></body></html>");
    doc.close();

    // Inject CSS
    const style = doc.createElement("style");
    style.innerHTML = css;
    doc.head.appendChild(style);

    // Inject HTML
    doc.body.innerHTML = html;

    // Inject JS
    const script = doc.createElement("script");
    script.type = "text/javascript";
    script.innerHTML = js;
    doc.body.appendChild(script);

    // Auto-resize iframe height
    const updateHeight = () => {
      const newHeight = doc.body.scrollHeight;
      setHeight(newHeight);
    };

    // Initial height
    updateHeight();

    // Observe DOM changes inside iframe
    const observer = new MutationObserver(updateHeight);
    observer.observe(doc.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [html, css, js]); // Re-run effect whenever editor content changes

  return (
    <div className="cms-content w-full border rounded overflow-hidden">
      <iframe
        ref={iframeRef}
        title="CMS Content Live Preview"
        className="w-full"
        style={{ border: "none", height: `${height}px` }}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

export default Content;
