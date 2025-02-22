'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/redux';
import { setActiveWorkspace } from '@/store/workspaceSlice';
import { useGetAllWorkspacesQuery, Workspace } from '@/store/workspaceApi';
import CreateWorkspaceModal from './CreateWorkspaceModal';
import WorkspaceSettingsModal from './WorkspaceSettingsModal';
import InvitePeopleModal from './InvitePeopleModal';
import WorkspaceDropdown from './WorkspaceDropdown';

const WorkspaceHeader = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // API Hooks
  const { data: workspacesResponse, isLoading } = useGetAllWorkspacesQuery();

  // Get active workspace from Redux store
  const activeWorkspaceId = useAppSelector(
    (state) => state.workspace.activeWorkspaceId
  );

  const workspaces = workspacesResponse?.data || [];
  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) || null;

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // Handle workspace selection
  const handleWorkspaceSelect = (workspace: Workspace) => {
    dispatch(setActiveWorkspace(workspace.id));
    router.push(`/workspaces/${workspace.id}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-5 border-y-[1.5px] border-[--border] px-8 py-4">
        <div className="h-10 w-10 animate-pulse rounded-lg bg-[--background-tertiary]" />
        <div className="h-5 w-40 animate-pulse rounded bg-[--background-tertiary]" />
      </div>
    );
  }

  // Get non-active workspaces for dropdown
  const otherWorkspaces = workspaces.filter(
    (workspace) => workspace.id !== activeWorkspace?.id
  );

  return (
    <>
      <WorkspaceDropdown
        activeWorkspace={activeWorkspace}
        otherWorkspaces={otherWorkspaces}
        handleWorkspaceSelect={handleWorkspaceSelect}
        handleWorkspaceSettings={() => setSettingsModalOpen(true)}
        handleInvitePeople={() => setInviteModalOpen(true)}
        handleManageUsers={() =>
          router.push(`/workspaces/${activeWorkspace?.id}/members`)
        }
        handleCreateWorkspaceClick={() => setCreateModalOpen(true)}
      />

      <CreateWorkspaceModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      <WorkspaceSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        workspaceId={activeWorkspaceId}
      />

      <InvitePeopleModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        workspaceId={activeWorkspaceId}
      />
    </>
  );
};

export default WorkspaceHeader;
