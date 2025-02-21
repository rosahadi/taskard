'use client';

import { ImageIcon, X } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  imagePreview: string | null;
  onImageUpload: (file: File) => void;
  onRemoveImage: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  imagePreview,
  onImageUpload,
  onRemoveImage,
}) => {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <div className="flex justify-start w-full">
      {imagePreview ? (
        <div className="relative w-24 h-24 rounded-lg overflow-hidden">
          <Image
            src={imagePreview}
            alt="Workspace preview"
            width={96}
            height={96}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onRemoveImage}
            className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1"
            type="button"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      ) : (
        <label
          htmlFor="workspace-image"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-[--background-tertiary] border-[--border] hover:bg-[--background-quaternary]"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <ImageIcon className="w-8 h-8 mb-3 text-[--text-muted]" />
            <p className="mb-2 text-sm text-[--text-muted]">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-[--text-muted]">
              SVG, PNG, JPG or GIF (max 10MB)
            </p>
          </div>
          <input
            id="workspace-image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>
      )}
    </div>
  );
};

export default ImageUpload;
