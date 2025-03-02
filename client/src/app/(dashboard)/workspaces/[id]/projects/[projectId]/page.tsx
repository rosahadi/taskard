'use client';

import ProjectHeader from '@/components/projectPage/ProjectHeader';
import TaskListView from '@/components/projectPage/TaskListView';
import { Project, useGetProjectQuery } from '@/store/projectApi';
import { Task, useGetAllTasksQuery } from '@/store/taskApi';
import { use, useState } from 'react';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

const ProjectTasksPage = ({ params }: PageProps) => {
  const { projectId } = use(params);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [activeTab, setActiveTab] = useState('List');

  const { data: projectData, isLoading: isLoadingProject } = useGetProjectQuery(
    parseInt(projectId)
  );

  const { data: tasksData, error } = useGetAllTasksQuery({
    projectId: parseInt(projectId),
  });

  const project: Project | undefined = projectData?.data;
  // const tasks: Task[] = project?.tasks || [];
  const tasks: Task[] = tasksData?.data || [];

  console.log(error);

  if (isLoadingProject) {
    return <div>Loading...</div>;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="mt-[70px]">
      <ProjectHeader
        projectName={project.name}
        startDate={project.startDate}
        endDate={project.endDate}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        projectId={parseInt(projectId)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedPriority={selectedPriority}
        setSelectedPriority={setSelectedPriority}
      />

      {activeTab === 'List' && (
        <TaskListView
          tasks={tasks}
          projectId={parseInt(projectId)}
          searchTerm={searchTerm}
          selectedStatus={selectedStatus}
          selectedPriority={selectedPriority}
        />
      )}

      {activeTab === 'Board' && (
        <div className="p-4">Board view coming soon</div>
      )}

      {activeTab === 'Calendar' && (
        <div className="p-4">Calendar view coming soon</div>
      )}
    </div>
  );
};

export default ProjectTasksPage;
