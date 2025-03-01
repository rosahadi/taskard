'use client';

import { Task, useDeleteTaskMutation } from '@/store/taskApi';
import { MoreHorizontal, Edit, Trash2, ListPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

import EditTaskDialog from './EditTaskDialog';
import CreateTaskDialog from './CreateTaskDialog';

interface TaskActionsMenuProps {
  task: Task;
  projectId: number;
  isSubtask?: boolean;
}

const TaskActionsMenu = ({
  task,
  projectId,
  isSubtask = false,
}: TaskActionsMenuProps) => {
  const [deleteTask] = useDeleteTaskMutation();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await deleteTask(task.id).unwrap();
      toast({
        title: 'Task deleted',
        description: 'The task has been successfully deleted.',
      });
    } catch (err) {
      console.log(err);
      toast({
        title: 'Error',
        description: 'Failed to delete task. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal size={isSubtask ? 14 : 16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Task Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <EditTaskDialog task={task}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
        </EditTaskDialog>

        {!isSubtask && (
          <CreateTaskDialog
            projectId={projectId}
            parentTaskId={task.id}
            defaultStatus={task.status}
          >
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <ListPlus className="mr-2 h-4 w-4" />
              <span>Add subtask</span>
            </DropdownMenuItem>
          </CreateTaskDialog>
        )}

        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={handleDelete}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TaskActionsMenu;
