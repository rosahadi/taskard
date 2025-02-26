import { z } from 'zod';

export const projectFormSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters long'),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
