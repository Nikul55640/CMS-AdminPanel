import { useEffect } from "react";
import { SimpleEditor } from "../tiptap-templates/simple/simple-editor";

const RichTextEditor = ({ value, onChange }) => {
  return (
    <div className="bg-white rounded-lg w-full">
      <SimpleEditor value={value} setContent={onChange} />
    </div>
  );
};

export default RichTextEditor;
