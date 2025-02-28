'use client';

import { RootState } from '@/app/redux';
import ProjectHeader from '@/components/projectPage/ProjectHeader';
import { Project, useGetProjectQuery } from '@/store/projectApi';
import { Task } from '@/store/taskApi';
import { use, useState } from 'react';
import { useSelector } from 'react-redux';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

const ProjectTasksPage = ({ params }: PageProps) => {
  const { projectId } = use(params);
  const activeWorkspaceId = useSelector(
    (state: RootState) => state.workspace.activeWorkspaceId
  );

  const { data: projectData, isLoading: isLoadingProject } = useGetProjectQuery(
    parseInt(projectId)
  );

  const project: Project | undefined = projectData?.data;
  const tasks: Task[] = project?.tasks || [];

  const [activeTab, setActiveTab] = useState('List');

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
      />
    </div>
  );
};

export default ProjectTasksPage;
