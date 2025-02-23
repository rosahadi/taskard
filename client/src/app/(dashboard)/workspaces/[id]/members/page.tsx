'use client';

import { use, useEffect, useState } from 'react';
import { MoreVerticalIcon } from 'lucide-react';
import { useDispatch } from 'react-redux';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  clearActiveWorkspace,
  setActiveWorkspace,
} from '@/store/workspaceSlice';
import {
  Role,
  useGetWorkspaceMembersQuery,
  useRemoveMemberMutation,
  useUpdateMemberRoleMutation,
} from '@/store/workspaceApi';
import { useToast } from '@/hooks/use-toast';

interface PageProps {
  params: Promise<{ id: string }>;
}

const WorkspaceMembersPage = ({ params }: PageProps) => {
  const { id } = use(params);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const workspaceId = parseInt(id);

  // Set active workspace
  useEffect(() => {
    dispatch(setActiveWorkspace(workspaceId));
    return () => {
      dispatch(clearActiveWorkspace());
    };
  }, [dispatch, workspaceId]);

  // RTK Query hooks
  const {
    data: membersData,
    isLoading,
    error,
  } = useGetWorkspaceMembersQuery(workspaceId);
  const [updateRole] = useUpdateMemberRoleMutation();
  const [removeMember] = useRemoveMemberMutation();

  // Local state for delete confirmation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // Handle role update
  const handleRoleUpdate = async (memberId: number, role: Role) => {
    try {
      await updateRole({ memberId, role, workspaceId }).unwrap();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update member role',
        variant: 'destructive',
      });
    }
  };

  // Handle member removal
  const handleRemoveMember = async () => {
    if (!memberToDelete) return;

    try {
      await removeMember({
        memberId: memberToDelete.id,
        workspaceId: workspaceId,
      }).unwrap();
      setShowDeleteDialog(false);
      setMemberToDelete(null);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to remove member',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading members...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-textError">Failed to load members</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-4xl mx-auto bg-[--background-secondary] border-[--border]">
        <CardContent className="p-6">
          {membersData?.data.map((member, index) => (
            <div key={member.id}>
              <div className="flex items-center gap-4 py-3 hover:bg-[--background-tertiary] rounded-lg transition-colors duration-200">
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="h-10 w-10">
                    {member.user.image ? (
                      <AvatarImage
                        src={member.user.image}
                        alt={member.user.name}
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <AvatarFallback className="bg-[--background-quaternary] text-[--text-primary]">
                        {member.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <div className="font-medium text-[--text-primary]">
                      {member.user.name}
                      {member.role === Role.ADMIN && (
                        <span className="ml-2 text-sm text-[--text-info]">
                          (Admin)
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-[--text-muted]">
                      {member.user.email}
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-[--background-tertiary]"
                    >
                      <MoreVerticalIcon className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[--background-secondary] border-[--border] shadow-lg">
                    <DropdownMenuItem
                      onClick={() => handleRoleUpdate(member.id, Role.ADMIN)}
                      disabled={member.role === Role.ADMIN}
                      className="hover:bg-[--background-tertiary]"
                    >
                      Make Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleRoleUpdate(member.id, Role.MEMBER)}
                      disabled={member.role === Role.MEMBER}
                      className="hover:bg-[--background-tertiary]"
                    >
                      Make Member
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-[--text-error] hover:bg-[--background-tertiary]"
                      onClick={() => {
                        setMemberToDelete({
                          id: member.id,
                          name: member.user.name,
                        });
                        setShowDeleteDialog(true);
                      }}
                    >
                      Remove Member
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {index < membersData.data.length - 1 && (
                <Separator className="bg-[--border]" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[--background-secondary] border-[--border]">
          <DialogHeader>
            <DialogTitle className="text-[--text-primary]">
              Remove Member
            </DialogTitle>
            <DialogDescription className="text-[--text-muted]">
              Are you sure you want to remove {memberToDelete?.name} from the
              workspace? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setMemberToDelete(null);
              }}
              className="hover:bg-[--background-tertiary]"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveMember}
              className="bg-[--status-danger] hover:bg-[--status-danger-hover]"
            >
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkspaceMembersPage;
