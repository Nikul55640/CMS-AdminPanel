"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Selection } from "@tiptap/extensions";

import { Button } from "@/components/tiptap-ui-primitive/button";
import { Spacer } from "@/components/tiptap-ui-primitive/spacer";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar";

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension";
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu";
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button";
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu";
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button";
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/components/tiptap-ui/color-highlight-popover";
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/tiptap-ui/link-popover";
import { MarkButton } from "@/components/tiptap-ui/mark-button";
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button";

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon";
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon";
import { LinkIcon } from "@/components/tiptap-icons/link-icon";

// --- Hooks ---
import { useIsMobile } from "@/hooks/use-mobile";
import { useWindowSize } from "@/hooks/use-window-size";
import { useCursorVisibility } from "@/hooks/use-cursor-visibility";

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils";

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss";

const MainToolbarContent = ({ onHighlighterClick, onLinkClick, isMobile }) => {
  return (
    <>
      {isMobile ? (
        <>
          <Spacer />
          <ToolbarGroup>
            <UndoRedoButton action="undo" title="Undo" />
            <UndoRedoButton action="redo" title="Redo" />
          </ToolbarGroup>

          <ToolbarGroup>
            <HeadingDropdownMenu levels={[1, 2, 3]} portal={isMobile} />
            <ListDropdownMenu
              types={["bulletList", "orderedList"]}
              portal={isMobile}
            />
          </ToolbarGroup>

          <ToolbarGroup>
            <MarkButton type="bold" title="Bold" />
            <MarkButton type="italic" title="Italic" />
            <MarkButton type="strike" title="Strike" />
          </ToolbarGroup>

          <ToolbarGroup>
            <ColorHighlightPopoverButton
              onClick={onHighlighterClick}
              title="Color"
            />
            <LinkButton onClick={onLinkClick} title="Link" />
          </ToolbarGroup>

          <Spacer />
        </>
      ) : (
        <>
          <Spacer />

          {/* Undo/Redo Group */}
          <ToolbarGroup>
            <UndoRedoButton action="undo" title="Undo (Ctrl+Z)" />
            <UndoRedoButton action="redo" title="Redo (Ctrl+Y)" />
          </ToolbarGroup>
          <ToolbarSeparator />

          {/* Headings & Lists Group */}
          <ToolbarGroup>
            <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
            <ListDropdownMenu
              types={["bulletList", "orderedList", "taskList"]}
              portal={isMobile}
            />
            <BlockquoteButton title="Quote (Ctrl+Shift+B)" />
            <CodeBlockButton title="Code Block (Ctrl+Alt+C)" />
          </ToolbarGroup>
          <ToolbarSeparator />

          {/* Text Formatting Group */}
          <ToolbarGroup>
            <MarkButton type="bold" title="Bold (Ctrl+B)" />
            <MarkButton type="italic" title="Italic (Ctrl+I)" />
            <MarkButton
              type="strike"
              title="Strikethrough (Ctrl+Shift+X)"
            />
            <MarkButton type="code" title="Inline Code (Ctrl+`)" />
            <MarkButton type="underline" title="Underline (Ctrl+U)" />
            <ColorHighlightPopover />
            <LinkPopover />
          </ToolbarGroup>

          <ToolbarSeparator />

          {/* Advanced Group */}
          <ToolbarGroup>
            <MarkButton type="superscript" title="Superscript" />
            <MarkButton type="subscript" title="Subscript" />
          </ToolbarGroup>
          <ToolbarSeparator />

          {/* Alignment Group */}
          <ToolbarGroup>
            <TextAlignButton align="left" title="Align Left" />
            <TextAlignButton align="center" title="Align Center" />
            <TextAlignButton align="right" title="Align Right" />
            <TextAlignButton align="justify" title="Justify" />
          </ToolbarGroup>
          <ToolbarSeparator />

          {/* Media Group */}
          <ToolbarGroup>
            <ImageUploadButton text="Add Image" title="Upload Image" />
          </ToolbarGroup>

          <Spacer />
        </>
      )}
    </>
  );
};

const MobileToolbarContent = ({ type, onBack }) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
);

// ⚠️ Note: we now accept `value` instead of `content` from parent
export function SimpleEditor({ value, setContent }) {
  const isMobile = useIsMobile();
  const { height } = useWindowSize();
  const [mobileView, setMobileView] = useState("main");
  const toolbarRef = useRef(null);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
    ],
    content: value ?? null, // initial content from props
  });

  // 🧠 Keep editor in sync when `value` (from parent) changes
  useEffect(() => {
    if (!editor) return;
    // If no value, clear content (for new blog)
    if (!value) {
      editor.commands.clearContent(true);
      return;
    }

    try {
      const current = editor.getJSON();
      const next = value;

      // avoid infinite loop by comparing JSON
      if (JSON.stringify(current) !== JSON.stringify(next)) {
        editor.commands.setContent(next, false);
      }
    } catch (e) {
      console.warn("Failed to sync editor content:", e);
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  // Update mobile toolbar view
  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main");
    }
  }, [isMobile, mobileView]);

  // 🔄 Push editor changes back to parent
  useEffect(() => {
    if (!editor || !setContent) return;

    const handler = ({ editor }) => {
      setContent(editor.getJSON());
    };

    editor.on("update", handler);
    return () => {
      editor.off("update", handler);
    };
  }, [editor, setContent]);

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  });

  return (
    <div
      className={`simple-editor-wrapper ${
        isMobile ? "mobile-view" : "desktop-view"
      }`}
    >
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          className={`simple-editor-toolbar ${
            isMobile ? "mobile" : "desktop"
          }`}
          style={{
            ...(isMobile
              ?{
      position: "fixed",
      bottom: 100,
      left: 0,
      right: 0,
      height: "40px",
      display: "flex",
      alignItems: "center",
      padding: "0 8px",

      // WhatsApp style scroll
      overflowX: "auto",
      overflowY: "hidden",
      whiteSpace: "nowrap",

      backgroundColor: "#fff",
      borderTop: "1px solid #e5e7eb",
      boxShadow: "0 -2px 8px rgba(0,0,0,0.05)",

      // Smooth scroll
      WebkitOverflowScrolling: "touch",
      scrollbarWidth: "none",
    }
              : {
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  padding: "0.75rem",
                  minHeight: "52px",
                }),
          }}
        >
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        <EditorContent
          editor={editor}
          role="presentation"
          className={`simple-editor-content ${
            isMobile ? "mobile" : "desktop"
          }`}
        />
      </EditorContext.Provider>
    </div>
  );
}
