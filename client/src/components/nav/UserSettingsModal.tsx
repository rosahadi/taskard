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
import { useGetMeQuery, useUpdateMeMutation } from '@/store/userApi';
import { useToast } from '@/hooks/use-toast';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import ImageUpload from '../ImageUpload';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/authSlice';

const userSettingsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  image: z.any().optional(),
});

type UserSettingsValues = z.infer<typeof userSettingsSchema>;

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    name: string;
    email: string;
    image?: string;
  };
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const dispatch = useDispatch();
  const [imagePreview, setImagePreview] = useState<string | null>(
    currentUser.image || null
  );
  const [updateMe, { isLoading: isUpdating }] = useUpdateMeMutation();
  const { refetch: refetchMe } = useGetMeQuery();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<UserSettingsValues>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      name: currentUser.name,
      email: currentUser.email,
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

  const handleFormSubmit = async (values: UserSettingsValues) => {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('email', values.email);

      if (values.image && values.image instanceof File) {
        formData.append('image', values.image);
      }

      await updateMe(formData).unwrap();

      const { data: userData, error } = await refetchMe();

      if (error) throw new Error('Failed to fetch user data');

      if (userData) {
        // Store the complete user data in Redux
        dispatch(setCredentials(userData));
      }

      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
      });

      onClose();
    } catch (error) {
      console.log(error);
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
          form.reset({
            name: currentUser.name,
            email: currentUser.email,
          });
          setImagePreview(currentUser.image || null);
          onClose();
        }
      }}
    >
      <DialogContent className="bg-[--background-secondary] border-[--border] text-[--text-primary] sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>User Settings</DialogTitle>
          <DialogDescription className="text-[--text-muted]">
            Update your profile information
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-6"
          >
            {error && <div className="text-sm text-red-500">{error}</div>}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="john@example.com"
                      type="email"
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
                  <FormLabel>Profile Picture</FormLabel>
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
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UserSettingsModal;
