import { useContext, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import StudioEditor from "@grapesjs/studio-sdk/react";
import "@grapesjs/studio-sdk/style";
import { layoutSidebarButtons } from "@grapesjs/studio-sdk-plugins";
import PageContext from "../context/PageContext";
import axios from "axios";

const CMSEditor = () => {
  const { pages, currentPage, setPages, token } = useContext(PageContext);
  const [editorInstance, setEditorInstance] = useState(null);
  const editorRef = useRef(null);
  const navigate = useNavigate();
  const page = pages.find(p => p.slug === currentPage);

  const handleSave = async () => {
  if (!editorInstance || !page) return;
  const html = editorInstance.getHtml();
  const css = editorInstance.getCss();

  try {
    const res = await axios.put(
      `http://localhost:8000/api/pages/${page.slug}`,
      { html, css },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    // Use backend response to update state
    const updatedPage = res.data;
    setPages(pages.map(p => p.slug === page.slug ? updatedPage : p));
    alert("Page saved successfully!");
  } catch (err) {
    console.error(err);
    alert("Error saving page");
  }
  navigate("/admin")
};

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow">
        <StudioEditor
          ref={editorRef}
          options={{
            initialHtml: page?.html || "<div>Start editing...</div>",
            initialCss: page?.css || "",
            onLoad: setEditorInstance,
            style: { height: "100%", width: "100%" },
            plugins: [
              layoutSidebarButtons.init({
                sidebarButton({ id, buttonProps }) {
                  if (id === "panelGlobalStyles") return null;
                  return buttonProps;
                },
              }),
            ],
          }}
        />
      </div>
      <div className="p-4 border-t flex justify-center bg-gray-100">
        <button onClick={handleSave} className="px-4 py-2 bg-green-500 text-white rounded">
          Save
        </button>
      </div>
    </div>
  );
};

export default CMSEditor;
