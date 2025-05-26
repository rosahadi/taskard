'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useUpdateWorkspaceMutation,
  useGetWorkspaceQuery,
} from '@/store/workspaceApi';
import { useToast } from '@/hooks/use-toast';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import ImageUpload from '../ImageUpload';

const workspaceFormSchema = z.object({
  name: z.string().min(1, 'Workspace name is required'),
  image: z.any().optional(),
});

type WorkspaceFormValues = z.infer<typeof workspaceFormSchema>;

interface WorkspaceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: number | null;
}

const WorkspaceSettingsModal: React.FC<WorkspaceSettingsModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [imageDeleted, setImageDeleted] = useState<boolean>(false); // Track if image was deleted
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null); // Track original image
  const { toast } = useToast();
  const [updateWorkspace, { isLoading: isUpdating }] =
    useUpdateWorkspaceMutation();
  const [error, setError] = useState<string | null>(null);

  // Fetch current workspace data
  const { data: workspaceData, isLoading: isLoadingWorkspace } =
    useGetWorkspaceQuery(workspaceId!, { skip: !workspaceId || !isOpen });

  const form = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceFormSchema),
    defaultValues: {
      name: '',
      image: undefined,
    },
  });

  // Populate form when workspace data is loaded
  useEffect(() => {
    if (workspaceData?.data && isOpen) {
      form.reset({
        name: workspaceData.data.name,
        image: undefined,
      });

      // Set the existing image preview if there's an image
      if (workspaceData.data.image) {
        setImagePreview(workspaceData.data.image);
        setOriginalImageUrl(workspaceData.data.image);
      } else {
        setImagePreview(null);
        setOriginalImageUrl(null);
      }

      setNewImageFile(null);
      setImageDeleted(false);
      setError(null);
    }
  }, [workspaceData, isOpen, form]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setImagePreview(null);
      setNewImageFile(null);
      setImageDeleted(false);
      setOriginalImageUrl(null);
      setError(null);
    }
  }, [isOpen, form]);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setNewImageFile(file);
      setImageDeleted(false); // Reset deletion flag when new image is uploaded
      form.setValue('image', file);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setNewImageFile(null);
    setImageDeleted(true); // Mark image as deleted
    form.setValue('image', undefined);
  };

  const handleFormSubmit = async (values: WorkspaceFormValues) => {
    try {
      setError(null);
      const formData = new FormData();
      formData.append('name', values.name);

      // Handle image logic
      if (newImageFile) {
        // New image uploaded
        formData.append('image', newImageFile);
      } else if (imageDeleted && originalImageUrl) {
        // Image was deleted - send explicit deletion signal
        formData.append('deleteImage', 'true');
      }
      // If neither condition is met, don't send any image-related data (no change)

      await updateWorkspace({
        id: Number(workspaceId),
        body: formData,
      }).unwrap();

      toast({
        title: 'Success',
        description: 'Workspace updated successfully!',
      });

      onClose();
    } catch (error) {
      console.error('Update workspace error:', error);
      const { data } = error as FetchBaseQueryError;
      setError(
        data
          ? (data as { message: string }).message
          : 'An unexpected error occurred'
      );
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="bg-[--background-secondary] border-[--border] text-[--text-primary] sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Workspace</DialogTitle>
          <DialogDescription className="text-[--text-muted]">
            Update your workspace details.
          </DialogDescription>
        </DialogHeader>

        {isLoadingWorkspace ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading workspace...</span>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="space-y-6"
            >
              {error && (
                <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                  {error}
                </div>
              )}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workspace Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter workspace name"
                        className="bg-[--background-tertiary] border-[--border]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={() => (
                  <FormItem>
                    <FormLabel>Workspace Image (Optional)</FormLabel>
                    <FormControl>
                      <ImageUpload
                        imagePreview={imagePreview}
                        onImageUpload={handleImageUpload}
                        onRemoveImage={handleRemoveImage}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  type="button"
                  className="border-[--border] text-[--text-primary]"
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating || !form.formState.isValid}
                  className="bg-[--primary] text-white hover:bg-[--primary-hover]"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Workspace'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WorkspaceSettingsModal;
