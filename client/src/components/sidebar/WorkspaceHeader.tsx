'use client';

import { ChevronDown, Settings, UserPlus, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const WorkspaceAvatar = () => {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[--background-tertiary]">
      <span className="text-lg font-semibold text-[--text-primary]">R</span>
    </div>
  );
};

const WorkspaceHeader = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full">
        <div className="flex items-center gap-5 border-y-[1.5px] border-[--border] px-8 py-4 hover:bg-[--background-tertiary] transition-colors">
          <WorkspaceAvatar />
          <div className="flex-1 flex items-center justify-between">
            <h3 className="text-md font-bold tracking-wide text-[--text-primary]">
              Rosa&apos;s TEAM
            </h3>
            <ChevronDown className="h-5 w-5 text-[--text-muted]" />
          </div>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-full bg-[--background-quaternary] border border-[--border] shadow-lg">
        <DropdownMenuItem className="px-6 py-2 hover:bg-[--background-tertiary] flex items-center gap-3">
          <Settings className="h-4 w-4" />
          <span>Workspace Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="px-6 py-2 hover:bg-[--background-tertiary] flex items-center gap-3">
          <UserPlus className="h-4 w-4" />
          <span>Invite People</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="px-6 py-2 hover:bg-[--background-tertiary] flex items-center gap-3">
          <Users className="h-4 w-4" />
          <span>Manage Users</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="px-6 py-2 hover:bg-[--background-tertiary] flex items-center gap-3 border-t border-[--border]">
          <span className="font-medium">Create New Workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WorkspaceHeader;
