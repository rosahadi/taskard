import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Task } from './taskApi';

export interface Project {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  workspaceId: number;
  creatorId: number;
  creator?: {
    name: string;
    email: string;
  };
  workspace?: {
    name: string;
  };
  tasks?: Task[];
}

export interface TaskAssignee {
  id: number;
  user: {
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

export interface CreateProjectRequest {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  workspaceId: number;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export const projectApi = createApi({
  reducerPath: 'projectApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/projects`,
    credentials: 'include',
  }),
  tagTypes: ['Project', 'Projects'],
  endpoints: (builder) => ({
    createProject: builder.mutation<
      { status: string; data: Project },
      CreateProjectRequest
    >({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Projects'],
    }),

    getAllProjects: builder.query<
      { status: string; data: Project[] },
      { workspaceId: number }
    >({
      query: ({ workspaceId }) => `/workspace/${workspaceId}`,
      providesTags: (result, error, { workspaceId }) => [
        { type: 'Projects', id: workspaceId },
      ],
    }),

    getProject: builder.query<{ status: string; data: Project }, number>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Project', id }],
    }),

    updateProject: builder.mutation<
      { status: string; data: Project },
      { id: number; body: UpdateProjectRequest }
    >({
      query: ({ id, body }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Project', id },
        'Projects',
      ],
    }),

    deleteProject: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Projects'],
    }),
  }),
});

export const {
  useCreateProjectMutation,
  useGetAllProjectsQuery,
  useGetProjectQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectApi;
