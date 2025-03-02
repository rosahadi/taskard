'use client';

import ProjectHeader from '@/components/projectPage/ProjectHeader';
import TaskListView from '@/components/projectPage/TaskListView';
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
  const [activeTab, setActiveTab] = useState('List');

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
        <TaskListView tasks={tasks} projectId={parseInt(projectId)} />
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

// 'use client';

// import ProjectHeader from '@/components/projectPage/ProjectHeader';
// import TaskListView from '@/components/projectPage/TaskListView';
// import { Project, useGetProjectQuery } from '@/store/projectApi';
// import {
//   Task,
//   useGetAllTasksQuery,
//   useSearchTasksQuery,
// } from '@/store/taskApi';
// import { use, useState } from 'react';

// interface PageProps {
//   params: Promise<{ projectId: string }>;
// }

// const ProjectTasksPage = ({ params }: PageProps) => {
//   const { projectId } = use(params);

//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedStatus, setSelectedStatus] = useState<string>('');
//   const [selectedPriority, setSelectedPriority] = useState<string>('');
//   const [activeTab, setActiveTab] = useState('List');

//   const { data: projectData, isLoading: isLoadingProject } = useGetProjectQuery(
//     parseInt(projectId)
//   );

//   const { data: tasksData, error } = useGetAllTasksQuery({
//     projectId: parseInt(projectId),
//   });

//   const project: Project | undefined = projectData?.data;
//   // const tasks: Task[] = project?.tasks || [];
//   const tasks: Task[] = tasksData?.data || [];

//   const { data: searchTask } = useSearchTasksQuery({
//     projectId: parseInt(projectId),
//   });

//   console.log(searchTask);

//   if (isLoadingProject) {
//     return <div>Loading...</div>;
//   }

//   if (!project) {
//     return <div>Project not found</div>;
//   }

//   return (
//     <div className="mt-[70px]">
//       <ProjectHeader
//         projectName={project.name}
//         startDate={project.startDate}
//         endDate={project.endDate}
//         activeTab={activeTab}
//         setActiveTab={setActiveTab}
//         projectId={parseInt(projectId)}
//         searchTerm={searchTerm}
//         setSearchTerm={setSearchTerm}
//         selectedStatus={selectedStatus}
//         setSelectedStatus={setSelectedStatus}
//         selectedPriority={selectedPriority}
//         setSelectedPriority={setSelectedPriority}
//       />

//       {activeTab === 'List' && (
//         <TaskListView
//           tasks={tasks}
//           projectId={parseInt(projectId)}
//           searchTerm={searchTerm}
//           selectedStatus={selectedStatus}
//           selectedPriority={selectedPriority}
//         />
//       )}

//       {activeTab === 'Board' && (
//         <div className="p-4">Board view coming soon</div>
//       )}

//       {activeTab === 'Calendar' && (
//         <div className="p-4">Calendar view coming soon</div>
//       )}
//     </div>
//   );
// };

// export default ProjectTasksPage;
