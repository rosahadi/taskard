'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVerifyEmailMutation } from '@/store/authApi';
import { useGetMeQuery } from '@/store/userApi';
import { useAppDispatch } from '@/app/redux';
import { setCredentials } from '@/store/authSlice';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AuthCard from './AuthCard';
import { CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

const VerifyEmail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const token = searchParams.get('token');

  const [verifyEmail, { isLoading: isVerifyEmailLoading }] =
    useVerifyEmailMutation();
  const { refetch: refetchMe } = useGetMeQuery();
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isSuccess) return;

    const verifyToken = async () => {
      try {
        if (!token) {
          setError('Verification token is missing');
          return;
        }

        await verifyEmail(token).unwrap();
        const { data: userData, error: userError } = await refetchMe();

        if (userError) throw new Error('Failed to fetch user data');

        if (userData) {
          dispatch(setCredentials(userData));
          setIsSuccess(true);
          setError(null);
        }
      } catch (error) {
        const { data } = error as FetchBaseQueryError;
        setIsSuccess(false);

        if (data) {
          setError((data as { message: string }).message);
        } else {
          setError('An unexpected error occurred');
        }
      }
    };

    verifyToken();
  }, [token, isSuccess, verifyEmail, refetchMe, dispatch]);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Verification token is missing');
        return;
      }

      try {
        await verifyEmail(token).unwrap();

        const { data: userData, error: userError } = await refetchMe();

        if (userError) {
          throw new Error('Failed to fetch user data');
        }

        if (userData) {
          // Store the complete user data in Redux
          dispatch(setCredentials(userData));
          setIsSuccess(true);
        }
      } catch (error) {
        const { data } = error as FetchBaseQueryError;

        if (data) {
          setError((data as { message: string }).message);
        } else {
          setError('An unexpected error occurred');
        }
      }
    };

    verifyToken();
  }, [token, verifyEmail, refetchMe, dispatch, router]);

  if (error) {
    return (
      <AuthCard title="Email Verification Failed">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </AuthCard>
    );
  }

  if (isVerifyEmailLoading) {
    return (
      <AuthCard title="Verifying Your Email">
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-center text-secondary">
            Please wait while we verify your email address...
          </p>
        </div>
      </AuthCard>
    );
  }

  if (isSuccess) {
    return (
      <AuthCard title="Email Verification Complete">
        <div className="flex flex-col items-center space-y-6 py-4">
          {/* Success Icon */}
          <CheckCircle2 className="h-16 w-16 text-success relative" />

          {/* Success Message */}
          <div className="space-y-3 text-center">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              You&apos;re all set!
            </h2>
            <Alert className="bg-[var(--background-secondary)] border-[var(--border)]">
              <AlertDescription className="text-[var(--text-secondary)]">
                Your email has been successfully verified. You can now access
                all features of your account.
              </AlertDescription>
            </Alert>
          </div>

          {/* Action Button */}
          <Link
            href="/"
            className="flex items-center justify-center w-full gap-2 px-5 py-2 rounded-lg bg-[var(--button-bg)] hover:bg-[var(--button-hover)] text-[var(--button-text)] transition-colors duration-200 font-medium"
          >
            Return to Homepage
          </Link>
        </div>
      </AuthCard>
    );
  }

  return null;
};

export default VerifyEmail;
