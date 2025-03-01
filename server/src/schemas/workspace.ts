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

export const getWorkspaceMembersSchema = z.object({
  workspaceId: z.coerce
    .number()
    .int()
    .positive()
    .refine((val) => val > 0, {
      message: 'Workspace ID must be a positive integer',
    }),
});

export const updateMemberRoleSchema = z.object({
  params: z.object({
    memberId: z.coerce
      .number()
      .int()
      .positive()
      .refine((val) => val > 0, {
        message: 'Member ID must be a positive integer',
      }),
  }),
  body: z.object({
    role: z.enum(['ADMIN', 'MEMBER']),
  }),
});

export const removeMemberSchema = z.object({
  memberId: z.coerce
    .number()
    .int()
    .positive()
    .refine((val) => val > 0, {
      message: 'Member ID must be a positive integer',
    }),
});

export const searchWorkspaceMembersSchema = z.object({
  params: z.object({
    workspaceId: z.coerce
      .number()
      .int()
      .positive()
      .refine((val) => val > 0, {
        message: 'Workspace ID must be a positive integer',
      }),
  }),
  query: z.object({
    query: z.string().min(1, 'Search query is required').trim(),
  }),
});
