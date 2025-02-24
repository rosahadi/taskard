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

export const updateProjectSchema = createProjectSchema.partial();
