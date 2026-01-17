"use client";

import {
  Dropzone,
  DropZoneArea,
  DropzoneDescription,
  DropzoneMessage,
  DropzoneTrigger,
  useDropzone,
} from "@/components/ui/dropzone";
import { uploadFileWithRetry } from "@/lib/upload-utils";

import {
  CloudUploadIcon,
  Trash2Icon,
  StarIcon,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface ImageWithThumbnail {
  url: string;
  isThumbnail: boolean;
}

interface ImageLoadError {
  index: number;
  url: string;
}

interface MultiUploaderProps {
  images: ImageWithThumbnail[]; // Controlled: parent manages the state
  onImagesChange: (
    imagesOrUpdater:
      | ImageWithThumbnail[]
      | ((prev: ImageWithThumbnail[]) => ImageWithThumbnail[])
  ) => void; // Required callback - supports functional updates
}

export function MultiUploader({ images, onImagesChange }: MultiUploaderProps) {
  const [imageLoadErrors, setImageLoadErrors] = useState<ImageLoadError[]>([]);

  // Thumbnail selection handler ensuring only one thumbnail is selected
  const handleThumbnailSelect = (index: number) => {
    // Update images array with new thumbnail designation
    const updatedImages = images.map((img, idx) => ({
      ...img,
      isThumbnail: idx === index,
    }));

    onImagesChange(updatedImages);
  };

  // Handle image removal
  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, idx) => idx !== index);

    // Remove error for this image if it exists
    setImageLoadErrors((prev) => prev.filter((err) => err.index !== index));

    // Find current thumbnail index
    const currentThumbnailIndex = images.findIndex((img) => img.isThumbnail);

    // Adjust thumbnail index if needed
    let newThumbnailIndex = 0;
    if (updatedImages.length > 0) {
      if (index === currentThumbnailIndex) {
        // If removing the thumbnail, set first image as thumbnail
        newThumbnailIndex = 0;
      } else if (index < currentThumbnailIndex) {
        // If removing an image before the thumbnail, adjust index
        newThumbnailIndex = currentThumbnailIndex - 1;
      } else {
        // Thumbnail is before the removed image, keep its position
        newThumbnailIndex = currentThumbnailIndex;
      }
    }

    // Update thumbnail designation
    const imagesWithThumbnail = updatedImages.map((img, idx) => ({
      ...img,
      isThumbnail: idx === newThumbnailIndex,
    }));

    onImagesChange(imagesWithThumbnail);
  };

  // Handle image load error
  const handleImageError = (index: number, url: string) => {
    setImageLoadErrors((prev) => {
      // Avoid duplicate errors
      if (prev.some((err) => err.index === index)) {
        return prev;
      }
      return [...prev, { index, url }];
    });

    // Show error toast for image fetch failures in edit mode
    toast({
      title: "Gagal memuat gambar",
      description: `Gambar #${index + 1} tidak dapat dimuat. Silakan hapus dan unggah ulang.`,
      variant: "destructive",
    });
  };

  const dropzone = useDropzone({
    onDropFile: async (file: File) => {
      try {
        // Create instant preview URL
        const previewUrl = URL.createObjectURL(file);

        // Start upload in background
        const result = await uploadFileWithRetry(file, 3, (progress) => {
          console.log(
            `Uploading ${progress.fileName}: ${progress.progress.toFixed(0)}%`
          );
        });

        // Cleanup preview URL
        URL.revokeObjectURL(previewUrl);

        // Add newly uploaded image to existing images
        // Use functional update to avoid race conditions when uploading multiple files
        onImagesChange((prevImages) => {
          const newImage: ImageWithThumbnail = {
            url: result.url,
            isThumbnail: prevImages.length === 0, // First image is thumbnail
          };

          return [...prevImages, newImage];
        });

        return {
          status: "success",
          result: result.url,
        };
      } catch (error) {
        console.error("Upload failed:", error);
        return {
          status: "error",
          error: error instanceof Error ? error.message : "Upload failed",
        };
      }
    },
    validation: {
      accept: {
        "image/*": [".png", ".jpg", ".jpeg"],
      },
      maxSize: 50 * 1024 * 1024, // Increased to 50MB for chunk upload
      maxFiles: 10,
    },
    maxRetryCount: 3,
    autoRetry: true,
  });

  return (
    <div className="not-prose flex flex-col gap-4">
      <Dropzone {...dropzone}>
        <div>
          <div className="flex justify-between">
            <DropzoneDescription>
              Please select up to 10 images
            </DropzoneDescription>
            <DropzoneMessage />
          </div>
          <DropZoneArea>
            <DropzoneTrigger className="flex flex-col items-center gap-4 bg-transparent p-10 text-center text-sm">
              <CloudUploadIcon className="size-5" />
              <div>
                <p className="font-medium">Upload gambar produk</p>
                <p className="text-sm text-muted-foreground">
                  Klik di sini atau tarik gambar untuk mengunggah
                </p>
              </div>
            </DropzoneTrigger>
          </DropZoneArea>
        </div>

        {/* Combined grid: uploaded images + pending uploads in sequence */}
        {(images.length > 0 ||
          dropzone.fileStatuses.some((f) => f.status === "pending")) && (
          <div className="grid grid-cols-3 gap-3 p-0">
            {/* Uploaded images */}
            {images.map((image, index) => {
              const hasError = imageLoadErrors.some(
                (err) => err.index === index
              );

              return (
                <div
                  key={`uploaded-${index}`}
                  className={cn(
                    "overflow-hidden rounded-md bg-secondary p-0 shadow-sm relative",
                    image.isThumbnail && "ring-2 ring-primary",
                    hasError && "ring-2 ring-destructive"
                  )}
                >
                  {hasError ? (
                    <div className="aspect-video flex flex-col items-center justify-center bg-muted">
                      <AlertCircle className="size-8 text-destructive mb-2" />
                      <p className="text-xs text-destructive text-center px-2">
                        Gagal memuat gambar
                      </p>
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image.url}
                      alt={`uploaded-${index}`}
                      className="aspect-video object-cover"
                      onError={() => handleImageError(index, image.url)}
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => handleThumbnailSelect(index)}
                    className={cn(
                      "absolute top-2 left-2 p-1.5 rounded-full transition-colors",
                      image.isThumbnail
                        ? "bg-primary text-primary-foreground"
                        : "bg-black/50 text-white hover:bg-black/70"
                    )}
                    title={image.isThumbnail ? "Thumbnail" : "Set as thumbnail"}
                    disabled={hasError}
                  >
                    <StarIcon
                      className={cn(
                        "size-4",
                        image.isThumbnail && "fill-current"
                      )}
                    />
                  </button>

                  <div className="flex items-center justify-between p-2 pl-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm">
                        {image.isThumbnail ? "Thumbnail" : `Image ${index + 1}`}
                      </p>
                      {hasError && (
                        <p className="text-xs text-destructive">
                          Error loading
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="shrink-0 hover:outline p-2 hover:bg-accent rounded-md"
                    >
                      <Trash2Icon className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Pending uploads - inline in same grid */}
            {dropzone.fileStatuses
              .filter((file) => file.status === "pending")
              .map((file) => (
                <div
                  key={file.id}
                  className="overflow-hidden rounded-md bg-secondary p-0 shadow-sm"
                >
                  <div className="relative aspect-video">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={URL.createObjectURL(file.file)}
                      alt={`preview-${file.fileName}`}
                      className="aspect-video object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
                        <p className="text-xs text-white">Uploading...</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 pl-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm">{file.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </Dropzone>
    </div>
  );
}
