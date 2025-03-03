'use client';
import ProjectHeader from '@/components/projectPage/ProjectHeader';
import TaskListView from '@/components/projectPage/TaskListView';
import BoardView from '@/components/projectPage/BoardView';
import { Project, useGetProjectQuery } from '@/store/projectApi';
import { Task, useSearchTasksQuery } from '@/store/taskApi';
import { use, useState, useEffect } from 'react';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

const ProjectTasksPage = ({ params }: PageProps) => {
  const { projectId } = use(params);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState('Board');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: projectData, isLoading: isLoadingProject } = useGetProjectQuery(
    parseInt(projectId)
  );

  const { data: searchTasksData, isLoading: isLoadingTasks } =
    useSearchTasksQuery({
      projectId: parseInt(projectId),
      searchTerm: debouncedSearchTerm,
      status: selectedStatus === 'ALL' ? '' : selectedStatus,
      priority: selectedPriority === 'ALL' ? '' : selectedPriority,
    });

  const project: Project | undefined = projectData?.data;
  const tasks: Task[] = searchTasksData?.data || [];

  if (isLoadingProject || isLoadingTasks) {
    return <div>Loading...</div>;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-70px)] overflow-hidden">
      {/* Fixed position header */}
      <div className="w-full sticky top-[70px] bg-background z-20 shadow-sm">
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
      </div>

      {/* Content area with tabs */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'List' && (
          <div className="h-full overflow-auto">
            <TaskListView tasks={tasks} projectId={parseInt(projectId)} />
          </div>
        )}
        {activeTab === 'Board' && (
          <div className="h-full relative">
            <BoardView tasks={tasks} projectId={parseInt(projectId)} />
          </div>
        )}
        {activeTab === 'Calendar' && (
          <div className="p-4">Calendar view coming soon</div>
        )}
      </div>
    </div>
  );
};

export default ProjectTasksPage;
