import { useState } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link,
  Image,
  Quote,
  Code,
} from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Separator } from "../ui/separator";

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const [isFocused, setIsFocused] = useState(false);

  const toolbarButtons = [
    { icon: Bold, label: "Bold", action: () => {} },
    { icon: Italic, label: "Italic", action: () => {} },
    { icon: List, label: "Bullet List", action: () => {} },
    { icon: ListOrdered, label: "Numbered List", action: () => {} },
    { icon: Link, label: "Insert Link", action: () => {} },
    { icon: Image, label: "Insert Image", action: () => {} },
    { icon: Quote, label: "Quote", action: () => {} },
    { icon: Code, label: "Code", action: () => {} },
  ];

  return (
    <div className={`border rounded-lg ${isFocused ? "ring-2 ring-ring" : ""}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
        {toolbarButtons.map((button, index) => (
          <div key={index} className="flex items-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={button.action}
            >
              <button.icon className="w-4 h-4" />
            </Button>
            {(index === 1 || index === 3 || index === 5) && (
              <Separator orientation="vertical" className="h-6 mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* Editor Area */}
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="min-h-[400px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
      />
    </div>
  );
};

export default RichTextEditor;
