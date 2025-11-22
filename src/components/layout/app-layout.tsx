import React from 'react';
import { Outlet, useLocation } from 'react-router';
import { AppSidebar } from './app-sidebar';
import { GlobalHeader } from './global-header';
import { AppsDataProvider } from '@/contexts/apps-data-context';
import clsx from 'clsx';
import BackgroundPaths from '@/components/background-paths';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { pathname } = useLocation();
  return (
    <AppsDataProvider>
      <BackgroundPaths />
      <div className="flex flex-col h-screen relative">
        <GlobalHeader />
        <main className={clsx("flex-1", pathname !== "/" && "min-h-0 overflow-auto")}>
          {children || <Outlet />}
        </main>
        <AppSidebar />
      </div>
    </AppsDataProvider>
  );
}