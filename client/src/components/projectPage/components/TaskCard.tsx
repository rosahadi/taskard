'use client';

import { useState } from 'react';
import {
  Task,
  TaskStatus,
  Priority,
  useUpdateTaskMutation,
} from '@/store/taskApi';
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Calendar,
  ListPlus,
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { formatPriority, formatStatus } from '../utils';
import CreateTaskDialog from './CreateTaskDialog';
import { Progress } from '@/components/ui/progress';
import SubTaskRow from './SubTaskRow';
import TaskActionsMenu from './TaskActionsMenu';

interface TaskCardProps {
  task: Task;
  subTasks: Task[];
  projectId: number;
}

const TaskCard = ({ task, subTasks, projectId }: TaskCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [updateTask] = useUpdateTaskMutation();
  const { toast } = useToast();

  // Calculate subtask completion percentage
  const getSubtaskProgress = () => {
    if (subTasks.length === 0) return 0;
    const completedSubtasks = subTasks.filter(
      (st) => st.status === TaskStatus.DONE
    ).length;
    return Math.round((completedSubtasks / subTasks.length) * 100);
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    try {
      await updateTask({
        id: task.id,
        body: { status: newStatus },
      }).unwrap();
      toast({
        title: 'Task updated',
        description: `Task status changed to ${formatStatus(newStatus)}.`,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update task status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getPriorityColor = (priority: Priority) => {
    const colors = {
      [Priority.URGENT]:
        'bg-[var(--priority-urgent)] text-white border-[var(--priority-urgent)]',
      [Priority.HIGH]:
        'bg-[var(--priority-high)] text-white border-[var(--priority-high)]',
      [Priority.NORMAL]:
        'bg-[var(--priority-medium)] text-white border-[var(--priority-medium)]',
      [Priority.LOW]:
        'bg-[var(--priority-low)] text-white border-[var(--priority-low)]',
    };
    return (
      colors[priority] ||
      'bg-[var(--priority-low)] text-white border-[var(--priority-low)]'
    );
  };

  // Handle click to expand subtasks list
  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <div className="border border-border rounded-md mb-3 overflow-hidden bg-card shadow-sm hover:shadow transition-shadow">
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={task.status === TaskStatus.DONE}
              onCheckedChange={(checked) =>
                handleStatusChange(checked ? TaskStatus.DONE : TaskStatus.TODO)
              }
              className="h-4 w-4 rounded-sm"
            />
            <span
              className={`font-medium ${
                task.status === TaskStatus.DONE
                  ? 'line-through text-muted-foreground'
                  : ''
              }`}
            >
              {task.title}
            </span>

            {/* Subtask indicator and expand button */}
            {subTasks.length > 0 ? (
              <button
                onClick={toggleExpanded}
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                {expanded ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
                <span className="text-xs text-muted-foreground">
                  {subTasks.length}
                </span>
              </button>
            ) : (
              <CreateTaskDialog
                projectId={projectId}
                parentTaskId={task.id}
                defaultStatus={task.status}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-1 text-muted-foreground hover:text-foreground"
                >
                  <ListPlus size={14} />
                </Button>
              </CreateTaskDialog>
            )}

            <Badge
              className={`text-xs ${getPriorityColor(
                task.priority as Priority
              )}`}
              variant="outline"
            >
              <span className="flex items-center">
                {formatPriority(task.priority)}
              </span>
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            {task.dueDate && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar size={14} className="mr-1" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Due date: {format(new Date(task.dueDate), 'PPP')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {task.assignees && task.assignees.length > 0 && (
              <div className="flex -space-x-2">
                {task.assignees.map((assignee) => (
                  <TooltipProvider key={assignee.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className="h-6 w-6 border-2 border-background">
                          {assignee.user?.image ? (
                            <AvatarImage
                              src={assignee.user.image}
                              alt={assignee.user?.name || 'User'}
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <AvatarFallback>
                              {assignee.user?.name?.charAt(0).toUpperCase() ||
                                '?'}
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

            <div className="flex items-center">
              {task.points && (
                <Badge variant="outline" className="mr-2">
                  {task.points} pts
                </Badge>
              )}

              <TaskActionsMenu task={task} projectId={projectId} />
            </div>
          </div>
        </div>

        {task.description && (
          <div className="mt-2 text-sm text-muted-foreground pl-6">
            {task.description.length > 100
              ? `${task.description.substring(0, 100)}...`
              : task.description}
          </div>
        )}

        {/* Subtask progress indicator */}
        {subTasks.length > 0 && (
          <div className="mt-2 pl-6">
            <div className="flex items-center gap-2">
              <Progress value={getSubtaskProgress()} className="h-1.5 w-32" />
              <span className="text-xs text-muted-foreground">
                {subTasks.filter((st) => st.status === TaskStatus.DONE).length}/
                {subTasks.length}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Subtasks section */}
      {subTasks.length > 0 && expanded && (
        <div className="px-3 py-2 border-t border-border bg-muted/30">
          {subTasks.map((subTask) => (
            <SubTaskRow
              key={subTask.id}
              subTask={subTask}
              projectId={projectId}
            />
          ))}

          <CreateTaskDialog
            projectId={projectId}
            parentTaskId={task.id}
            defaultStatus={task.status}
          >
            <button className="flex items-center gap-2 py-2 pl-6 text-xs text-muted-foreground hover:text-primary cursor-pointer w-full text-left">
              <Plus size={14} />
              <span>Add subtask</span>
            </button>
          </CreateTaskDialog>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
