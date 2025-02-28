'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAcceptWorkspaceInvitationMutation } from '@/store/workspaceApi';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch } from '@/app/redux';
import { setActiveWorkspace } from '@/store/workspaceSlice';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Loader2 } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

const WorkspaceInvitationPage = ({ params }: PageProps) => {
  const { id: workspaceId } = use(params);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const [acceptInvitation, { isLoading }] =
    useAcceptWorkspaceInvitationMutation();

  const token = searchParams.get('token');

  useEffect(() => {
    const handleInvitation = async () => {
      if (!token) {
        setError('Invalid invitation link');
        return;
      }

      try {
        const result = await acceptInvitation({
          workspaceId: parseInt(workspaceId),
          token,
        }).unwrap();

        if (result.status === 'success') {
          dispatch(setActiveWorkspace(parseInt(workspaceId)));

          toast({
            title: 'Success',
            description:
              result.message || 'You have successfully joined the workspace',
          });

          router.push(`/workspaces/${workspaceId}`);
        } else {
          throw new Error('Failed to accept invitation');
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

    handleInvitation();
  }, [token, workspaceId, acceptInvitation, router, toast, dispatch]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md bg-cardBg">
        {error ? (
          <>
            <CardHeader>
              <CardTitle className="text-textPrimary text-lg">
                Invitation Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-textSecondary">{error}</p>
            </CardContent>
          </>
        ) : isLoading ? (
          <>
            <CardHeader>
              <CardTitle className="text-textPrimary text-lg">
                Joining Workspace...
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-textSecondary">
                Please wait while we process your invitation.
              </p>
            </CardContent>
          </>
        ) : null}
      </Card>
    </div>
  );
};

export default WorkspaceInvitationPage;
