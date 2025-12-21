"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import { useEffect } from "react";

interface BlogEditorProps {
  value: any;
  onChange?: (v: any) => void;
  readOnly?: boolean;
}

export function BlogEditor({
  value,
  onChange,
  readOnly = false,
}: BlogEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      ImageExtension,
    ],
    content: value,
    editable: !readOnly,
    onUpdate({ editor }) {
      onChange?.(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: [
          "prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[200px]",
          readOnly ? "" : "cursor-text",
        ].join(" "),
      },
    },
    immediatelyRender: false,
  });

  // Sync value if changed from outside (e.g. after fetch)
  useEffect(() => {
    if (editor && value && JSON.stringify(value) !== JSON.stringify(editor.getJSON())) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className={`w-full ${readOnly ? "" : "space-y-2"}`}>
      {!readOnly && (
        <div className="flex flex-wrap gap-1 p-1 bg-muted/30 border rounded-t-lg items-center backdrop-blur-sm sticky top-0 z-10">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            label="B"
            title="Bold"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            label="I"
            title="Italic"
            className="italic"
          />
          <div className="w-px h-6 bg-border mx-1" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive("heading", { level: 1 })}
            label="H1"
            title="Heading 1"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
            label="H2"
            title="Heading 2"
          />
          <div className="w-px h-6 bg-border mx-1" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            label="• List"
            title="Bullet List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            label="1. List"
            title="Ordered List"
          />
          <div className="w-px h-6 bg-border mx-1" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive("codeBlock")}
            label="<>"
            title="Code Block"
          />
        </div>
      )}
      <div className={readOnly ? "" : "border border-t-0 rounded-b-lg bg-surface p-4 shadow-inner ring-offset-background focus-within:ring-2 focus-within:ring-accent/20 transition-all"}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolbarButton({ 
  onClick, 
  active, 
  label, 
  title, 
  className = "" 
}: { 
  onClick: () => void; 
  active?: boolean; 
  label: string; 
  title: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`
        px-3 py-1.5 text-xs font-semibold rounded transition-colors
        ${active 
          ? "bg-accent text-white shadow-sm" 
          : "hover:bg-accent/10 text-muted-foreground hover:text-accent"
        }
        ${className}
      `}
    >
      {label}
    </button>
  );
}

export default BlogEditor;
