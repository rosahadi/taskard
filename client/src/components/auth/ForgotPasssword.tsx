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
import { forgotPasswordSchema } from '@/schemas/auth';
import { useForgotPasswordMutation } from '@/store/authApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

type FormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const [forgotPassword, { isLoading, error }] = useForgotPasswordMutation();
  const [backendError, setBackendError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setBackendError(null);
    setSuccessMessage(null);
    try {
      const response = await forgotPassword(data).unwrap();
      setSuccessMessage(response.message);
    } catch {
      if (error && 'data' in error) {
        const { data } = error as FetchBaseQueryError;
        if (data) {
          setBackendError((data as { message: string }).message);
        } else {
          setBackendError('An unexpected error occurred');
        }
      }
    }
  };

  return (
    <AuthCard
      title="Forgot Password"
      subtitle="Enter your email to reset your password"
      footerLink="/auth/login"
      footerText="Remember your password?"
      footerLinkText="Sign in"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Success Message */}
          {successMessage && (
            <FormMessage className="text-textSuccess">
              {successMessage}
            </FormMessage>
          )}

          {/* Backend Error Message */}
          {backendError && <FormMessage>{backendError}</FormMessage>}

          <Button
            type="submit"
            className="w-full bg-buttonBg hover:bg-buttonHover text-buttonText"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
};

export default ForgotPassword;
