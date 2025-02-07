import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email format' }),
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
});

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(1, { message: 'Incorrect email or password' }),
});
