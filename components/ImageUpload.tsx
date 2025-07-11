"use client";

import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Button } from "./ui/button";
import { Upload as UploadIcon, Image as ImageIcon, X } from "lucide-react";

interface ImageUploadProps {
  onImageSelect: (imageData: string) => void;
  currentImage: string | null;
  onError?: (error: string) => void;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
}

export function ImageUpload({ onImageSelect, currentImage, onError }: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update the selected file when the current image changes
  useEffect(() => {
    if (!currentImage) {
      setSelectedFile(null);
    }
  }, [currentImage]);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections) => {
      if (fileRejections?.length > 0) {
        const error = fileRejections[0].errors[0];
        onError?.(error.message);
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;

      setSelectedFile(file);
      setIsLoading(true);

      // Convert the file to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          const result = event.target.result as string;
          onImageSelect(result);
        }
        setIsLoading(false);
      };
      reader.onerror = () => {
        onError?.("Error reading file. Please try again.");
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect, onError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"]
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const handleRemove = () => {
    setSelectedFile(null);
    onImageSelect(""); // This will clear the image
  };

  return (
    <div className="w-full">
      {!currentImage ? (
        <div
          {...getRootProps()}
          className={`min-h-[180px] p-8 rounded-2xl relative overflow-hidden group
          ${isDragActive
            ? "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-300 dark:border-blue-600"
            : "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-slate-200 dark:border-slate-600"
          }
          ${isLoading ? "opacity-50 cursor-wait" : "cursor-pointer hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-700 dark:hover:to-slate-600"}
          transition-all duration-300 ease-in-out
          border-2 border-dashed
          flex items-center justify-center
        `}
        >
          <input {...getInputProps()} />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="flex flex-col items-center space-y-4 text-center relative z-10" role="presentation">
            <div className={`p-4 rounded-full transition-all duration-300 ${
              isDragActive
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 scale-110"
                : "bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 group-hover:scale-105"
            }`}>
              <UploadIcon className="w-8 h-8" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
                {isDragActive ? "Drop your image here" : "Upload an image to edit"}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Upload an existing image to modify with AI • Max 10MB
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Supports PNG, JPG, JPEG • Or skip to generate from text below
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 border border-slate-200 dark:border-slate-600 shadow-lg">
          <div className="flex w-full items-center mb-6 p-4 bg-white/50 dark:bg-slate-700/50 rounded-xl">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
              <ImageIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-semibold truncate text-slate-700 dark:text-slate-200">
                {selectedFile?.name || "Current Image"}
              </p>
              {selectedFile && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatFileSize(selectedFile?.size ?? 0)}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="flex-shrink-0 ml-2 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
              <span className="sr-only">Remove image</span>
            </Button>
          </div>
          <div className="w-full overflow-hidden rounded-xl shadow-inner bg-white dark:bg-slate-800 p-2">
            <Image
              src={currentImage}
              alt="Selected"
              width={640}
              height={480}
              className="w-full h-auto object-contain rounded-lg"
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  );
}
