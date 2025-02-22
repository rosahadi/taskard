'use client';
import { useAppDispatch, useAppSelector } from '@/app/redux';
import { setIsSidebarCollapsed } from '@/store/global';
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Home,
  Layers3,
  LucideIcon,
  ShieldAlert,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Logo from '../Logo';
import WorkspaceHeader from '../workspaceHeader/WorkspaceHeader';

const Sidebar = () => {
  const [showProjects, setShowProjects] = useState(true);
  const [showPriority, setShowPriority] = useState(true);

  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );

  const sidebarClassNames = `fixed flex flex-col h-[100%] justify-between shadow-xl
    transition-all duration-300 h-full z-40 bg-[--background-quaternary] overflow-y-auto
    ${isSidebarCollapsed ? 'w-0 hidden' : 'w-64'}
  `;

  return (
    <div className={sidebarClassNames}>
      <div className="flex h-[100%] w-full flex-col justify-start z-50">
        {/* TOP LOGO */}
        <div className=" flex min-h-[68px] w-64 items-center justify-between bg-[--background-quaternary] px-6 pt-3">
          <Logo />

          {isSidebarCollapsed ? null : (
            <button
              className="py-3"
              onClick={() => {
                dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
              }}
            >
              <X className="h-5 w-5 text-[--text-primary] hover:text-[--text-secondary]" />
            </button>
          )}
        </div>

        {/* WORKSPACE */}
        <WorkspaceHeader />

        {/* NAVBAR LINKS */}
        <nav className="z-10 w-full">
          <SidebarLink icon={Home} label="Home" href="/" />
          <SidebarLink icon={Briefcase} label="Timeline" href="/timeline" />
        </nav>

        {/* PROJECTS LINKS */}
        <button
          onClick={() => setShowProjects((prev) => !prev)}
          className="flex w-full items-center justify-between px-8 py-3 text-[--text-muted]"
        >
          <span>Projects</span>
          {showProjects ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>

        {/* PRIORITIES LINKS */}
        <button
          onClick={() => setShowPriority((prev) => !prev)}
          className="flex w-full items-center justify-between px-8 py-3 text-[--text-muted]"
        >
          <span>Priority</span>
          {showPriority ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
        {showPriority && (
          <>
            <SidebarLink
              icon={AlertCircle}
              label="Urgent"
              href="/priority/urgent"
            />
            <SidebarLink
              icon={ShieldAlert}
              label="High"
              href="/priority/high"
            />
            <SidebarLink
              icon={AlertTriangle}
              label="Medium"
              href="/priority/medium"
            />
            <SidebarLink icon={AlertOctagon} label="Low" href="/priority/low" />
            <SidebarLink
              icon={Layers3}
              label="Backlog"
              href="/priority/backlog"
            />
          </>
        )}
      </div>
    </div>
  );
};

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

const SidebarLink = ({ href, icon: Icon, label }: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive =
    pathname === href || (pathname === '/' && href === '/dashboard');

  return (
    <Link href={href} className="w-full">
      <div
        className={`relative flex cursor-pointer items-center gap-3 transition-colors
          hover:bg-[--background-tertiary]
          ${isActive ? 'bg-[--background-secondary]' : ''} 
          justify-start px-8 py-3`}
      >
        {isActive && (
          <div className="absolute left-0 top-0 h-[100%] w-[5px] bg-[--primary]" />
        )}

        <Icon className="h-6 w-6 text-[--text-primary]" />
        <span className="font-medium text-[--text-primary]">{label}</span>
      </div>
    </Link>
  );
};

export default Sidebar;
