'use client';
import { useAppSelector } from '@/app/redux';
import { useState } from 'react';
import {
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Layers3,
  MoreVertical,
  Plus,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import WorkspaceHeader from '../workspaceHeader/WorkspaceHeader';
import { useGetAllProjectsQuery } from '@/store/projectApi';
import CreateProjectModal from './CreateProjectModal';
import SidebarHeader from './SidebarHeader';
import SidebarLink from './SidebarLink';
import EditProjectModal from './EditProjectModal';
import DeleteProjectModal from './DeleteProjectModal';

const Sidebar = () => {
  const [showProjects, setShowProjects] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editProjectId, setEditProjectId] = useState<number | null>(null);

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
    transition-all duration-300 h-full z-40 bg-[var(--background-quaternary)] overflow-y-auto border-r border-[var(--border)]
    ${isSidebarCollapsed ? 'w-0 hidden' : 'w-64'}
  `;

  const workspaceBaseUrl = activeWorkspaceId
    ? `/workspaces/${activeWorkspaceId}`
    : '';

  return (
    <div className={sidebarClassNames}>
      <div className="flex h-[100%] w-full flex-col justify-start z-50">
        {/* TOP LOGO */}
        <SidebarHeader />

        {/* WORKSPACE */}
        <div className="border-b border-[var(--border)] mb-2">
          <WorkspaceHeader />
        </div>

        {/* NAVBAR LINKS */}
        <nav className="z-10 w-full px-2 mb-4">
          <SidebarLink
            icon={CheckSquare}
            label="My Tasks"
            href={`${workspaceBaseUrl}/my-tasks`}
          />
        </nav>

        {/* PROJECTS SECTION */}
        <div className="flex-1 overflow-y-auto">
          {/* Projects Header */}
          <div className="flex items-center justify-between px-6 py-3 mb-2 bg-[var(--background-secondary)] mx-2 rounded-lg">
            <button
              onClick={() => setShowProjects((prev) => !prev)}
              className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200 font-medium"
            >
              <span>Projects</span>
              {showProjects ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {/* Plus button to create a new project */}
            <button
              onClick={() => setShowCreateDialog(true)}
              className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--background-tertiary)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!activeWorkspaceId}
              title="Create new project"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Projects List */}
          {showProjects && (
            <div className="w-full px-2 space-y-1">
              {isLoading ? (
                <div className="px-4 py-6 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--primary)] mx-auto mb-2"></div>
                  <div className="text-[var(--text-muted)] text-sm">
                    Loading projects...
                  </div>
                </div>
              ) : isError ? (
                <div className="px-4 py-6 text-center">
                  <div className="text-[var(--text-error)] text-sm">
                    Failed to load projects
                  </div>
                </div>
              ) : !activeWorkspaceId ? (
                <div className="px-4 py-6 text-center">
                  <div className="text-[var(--text-muted)] text-sm">
                    Select a workspace to view projects
                  </div>
                </div>
              ) : projectsData?.data.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <Layers3 className="h-8 w-8 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
                  <div className="text-[var(--text-muted)] text-sm">
                    No projects yet
                  </div>
                  <div className="text-[var(--text-muted)] text-xs mt-1">
                    Create your first project!
                  </div>
                </div>
              ) : (
                projectsData?.data.map((project) => (
                  <div
                    key={project.id}
                    className="group flex items-center rounded-lg hover:bg-[var(--background-secondary)] transition-colors duration-200"
                  >
                    <div className="flex-1">
                      <SidebarLink
                        icon={Layers3}
                        label={project.name}
                        href={`${workspaceBaseUrl}/projects/${project.id}`}
                      />
                    </div>

                    {/* Dropdown Menu for Edit/Delete */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 m-1 rounded-md text-[var(--text-muted)] opacity-0 group-hover:opacity-100 hover:text-[var(--text-primary)] hover:bg-[var(--background-tertiary)] transition-all duration-200">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="bg-[var(--background-tertiary)] border-[var(--border)] shadow-lg w-48"
                        align="end"
                      >
                        <DropdownMenuItem
                          onClick={() => {
                            setEditProjectId(project.id);
                            setShowEditDialog(true);
                          }}
                          className="cursor-pointer text-[var(--text-primary)] hover:bg-[var(--background-secondary)] transition-colors duration-150"
                        >
                          Edit Project
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setProjectToDelete(project.id);
                            setShowDeleteDialog(true);
                          }}
                          className="cursor-pointer text-[var(--status-danger)] hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
                        >
                          Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        workspaceId={activeWorkspaceId}
        onSuccess={() => refetch()}
      />

      <EditProjectModal
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        projectId={editProjectId}
        onSuccess={() => refetch()}
      />

      {/* Delete Project Modal */}
      <DeleteProjectModal
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        projectId={projectToDelete}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default Sidebar;
