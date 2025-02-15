import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface User {
  name: string;
  email: string;
  emailVerified: boolean;
  passwordChangedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users`,
    credentials: 'include',
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getMe: builder.query<User, void>({
      query: () => '/me',
      providesTags: ['User'],
    }),

    updateMe: builder.mutation<User, UpdateUserRequest>({
      query: (data) => ({
        url: '/updateMe',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    deleteMe: builder.mutation<void, void>({
      query: () => ({
        url: '/deleteMe',
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const { useGetMeQuery, useUpdateMeMutation, useDeleteMeMutation } =
  userApi;
