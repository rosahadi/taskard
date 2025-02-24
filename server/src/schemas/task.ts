import { z } from 'zod';

const TaskStatusEnum = z.enum([
  'TODO',
  'IN_PROGRESS',
  'REVIEW',
  'DONE',
  'CANCELED',
]);
const PriorityEnum = z.enum(['URGENT', 'HIGH', 'NORMAL', 'LOW']);

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  status: TaskStatusEnum.optional(),
  priority: PriorityEnum.optional(),
  tags: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  points: z.number().int().positive().optional(),
  projectId: z.number().int().positive(),
  parentTaskId: z.number().int().positive().optional(),
  assigneeIds: z.array(z.number().int().positive()).optional(),
});
