"use client";

import React, { useState, useRef } from "react";
import { Image as ImageIcon, Camera, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface UploadedImage {
  id: string;
  name: string;
  size: number;
  previewUrl: string;
  base64: string;
  compressed: boolean;
  file: File;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}

function compressImage(file: File): Promise<{ base64: string; previewUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas 2d context"));
          return;
        }

        const maxDimension = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75);
        resolve({
          base64: compressedBase64.split(",")[1] || compressedBase64,
          previewUrl: compressedBase64,
        });
      };
      img.onerror = () => reject(new Error("Failed to load image"));
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
  });
}

function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export function ImageUploader({ images, onChange }: ImageUploaderProps): JSX.Element {
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = async (fileList: File[]) => {
    const validMimes = ["image/jpeg", "image/png", "image/webp"];
    const maxFilesAllowed = 5;

    const filteredFiles = fileList.filter(file => {
      if (!validMimes.includes(file.type)) {
        alert(`Unsupported file format: ${file.name}. Only JPEG, PNG, and WebP are allowed.`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert(`File too large: ${file.name}. Max size limit is 10MB.`);
        return false;
      }
      return true;
    });

    if (images.length + filteredFiles.length > maxFilesAllowed) {
      alert(`Maximum of ${maxFilesAllowed} images can be uploaded.`);
      return;
    }

    setIsCompressing(true);
    const newImages: UploadedImage[] = [];

    for (let i = 0; i < filteredFiles.length; i++) {
      const file = filteredFiles[i];
      setCompressionProgress(`Scaling & compressing "${file.name}"...`);
      try {
        const { base64, previewUrl } = await compressImage(file);
        const compressedFile = dataURLtoFile(previewUrl, file.name);
        newImages.push({
          id: Math.random().toString(36).slice(2, 9),
          name: file.name,
          size: compressedFile.size,
          previewUrl,
          base64,
          compressed: true,
          file: compressedFile,
        });
      } catch (err) {
        console.error("Compression failed for file:", file.name, err);
      }
    }

    onChange([...images, ...newImages]);
    setIsCompressing(false);
    setCompressionProgress("");
  };

  const removeImage = (id: string) => {
    onChange(images.filter(img => img.id !== id));
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-200 flex justify-between items-center">
        <span>Step 1: Upload Visual Evidence (Up to 5 images)</span>
        <span className="text-xs text-slate-500">Min. 1 photo required for AI analysis</span>
      </label>

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed border-slate-800 rounded-xl p-8 text-center cursor-pointer transition-all duration-300 relative overflow-hidden",
          dragActive ? "border-blue-500 bg-blue-500/5 shadow-inner" : "hover:border-slate-700 hover:bg-slate-800/20",
          isCompressing && "pointer-events-none opacity-50"
        )}
        style={{ minHeight: "150px" }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
          accept="image/jpeg,image/png,image/webp"
        />
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
          capture="environment"
        />

        {isCompressing ? (
          <div className="flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
            <p className="text-sm text-slate-300 font-medium">{compressionProgress}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-2 shadow-sm text-slate-400 hover:text-blue-400 transition-colors">
              <ImageIcon className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-slate-200">Drag & drop files here, or click to upload</p>
            <p className="text-xs text-slate-500">Supports JPEG, PNG, WEBP up to 10MB (Auto-compressed to 75% quality)</p>
            
            <div className="flex gap-3 mt-4" onClick={(e) => e.stopPropagation()}>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="bg-slate-880 border border-slate-700 text-slate-300 hover:bg-slate-750 flex items-center gap-1.5"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Gallery
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="bg-slate-880 border border-slate-700 text-slate-300 hover:bg-slate-750 flex items-center gap-1.5"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="w-3.5 h-3.5" />
                Snap Photo
              </Button>
            </div>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3">
          {images.map((img) => (
            <div key={img.id} className="relative group rounded-lg overflow-hidden border border-slate-800 aspect-square bg-slate-950">
              <img
                src={img.previewUrl}
                alt={img.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  className="bg-red-500/80 hover:bg-red-600 rounded-full p-2 text-white transition-all transform hover:scale-110 shadow-lg"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute bottom-1 left-1 bg-slate-950/80 text-[9px] font-semibold text-emerald-400 border border-emerald-950 px-1.5 rounded-md">
                Compressed
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
