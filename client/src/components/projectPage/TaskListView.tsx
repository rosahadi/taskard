import { Task, TaskStatus } from '@/store/taskApi';
import StatusGroup from './components/StatusGroup';

interface TaskListViewProps {
  tasks: Task[];
  projectId: number;
}

const TaskListView = ({ tasks, projectId }: TaskListViewProps) => {
  // Filter out only parent tasks
  const parentTasks = tasks.filter((task) => !task.parentTaskId);

  // Group tasks by their status
  const groupedTasks = parentTasks.reduce((acc, task) => {
    if (!acc[task.status]) {
      acc[task.status] = [];
    }
    acc[task.status].push(task);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  // Get subtasks for a given parent task
  const getSubtasks = (parentId: number) => {
    return tasks.filter((task) => task.parentTaskId === parentId);
  };

  return (
    <div className="px-4 xl:px-6 mt-4">
      {/* Show message when no tasks are found */}
      {parentTasks.length === 0 && (
        <div className="py-8 text-center text-[var(--text-muted)]">
          No tasks found matching your criteria
        </div>
      )}

      {/* Task groups */}
      {Object.keys(TaskStatus).length > 0 &&
        Object.entries(groupedTasks).map(([status, statusTasks]) => (
          <StatusGroup
            key={status}
            status={status as TaskStatus}
            tasks={statusTasks}
            getSubtasks={getSubtasks}
            projectId={projectId}
          />
        ))}
    </div>
  );
};

export default TaskListView;
