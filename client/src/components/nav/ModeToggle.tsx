'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ModeToggle() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-[var(--background-tertiary)] border-[var(--border)] hover:bg-[var(--background-secondary)] text-[var(--text-primary)] transition-all duration-200 shadow-sm hover:shadow-md h-10 w-10"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-[var(--text-primary)]" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-[var(--text-primary)]" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-[var(--background-tertiary)] border-[var(--border)] shadow-lg min-w-[120px]"
      >
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className="hover:bg-[var(--background-secondary)] text-[var(--text-primary)] cursor-pointer px-4 py-2.5 transition-colors duration-150"
        >
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className="hover:bg-[var(--background-secondary)] text-[var(--text-primary)] cursor-pointer px-4 py-2.5 transition-colors duration-150"
        >
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className="hover:bg-[var(--background-secondary)] text-[var(--text-primary)] cursor-pointer px-4 py-2.5 transition-colors duration-150"
        >
          <Sun className="mr-2 h-4 w-4 opacity-60" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
