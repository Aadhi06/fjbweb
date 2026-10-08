"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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

export function MediaLightbox({
  file,
  onClose,
}: {
  file: { url: string; original_name?: string; is_image?: boolean; is_pdf?: boolean; mime_type?: string | null } | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!file) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [file, onClose]);

  if (!file || typeof document === "undefined") return null;

  const pdf = isPdfAttachment(file);

  const dialog = (
    <div
      className="fixed inset-0 z-[300] bg-black flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={file.original_name || "Preview"}
    >
      <div className="shrink-0 flex items-center justify-end gap-2 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
        <button
          type="button"
          onClick={onClose}
          className="min-h-12 px-4 rounded-full bg-white text-black text-sm font-semibold inline-flex items-center gap-1.5"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
          Close
        </button>
      </div>
      <div className="flex-1 min-h-0 flex items-center justify-center px-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {pdf ? (
          <iframe
            src={file.url}
            title={file.original_name || "PDF"}
            className="w-full h-full rounded-xl bg-white"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.url}
            alt={file.original_name || "Photo"}
            className="max-w-full max-h-full object-contain"
          />
        )}
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}

export function ChatMedia({ attachments }: { attachments?: ChatAttachment[] }) {
  const [open, setOpen] = useState<ChatAttachment | null>(null);

  if (!attachments?.length) return null;

  return (
    <>
      <div className={`mt-1.5 grid gap-1.5 ${attachments.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
        {attachments.map((file) =>
          file.is_image || isPdfAttachment(file) ? (
            <button
              key={file.id}
              type="button"
              onClick={() => setOpen(file)}
              className="block overflow-hidden rounded-xl bg-black/5 min-h-11 text-left w-full"
              aria-label={`View ${file.original_name}`}
            >
              {file.is_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={file.url}
                  alt={file.original_name}
                  className="w-full max-h-64 object-cover bg-black/5"
                />
              ) : (
                <span className="flex items-center gap-2 min-h-11 px-3 py-2">
                  <FileText className="w-5 h-5 shrink-0 text-[#111b21]" />
                  <span className="text-sm font-medium truncate">{file.original_name || "PDF"}</span>
                </span>
              )}
            </button>
          ) : (
            <button
              key={file.id}
              type="button"
              onClick={() => setOpen(file)}
              className="flex items-center gap-2 min-h-11 px-3 py-2 rounded-xl bg-black/5 w-full text-left"
            >
              <FileText className="w-5 h-5 shrink-0 text-[#111b21]" />
              <span className="text-sm font-medium truncate">{file.original_name || "File"}</span>
            </button>
          )
        )}
      </div>
      <MediaLightbox file={open} onClose={() => setOpen(null)} />
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
