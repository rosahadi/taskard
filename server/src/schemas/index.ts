import { Role } from '@prisma/client';
import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required'),
  image: z.string().optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required'),
  image: z.string().optional(),
});

export const addMemberSchema = z.object({
  email: z.string().email('Invalid email format'),
  role: z.enum([Role.ADMIN, Role.MEMBER]).default(Role.MEMBER),
});
