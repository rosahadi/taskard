import {
  Task,
  TaskStatus,
  Priority,
  useUpdateTaskMutation,
} from '@/store/taskApi';
import { Flag } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import TaskActionsMenu from './TaskActionsMenu';

interface SubTaskRowProps {
  subTask: Task;
  projectId: number;
}

const SubTaskRow = ({ subTask, projectId }: SubTaskRowProps) => {
  const [updateTask] = useUpdateTaskMutation();
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: TaskStatus) => {
    try {
      await updateTask({
        id: subTask.id,
        body: { status: newStatus },
      }).unwrap();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update subtask status.',
        variant: 'destructive',
      });
    }
  };

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case Priority.URGENT:
        return <Flag className="text-[var(--priority-urgent)]" size={12} />;
      case Priority.HIGH:
        return <Flag className="text-[var(--priority-high)]" size={12} />;
      case Priority.NORMAL:
        return <Flag className="text-[var(--priority-medium)]" size={12} />;
      case Priority.LOW:
        return <Flag className="text-[var(--priority-low)]" size={12} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-between py-1.5 pl-6 hover:bg-muted/50 rounded">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={subTask.status === TaskStatus.DONE}
          onCheckedChange={(checked) =>
            handleStatusChange(checked ? TaskStatus.DONE : TaskStatus.TODO)
          }
          className="h-3.5 w-3.5 rounded-sm"
        />
        <span
          className={
            subTask.status === TaskStatus.DONE
              ? 'line-through text-muted-foreground'
              : ''
          }
        >
          {subTask.title}
        </span>
        <span className="text-xs">
          {getPriorityIcon(subTask.priority as Priority)}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Avatar rendering for subtask assignees */}
        {subTask.assignees && subTask.assignees.length > 0 && (
          <div className="flex -space-x-1">
            {subTask.assignees.map((assignee) => (
              <TooltipProvider key={assignee.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="h-5 w-5 border-2 border-background">
                      {assignee.user?.image ? (
                        <AvatarImage
                          src={assignee.user.image}
                          alt={assignee.user?.name || 'User'}
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <AvatarFallback>
                          {assignee.user?.name?.charAt(0).toUpperCase() || '?'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{assignee.user?.name || 'Unknown User'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        )}

        <TaskActionsMenu task={subTask} projectId={projectId} isSubtask />
      </div>
    </div>
  );
};

export default SubTaskRow;
