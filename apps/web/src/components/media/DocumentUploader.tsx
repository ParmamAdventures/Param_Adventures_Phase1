"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { apiFetch } from "@/lib/api";

type Props = {
  onUpload: (url: string) => void;
  label?: string;
  existingUrl?: string;
};

export function DocumentUploader({ onUpload, label = "Upload Document", existingUrl }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(existingUrl || null);

  function handleSelect(file: File) {
    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File must be under 10MB");
      return;
    }

    setError(null);
    setFile(file);
    setSuccess(null); // Reset success state when new file selected
  }

  async function upload() {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await apiFetch("/media/upload-doc", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${data.url}`;
      onUpload(fullUrl);
      setSuccess(data.filename);
      setFile(null); // Clear file after successful upload
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div
        className="cursor-pointer rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center transition-colors hover:border-blue-400"
        onClick={() => document.getElementById("docInput")?.click()}
      >
        {success ? (
          <div className="space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <path d="M12 18v-6" />
                <path d="m9 15 3 3 3-3" />
              </svg>
            </div>
            <p className="text-sm font-medium break-all text-emerald-600">
              {success.includes("/") ? success.split("/").pop() : success}
            </p>
            <p className="text-xs text-slate-400">Click to replace</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" x2="8" y1="13" y2="13" />
                <line x1="16" x2="8" y1="17" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <p className="text-sm text-slate-500">{file ? file.name : "Click to select PDF"}</p>
            <p className="text-xs text-slate-400">PDF only (max. 10MB)</p>
          </div>
        )}
      </div>

      <input
        id="docInput"
        type="file"
        hidden
        accept="application/pdf"
        onChange={(e) => e.target.files && handleSelect(e.target.files[0])}
      />

      {error && <p className="text-sm font-medium text-red-500">{error}</p>}

      {file && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            upload();
          }}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white shadow-md shadow-blue-100 hover:bg-blue-700"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Spinner className="h-4 w-4" />
              <span>Uploading...</span>
            </div>
          ) : (
            label
          )}
        </Button>
      )}
    </div>
  );
}

