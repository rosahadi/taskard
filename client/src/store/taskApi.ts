import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  tags: string[];
  startDate?: string;
  dueDate?: string;
  points?: number;
  projectId: number;
  createdAt: string;
  updatedAt: string;
  creatorId?: number;
  parentTaskId?: number;
  assignees?: TaskAssignee[];
  comments?: TaskComment[];
}

export interface TaskAssignee {
  id: number;
  userId: number;
  user: {
    id: number;
    name: string;
    email: string;
    image?: string;
  };
}

export interface TaskComment {
  id: number;
  content: string;
  taskId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE',
  CANCELED = 'CANCELED',
}

export enum Priority {
  URGENT = 'URGENT',
  HIGH = 'HIGH',
  NORMAL = 'NORMAL',
  LOW = 'LOW',
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  tags?: string[];
  startDate?: string;
  dueDate?: string;
  points?: number;
  projectId: number;
  parentTaskId?: number;
  assigneeIds?: number[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  tags?: string[];
  startDate?: string;
  dueDate?: string;
  points?: number;
  parentTaskId?: number | null;
  assigneeIds?: number[];
}

export interface AssignTaskRequest {
  taskId: number;
  userId: number;
}

export interface UnassignTaskRequest {
  taskId: number;
  userId: number;
}

export interface AddCommentRequest {
  taskId: number;
  content: string;
}

export interface SearchTasksParams {
  projectId: number;
  searchTerm?: string;
  status?: string;
  priority?: string;
}

export const taskApi = createApi({
  reducerPath: 'taskApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/tasks`,
    credentials: 'include',
  }),
  tagTypes: ['Task', 'Tasks', 'TaskComments'],
  endpoints: (builder) => ({
    // Task CRUD operations
    createTask: builder.mutation<
      { status: string; data: Task },
      CreateTaskRequest
    >({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Tasks'],
    }),

    updateTask: builder.mutation<
      { status: string; data: Task },
      { id: number; body: UpdateTaskRequest }
    >({
      query: ({ id, body }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Task', id },
        'Tasks',
      ],
    }),

    deleteTask: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tasks'],
    }),

    // Task assignments
    assignTask: builder.mutation<
      { status: string; data: TaskAssignee },
      AssignTaskRequest
    >({
      query: (body) => ({
        url: '/assign',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: 'Task', id: taskId },
        'Tasks',
      ],
    }),

    unassignTask: builder.mutation<void, UnassignTaskRequest>({
      query: (body) => ({
        url: '/unassign',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: 'Task', id: taskId },
        'Tasks',
      ],
    }),

    // Task comments
    addComment: builder.mutation<
      { status: string; data: TaskComment },
      AddCommentRequest
    >({
      query: (body) => ({
        url: '/comment',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: 'TaskComments', id: taskId },
      ],
    }),

    getTaskComments: builder.query<
      { status: string; data: TaskComment[] },
      number
    >({
      query: (taskId) => `/${taskId}/comments`,
      providesTags: (result, error, taskId) => [
        { type: 'TaskComments', id: taskId },
      ],
    }),

    deleteComment: builder.mutation<void, number>({
      query: (commentId) => ({
        url: `/comment/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, commentId) => [
        { type: 'TaskComments', id: commentId },
      ],
    }),

    searchTasks: builder.query<
      { status: string; data: Task[] },
      SearchTasksParams
    >({
      query: ({ projectId, searchTerm = '', status = '', priority = '' }) => ({
        url: '/search',
        params: {
          projectId,
          searchTerm,
          status,
          priority,
          taskId: 0,
        },
      }),
      providesTags: ['Tasks', 'Task'],
    }),
  }),
});

export const {
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useAssignTaskMutation,
  useUnassignTaskMutation,
  useAddCommentMutation,
  useGetTaskCommentsQuery,
  useDeleteCommentMutation,
  useSearchTasksQuery,
} = taskApi;
