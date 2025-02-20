'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/redux';
import { setActiveWorkspace } from '@/store/workspaceSlice';
import {
  useGetAllWorkspacesQuery,
  useCreateWorkspaceMutation,
  useUpdateWorkspaceMutation,
  useInviteWorkspaceMemberMutation,
  Workspace,
  Role,
} from '@/store/workspaceApi';
import CreateWorkspaceModal from './CreateWorkspaceModal';
import WorkspaceSettingsModal from './WorkspaceSettingsModal';
import InvitePeopleModal from './InvitePeopleModal';
import WorkspaceDropdown from './WorkspaceDropdown';

const WorkspaceHeader = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // API Hooks
  const { data: workspacesResponse, isLoading } = useGetAllWorkspacesQuery();
  const [createWorkspace, { isLoading: isCreating }] =
    useCreateWorkspaceMutation();
  const [updateWorkspace, { isLoading: isUpdating }] =
    useUpdateWorkspaceMutation();
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

  // Form states
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceImage, setWorkspaceImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>(Role.MEMBER);

  // Handle workspace selection
  const handleWorkspaceSelect = (workspace: Workspace) => {
    dispatch(setActiveWorkspace(workspace.id));
    router.push(`/workspaces/${workspace.id}`);
  };

  // Handle workspace creation
  const handleCreateWorkspace = async () => {
    try {
      const result = await createWorkspace({
        name: workspaceName.trim(),
        image: workspaceImage || undefined,
      }).unwrap();

      if (result.data) {
        dispatch(setActiveWorkspace(result.data.id));
        router.push(`/workspaces/${result.data.id}`);
      }

      // Reset form
      setWorkspaceName('');
      setWorkspaceImage(null);
      setImagePreview(null);
      setCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create workspace:', error);
    }
  };

  // Handle workspace update
  const handleUpdateWorkspace = async () => {
    if (!activeWorkspace) return;

    try {
      await updateWorkspace({
        id: activeWorkspace.id,
        body: {
          name: workspaceName.trim(),
          image: workspaceImage || undefined,
        },
      }).unwrap();

      setSettingsModalOpen(false);
    } catch (error) {
      console.error('Failed to update workspace:', error);
    }
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

      setInviteEmail('');
      setInviteModalOpen(false);
    } catch (error) {
      console.error('Failed to invite:', error);
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
        onSubmit={handleCreateWorkspace}
        workspaceName={workspaceName}
        setWorkspaceName={setWorkspaceName}
        workspaceImage={workspaceImage}
        setWorkspaceImage={setWorkspaceImage}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        isCreating={isCreating}
      />

      <WorkspaceSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        onSubmit={handleUpdateWorkspace}
        workspaceName={workspaceName}
        setWorkspaceName={setWorkspaceName}
        workspaceImage={workspaceImage}
        setWorkspaceImage={setWorkspaceImage}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        isUpdating={isUpdating}
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
