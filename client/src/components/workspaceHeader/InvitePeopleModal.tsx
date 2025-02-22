'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Role } from '@/store/workspaceApi';
import { useToast } from '@/hooks/use-toast';
import { useInviteWorkspaceMemberMutation } from '@/store/workspaceApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

const InvitePeopleModalSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['ADMIN', 'MEMBER']),
});

interface InvitePeopleModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: number | null;
}

type InvitePeopleValues = z.infer<typeof InvitePeopleModalSchema>;

const InvitePeopleModal = ({
  isOpen,
  onClose,
  workspaceId,
}: InvitePeopleModalProps) => {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [inviteWorkspaceMember, { isLoading: isInviting }] =
    useInviteWorkspaceMemberMutation();

  const form = useForm<InvitePeopleValues>({
    resolver: zodResolver(InvitePeopleModalSchema),
    defaultValues: {
      email: '',
      role: Role.MEMBER,
    },
  });

  const onSubmit = async (values: InvitePeopleValues) => {
    if (!workspaceId) {
      setError('No workspace selected. Please select a workspace first.');
      return;
    }

    try {
      await inviteWorkspaceMember({
        workspaceId,
        body: {
          email: values.email.trim(),
          role: values.role as Role,
        },
      }).unwrap();

      toast({
        title: 'Invitation Sent',
        description: `Invitation sent to ${values.email.trim()}`,
      });
      form.reset();
      onClose();
    } catch (error) {
      const { data } = error as FetchBaseQueryError;
      setError(
        data
          ? (data as { message: string }).message
          : 'An unexpected error occurred'
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[--background-secondary] border-[--border] text-[--text-primary]">
        <DialogHeader>
          <DialogTitle>Invite People</DialogTitle>
          <DialogDescription className="text-[--text-muted]">
            Invite people to join your workspace.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="example@email.com"
                      className="bg-[--background-tertiary] border-[--border]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-[--background-tertiary] border-[--border]">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                      <SelectItem value={Role.MEMBER}>Member</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <FormMessage>{error}</FormMessage>}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-[--border] text-[--text-primary]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isInviting}
                className="bg-[--primary] text-white hover:bg-[--primary-hover]"
              >
                {isInviting ? 'Inviting...' : 'Invite'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InvitePeopleModal;
