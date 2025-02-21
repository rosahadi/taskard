'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ImageIcon, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
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
import { useCreateWorkspaceMutation } from '@/store/workspaceApi';
import { useAppDispatch } from '@/app/redux';
import { setActiveWorkspace } from '@/store/workspaceSlice';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

const workspaceFormSchema = z.object({
  name: z.string().min(1, 'Workspace name is required'),
  image: z.any().optional(),
});

type WorkspaceFormValues = z.infer<typeof workspaceFormSchema>;

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [createWorkspace, { isLoading: isCreating }] =
    useCreateWorkspaceMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { toast } = useToast();

  const [error, setError] = useState<string | null>(null);

  const form = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceFormSchema),
    defaultValues: {
      name: '',
      image: undefined,
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      form.setError('image', { message: 'Image must be less than 10MB' });
      return;
    }

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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFormSubmit = async (values: WorkspaceFormValues) => {
    try {
      const formData = new FormData();
      formData.append('name', values.name);

      if (values.image && values.image instanceof File) {
        formData.append('image', values.image);
      }

      const result = await createWorkspace(formData).unwrap();

      if (result.data) {
        dispatch(setActiveWorkspace(result.data.id));
        router.push(`/workspaces/${result.data.id}`);
        toast({
          title: 'Success',
          description: 'Workspace created successfully!',
        });
      }

      form.reset();
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onClose();
    } catch (error) {
      const { data } = error as FetchBaseQueryError;

      if (data) {
        setError((data as { message: string }).message);
      } else {
        setError('An unexpected error occurred');
      }
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
          <DialogTitle>Create New Workspace</DialogTitle>
          <DialogDescription className="text-[--text-muted]">
            Create a workspace to collaborate with your team.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-6"
          >
            {form.formState.errors.root && (
              <div className="text-sm text-red-500">
                {form.formState.errors.root.message}
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
                      placeholder="My Awesome Team"
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
                              <span className="font-semibold">
                                Click to upload
                              </span>{' '}
                              or drag and drop
                            </p>
                            <p className="text-xs text-[--text-muted]">
                              SVG, PNG, JPG or GIF (max 10MB)
                            </p>
                          </div>
                          <input
                            id="workspace-image"
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </label>
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Display backend error message */}
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
                disabled={isCreating || !form.formState.isValid}
                className="bg-[--primary] text-white hover:bg-[--primary-hover]"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Workspace'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWorkspaceModal;
