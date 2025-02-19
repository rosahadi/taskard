import { Role } from '@prisma/client';
import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required').trim(),
  image: z.string().optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required').trim(),
  image: z.string().optional(),
});

export const inviteWorkspaceMemberSchema = z.object({
  email: z.string().email('Invalid email format').trim().toLowerCase(),
  role: z.nativeEnum(Role, {
    errorMap: () => ({ message: 'Role must be either ADMIN or MEMBER' }),
  }),
});
