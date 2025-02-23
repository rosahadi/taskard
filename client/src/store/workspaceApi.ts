import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Type definitions
export interface Workspace {
  id: number;
  name: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  owner?: {
    name: string;
    email: string;
  };
  members?: WorkspaceMember[];
}

export interface WorkspaceMember {
  id: number;
  role: Role;
  user: {
    name: string;
    email: string;
    image?: string;
  };
}

export enum Role {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export interface UpdateWorkspaceRequest {
  name?: string;
  image?: string;
}

export interface InviteWorkspaceMemberRequest {
  email: string;
  role: Role;
}

export interface WorkspaceInvite {
  id: number;
  email: string;
  role: Role;
}

export interface WorkspaceMemberDetails extends WorkspaceMember {
  user: {
    name: string;
    email: string;
    image?: string;
  };
}

export interface UpdateMemberRoleRequest {
  role: Role;
}

export const workspaceApi = createApi({
  reducerPath: 'workspaceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/workspaces`,
    credentials: 'include',
  }),
  tagTypes: ['Workspace', 'WorkspaceMembers'],
  endpoints: (builder) => ({
    // Workspace endpoints
    createWorkspace: builder.mutation<
      { status: string; data: Workspace },
      FormData
    >({
      query: (formData) => ({
        url: '/',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Workspace'],
    }),

    getAllWorkspaces: builder.query<
      { status: string; data: Workspace[] },
      void
    >({
      query: () => '/',
      providesTags: ['Workspace'],
    }),

    getWorkspace: builder.query<{ status: string; data: Workspace }, number>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Workspace', id }],
    }),

    updateWorkspace: builder.mutation<
      { status: string; data: Workspace },
      { id: number; body: FormData }
    >({
      query: ({ id, body }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Workspace', id },
        'Workspace',
      ],
    }),

    deleteWorkspace: builder.mutation<void, number>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Workspace'],
    }),

    // Workspace invitation endpoints
    inviteWorkspaceMember: builder.mutation<
      { status: string; message: string; data: WorkspaceInvite },
      { workspaceId: number; body: InviteWorkspaceMemberRequest }
    >({
      query: ({ workspaceId, body }) => ({
        url: `/${workspaceId}/invites`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { workspaceId }) => [
        { type: 'WorkspaceMembers', id: workspaceId },
      ],
    }),

    acceptWorkspaceInvitation: builder.mutation<
      { status: string; message: string },
      { workspaceId: number; token: string }
    >({
      query: ({ workspaceId, token }) => ({
        url: `/${workspaceId}/join/${token}`,
        method: 'GET',
      }),
      invalidatesTags: (result, error, { workspaceId }) => [
        { type: 'Workspace', id: workspaceId },
        'Workspace',
        { type: 'WorkspaceMembers', id: workspaceId },
      ],
    }),

    // Workspace members endpoints
    getWorkspaceMembers: builder.query<
      { status: string; data: WorkspaceMember[] },
      number
    >({
      query: (workspaceId) => `/${workspaceId}/members`,
      providesTags: (result, error, workspaceId) => [
        { type: 'WorkspaceMembers', id: workspaceId },
      ],
    }),

    updateMemberRole: builder.mutation<
      { status: string; data: WorkspaceMember },
      { memberId: number; role: Role; workspaceId: number }
    >({
      query: ({ memberId, role }) => ({
        url: `/members/${memberId}`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: (result, error, { workspaceId }) => [
        { type: 'WorkspaceMembers', id: workspaceId },
        { type: 'Workspace', id: workspaceId },
      ],
    }),

    removeMember: builder.mutation<
      void,
      { memberId: number; workspaceId: number }
    >({
      query: ({ memberId }) => ({
        url: `/members/${memberId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { workspaceId }) => [
        { type: 'WorkspaceMembers', id: workspaceId },
        { type: 'Workspace', id: workspaceId },
      ],
    }),
  }),
});

export const {
  useCreateWorkspaceMutation,
  useGetAllWorkspacesQuery,
  useGetWorkspaceQuery,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useInviteWorkspaceMemberMutation,
  useAcceptWorkspaceInvitationMutation,
  useGetWorkspaceMembersQuery,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
} = workspaceApi;
