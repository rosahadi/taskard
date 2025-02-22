'use client';

import { useState } from 'react';
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
import { useUpdateWorkspaceMutation } from '@/store/workspaceApi';
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
  const { toast } = useToast();
  const [updateWorkspace, { isLoading: isUpdating }] =
    useUpdateWorkspaceMutation();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceFormSchema),
    defaultValues: {
      name: '',
      image: undefined,
    },
  });

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      form.setValue('image', file);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    form.setValue('image', undefined);
  };

  const handleFormSubmit = async (values: WorkspaceFormValues) => {
    try {
      const formData = new FormData();
      formData.append('name', values.name);

      if (values.image && values.image instanceof File) {
        formData.append('image', values.image);
      }

      await updateWorkspace({
        id: Number(workspaceId),
        body: formData,
      }).unwrap();

      toast({
        title: 'Success',
        description: 'Workspace updated successfully!',
      });

      form.reset();
      setImagePreview(null);
      onClose();
    } catch (error) {
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
          form.reset();
          setImagePreview(null);
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

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-6"
          >
            {error && <FormMessage>{error}</FormMessage>}

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

            {error && <FormMessage>{error}</FormMessage>}

            <DialogFooter className="pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                type="button"
                className="border-[--border] text-[--text-primary]"
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
      </DialogContent>
    </Dialog>
  );
};

export default WorkspaceSettingsModal;
