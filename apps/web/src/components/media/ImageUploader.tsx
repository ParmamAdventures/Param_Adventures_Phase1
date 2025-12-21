"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

type UploadedImage = {
  id: string;
  originalUrl: string;
  mediumUrl: string;
  thumbUrl: string;
};

type Props = {
  onUpload: (image: UploadedImage) => void;
  label?: string;
};

export function ImageUploader({ onUpload, label = "Upload Image" }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSelect(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Only images are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }

    setError(null);
    setFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function upload() {
    if (!file) return;

    setLoading(true);
    setError(null);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/media/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: form,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      onUpload(data.image);
      setFile(null);
      setPreview(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div
        className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 transition-colors bg-slate-50/50"
        onClick={() => document.getElementById("fileInput")?.click()}
      >
        {preview ? (
          <div className="relative group">
            <img
              src={preview}
              alt="Preview"
              className="mx-auto max-h-48 rounded-lg shadow-sm group-hover:opacity-75 transition-opacity"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-sm font-medium text-slate-700 bg-white/80 px-3 py-1 rounded-full shadow-sm">
                Change Image
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="mx-auto w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            </div>
            <p className="text-sm text-slate-500">
              Click or drop an image here
            </p>
            <p className="text-xs text-slate-400">
                JPG, PNG or WEBP (max. 5MB)
            </p>
          </div>
        )}
      </div>

      <input
        id="fileInput"
        type="file"
        hidden
        accept="image/*"
        onChange={(e) =>
          e.target.files && handleSelect(e.target.files[0])
        }
      />

      {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

      {file && (
        <Button 
            onClick={upload} 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-100"
        >
          {loading ? (
            <div className="flex items-center gap-2">
                <Spinner className="w-4 h-4" />
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
