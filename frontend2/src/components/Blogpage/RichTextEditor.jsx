import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";
import { useState } from "react";
import { SimpleEditor } from "../tiptap-templates/simple/simple-editor";

const RichTextEditor = ({   }) => {
  const [content, setContent] = useState("");


  return (
    <div className= "flex bg-white">
      {/* Toolbar */}
      <SimpleEditor setContent={setContent} content={content} />
      
      <EditorContent   />
    </div>
  );
};

export default RichTextEditor;
