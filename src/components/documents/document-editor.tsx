"use client";

import { useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, List, ListOrdered, Heading2, Heading3,
  Save, Loader2, ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  title: string;
  content: string;
  document_type: string;
}

interface Props {
  document: Document;
  onSave: (content: string) => Promise<void>;
  onBack: () => void;
}

function ToolbarButton({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-1.5 rounded transition-colors",
        active
          ? "bg-[#18181B] text-white"
          : "hover:bg-[#F3F4F6] text-[#52525B]"
      )}
    >
      {children}
    </button>
  );
}

export function DocumentEditor({ document, onSave, onBack }: Props) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Your document content will appear here...",
      }),
    ],
    content: document.content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[500px] p-6 text-[#1A1F2E]",
      },
    },
  });

  const handleSave = useCallback(async () => {
    if (!editor) return;
    setSaving(true);
    try {
      await onSave(editor.getHTML());
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }, [editor, onSave]);

  if (!editor) return null;

  return (
    <div className="space-y-4" style={{ fontFamily: "var(--font-geist-sans)" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] font-medium text-[#71717A] hover:text-[#18181B] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.6} />
          Back to documents
        </button>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-[13px] text-[#059669] font-medium">Saved</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-full bg-[#18181B] px-4 py-1.5 text-[13px] font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" strokeWidth={1.6} />}
            Save
          </button>
        </div>
      </div>

      <h2 className="text-[18px] font-semibold text-[#18181B]">{document.title}</h2>

      {/* Editor */}
      <div className="rounded-2xl border border-[rgba(226,232,240,0.8)] bg-white overflow-hidden"
        style={{ boxShadow: "0 4px 24px -4px rgba(0,0,0,0.06)" }}>
        {/* Toolbar */}
        <div className="flex items-center gap-1 border-b border-[rgba(226,232,240,0.8)] bg-[#F9FAFB] px-4 py-2.5">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <div className="w-px h-4 bg-[rgba(226,232,240,0.8)] mx-1" />
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}>
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>
          <div className="w-px h-4 bg-[rgba(226,232,240,0.8)] mx-1" />
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
