"use client";

import { useEffect } from "react";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  emptyEventNoteHtml,
  isEventNoteBodyEmpty,
  sanitizeEventNoteHtml,
} from "@/lib/events/event-note-html";
import { cn } from "@/lib/utils";

type EventNoteEditorProps = {
  initialHtml?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (html: string) => void;
  onBlur?: () => void;
  className?: string;
};

function ToolbarButton({
  active,
  disabled,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        "size-8 text-muted-foreground hover:text-foreground",
        active && "bg-muted text-foreground",
      )}
    >
      {children}
    </Button>
  );
}

export function EventNoteEditor({
  initialHtml,
  placeholder = "Escreva o que quiser registrar neste evento…",
  disabled = false,
  onChange,
  onBlur,
  className,
}: EventNoteEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        strike: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
          class: "text-foreground underline underline-offset-2",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: initialHtml?.trim() ? initialHtml : emptyEventNoteHtml(),
    editable: !disabled,
    editorProps: {
      attributes: {
        class: cn(
          "min-h-40 max-h-[min(60vh,480px)] overflow-y-auto px-3 py-2.5 text-sm leading-relaxed text-foreground outline-none",
          "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
          "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
          "[&_p]:my-1 [&_a]:underline [&_a]:underline-offset-2",
          "[&_.is-editor-empty:first-child::before]:pointer-events-none [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:h-0 [&_.is-editor-empty:first-child::before]:text-muted-foreground [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
        ),
      },
      handleDOMEvents: {
        blur: () => {
          onBlur?.();
          return false;
        },
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange(sanitizeEventNoteHtml(current.getHTML()));
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  if (!editor) {
    return (
      <div
        className={cn(
          "min-h-48 rounded-xl border border-input/80 bg-surface-elevated",
          className,
        )}
      />
    );
  }

  const activeEditor = editor;

  function setLink() {
    const previous = activeEditor.getAttributes("link").href as
      | string
      | undefined;
    const url = window.prompt("Link (URL)", previous ?? "https://");
    if (url === null) {
      return;
    }
    const trimmed = url.trim();
    if (!trimmed) {
      activeEditor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    activeEditor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: trimmed })
      .run();
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-input/80 bg-surface-elevated focus-within:border-transparent focus-within:bg-muted/60",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border/70 px-1.5 py-1">
        <ToolbarButton
          label="Negrito"
          active={editor.isActive("bold")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Itálico"
          active={editor.isActive("italic")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Lista"
          active={editor.isActive("bulletList")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Lista numerada"
          active={editor.isActive("orderedList")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Link"
          active={editor.isActive("link")}
          disabled={disabled}
          onClick={setLink}
        >
          <Link2 className="size-3.5" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

type EventNoteHtmlProps = {
  html: string;
  className?: string;
  emptyLabel?: string;
};

export function EventNoteHtml({
  html,
  className,
  emptyLabel = "Rascunho vazio",
}: EventNoteHtmlProps) {
  const safe = sanitizeEventNoteHtml(html);

  if (isEventNoteBodyEmpty(safe)) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        {emptyLabel}
      </p>
    );
  }

  return (
    <div
      className={cn(
        "text-sm leading-relaxed text-foreground",
        "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
        "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
        "[&_p]:my-1 [&_a]:underline [&_a]:underline-offset-2",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
