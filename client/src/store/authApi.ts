import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  currentPassword: string;
  password: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  password: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users`,
    credentials: 'include',
  }),
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    signup: builder.mutation<AuthUser, SignupCredentials>({
      query: (credentials) => ({
        url: '/signup',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    login: builder.mutation<AuthUser, LoginCredentials>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),

    getCurrentUser: builder.query<AuthUser, void>({
      query: () => '/me',
      providesTags: ['Auth'],
    }),

    forgotPassword: builder.mutation<
      { message: string },
      ForgotPasswordRequest
    >({
      query: (body) => ({
        url: '/forgot-password',
        method: 'POST',
        body,
      }),
    }),

    resetPassword: builder.mutation<
      { message: string },
      { token: string; body: ResetPasswordRequest }
    >({
      query: ({ token, body }) => ({
        url: `/reset-password/${token}`,
        method: 'PATCH',
        body,
      }),
    }),

    updatePassword: builder.mutation<
      { message: string },
      UpdatePasswordRequest
    >({
      query: (body) => ({
        url: '/updateMyPassword',
        method: 'PATCH',
        body,
      }),
    }),

    verifyEmail: builder.mutation<{ message: string }, string>({
      query: (token) => ({
        url: `/verify-email/${token}`,
        method: 'GET',
      }),
      invalidatesTags: ['Auth'],
    }),

    googleAuth: builder.mutation<AuthUser, void>({
      query: () => ({
        url: '/auth/google',
        method: 'GET',
        credentials: 'include',
      }),
      invalidatesTags: ['Auth'],
    }),

    googleAuthCallback: builder.mutation<AuthUser, string>({
      query: (code) => ({
        url: `/auth/google/callback?code=${code}`,
        method: 'GET',
        credentials: 'include',
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const {
  useSignupMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useUpdatePasswordMutation,
  useVerifyEmailMutation,
  useGoogleAuthMutation,
  useGoogleAuthCallbackMutation,
} = authApi;
