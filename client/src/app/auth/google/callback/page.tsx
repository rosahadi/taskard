'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGoogleAuthCallbackMutation } from '@/store/authApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useAppDispatch } from '@/app/redux';
import { useGetMeQuery } from '@/store/userApi';
import { setCredentials } from '@/store/authSlice';
import Link from 'next/link';

export default function GoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refetch: refetchMe } = useGetMeQuery();
  const dispatch = useAppDispatch();
  const [googleAuthCallback] = useGoogleAuthCallbackMutation();
  const [backendError, setBackendError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        if (!code) {
          setBackendError('No authorization code received');
          return;
        }

        await googleAuthCallback(code).unwrap();

        const { data: userData, error } = await refetchMe();

        if (error) throw new Error('Failed to fetch user data');

        if (userData) {
          // Store the complete user data in Redux
          dispatch(setCredentials(userData));

          router.push('/');
        }
      } catch (error) {
        const { data } = error as FetchBaseQueryError;

        if (data) {
          setBackendError((data as { message: string }).message);
        } else {
          setBackendError('An unexpected error occurred');
        }
      }
    };

    handleCallback();
  }, [searchParams, router, googleAuthCallback, dispatch, refetchMe]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[--background-primary]">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">
          {backendError ? 'Authentication Failed' : 'Authenticating...'}
        </h2>
        <p className="text-muted-foreground">
          {backendError
            ? backendError
            : 'Please wait while we complete your sign-in.'}
        </p>

        {backendError && (
          <div className="mt-4">
            <Link href="/auth/signup" className="text-primary hover:underline">
              Sign up for an account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
