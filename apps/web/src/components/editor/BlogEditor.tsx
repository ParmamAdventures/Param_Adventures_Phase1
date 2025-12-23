"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Youtube from "@tiptap/extension-youtube";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../../lib/api";
import Spinner from "../ui/Spinner";

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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extensions = [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
    }),
    ImageExtension.configure({
      HTMLAttributes: {
        class: "rounded-2xl shadow-xl my-8 mx-auto block max-w-full",
      },
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: "text-[var(--accent)] underline font-bold hover:opacity-80 transition-opacity cursor-pointer",
      },
    }),
    Underline,
    Placeholder.configure({
      placeholder: "Start telling your adventure...",
      emptyEditorClass: "is-editor-empty",
    }),
    Youtube.configure({
      width: 840,
      height: 480,
      HTMLAttributes: {
        class: "rounded-2xl shadow-2xl my-10 aspect-video mx-auto block max-w-full",
      },
    }),
  ];

  const editor = useEditor({
    extensions,
    content: value,
    editable: !readOnly,
    onUpdate({ editor }) {
      onChange?.(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: [
          "prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-8 text-black dark:text-white",
          readOnly ? "" : "cursor-text",
        ].join(" "),
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value && JSON.stringify(value) !== JSON.stringify(editor.getJSON())) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const addLink = () => {
    const url = window.prompt("Enter URL");
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  };

  const addYoutube = () => {
    const url = window.prompt("Enter YouTube URL");
    if (url) {
      editor?.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await apiFetch("/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const imageUrl = data.image.originalUrl.startsWith('/uploads') 
        ? `${baseUrl}${data.image.originalUrl}` 
        : data.image.originalUrl;
        
      editor.chain().focus().setImage({ src: imageUrl }).run();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!editor) return null;

  return (
    <div className={`w-full group ${readOnly ? "" : "space-y-4"}`}>
      {!readOnly && (
        <div className="flex flex-wrap gap-2 p-2 bg-[var(--card)]/80 backdrop-blur-xl border border-[var(--border)] rounded-2xl items-center sticky top-4 z-30 shadow-2xl shadow-[var(--accent)]/5">
          <div className="flex bg-[var(--border)]/30 rounded-xl p-1 gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive("bold")}
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>}
              title="Bold"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive("italic")}
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/></svg>}
              title="Italic"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={editor.isActive("underline")}
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" x2="20" y1="20" y2="20"/></svg>}
              title="Underline"
            />
          </div>

          <div className="h-6 w-px bg-[var(--border)] mx-1" />

          <div className="flex bg-[var(--border)]/30 rounded-xl p-1 gap-1">
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
          </div>

          <div className="h-6 w-px bg-[var(--border)] mx-1" />

          <div className="flex bg-[var(--border)]/30 rounded-xl p-1 gap-1">
            <ToolbarButton
              onClick={addLink}
              active={editor.isActive("link")}
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>}
              title="Link"
            />
            <ToolbarButton
              onClick={() => fileInputRef.current?.click()}
              loading={uploading}
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>}
              title="Upload Image"
            />
            <ToolbarButton
              onClick={addYoutube}
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 2-2 10 10 0 0 1 15 0 2 2 0 0 1 2 2 24.12 24.12 0 0 1 0 10 2 2 0 0 1-2 2 10 10 0 0 1-15 0 2 2 0 0 1-2-2Z"/><path d="m10 15 5-3-5-3z"/></svg>}
              title="Embed Video"
            />
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            hidden 
            accept="image/*" 
            onChange={handleImageUpload} 
          />
        </div>
      )}

      <div className={`
        relative rounded-3xl overflow-hidden transition-all duration-500
        ${readOnly ? "" : "border border-[var(--border)] bg-[var(--card)] shadow-2xl shadow-[var(--accent)]/5 focus-within:border-[var(--accent)]/30"}
      `}>
        <EditorContent editor={editor} className="tiptap" />
        
        {!readOnly && (
          <div className="absolute top-8 right-8 pointer-events-none opacity-20 group-hover:opacity-100 transition-opacity">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)]">
              Param Editorial Mode
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ToolbarButton({ 
  onClick, 
  active, 
  icon,
  label, 
  title, 
  loading,
  className = "" 
}: { 
  onClick: () => void; 
  active?: boolean; 
  icon?: React.ReactNode;
  label?: string; 
  title: string;
  loading?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      title={title}
      className={`
        h-9 flex items-center justify-center rounded-lg transition-all min-w-[36px] px-2
        ${active 
          ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20 scale-105" 
          : "text-muted-foreground hover:bg-[var(--border)]/30 hover:text-foreground"
        }
        ${loading ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {loading ? <Spinner size={14} /> : icon || <span className="text-xs font-bold leading-none">{label}</span>}
    </button>
  );
}

export default BlogEditor;
