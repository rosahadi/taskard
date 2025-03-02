import { Priority, TaskStatus } from '@prisma/client';
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

export const getAllTasksSchema = z.object({
  projectId: z.coerce
    .number()
    .int()
    .positive()
    .refine((val) => val > 0, {
      message: 'Project ID must be a positive integer',
    }),
});

export const getTaskSchema = z.object({
  taskId: z.coerce
    .number()
    .int()
    .positive()
    .refine((val) => val > 0, {
      message: 'Task ID must be a positive integer',
    }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    taskId: z.coerce
      .number()
      .int()
      .positive()
      .refine((val) => val > 0, {
        message: 'Task ID must be a positive integer',
      }),
  }),
  body: z.object({
    title: z.string().min(1, 'Task title is required').optional(),
    description: z.string().optional(),
    status: TaskStatusEnum.optional(),
    priority: PriorityEnum.optional(),
    tags: z.array(z.string()).optional(),
    startDate: z.string().optional(),
    dueDate: z.string().optional(),
    points: z.number().int().positive().optional(),
    parentTaskId: z.number().int().positive().optional().nullable(),
    assigneeIds: z.array(z.number().int().positive()).optional(),
  }),
});

export const deleteTaskSchema = z.object({
  taskId: z.coerce
    .number()
    .int()
    .positive()
    .refine((val) => val > 0, {
      message: 'Task ID must be a positive integer',
    }),
});

export const searchTasksSchema = z.object({
  projectId: z.coerce
    .number()
    .int()
    .positive()
    .refine((val) => val > 0, {
      message: 'Project ID must be a positive integer',
    }),
  searchTerm: z.string().optional(),
  status: z
    .string()
    .optional()
    .refine(
      (val) => !val || Object.values(TaskStatus).includes(val as TaskStatus),
      {
        message: 'Invalid task status',
      }
    ),
  priority: z
    .string()
    .optional()
    .refine(
      (val) => !val || Object.values(Priority).includes(val as Priority),
      {
        message: 'Invalid priority level',
      }
    ),
});

export const assignTaskSchema = z.object({
  taskId: z.number().int().positive(),
  userId: z.number().int().positive(),
});

export const unassignTaskSchema = z.object({
  taskId: z.number().int().positive(),
  userId: z.number().int().positive(),
});

export const addCommentSchema = z.object({
  taskId: z.number().int().positive(),
  content: z.string().min(1, 'Comment content is required'),
});

export const deleteCommentSchema = z.object({
  commentId: z.coerce
    .number()
    .int()
    .positive()
    .refine((val) => val > 0, {
      message: 'Comment ID must be a positive integer',
    }),
});

export const getTaskCommentsSchema = z.object({
  taskId: z.coerce
    .number()
    .int()
    .positive()
    .refine((val) => val > 0, {
      message: 'Task ID must be a positive integer',
    }),
});
