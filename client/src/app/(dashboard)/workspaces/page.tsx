'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGetAllWorkspacesQuery } from '@/store/workspaceApi';
import { useAppSelector, useAppDispatch } from '@/app/redux';
import { setActiveWorkspace } from '@/store/workspaceSlice';

const WorkspacesPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: workspacesResponse, isLoading } = useGetAllWorkspacesQuery();

  const activeWorkspaceId = useAppSelector(
    (state) => state.workspace.activeWorkspaceId
  );

  useEffect(() => {
    if (isLoading) return;

    const workspaces = workspacesResponse?.data || [];

    // Redirect to active workspace if it exists
    if (activeWorkspaceId) {
      const workspaceExists = workspaces.some(
        (workspace) => workspace.id === activeWorkspaceId
      );

      if (workspaceExists) {
        router.replace(`/workspaces/${activeWorkspaceId}/my-tasks`);
        return;
      }
    }

    // If no active workspace or it doesn't exist, set the first one as active
    if (workspaces.length > 0) {
      const firstWorkspaceId = workspaces[0].id;
      dispatch(setActiveWorkspace(firstWorkspaceId));
      router.replace(`/workspaces/${firstWorkspaceId}/my-tasks`);
    }
  }, [workspacesResponse, isLoading, activeWorkspaceId, dispatch, router]);

  return null;
};

export default WorkspacesPage;
