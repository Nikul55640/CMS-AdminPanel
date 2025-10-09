import { useRef, useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StudioEditor from "@grapesjs/studio-sdk/react";
import "@grapesjs/studio-sdk/style";
import CmsContext from "../context/CmsContext";
import toast from "react-hot-toast";
import axios from "axios";

const EditorComponent = () => {
  const { id } = useParams();

  const { token, updateComponent } = useContext(CmsContext);
  const [componentData, setComponentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const editorRef = useRef(null);
  const navigate = useNavigate();

  // Fetch component data by slug
  useEffect(() => {
    const fetchComponent = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/components/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setComponentData(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load component");
        navigate("/admin/components");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchComponent();
  }, [id, token]);

  const handleSave = async () => {
    if (!editorRef.current) return;

    const html = editorRef.current.getHtml();
    const css = editorRef.current.getCss();

    try {
      const res = await axios.put(
        `http://localhost:5000/api/components/${componentData._id}`,
        { ...componentData, html, css },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateComponent(res.data); // Update in context
      toast.success("Component updated!");
      navigate("/admin/components");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save component");
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (!componentData) return null;

  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-between items-center p-4 border-b bg-white shadow">
        <h1 className="text-xl font-bold">
          Edit Component: {componentData.name}
        </h1>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={handleSave}
        >
          Save Changes
        </button>
      </div>

      <div className="flex-grow">
        <StudioEditor
          key={componentData._id}
          options={{
            storageManager: { autoload: false, autosave: false },
            initialHtml: componentData.html || "<div>Start editing...</div>",
            initialCss: componentData.css || "",
            style: { height: "100%", width: "100%" },
          }}
          onReady={(editor) => {
            editorRef.current = editor;
          }}
        />
      </div>
    </div>
  );
};

export default EditorComponent;
