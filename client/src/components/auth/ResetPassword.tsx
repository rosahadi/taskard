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
import { resetPasswordSchema } from '@/schemas/auth';
import { Info } from 'lucide-react';

type FormValues = z.infer<typeof resetPasswordSchema>;

const ResetPasswordForm = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      currentPassword: '',
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

  const onSubmit = (data: FormValues) => {
    console.log(data);
  };

  return (
    <AuthCard title="Reset Password" subtitle="Enter your new password">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
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

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-buttonBg hover:bg-buttonHover text-buttonText"
            >
              Reset Password
            </Button>
          </div>
        </form>
      </Form>
    </AuthCard>
  );
};

export default ResetPasswordForm;
