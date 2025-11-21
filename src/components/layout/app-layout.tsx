import React from 'react';
import { Outlet, useLocation } from 'react-router';
import { GlobalHeader } from './global-header';
import { AppDock } from './app-dock';
import { AppsDataProvider } from '@/contexts/apps-data-context';
import BackgroundPaths from '@/components/background-paths';
import clsx from 'clsx';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { pathname } = useLocation();
  return (
    <AppsDataProvider>
      <div className="relative min-h-screen w-full">
        {/* Global background */}
        <BackgroundPaths />

        {/* macOS-style Dock */}
        <AppDock />

        {/* Main content */}
        <div className={clsx(
          "relative z-10 flex flex-col h-screen",
          // Add left padding on desktop for dock
          "md:pl-24",
          // Add bottom padding on mobile for dock
          "pb-24 md:pb-0"
        )}>
          <GlobalHeader />
          <main className={clsx(
            "flex-1",
            pathname !== "/" && "min-h-0 overflow-auto"
          )}>
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </AppsDataProvider>
  );
}