'use client';

import { ImageIcon, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

const CreateWorkspaceModal = ({
  isOpen,
  onClose,
  onSubmit,
  workspaceName,
  setWorkspaceName,
  workspaceImage,
  setWorkspaceImage,
  imagePreview,
  setImagePreview,
  isCreating,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  workspaceName: string;
  setWorkspaceName: (name: string) => void;
  workspaceImage: string | null;
  setWorkspaceImage: (image: string | null) => void;
  imagePreview: string | null;
  setImagePreview: (preview: string | null) => void;
  isCreating: boolean;
}) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setWorkspaceImage(base64String);
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setWorkspaceImage(null);
    setImagePreview(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[--background-secondary] border-[--border] text-[--text-primary]">
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
          <DialogDescription className="text-[--text-muted]">
            Create a workspace to collaborate with your team.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Workspace Name</Label>
            <Input
              id="name"
              placeholder="My Awesome Team"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="bg-[--background-tertiary] border-[--border]"
            />
          </div>

          <div className="grid gap-2">
            <Label>Workspace Image (Optional)</Label>
            {imagePreview ? (
              <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Workspace preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1"
                  type="button"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="workspace-image"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-[--background-tertiary] border-[--border] hover:bg-[--background-quaternary]"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-8 h-8 mb-3 text-[--text-muted]" />
                    <p className="mb-2 text-sm text-[--text-muted]">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-[--text-muted]">
                      SVG, PNG, JPG or GIF
                    </p>
                  </div>
                  <input
                    id="workspace-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[--border] text-[--text-primary]"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!workspaceName.trim() || isCreating}
            className="bg-[--primary] text-white hover:bg-[--primary-hover]"
          >
            {isCreating ? 'Creating...' : 'Create Workspace'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWorkspaceModal;
