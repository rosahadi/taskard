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
import { forgotPasswordSchema } from '@/schemas/auth';

type FormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (data: unknown) => {
    console.log(data);
  };

  return (
    <AuthCard
      title="Forgot Password"
      subtitle="Enter your email to reset your password"
      footerLink="/login"
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
          <Button
            type="submit"
            className="w-full bg-buttonBg hover:bg-buttonHover text-buttonText"
          >
            Send Reset Link
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
};

export default ForgotPassword;
