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
        dispatch(setCredentials(userData));
      }

      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
      });

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
          form.reset({
            name: currentUser.name,
            email: currentUser.email,
          });
          setImagePreview(currentUser.image || null);
          setError(null);
          onClose();
        }
      }}
    >
      <DialogContent className="bg-[var(--background-tertiary)] border-[var(--border)] text-[var(--text-primary)] sm:max-w-[500px] shadow-xl rounded-xl">
        <DialogHeader className="space-y-3 pb-4">
          <DialogTitle className="text-xl font-semibold text-[var(--text-primary)]">
            User Settings
          </DialogTitle>
          <DialogDescription className="text-[var(--text-muted)]">
            Update your profile information and preferences
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-6"
          >
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-[var(--text-error)]">{error}</p>
              </div>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium text-[var(--text-primary)]">
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your full name"
                      className="bg-[var(--background-secondary)] border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors duration-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[var(--text-error)]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium text-[var(--text-primary)]">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email address"
                      type="email"
                      className="bg-[var(--background-secondary)] border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors duration-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[var(--text-error)]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={() => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium text-[var(--text-primary)]">
                    Profile Picture
                  </FormLabel>
                  <FormControl>
                    <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-4 hover:border-[var(--primary)] transition-colors duration-200">
                      <ImageUpload
                        imagePreview={imagePreview}
                        onImageUpload={handleImageUpload}
                        onRemoveImage={handleRemoveImage}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[var(--text-error)]" />
                </FormItem>
              )}
            />

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-[var(--border)]">
              <Button
                variant="outline"
                onClick={onClose}
                type="button"
                className="border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--background-secondary)] transition-colors duration-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating || !form.formState.isValid}
                className="bg-[var(--primary)] text-white hover:bg-[var(--secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
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
