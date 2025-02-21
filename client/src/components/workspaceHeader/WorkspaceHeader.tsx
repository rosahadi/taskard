'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/redux';
import { setActiveWorkspace } from '@/store/workspaceSlice';
import {
  useGetAllWorkspacesQuery,
  useInviteWorkspaceMemberMutation,
  Workspace,
  Role,
} from '@/store/workspaceApi';
import CreateWorkspaceModal from './CreateWorkspaceModal';
import WorkspaceSettingsModal from './WorkspaceSettingsModal';
import InvitePeopleModal from './InvitePeopleModal';
import WorkspaceDropdown from './WorkspaceDropdown';
import { useToast } from '@/hooks/use-toast';

const WorkspaceHeader = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  // API Hooks
  const { data: workspacesResponse, isLoading } = useGetAllWorkspacesQuery();
  const [inviteWorkspaceMember, { isLoading: isInviting }] =
    useInviteWorkspaceMemberMutation();

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

  // Form states for other modals
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>(Role.MEMBER);

  // Handle workspace selection
  const handleWorkspaceSelect = (workspace: Workspace) => {
    dispatch(setActiveWorkspace(workspace.id));
    router.push(`/workspaces/${workspace.id}`);
  };

  // Handle member invitation
  const handleInviteMember = async () => {
    if (!activeWorkspace) return;
    if (!inviteEmail.trim()) return;

    try {
      await inviteWorkspaceMember({
        workspaceId: activeWorkspace.id,
        body: {
          email: inviteEmail.trim(),
          role: inviteRole,
        },
      }).unwrap();

      toast({
        title: 'Invitation Sent',
        description: `Invitation sent to ${inviteEmail.trim()}`,
      });
      setInviteEmail('');
      setInviteModalOpen(false);
    } catch (error) {
      console.error('Failed to invite:', error);
      toast({
        title: 'Error',
        description: 'Failed to send invitation. Please try again.',
        variant: 'destructive',
      });
    }
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
        onSubmit={handleInviteMember}
        inviteEmail={inviteEmail}
        setInviteEmail={setInviteEmail}
        isInviting={isInviting}
        inviteRole={inviteRole}
        setInviteRole={setInviteRole}
      />
    </>
  );
};

export default WorkspaceHeader;
