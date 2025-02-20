import { Workspace } from '@/store/workspaceApi';
import WorkspaceAvatar from './WorkspaceAvatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import { ChevronDown, Plus, Settings, UserPlus, Users } from 'lucide-react';

const WorkspaceDropdown = ({
  activeWorkspace,
  otherWorkspaces,
  handleWorkspaceSelect,
  handleWorkspaceSettings,
  handleInvitePeople,
  handleManageUsers,
  handleCreateWorkspaceClick,
}: {
  activeWorkspace: Workspace | null;
  otherWorkspaces: Workspace[];
  handleWorkspaceSelect: (workspace: Workspace) => void;
  handleWorkspaceSettings: () => void;
  handleInvitePeople: () => void;
  handleManageUsers: () => void;
  handleCreateWorkspaceClick: () => void;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full">
        <div className="flex items-center gap-5 border-y-[1.5px] border-[--border] px-8 py-4 hover:bg-[--background-tertiary] transition-colors">
          {activeWorkspace ? (
            <>
              <WorkspaceAvatar
                name={activeWorkspace.name}
                image={activeWorkspace.image}
              />
              <div className="flex-1 flex items-center justify-between">
                <h3 className="text-md font-bold tracking-wide text-[--text-primary]">
                  {activeWorkspace.name}
                </h3>
                <ChevronDown className="h-5 w-5 text-[--text-muted]" />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-between">
              <h3 className="text-md font-bold tracking-wide text-[--text-primary]">
                Select a Workspace
              </h3>
              <ChevronDown className="h-5 w-5 text-[--text-muted]" />
            </div>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-full bg-[--background-quaternary] border border-[--border] shadow-lg z-50">
        {activeWorkspace && (
          <>
            <div className="px-6 py-2 text-sm text-[--text-muted]">
              Workspace Settings
            </div>
            <DropdownMenuItem
              className="px-6 py-2 hover:bg-[--background-tertiary] flex items-center gap-3"
              onClick={handleWorkspaceSettings}
            >
              <Settings className="h-4 w-4" />
              <span>Workspace Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="px-6 py-2 hover:bg-[--background-tertiary] flex items-center gap-3"
              onClick={handleInvitePeople}
            >
              <UserPlus className="h-4 w-4" />
              <span>Invite People</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="px-6 py-2 hover:bg-[--background-tertiary] flex items-center gap-3"
              onClick={handleManageUsers}
            >
              <Users className="h-4 w-4" />
              <span>Manage Users</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[--border]" />
          </>
        )}

        {otherWorkspaces.length > 0 && (
          <>
            <div className="px-6 py-2 text-sm text-[--text-muted]">
              Switch Workspaces
            </div>
            {otherWorkspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace.id}
                className="px-6 py-2 hover:bg-[--background-tertiary] flex items-center gap-3"
                onClick={() => handleWorkspaceSelect(workspace)}
              >
                <WorkspaceAvatar
                  name={workspace.name}
                  image={workspace.image}
                />
                <span>{workspace.name}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-[--border]" />
          </>
        )}

        <DropdownMenuItem
          className="px-6 py-2 hover:bg-[--background-tertiary] flex items-center gap-3"
          onClick={handleCreateWorkspaceClick}
        >
          <Plus className="h-4 w-4" />
          <span className="font-medium">Create New Workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WorkspaceDropdown;
