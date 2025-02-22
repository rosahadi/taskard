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
import SocialAuth from './SocialAuth';
import { loginSchema } from '@/schemas/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/app/redux';
import { useLoginMutation } from '@/store/authApi';
import { useGetMeQuery } from '@/store/userApi';
import { setCredentials } from '@/store/authSlice';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

type FormValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading: isLoginLoading, error: loginError }] =
    useLoginMutation();
  const { refetch: refetchMe } = useGetMeQuery();

  const form = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const [backendError, setBackendError] = useState<string | null>(null);

  const onSubmit = async (data: FormValues) => {
    setBackendError(null);
    try {
      await login(data).unwrap();

      const { data: userData, error } = await refetchMe();

      if (error) throw new Error('Failed to fetch user data');

      if (userData) {
        // Store the complete user data in Redux
        dispatch(setCredentials(userData));

        router.push('/');
      }
    } catch {
      if (loginError && 'data' in loginError) {
        const { data } = loginError as FetchBaseQueryError;

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
      title="Welcome Back"
      subtitle="Please login in to continue to your account"
      footerLink="/auth/signup"
      footerText="Don't have an account?"
      footerLinkText="Sign up"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-start">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Display backend error message */}
          {backendError && <FormMessage>{backendError}</FormMessage>}

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-buttonBg hover:bg-buttonHover text-buttonText"
              disabled={isLoginLoading}
            >
              {isLoginLoading ? 'Loading...' : 'Log in'}
            </Button>
          </div>

          <SocialAuth />
        </form>
      </Form>
    </AuthCard>
  );
};

export default LoginForm;
