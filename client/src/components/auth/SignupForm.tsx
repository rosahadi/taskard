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
import SocialAuth from './SocialAuth';
import AuthCard from './AuthCard';
import { signupSchema } from '@/schemas/auth';
import { Info } from 'lucide-react';
import { useSignupMutation } from '@/store/authApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

type FormValues = z.infer<typeof signupSchema>;

const SignUpForm = () => {
  const [signup, { isLoading, error: signupError }] = useSignupMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const [backendError, setBackendError] = useState<string | null>(null);
  const [backendMessage, setBackendMessage] = useState<string | null>(null);

  const getPasswordErrors = (password: string) => {
    const errors: Set<string> = new Set();

    if (password.length < 10) errors.add('Must be at least 10 characters long');
    if (!/[A-Z]/.test(password))
      errors.add('Must contain at least one uppercase letter');
    if (!/[a-z]/.test(password))
      errors.add('Must contain at least one lowercase letter');
    if (!/[\W_]/.test(password))
      errors.add('Must contain at least one special character');

    return Array.from(errors);
  };

  const password = form.watch('password');
  const passwordErrors = getPasswordErrors(password);
  const isPasswordTouched = form.formState.touchedFields.password;

  const onSubmit = async (data: FormValues) => {
    setBackendError(null);
    setBackendMessage(null);

    try {
      const response = await signup(data).unwrap();
      if (response) {
        setBackendMessage(
          'A verification email has been sent. Please check your inbox.'
        );
      }
    } catch {
      if (signupError && 'data' in signupError) {
        const { data } = signupError as FetchBaseQueryError;

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
      title="Create Account"
      subtitle="Sign up to get started"
      footerLink="/auth/login"
      footerText="Already have an account?"
      footerLinkText="Sign in"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Input Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email Input Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Input Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>

                {/* Show info message when password field is untouched */}
                {!isPasswordTouched && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <Info size={14} />
                    <span>
                      Minimum 10 characters with uppercase, lowercase & symbol
                    </span>
                  </div>
                )}

                {/* Show all password errors when they exist and field is touched */}
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

          {/* Confirm Password Input Field */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Display backend error message */}
          {backendError && <FormMessage>{backendError}</FormMessage>}

          {/* BackendMessage */}
          {backendMessage && (
            <FormMessage className="text-info">{backendMessage}</FormMessage>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-buttonBg hover:bg-buttonHover text-buttonText"
              disabled={isLoading}
            >
              {isLoading ? 'Signing up...' : 'Sign up'}
            </Button>
          </div>

          <SocialAuth />
        </form>
      </Form>
    </AuthCard>
  );
};

export default SignUpForm;
