import { useState } from "react";
import { apiFetch } from "@/lib/api";

type UseUploadOptions = {
  endpoint?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
};

export function useUpload({
  endpoint = "/media/upload",
  onSuccess,
  onError,
}: UseUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File | FormData) => {
    setIsUploading(true);
    setError(null);

    try {
      let body: FormData;

      if (file instanceof FormData) {
        body = file;
      } else {
        body = new FormData();
        body.append("file", file);
      }

      const res = await apiFetch(endpoint, {
        method: "POST",
        body,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Upload failed");
      }

      onSuccess?.(json);
      return json;
    } catch (err: any) {
      const message = err.message || "Upload failed";
      setError(message);
      onError?.(err);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    upload,
    isUploading,
    error,
    setError, // exposed to clear errors manually if needed
  };
}
