import { Content, EditorContent, useEditor } from "@tiptap/react";
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Youtube from "@tiptap/extension-youtube";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import BubbleMenuExtension from "@tiptap/extension-bubble-menu";
import FloatingMenuExtension from "@tiptap/extension-floating-menu";
import { useEffect, useRef, useState, useMemo } from "react";
import { apiFetch } from "../../lib/api";
import Spinner from "../ui/Spinner";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Youtube as YoutubeIcon,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Undo,
  Redo,
  Highlighter,
  CheckSquare,
  Strikethrough,
  Eraser,
} from "lucide-react";

type ContentValue = string | number | boolean | null | Record<string, unknown> | ContentValue[];

interface BlogEditorProps {
  value: ContentValue;
  onChange?: (v: ContentValue) => void;
  readOnly?: boolean;
}

/**
 * BlogEditor - React component for UI presentation and interaction.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Component children
 * @returns {React.ReactElement} Component element
 */
export function BlogEditor({ value, onChange, readOnly = false }: BlogEditorProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Memoize extensions to prevent duplication warnings on re-renders
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-[var(--accent)] underline font-bold hover:opacity-80 transition-opacity cursor-pointer",
        },
      }),
      Placeholder.configure({
        placeholder: "Start telling your adventure...",
        emptyEditorClass: "is-editor-empty",
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: "rounded-2xl shadow-xl my-8 mx-auto block max-w-full",
        },
      }),
      Youtube.configure({
        width: 840,
        height: 480,
        HTMLAttributes: {
          class: "rounded-2xl shadow-2xl my-10 aspect-video mx-auto block max-w-full",
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({ multicolor: true }),
      BubbleMenuExtension,
      FloatingMenuExtension,
    ],
    [],
  );

  const editor = useEditor({
    extensions,
    content: value as Content,
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
    // Prevent update loop: Don't set content if editor is focused (user is typing)
    if (
      editor &&
      !editor.isDestroyed &&
      value &&
      !editor.isFocused &&
      JSON.stringify(value) !== JSON.stringify(editor.getJSON())
    ) {
      editor.commands.setContent(value as Content);
    }
  }, [value, editor]);

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("Enter URL");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const addYoutube = () => {
    const url = window.prompt("Enter YouTube URL");
    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await apiFetch("/media/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const imageUrl = data.image.originalUrl.startsWith("/uploads")
        ? `${baseUrl}${data.image.originalUrl}`
        : data.image.originalUrl;

      if (editor && !editor.isDestroyed) {
        editor.chain().focus().setImage({ src: imageUrl }).run();
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Upload failed";
      alert(errMsg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`group w-full ${readOnly ? "" : "space-y-4"}`}>
      {!readOnly && (
        <>
          {/* Main Toolbar */}
          <div className="sticky top-4 z-30 flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-2 shadow-[var(--accent)]/5 shadow-2xl shadow-white/5 backdrop-blur-md">
            <div className="flex gap-1 rounded-xl bg-[var(--border)]/10 p-1">
              <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                icon={<Undo size={16} />}
                title="Undo"
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                icon={<Redo size={16} />}
                title="Redo"
              />
            </div>

            <div className="mx-1 h-6 w-px bg-[var(--border)]" />

            <div className="flex gap-1 rounded-xl bg-[var(--border)]/10 p-1">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                active={editor.isActive("bold")}
                icon={<Bold size={16} />}
                title="Bold"
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                active={editor.isActive("italic")}
                icon={<Italic size={16} />}
                title="Italic"
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                active={editor.isActive("underline")}
                icon={<UnderlineIcon size={16} />}
                title="Underline"
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                active={editor.isActive("strike")}
                icon={<Strikethrough size={16} />}
                title="Strikethrough"
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                active={editor.isActive("highlight")}
                icon={<Highlighter size={16} />}
                title="Highlight"
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                icon={<Eraser size={16} />}
                title="Clear Formatting"
              />
            </div>

            <div className="mx-1 h-6 w-px bg-[var(--border)]" />

            <div className="flex gap-1 rounded-xl bg-[var(--border)]/10 p-1">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                active={editor.isActive("heading", { level: 1 })}
                icon={<Heading1 size={16} />}
                title="Heading 1"
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                active={editor.isActive("heading", { level: 2 })}
                icon={<Heading2 size={16} />}
                title="Heading 2"
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                active={editor.isActive("heading", { level: 3 })}
                icon={<Heading3 size={16} />}
                title="Heading 3"
              />
            </div>

            <div className="mx-1 h-6 w-px bg-[var(--border)]" />

            <div className="flex gap-1 rounded-xl bg-[var(--border)]/10 p-1">
              <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign("left").run()}
                active={editor.isActive({ textAlign: "left" })}
                icon={<AlignLeft size={16} />}
                title="Align Left"
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign("center").run()}
                active={editor.isActive({ textAlign: "center" })}
                icon={<AlignCenter size={16} />}
                title="Align Center"
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign("right").run()}
                active={editor.isActive({ textAlign: "right" })}
                icon={<AlignRight size={16} />}
                title="Align Right"
              />
            </div>

            <div className="mx-1 h-6 w-px bg-[var(--border)]" />

            <div className="flex gap-1 rounded-xl bg-[var(--border)]/10 p-1">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                active={editor.isActive("bulletList")}
                icon={<List size={16} />}
                title="Bullet List"
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                active={editor.isActive("orderedList")}
                icon={<ListOrdered size={16} />}
                title="Ordered List"
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                active={editor.isActive("taskList")}
                icon={<CheckSquare size={16} />}
                title="Task List"
              />
            </div>

            <div className="mx-1 h-6 w-px bg-[var(--border)]" />

            <div className="flex gap-1 rounded-xl bg-[var(--border)]/10 p-1">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                active={editor.isActive("blockquote")}
                icon={<Quote size={16} />}
                title="Quote"
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                active={editor.isActive("codeBlock")}
                icon={<Code size={16} />}
                title="Code Block"
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                icon={<Minus size={16} />}
                title="Horizontal Rule"
              />
            </div>

            <div className="mx-1 h-6 w-px bg-[var(--border)]" />

            <div className="flex gap-1 rounded-xl bg-[var(--border)]/10 p-1">
              <ToolbarButton
                onClick={addLink}
                active={editor.isActive("link")}
                icon={<LinkIcon size={16} />}
                title="Link"
              />
              <ToolbarButton
                onClick={() => fileInputRef.current?.click()}
                loading={uploading}
                icon={<ImageIcon size={16} />}
                title="Image"
              />
              <ToolbarButton
                onClick={addYoutube}
                icon={<YoutubeIcon size={16} />}
                title="YouTube"
              />
            </div>
          </div>

          {editor && !editor.isDestroyed && (
            <>
              <BubbleMenu editor={editor} className="bubble-menu">
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  active={editor.isActive("bold")}
                  icon={<Bold size={14} />}
                  title="Bold"
                />
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  active={editor.isActive("italic")}
                  icon={<Italic size={14} />}
                  title="Italic"
                />
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  active={editor.isActive("underline")}
                  icon={<UnderlineIcon size={14} />}
                  title="Underline"
                />
                <ToolbarButton
                  onClick={addLink}
                  active={editor.isActive("link")}
                  icon={<LinkIcon size={14} />}
                  title="Link"
                />
              </BubbleMenu>

              <FloatingMenu editor={editor} className="floating-menu">
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  icon={<Heading1 size={14} />}
                  title="H1"
                />
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  icon={<Heading2 size={14} />}
                  title="H2"
                />
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  icon={<List size={14} />}
                  title="List"
                />
                <ToolbarButton
                  onClick={() => fileInputRef.current?.click()}
                  icon={<ImageIcon size={14} />}
                  title="Image"
                />
              </FloatingMenu>
            </>
          )}
        </>
      )}

      <div
        className={`relative overflow-hidden rounded-3xl transition-all duration-500 ${readOnly ? "" : "border border-[var(--border)] bg-[var(--card)] shadow-[var(--accent)]/5 shadow-2xl focus-within:border-[var(--accent)]/30"} `}
      >
        <EditorContent editor={editor} className="tiptap" />

        {!readOnly && (
          <div className="pointer-events-none absolute top-8 right-8 opacity-20 transition-opacity group-hover:opacity-100">
            <div className="text-[10px] font-black tracking-[0.2em] text-[var(--accent)] uppercase">
              Param Editorial Mode
            </div>
          </div>
        )}
      </div>

      <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
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
  className = "",
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
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      disabled={loading}
      title={title}
      className={`flex h-9 min-w-[36px] items-center justify-center rounded-lg px-2 transition-all ${
        active
          ? "scale-105 bg-[var(--accent)] text-white shadow-[var(--accent)]/20 shadow-lg"
          : "text-muted-foreground hover:text-foreground hover:bg-[var(--border)]/30"
      } ${loading ? "cursor-not-allowed opacity-50" : ""} ${className} `}
    >
      {loading ? (
        <Spinner size={14} />
      ) : (
        icon || <span className="text-xs leading-none font-bold">{label}</span>
      )}
    </button>
  );
}

export default BlogEditor;
