'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateTaskMutation } from '@/store/taskApi';
import { TaskStatus, Priority } from '@/store/taskApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { formatPriority, formatStatus } from '../utils';
import MemberSelector from './MemberSelector';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/redux';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  priority: z.nativeEnum(Priority).default(Priority.NORMAL),
  dueDate: z.string().optional(),
  points: z.preprocess((val) => {
    if (typeof val === 'string' && val.trim() === '') return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().optional()),
});

interface CreateTaskDialogProps {
  children: React.ReactNode;
  projectId: number;
  parentTaskId?: number;
  defaultStatus?: TaskStatus;
}

type TaskFormValues = z.infer<typeof taskSchema>;

const CreateTaskDialog = ({
  children,
  projectId,
  parentTaskId,
  defaultStatus = TaskStatus.TODO,
}: CreateTaskDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const { toast } = useToast();
  const [createTask, { isLoading }] = useCreateTaskMutation();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: defaultStatus,
      priority: Priority.NORMAL,
      dueDate: '',
      points: undefined,
    },
  });

  const activeWorkspaceId = useSelector(
    (state: RootState) => state.workspace.activeWorkspaceId
  );

  const workspaceId = activeWorkspaceId ? Number(activeWorkspaceId) : 0;

  if (!workspaceId) {
    return (
      <div className="p-4 text-destructive">No active workspace selected</div>
    );
  }

  const onSubmit = async (data: TaskFormValues) => {
    try {
      await createTask({
        ...data,
        projectId,
        parentTaskId,
        assigneeIds:
          selectedMemberIds.length > 0 ? selectedMemberIds : undefined,
      }).unwrap();

      toast({
        title: 'Task created',
        description: 'The task has been successfully created.',
      });
      form.reset();
      setSelectedMemberIds([]);
      setOpen(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[--background-quaternary]">
        <DialogHeader>
          <DialogTitle>
            {parentTaskId ? 'Create Subtask' : 'Create Task'}
          </DialogTitle>
          <DialogDescription>
            Add a new {parentTaskId ? 'subtask' : 'task'} to your project.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-2"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Description (optional)"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select {...field} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(TaskStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {formatStatus(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select {...field} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(Priority).map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {formatPriority(priority)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="points"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Points</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Estimate points"
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const numberValue =
                            val.trim() === '' ? undefined : Number(val);
                          field.onChange(numberValue);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormItem>
              <FormLabel>Assignees</FormLabel>
              <MemberSelector
                workspaceId={workspaceId}
                selectedMemberIds={selectedMemberIds}
                onChange={setSelectedMemberIds}
                disabled={isLoading}
              />
            </FormItem>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? 'Creating...'
                  : `Create ${parentTaskId ? 'Subtask' : 'Task'}`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialog;
