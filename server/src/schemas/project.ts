import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters long'),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  workspaceId: z.coerce
    .number()
    .int()
    .positive()
    .refine((val) => val > 0, {
      message: 'Workspace ID must be a positive integer',
    }),
});

export const getAllProjectsSchema = z.object({
  workspaceId: z.coerce
    .number()
    .int()
    .positive()
    .refine((val) => val > 0, {
      message: 'Workspace ID must be a positive integer',
    }),
});

export const getProjectSchema = z.object({
  projectId: z.coerce
    .number()
    .int()
    .positive()
    .refine((val) => val > 0, {
      message: 'Project ID must be a positive integer',
    }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    projectId: z.coerce
      .number()
      .int()
      .positive()
      .refine((val) => val > 0, {
        message: 'Project ID must be a positive integer',
      }),
  }),
  body: z.object({
    name: z
      .string()
      .min(3, 'Project name must be at least 3 characters long')
      .optional(),
    description: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export const deleteProjectSchema = z.object({
  projectId: z.coerce
    .number()
    .int()
    .positive()
    .refine((val) => val > 0, {
      message: 'Project ID must be a positive integer',
    }),
});
