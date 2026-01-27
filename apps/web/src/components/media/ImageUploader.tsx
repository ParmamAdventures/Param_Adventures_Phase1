"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import imageCompression from "browser-image-compression";
import { useUpload } from "@/hooks/useUpload";

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

/**
 * ImageUploader - React component for UI presentation and interaction.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Component children
 * @returns {React.ReactElement} Component element
 */
export function ImageUploader({ onUpload, label = "Upload Image" }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { upload, isUploading, error, setError } = useUpload(); // Using hook

  function handleSelect(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Only images are allowed");
      return;
    }

    setError(null);
    setFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleUpload() {
    if (!file) return;

    try {
      // Compress image if larger than 1MB
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressedFile = await (
        imageCompression as (file: File, options: Record<string, unknown>) => Promise<File>
      )(file, options);

      const data = await upload(compressedFile);

      onUpload(data.data?.image || data.image);
      setFile(null);
      setPreview(null);
    } catch (e) {
      // Error handled by hook
      console.error(e);
    }
  }

  return (
    <div className="space-y-3">
      <div
        className="cursor-pointer rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center transition-colors hover:border-blue-400"
        onClick={() => document.getElementById("fileInput")?.click()}
      >
        {preview ? (
          <div className="group relative">
            <img
              src={preview}
              alt="Preview"
              className="mx-auto max-h-48 rounded-lg shadow-sm transition-opacity group-hover:opacity-75"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
              <span className="rounded-full bg-white/80 px-3 py-1 text-sm font-medium text-slate-700 shadow-sm">
                Change Image
              </span>
            </div>
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
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </div>
            <p className="text-sm text-slate-500">Click or drop an image here</p>
            <p className="text-xs text-slate-400">JPG, PNG or WEBP (Auto-compressed)</p>
          </div>
        )}
      </div>

      <input
        id="fileInput"
        type="file"
        hidden
        accept="image/*"
        onChange={(e) => e.target.files && handleSelect(e.target.files[0])}
      />

      {error && <p className="text-sm font-medium text-red-500">{error}</p>}

      {file && (
        <Button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full bg-blue-600 text-white shadow-md shadow-blue-100 hover:bg-blue-700"
        >
          {isUploading ? (
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
