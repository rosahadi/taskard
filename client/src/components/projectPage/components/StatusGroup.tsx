'use client';

import { useState } from 'react';
import { Task, TaskStatus } from '@/store/taskApi';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatStatus } from '../utils';
import TaskCard from './TaskCard';

interface StatusGroupProps {
  status: TaskStatus;
  tasks: Task[];
  getSubtasks: (parentId: number) => Task[];
  projectId: number;
}

const StatusGroup = ({
  status,
  tasks,
  getSubtasks,
  projectId,
}: StatusGroupProps) => {
  const [collapsed, setCollapsed] = useState(false);

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

  return (
    <div className="mb-6">
      <div
        className="flex items-center justify-between py-2 px-2 cursor-pointer hover:bg-[--background-secondary] rounded-md transition-colors"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          {collapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
          <Badge className={`${getStatusColor(status)} px-2 py-1`}>
            {formatStatus(status)}
          </Badge>
          <span className="text-sm text-muted">{tasks.length}</span>
        </div>
      </div>

      {!collapsed && (
        <div className="ml-6 mt-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              subTasks={getSubtasks(task.id)}
              projectId={projectId}
            />
          ))}

          {tasks.length === 0 && (
            <div className="text-sm text-muted italic py-2">
              No tasks in this status
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatusGroup;
