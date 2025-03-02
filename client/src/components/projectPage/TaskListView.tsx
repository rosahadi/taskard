import { Task, TaskStatus } from '@/store/taskApi';
import StatusGroup from './components/StatusGroup';

interface TaskListViewProps {
  tasks: Task[];
  projectId: number;
  onTaskCreated?: () => void;
  searchTerm: string;
  selectedStatus: string;
  selectedPriority: string;
}

const TaskListView = ({
  tasks,
  projectId,
  searchTerm,
  selectedStatus,
  selectedPriority,
}: TaskListViewProps) => {
  // Filter tasks based on search term and filters
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus
      ? task.status === selectedStatus
      : true;
    const matchesPriority = selectedPriority
      ? task.priority === selectedPriority
      : true;

    return (
      matchesSearch && matchesStatus && matchesPriority && !task.parentTaskId
    );
  });

  // Group tasks by their status
  const groupedTasks = filteredTasks.reduce((acc, task) => {
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
