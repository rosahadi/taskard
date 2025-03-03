import { z } from 'zod';

// Signup schema
export const signupSchema = z.object({
  body: z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    email: z
      .string()
      .email({ message: 'Invalid email format' })
      .trim()
      .toLowerCase(),
    password: z
      .string()
      .min(10, { message: 'Password must be at least 10 characters long' })
      .regex(/[A-Z]/, {
        message: 'Password must contain at least one uppercase letter',
      })
      .regex(/[a-z]/, {
        message: 'Password must contain at least one lowercase letter',
      })
      .regex(/[\W_]/, {
        message: 'Password must contain at least one special character',
      }),
  }),
});

// Login schema
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email({ message: 'Invalid email format' })
      .trim()
      .toLowerCase(),
    password: z.string().min(1, { message: 'Incorrect email or password' }),
  }),
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email({ message: 'Invalid email format' })
      .trim()
      .toLowerCase(),
  }),
});

// Reset password schema
export const resetPasswordSchema = z.object({
  params: z.object({
    token: z.string().min(1, { message: 'Token is required' }),
  }),
  body: z.object({
    password: z
      .string()
      .min(10, { message: 'Password must be at least 10 characters long' })
      .regex(/[A-Z]/, {
        message: 'Password must contain at least one uppercase letter',
      })
      .regex(/[a-z]/, {
        message: 'Password must contain at least one lowercase letter',
      })
      .regex(/[\W_]/, {
        message: 'Password must contain at least one special character',
      }),
  }),
});

// Update password schema
export const updatePasswordSchema = z.object({
  body: z.object({
    currentPassword: z
      .string()
      .min(1, { message: 'Current password is required' }),
    password: z
      .string()
      .min(10, { message: 'Password must be at least 10 characters long' })
      .regex(/[A-Z]/, {
        message: 'Password must contain at least one uppercase letter',
      })
      .regex(/[a-z]/, {
        message: 'Password must contain at least one lowercase letter',
      })
      .regex(/[\W_]/, {
        message: 'Password must contain at least one special character',
      }),
  }),
});

// Verify email schema
export const verifyEmailSchema = z.object({
  params: z.object({
    token: z.string().min(1, { message: 'Verification token is required' }),
  }),
});
