'use client';

import React, { useEffect, useState } from 'react';
import { ModeToggle } from './ModeToggle';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSelector, useAppDispatch } from '@/app/redux';
import { setIsSidebarCollapsed } from '@/store/global';
import Logo from '../Logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, LogOut } from 'lucide-react';
import { logoutSuccess } from '@/store/authSlice';
import { useLogoutMutation } from '@/store/authApi';

const Nav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
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
      className={`fixed top-0 left-0 right-0 w-full bg-[--background-quaternary] transition-shadow duration-200 z-30 ${
        isScrolled ? 'shadow-lg shadow-[var(--shadow-light)]' : ''
      }`}
    >
      <div className="flex items-center justify-between px-7 py-4">
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hover:bg-accent"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          ) : (
            <Logo />
          )}
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          {isAuthenticated && user && (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="cursor-pointer h-8 w-8">
                  {user.image ? (
                    <AvatarImage
                      src={user.image}
                      alt={user.name}
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <AvatarFallback>
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-48 bg-[--background-quaternary] border border-[--border] shadow-lg">
                <DropdownMenuItem className="px-6 py-2 hover:bg-[--background-tertiary] flex items-center gap-3">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="px-6 py-2 hover:bg-[--background-tertiary] text-textError flex items-center gap-3 "
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Nav;
