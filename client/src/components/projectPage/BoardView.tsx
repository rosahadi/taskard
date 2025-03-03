'use client';

import { useState, useRef, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  Priority,
  Task,
  TaskStatus,
  useUpdateTaskMutation,
} from '@/store/taskApi';
import {
  EllipsisVertical,
  Plus,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CreateTaskDialog from './components/CreateTaskDialog';
import SubTaskRow from './components/SubTaskRow';
import TaskActionsMenu from './components/TaskActionsMenu';
import { formatPriority, formatStatus } from './utils';
import { Button } from '@/components/ui/button';

interface BoardViewProps {
  projectId: number;
  tasks: Task[];
}

const TASK_STATUSES = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.REVIEW,
  TaskStatus.DONE,
  TaskStatus.CANCELED,
];

// Get status color utility function
const getStatusColor = (status: TaskStatus) => {
  const colors = {
    [TaskStatus.TODO]: 'bg-[var(--status-todo)] text-foreground',
    [TaskStatus.IN_PROGRESS]: 'bg-[var(--status-inprogress)] text-foreground',
    [TaskStatus.REVIEW]: 'bg-[var(--status-info)] text-foreground',
    [TaskStatus.DONE]: 'bg-[var(--status-done)] text-foreground',
    [TaskStatus.CANCELED]: 'bg-[var(--status-blocked)] text-foreground',
  };
  return colors[status] || 'bg-muted text-foreground';
};

// Get priority color utility function
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

const BoardView = ({ projectId, tasks }: BoardViewProps) => {
  const [updateTask] = useUpdateTaskMutation();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const { toast } = useToast();
  const [scrollPosition, setScrollPosition] = useState(0);
  const columnHeadersRef = useRef<HTMLDivElement>(null);
  const columnContentsRef = useRef<HTMLDivElement>(null);

  // Sync horizontal scrolling between headers and contents
  useEffect(() => {
    const headersEl = columnHeadersRef.current;
    const contentsEl = columnContentsRef.current;

    if (!headersEl || !contentsEl) return;

    const handleScroll = () => {
      headersEl.scrollLeft = contentsEl.scrollLeft;
    };

    contentsEl.addEventListener('scroll', handleScroll);
    return () => contentsEl.removeEventListener('scroll', handleScroll);
  }, []);

  // Move task to a different status column
  const moveTask = async (taskId: number, toStatus: TaskStatus) => {
    try {
      await updateTask({
        id: taskId,
        body: { status: toStatus },
      }).unwrap();
      toast({
        title: 'Task updated',
        description: `Task moved to ${formatStatus(toStatus)}.`,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update task status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Group tasks by status
  const tasksByStatus = TASK_STATUSES.reduce((acc, status) => {
    acc[status] = tasks.filter(
      (task) => task.status === status && task.parentTaskId === null
    );
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  // Get subtasks for a specific task
  const getSubtasks = (taskId: number): Task[] => {
    return tasks.filter((task) => task.parentTaskId === taskId);
  };

  // Handle task click to show modal
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  // Handle horizontal scrolling
  const handleScroll = (direction: 'left' | 'right') => {
    const contentsEl = columnContentsRef.current;
    if (contentsEl) {
      const scrollAmount = 300; // Adjust based on preference
      const newPosition =
        direction === 'left'
          ? Math.max(0, scrollPosition - scrollAmount)
          : scrollPosition + scrollAmount;

      contentsEl.scrollLeft = newPosition;
      setScrollPosition(newPosition);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="absolute inset-0 flex flex-col overflow-hidden">
        {/* Column Headers */}
        <div
          ref={columnHeadersRef}
          className="flex px-10 overflow-hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex min-w-max gap-4 p-4 pb-2">
            {TASK_STATUSES.map((status) => (
              <div key={status} className="w-80 flex-shrink-0">
                <div className="mb-3 flex w-full">
                  <div
                    className={`w-2 rounded-s-lg ${
                      getStatusColor(status).split(' ')[0]
                    }`}
                  />
                  <div className="flex w-full items-center justify-between rounded-e-lg bg-card px-5 py-4">
                    <h3 className="flex items-center text-lg font-semibold">
                      {formatStatus(status)}{' '}
                      <span
                        className="ml-2 inline-block rounded-full bg-muted p-1 text-center text-sm leading-none"
                        style={{ width: '1.5rem', height: '1.5rem' }}
                      >
                        {tasksByStatus[status]?.length || 0}
                      </span>
                    </h3>
                    <div className="flex items-center gap-1">
                      <button className="flex h-6 w-5 items-center justify-center text-muted-foreground">
                        <EllipsisVertical size={26} />
                      </button>
                      <div onClick={(e) => e.stopPropagation()}>
                        <CreateTaskDialog
                          projectId={projectId}
                          defaultStatus={status}
                        >
                          <button className="flex h-6 w-6 items-center justify-center rounded bg-muted">
                            <Plus size={16} />
                          </button>
                        </CreateTaskDialog>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Columns - Scrollable content area */}
        <div className="relative flex-1 overflow-hidden">
          {/* Scroll Left Button */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background shadow-md opacity-80 hover:opacity-100"
            onClick={() => handleScroll('left')}
            disabled={scrollPosition <= 0}
          >
            <ChevronsLeft size={18} />
          </Button>

          {/* Scroll Right Button */}
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background shadow-md opacity-80 hover:opacity-100"
            onClick={() => handleScroll('right')}
          >
            <ChevronsRight size={18} />
          </Button>

          {/* Scrollable Columns Container */}
          <div
            ref={columnContentsRef}
            className="h-full px-10 pb-4 overflow-x-auto overflow-y-hidden"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
          >
            <div className="flex min-w-max gap-4 p-4 pt-0 h-full">
              {TASK_STATUSES.map((status) => (
                <TaskColumn
                  key={status}
                  status={status}
                  tasks={tasksByStatus[status] || []}
                  moveTask={moveTask}
                  projectId={projectId}
                  getSubtasks={getSubtasks}
                  onTaskClick={handleTaskClick}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
          <DialogContent className="max-w-3xl bg-[--background-quaternary]">
            <DialogHeader>
              <DialogTitle>{selectedTask.title}</DialogTitle>
            </DialogHeader>
            <div className="mt-2">
              {selectedTask.description && (
                <div className="mb-4 text-muted-foreground">
                  {selectedTask.description}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge
                  variant="outline"
                  className={`text-xs ${getPriorityColor(
                    selectedTask.priority as Priority
                  )}`}
                >
                  {formatPriority(selectedTask.priority)}
                </Badge>
                <Badge
                  variant="outline"
                  className={`${getStatusColor(selectedTask.status)} border-0`}
                >
                  {formatStatus(selectedTask.status)}
                </Badge>
                {selectedTask.points && (
                  <Badge variant="outline">{selectedTask.points} pts</Badge>
                )}
              </div>

              <div className="flex items-center gap-4 mb-6">
                {selectedTask.dueDate && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Due: </span>
                    {format(new Date(selectedTask.dueDate), 'PPP')}
                  </div>
                )}

                {selectedTask.assignees &&
                  selectedTask.assignees.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Assigned to:
                      </span>
                      <div className="flex -space-x-2">
                        {selectedTask.assignees.map((assignee) => (
                          <Avatar
                            key={assignee.id}
                            className="h-6 w-6 border-2 border-background"
                          >
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
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              <h3 className="text-lg font-medium mb-2">Subtasks</h3>
              <div className="space-y-2 mb-4">
                {getSubtasks(selectedTask.id).length > 0 ? (
                  getSubtasks(selectedTask.id).map((subtask) => (
                    <SubTaskRow
                      key={subtask.id}
                      subTask={subtask}
                      projectId={projectId}
                    />
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No subtasks yet
                  </p>
                )}
              </div>

              {/* Separated Add Subtask button from the modal closing logic */}
              <div onClick={(e) => e.stopPropagation()} className="mt-4">
                <CreateTaskDialog
                  projectId={projectId}
                  parentTaskId={selectedTask.id}
                  defaultStatus={selectedTask.status}
                >
                  <button className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-primary">
                    <Plus size={16} />
                    <span>Add subtask</span>
                  </button>
                </CreateTaskDialog>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DndProvider>
  );
};

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  moveTask: (taskId: number, toStatus: TaskStatus) => void;
  projectId: number;
  getSubtasks: (taskId: number) => Task[];
  onTaskClick: (task: Task) => void;
}

const TaskColumn = ({
  status,
  tasks,
  moveTask,
  projectId,
  getSubtasks,
  onTaskClick,
}: TaskColumnProps) => {
  const elementRef = useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'task',
    drop: (item: { id: number }) => moveTask(item.id, status),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  drop(elementRef);

  return (
    <div
      ref={elementRef}
      className={`w-80 flex-shrink-0 h-full ${
        isOver ? 'bg-muted dark:bg-neutral-950' : ''
      }`}
    >
      {/* Scrollable Task Cards Container  */}
      <div className="space-y-3 px-1 overflow-y-auto h-full">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            subTasks={getSubtasks(task.id)}
            projectId={projectId}
            onClick={() => onTaskClick(task)}
          />
        ))}
      </div>
    </div>
  );
};

interface TaskCardProps {
  task: Task;
  subTasks: Task[];
  projectId: number;
  onClick: () => void;
}

const TaskCard = ({ task, subTasks, projectId, onClick }: TaskCardProps) => {
  const elementRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'task',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  drag(elementRef);

  return (
    <div
      ref={elementRef}
      onClick={onClick}
      className={`mb-2 rounded-md bg-cardBg shadow cursor-pointer hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={`text-xs ${getPriorityColor(
                task.priority as Priority
              )}`}
              variant="outline"
            >
              {formatPriority(task.priority)}
            </Badge>
            {task.points && (
              <Badge variant="outline" className="text-xs">
                {task.points} pts
              </Badge>
            )}
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <TaskActionsMenu task={task} projectId={projectId} />
          </div>
        </div>

        <h4 className="my-3 font-medium">{task.title}</h4>

        {task.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="text-xs text-muted-foreground mb-3">
          {task.dueDate && (
            <span>Due: {format(new Date(task.dueDate), 'MMM d')}</span>
          )}
        </div>

        {/* Users and subtasks count */}
        <div className="flex items-center justify-between">
          {task.assignees && task.assignees.length > 0 && (
            <div className="flex -space-x-2 overflow-hidden">
              {task.assignees.map((assignee) => (
                <Avatar
                  key={assignee.id}
                  className="h-6 w-6 border-2 border-background"
                >
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
              ))}
            </div>
          )}
          {subTasks.length > 0 && (
            <div className="flex items-center text-muted-foreground">
              <span className="text-xs font-medium">
                {subTasks.length} subtask{subTasks.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardView;
