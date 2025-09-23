'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

import { LaptopMinimalCheck, Moon, Sun } from 'lucide-react';

import { useThemeSync } from '@/hooks/useThemeSync';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  // Use our custom hook to ensure theme changes are properly applied
  useThemeSync();

  useEffect(() => {
    setMounted(true);

    // Force apply the theme class when the component mounts
    const isDark = resolvedTheme === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [resolvedTheme]);

  // Only render the toggle after mounting to avoid hydration mismatch
  if (!mounted) {
    // Return a placeholder with the same dimensions to prevent layout shift
    return <div className="h-10 w-10"></div>;
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-accent focus:ring-0 focus-visible:ring-0 active:ring-0"
          onMouseEnter={() => setOpen(true)}
        >
          <Sun className={`size-5 ${resolvedTheme === 'light' ? 'block' : 'hidden'}`} />
          <Moon className={`size-5 ${resolvedTheme === 'dark' ? 'block' : 'hidden'}`} />
          <LaptopMinimalCheck
            className={`size-5 ${!resolvedTheme || (theme === 'system' && resolvedTheme !== 'dark' && resolvedTheme !== 'light') ? 'block' : 'hidden'}`}
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-background rounded-md border border-gray-200 p-1 shadow-md dark:border-gray-800"
        onMouseLeave={() => setOpen(false)}
      >
        <DropdownMenuItem
          onClick={() => {
            setTheme('light');
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
          }}
          className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm"
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setTheme('dark');
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark');
          }}
          className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm"
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm"
        >
          <LaptopMinimalCheck className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
