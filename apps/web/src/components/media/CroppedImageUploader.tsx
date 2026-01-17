"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";
import getCroppedImg from "@/lib/canvasUtils";
import imageCompression from "browser-image-compression";
import { Loader2, Image as ImageIcon, Crop as CropIcon } from "lucide-react";

export interface UploadedImage {
  id: string;
  originalUrl: string;
  mediumUrl?: string;
  thumbUrl?: string;
}

type Props = {
  onUpload: (image: UploadedImage) => void;
  label?: string;
  id?: string;
  aspectRatio?: number;
};

export default function CroppedImageUploader({
  onUpload,
  label = "Upload Image",
  id = "cropInput",
  aspectRatio = 4 / 3,
}: Props) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl as string);
    }
  };

  const readFile = (file: File) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setIsLoading(true);


// ... inside handleUpload ...

    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedImageBlob) throw new Error("Could not crop image");

      const file = new File([croppedImageBlob], "cropped.jpg", { type: "image/jpeg" });

      // Compress
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      const compressedFile = await (imageCompression as any)(file, options);

      const formData = new FormData();
      formData.append("file", compressedFile);

      const res = await apiFetch("/media/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const json = await res.json();
      const data = json.data; // ApiResponse wrapper
      const image = data.image;
      const finalUrl = image.originalUrl || image.mediumUrl;

      setUploadedUrl(finalUrl);
      onUpload(image);
      setImageSrc(null); // Close cropper
    } catch (e) {
      console.error(e);
      alert("Failed to upload image");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!uploadedUrl && !imageSrc && (
        <div
          className="cursor-pointer rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center transition-colors hover:border-blue-400"
          onClick={() => document.getElementById(id)?.click()}
        >
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <ImageIcon size={20} />
          </div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-xs text-slate-400">JPG/PNG with Crop</p>
        </div>
      )}

      <input
        id={id}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
      />

      {uploadedUrl && (
        <div className="border-border group relative overflow-hidden rounded-xl border">
          <img src={uploadedUrl} alt="Uploaded" className="h-48 w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setUploadedUrl(null);
                setImageSrc(null);
              }}
            >
              Replace
            </Button>
          </div>
        </div>
      )}

      {/* Cropper Modal */}
      <Dialog open={!!imageSrc} onOpenChange={(o) => !o && setImageSrc(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Adjust Image</DialogTitle>
          </DialogHeader>

          <div className="relative h-80 w-full bg-black">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatio} // Flexible aspect ratio
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            )}
          </div>

          <div className="mt-4">
            <label className="text-muted-foreground text-xs">Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setImageSrc(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 animate-spin" />
              ) : (
                <CropIcon className="mr-2" size={16} />
              )}
              Crop & Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

