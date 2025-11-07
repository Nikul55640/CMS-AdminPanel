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
import { SimpleEditor } from "../tiptap-templates/simple/simple-editor";

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const editor = useEditor({
    extensions: [StarterKit, Link, Image],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[400px] p-3 outline-none prose prose-sm max-w-none dark:prose-invert",
      },
    },
  });

  if (!editor) return null;

  const setLink = () => {
    const url = prompt("Enter URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = prompt("Enter Image URL:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const toolbarButtons = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run() },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run() },
    {
      icon: List,
      action: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      icon: ListOrdered,
      action: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      icon: Quote,
      action: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      icon: Code,
      action: () => editor.chain().focus().toggleCodeBlock().run(),
    },
    { icon: LinkIcon, action: setLink },
    { icon: ImageIcon, action: addImage },
  ];

  return (
    <div className= "flex bg-white">
      {/* Toolbar */}
      <SimpleEditor editor={editor} className="" />
      {/* <div className="flex items-center gap-1 p-2 border-b bg-muted/30 flex-wrap">
        {toolbarButtons.map((btn, i) => (
          <div key={i} className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className={`h-8 w-8 ${
                editor.isActive(btn.label?.toLowerCase()) ? "bg-accent" : ""
              }`}
              onClick={btn.action}
            >
              <btn.icon className="w-4 h-4" />
            </Button>
            {(i === 1 || i === 3 || i === 5) && (
              <Separator orientation="vertical" className="h-6 mx-1" />
            )}
          </div>
        ))}
      </div> */}

      Editor Area
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
