'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Role } from '@/store/workspaceApi';

const InvitePeopleModal = ({
  isOpen,
  onClose,
  onSubmit,
  inviteEmail,
  setInviteEmail,
  inviteRole,
  setInviteRole,
  isInviting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  inviteEmail: string;
  setInviteEmail: (email: string) => void;
  inviteRole: Role;
  setInviteRole: (role: Role) => void;
  isInviting: boolean;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[--background-secondary] border-[--border] text-[--text-primary]">
        <DialogHeader>
          <DialogTitle>Invite People</DialogTitle>
          <DialogDescription className="text-[--text-muted]">
            Invite people to join your workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Email Input */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="bg-[--background-tertiary] border-[--border]"
            />
          </div>

          {/* Role Selection */}
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={inviteRole}
              onValueChange={(value) => setInviteRole(value as Role)}
            >
              <SelectTrigger className="bg-[--background-tertiary] border-[--border]">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                <SelectItem value={Role.MEMBER}>Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[--border] text-[--text-primary]"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!inviteEmail.trim() || isInviting}
            className="bg-[--primary] text-white hover:bg-[--primary-hover]"
          >
            {isInviting ? 'Inviting...' : 'Invite'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvitePeopleModal;
