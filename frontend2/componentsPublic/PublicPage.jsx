// import { useParams } from "react-router-dom";
// import { useContext } from "react";
// import CmsContext from "../src/context/CmsContext";

// const PublicPage = () => {
//   const { pages } = useContext(CmsContext);
//   const { slug } = useParams();

//   const page = pages?.find(p => p.slug === slug);

//   if (!page) return <p className="p-4">Page not found</p>;



//   return (
//       <div className="p-4 bg-white rounded shadow min-h-[500px]">
     

//       {/* Render saved HTML */}
//       <div dangerouslySetInnerHTML={{ __html: page.html }}></div>

//       {/* Inject saved CSS */}
//       <style dangerouslySetInnerHTML={{ __html: page.css }}></style>

//       {/* Inject saved JS */}

//       <script dangerouslySetInnerHTML={{ __html: page.js }}></script>
//     </div>
//   );
  
// };

// export default PublicPage;





import { useParams } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import CmsContext from "../src/context/CmsContext";

const PublicPage = () => {
  const { pages } = useContext(CmsContext);
  const { slug } = useParams();
  const containerRef = useRef(null);

  // State to capture logs (for debugging)
  const [consoleOutput, setConsoleOutput] = useState([]);

  const page = pages?.find((p) => p.slug === slug);

  useEffect(() => {
    if (!page) return;

    const container = containerRef.current;
    if (!container) return;

    // Clear previously injected scripts
    const existingScripts = container.querySelectorAll("script.injected");
    existingScripts.forEach((s) => s.remove());

    // Helper to inject script with debug log
    const injectScript = (jsCode, label = "Page JS") => {
      const script = document.createElement("script");
      script.className = "injected";
      script.async = false;

      // Wrap code in try-catch and add log
      script.textContent = `
        try {
          console.log("🟢 [${label}] Script is running");
          ${jsCode}
        } catch(e) {
          console.error("❌ [${label}] Error:", e);
        }
      `;
      container.appendChild(script);
    };

    // Inject JS from page.js
    if (page.js) injectScript(page.js, "page.js");

    // Inject scripts inside HTML
    const htmlScripts = container.querySelectorAll("script");
    htmlScripts.forEach((oldScript, index) => {
      injectScript(oldScript.innerHTML, `HTML script ${index + 1}`);
      oldScript.remove();
    });

    // --- Override console safely ---
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      const msg = args.join(" ");
      // Capture only page JS logs
      if (msg.includes("[page.js]") || msg.includes("[HTML script")) {
        queueMicrotask(() => setConsoleOutput((prev) => [...prev, msg]));
      }
      originalLog(...args);
    };

    console.error = (...args) => {
      const msg = args.join(" ");
      if (msg.includes("[page.js]") || msg.includes("[HTML script")) {
        queueMicrotask(() => setConsoleOutput((prev) => [...prev, "ERROR: " + msg]));
      }
      originalError(...args);
    };

    // Cleanup on unmount
    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, [page?.html, page?.js]);

  if (!page) return <p className="p-4">Page not found</p>;

  return (
    <div>
      {/* Page container */}
      <div
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: page.html }}
      ></div>

      {/* Inject saved CSS */}
      <style dangerouslySetInnerHTML={{ __html: page.css }}></style>

      {/* Debug logs stored in state but not rendered */}
    </div>
  );
};

export default PublicPage;
