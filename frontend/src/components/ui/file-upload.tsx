"use client";

import { useRef, useState } from "react";
import { FileUp, Loader2, X } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

export function FileUploadField({
  label,
  accept,
  value,
  onChange,
  hint,
  className,
}: {
  label: string;
  accept?: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onFile(file: File | null) {
    if (!file) return;
    const max = 8 * 1024 * 1024;
    if (file.size > max) {
      toast("File must be under 8 MB", "error");
      return;
    }
    setUploading(true);
    try {
      const dataBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = String(reader.result || "");
          const base64 = result.includes(",")
            ? result.split(",")[1]
            : result;
          resolve(base64);
        };
        reader.onerror = () => reject(new Error("Could not read file"));
        reader.readAsDataURL(file);
      });
      const res = await api.uploadFile({
        filename: file.name,
        contentType: file.type || "application/octet-stream",
        dataBase64,
      });
      onChange(res.url);
      toast("File uploaded", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium text-fg">{label}</p>
      {hint ? <p className="text-xs text-fg-subtle">{hint}</p> : null}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-surface-muted px-4 text-sm font-medium text-fg transition hover:border-brand/40 disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileUp className="h-4 w-4" />
          )}
          {uploading ? "Uploading…" : "Choose file"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] || null)}
        />
        {value ? (
          <span className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-xl border border-line bg-card px-3 py-2 text-xs text-fg-muted">
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-brand hover:underline"
            >
              {value.split("/").pop() || "Uploaded file"}
            </a>
            <button
              type="button"
              aria-label="Remove file"
              onClick={() => onChange("")}
              className="shrink-0 text-fg-subtle hover:text-fg"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ) : null}
      </div>
    </div>
  );
}
