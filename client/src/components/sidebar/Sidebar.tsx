'use client';
import { useAppSelector } from '@/app/redux';
import {
  Briefcase,
  ChevronDown,
  ChevronUp,
  Home,
  Layers3,
  Plus,
} from 'lucide-react';

import { useState } from 'react';
import WorkspaceHeader from '../workspaceHeader/WorkspaceHeader';
import { useGetAllProjectsQuery } from '@/store/projectApi';
import CreateProjectModal from './CreateProjectModal';
import SidebarHeader from './SidebarHeader';
import SidebarLink from './SidebarLink';

const Sidebar = () => {
  const [showProjects, setShowProjects] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const activeWorkspaceId = useAppSelector(
    (state) => state.workspace.activeWorkspaceId
  );

  // Fetch projects for the active workspace
  const {
    data: projectsData,
    isLoading,
    isError,
    refetch,
  } = useGetAllProjectsQuery(
    { workspaceId: activeWorkspaceId! },
    { skip: !activeWorkspaceId }
  );

  const sidebarClassNames = `fixed flex flex-col h-[100%] justify-between shadow-xl
    transition-all duration-300 h-full z-40 bg-[--background-quaternary] overflow-y-auto
    ${isSidebarCollapsed ? 'w-0 hidden' : 'w-64'}
  `;

  return (
    <div className={sidebarClassNames}>
      <div className="flex h-[100%] w-full flex-col justify-start z-50">
        {/* TOP LOGO */}
        <SidebarHeader />

        {/* WORKSPACE */}
        <WorkspaceHeader />

        {/* NAVBAR LINKS */}
        <nav className="z-10 w-full">
          <SidebarLink icon={Home} label="Home" href="/" />
          <SidebarLink icon={Briefcase} label="Timeline" href="/timeline" />
        </nav>

        {/* PROJECTS LINKS */}
        <div className="flex items-center justify-between px-8 py-3">
          <button
            onClick={() => setShowProjects((prev) => !prev)}
            className="flex items-center gap-2 text-[--text-muted]"
          >
            <span>Projects</span>
            {showProjects ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>

          {/* Plus button to create a new project */}
          <button
            onClick={() => setShowCreateDialog(true)}
            className="p-1 text-[--text-muted] hover:text-[--text-primary]"
            disabled={!activeWorkspaceId}
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Render projects */}
        {showProjects && (
          <div className="w-full">
            {isLoading ? (
              <div className="px-8 py-3 text-[--text-muted]">Loading...</div>
            ) : isError ? (
              <div className="px-8 py-3 text-[--text-muted]">
                Failed to load projects
              </div>
            ) : !activeWorkspaceId ? (
              <div className="px-8 py-3 text-[--text-muted]">
                Select a workspace to view projects
              </div>
            ) : projectsData?.data.length === 0 ? (
              <div className="px-8 py-3 text-[--text-muted]">
                No projects found. Create one!
              </div>
            ) : (
              projectsData?.data.map((project) => (
                <div
                  key={project.id}
                  className="group flex items-center justify-between px-8 py-3 hover:bg-[--background-tertiary]"
                >
                  <SidebarLink
                    icon={Layers3}
                    label={project.name}
                    href={`/projects/${project.id}`}
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        workspaceId={activeWorkspaceId}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default Sidebar;
