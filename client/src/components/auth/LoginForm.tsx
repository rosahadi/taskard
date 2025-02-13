'use client';

import React from 'react';
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

type FormValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log(data);
  };

  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Please login in to continue to your account"
      footerLink="/signup"
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
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-buttonBg hover:bg-buttonHover text-buttonText"
            >
              Sign in
            </Button>
          </div>

          <SocialAuth />
        </form>
      </Form>
    </AuthCard>
  );
};

export default LoginForm;
