import { Role } from '@prisma/client';
import { z } from 'zod';

// Create workspace schema
export const createWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Workspace name is required').trim(),
    image: z.string().optional(),
  }),
});

// Update workspace schema
export const updateWorkspaceSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid workspace ID'),
  }),
  body: z.object({
    name: z.string().min(1, 'Workspace name is required').trim().optional(),
    image: z.string().optional(),
  }),
});

// Get workspace schema
export const getWorkspaceSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid workspace ID'),
  }),
});

// Delete workspace schema
export const deleteWorkspaceSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid workspace ID'),
  }),
});

// Get all workspaces schema
export const getAllWorkspacesSchema = z.object({
  query: z.object({}).optional(),
});

// Invite workspace member schema
export const inviteWorkspaceMemberSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid workspace ID'),
  }),
  body: z.object({
    email: z.string().email('Invalid email format').trim().toLowerCase(),
    role: z.nativeEnum(Role, {
      errorMap: () => ({ message: 'Role must be either ADMIN or MEMBER' }),
    }),
  }),
});

// Accept workspace invitation schema
export const acceptWorkspaceInvitationSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid workspace ID'),
    token: z.string().min(1, 'Invitation token is required'),
  }),
});

// Get workspace members schema
export const getWorkspaceMembersSchema = z.object({
  params: z.object({
    workspaceId: z.coerce
      .number()
      .int()
      .positive()
      .refine((val) => val > 0, {
        message: 'Workspace ID must be a positive integer',
      }),
  }),
});

// Update member role schema
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

// Remove member schema
export const removeMemberSchema = z.object({
  params: z.object({
    memberId: z.coerce
      .number()
      .int()
      .positive()
      .refine((val) => val > 0, {
        message: 'Member ID must be a positive integer',
      }),
  }),
});

// Search workspace members schema
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
