'use client';

import React, { useEffect, useState } from 'react';
import { ModeToggle } from './ModeToggle';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSelector, useAppDispatch } from '@/app/redux';
import { setIsSidebarCollapsed } from '@/store/global';
import Logo from '../Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, LogOut } from 'lucide-react';
import { logoutSuccess } from '@/store/authSlice';
import { useLogoutMutation } from '@/store/authApi';
import UserSettingsModal from './UserSettingsModal';
import Image from 'next/image';

const Nav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const [logout] = useLogoutMutation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(logoutSuccess());
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 w-full bg-[var(--background-quaternary)] backdrop-blur-sm transition-all duration-200 z-30 border-b ${
        isScrolled ? 'border-[var(--border)] shadow-lg' : 'border-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSidebar}
              className="bg-[var(--background-tertiary)] border-[var(--border)] hover:bg-[var(--background-secondary)] text-[var(--text-primary)] transition-all duration-200 shadow-sm hover:shadow-md h-10 w-10"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          ) : (
            <Logo />
          )}
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />
          {isAuthenticated && user && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-[var(--background-tertiary)] border-[var(--border)] hover:bg-[var(--background-secondary)] text-[var(--text-primary)] transition-all duration-200 shadow-sm hover:shadow-md h-10 w-10 p-0 overflow-hidden"
                  >
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name}
                        width={40}
                        height={40}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-[var(--text-primary)]">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="w-56 bg-[var(--background-tertiary)] border-[var(--border)] shadow-lg rounded-lg p-1"
                  align="end"
                  sideOffset={8}
                >
                  <div className="px-3 py-2 border-b border-[var(--border)]">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {user.name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {user.email}
                    </p>
                  </div>

                  <DropdownMenuItem
                    className="hover:bg-[var(--background-secondary)] text-[var(--text-primary)] cursor-pointer flex items-center gap-3 px-3 py-2.5 m-1 rounded-md transition-colors duration-150"
                    onClick={() => setIsSettingsOpen(true)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--text-error)] cursor-pointer flex items-center gap-3 px-3 py-2.5 m-1 rounded-md transition-colors duration-150"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <UserSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                currentUser={user}
              />
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Nav;
