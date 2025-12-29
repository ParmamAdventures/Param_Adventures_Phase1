"use client";

import { ImageUploader } from "./ImageUploader";
import { Button } from "@/components/ui/Button";

type Image = {
  id: string;
  thumbUrl: string;
};

type GalleryUploaderProps = {
  images: Image[];
  onChange: (images: Image[]) => void;
};

export function GalleryUploader({
  images,
  onChange,
}: GalleryUploaderProps) {
  function move(index: number, dir: -1 | 1) {
    const copy = [...images];
    const target = index + dir;
    if (target < 0 || target >= copy.length) return;
    [copy[index], copy[target]] = [copy[target], copy[index]];
    onChange(copy);
  }

  function remove(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-xl bg-slate-50/30 border-slate-100">
        <label className="block text-sm font-semibold text-slate-700 mb-3">Add to Gallery</label>
        <ImageUploader
            onUpload={(img) =>
                onChange([...images, { id: img.id, thumbUrl: img.thumbUrl }])
            }
            label="Upload to Gallery"
        />
      </div>

      {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img, i) => (
              <div key={`${img.id}-${i}`} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm ring-blue-500/20 hover:ring-2 transition-all">
                <img
                  src={img.thumbUrl}
                  alt={`Gallery image ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <div className="flex items-center gap-1">
                        <Button 
                            variant="subtle"
                            className="w-8 h-8 p-0 rounded-full bg-white hover:bg-slate-100 text-slate-700 shadow-md ring-1 ring-slate-900/5 group/btn"
                            onClick={() => move(i, -1)}
                            disabled={i === 0}
                            title="Move Up"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700 group-hover/btn:text-slate-900"><path d="m18 15-6-6-6 6"/></svg>
                        </Button>
                        <Button 
                            variant="subtle"
                            className="w-8 h-8 p-0 rounded-full bg-white hover:bg-slate-100 text-slate-700 shadow-md ring-1 ring-slate-900/5 group/btn"
                            onClick={() => move(i, 1)}
                            disabled={i === images.length - 1}
                            title="Move Down"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700 group-hover/btn:text-slate-900"><path d="m6 9 6 6 6-6"/></svg>
                        </Button>
                    </div>
                  
                    <Button
                        variant="danger"
                        className="w-8 h-8 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-md ring-1 ring-red-700/10 group/btn"
                        onClick={() => remove(i)}
                        title="Remove Image"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    </Button>
                </div>
                
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded text-[10px] font-bold text-white uppercase tracking-wider">
                    #{i + 1}
                </div>
              </div>
            ))}
          </div>
      ) : (
          <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <p className="text-sm text-slate-400">No images in gallery yet.</p>
          </div>
      )}
    </div>
  );
}
