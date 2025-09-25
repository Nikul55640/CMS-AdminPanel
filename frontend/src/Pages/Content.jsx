import React, { useEffect, useState } from "react";

const Content = ({ html = "", css = "", js = "" }) => {
  const [height, setHeight] = useState(500);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "resize") {
        setHeight(event.data.height);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const srcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>${css}</style>
      </head>
      <body>
        ${html}
        <script>
          ${js}
          function sendHeight() {
            window.parent.postMessage({ type: 'resize', height: document.body.scrollHeight }, '*');
          }
          window.addEventListener('load', sendHeight);
          const observer = new MutationObserver(sendHeight);
          observer.observe(document.body, { childList: true, subtree: true, characterData: true });
        </script>
      </body>
    </html>
  `;

  return (
    <div className="cms-content w-full border rounded overflow-hidden">
      <iframe
        title="CMS Content Live Preview"
        srcDoc={srcDoc}
        className="w-full"
        style={{ border: "none", height: `${height}px` }}
        sandbox="allow-scripts"
      />
    </div>
  );
};

export default Content;
