"use client";

import { useEffect, useState } from "react";
import { FileText, X } from "lucide-react";

export type ChatAttachment = {
  id: number;
  original_name: string;
  url: string;
  mime_type?: string | null;
  is_image: boolean;
  is_pdf?: boolean;
};

export function isPdfAttachment(file: { is_pdf?: boolean; mime_type?: string | null; original_name?: string }): boolean {
  if (file.is_pdf) return true;
  const mime = (file.mime_type || "").toLowerCase();
  const name = (file.original_name || "").toLowerCase();
  return mime.includes("pdf") || name.endsWith(".pdf");
}

export function ChatMedia({ attachments }: { attachments?: ChatAttachment[] }) {
  const [open, setOpen] = useState<ChatAttachment | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!attachments?.length) return null;

  return (
    <>
      <div className={`mt-1.5 grid gap-1.5 ${attachments.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
        {attachments.map((file) =>
          file.is_image ? (
            <button
              key={file.id}
              type="button"
              onClick={() => setOpen(file)}
              className="block overflow-hidden rounded-xl bg-black/5 min-h-11 text-left"
              aria-label={`View ${file.original_name}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={file.url}
                alt={file.original_name}
                className="w-full max-h-64 object-cover bg-black/5"
              />
            </button>
          ) : (
            <a
              key={file.id}
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 min-h-11 px-3 py-2 rounded-xl bg-black/5 hover:bg-black/10"
            >
              <FileText className="w-5 h-5 shrink-0 text-[#111b21]" />
              <span className="text-sm font-medium truncate">{file.original_name || "PDF"}</span>
            </a>
          )
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[120] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setOpen(null)}
          role="dialog"
          aria-modal="true"
          aria-label={open.original_name}
        >
          <button
            type="button"
            onClick={() => setOpen(null)}
            className="absolute top-4 right-4 min-h-11 min-w-11 rounded-full bg-white text-black flex items-center justify-center"
            aria-label="Close image"
          >
            <X className="w-5 h-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={open.url}
            alt={open.original_name}
            className="max-w-full max-h-[88dvh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

export function PendingChatFiles({
  files,
  onRemove,
}: {
  files: { name: string; url: string; isImage: boolean }[];
  onRemove: (index: number) => void;
}) {
  if (files.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto px-1 pb-1">
      {files.map((file, index) => (
        <div key={`${file.name}-${index}`} className="relative shrink-0">
          {file.isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={file.url} alt={file.name} className="w-16 h-16 rounded-xl object-cover bg-black/5" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-white border border-black/10 flex flex-col items-center justify-center px-1">
              <FileText className="w-5 h-5" />
              <span className="text-[9px] truncate w-full text-center">{file.name}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute -top-1.5 -right-1.5 min-h-6 min-w-6 rounded-full bg-black text-white flex items-center justify-center"
            aria-label={`Remove ${file.name}`}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
