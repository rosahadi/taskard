'use client';

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import AuthCard from './AuthCard';
import { resetPasswordSchema } from '@/schemas/auth';
import { Info } from 'lucide-react';
import { useResetPasswordMutation } from '@/store/authApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useRouter, useSearchParams } from 'next/navigation';

type FormValues = z.infer<typeof resetPasswordSchema>;

const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [backendError, setBackendError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const getPasswordErrors = (password: string) => {
    const errors: Set<string> = new Set();

    if (password.length < 10) errors.add('Must be at least 10 characters long');
    if (!/[A-Z]/.test(password))
      errors.add('Must contain at least one uppercase letter');
    if (!/[a-z]/.test(password))
      errors.add('Must contain at least one lowercase letter');
    if (!/\W/.test(password))
      errors.add('Must contain at least one special character');

    return Array.from(errors);
  };

  const password = form.watch('password');
  const passwordErrors = getPasswordErrors(password);
  const isPasswordTouched = form.formState.touchedFields.password;

  const [resetPassword, { isLoading: isResetPasswordLoading }] =
    useResetPasswordMutation();

  const onSubmit = async (data: FormValues) => {
    if (!token) {
      setBackendError('Token is missing');
      return;
    }

    setBackendError(null);
    setSuccessMessage(null);

    try {
      await resetPassword({
        token: token as string,
        body: {
          password: data.password,
        },
      }).unwrap();

      setSuccessMessage('Password reset successful! You can now login');

      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error) {
      const { data } = error as FetchBaseQueryError;

      if (data) {
        setBackendError((data as { message: string }).message);
      } else {
        setBackendError('An unexpected error occurred');
      }
    }
  };

  return (
    <AuthCard
      title="Reset Password"
      subtitle="Enter your new password"
      footerLink="/auth/login"
      footerText="Already have an account?"
      footerLinkText="Sign in"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>

                {!isPasswordTouched && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <Info size={14} />
                    <span>
                      Minimum 10 characters with uppercase, lowercase & symbol
                    </span>
                  </div>
                )}

                {isPasswordTouched && passwordErrors.length > 0 && (
                  <div className="text-sm text-destructive mt-2">
                    {passwordErrors.map((error, index) => (
                      <div key={index}>{error}</div>
                    ))}
                  </div>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Display backend error message */}
          {backendError && <FormMessage>{backendError}</FormMessage>}

          {/* Display success message */}
          {successMessage && (
            <FormMessage className="text-textSuccess">
              {successMessage}
            </FormMessage>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-buttonBg hover:bg-buttonHover text-buttonText"
              disabled={isResetPasswordLoading}
            >
              {isResetPasswordLoading ? 'Loading...' : 'Reset Password'}
            </Button>
          </div>
        </form>
      </Form>
    </AuthCard>
  );
};

export default ResetPasswordForm;
