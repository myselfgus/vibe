import React from 'react';
import { Outlet, useLocation } from 'react-router';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
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
      <SidebarProvider 
        defaultOpen={false}
        style={{
          "--sidebar-width": "320px",
          "--sidebar-width-mobile": "280px",
          "--sidebar-width-icon": "52px"
        } as React.CSSProperties}
      >
        <AppSidebar />
        <SidebarInset className={clsx("flex flex-col h-screen relative", pathname !== "/" && "overflow-hidden")}>
          <GlobalHeader />
          <div className={clsx("flex-1", pathname !== "/" && "min-h-0 overflow-auto")}>
            {children || <Outlet />}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AppsDataProvider>
  );
}