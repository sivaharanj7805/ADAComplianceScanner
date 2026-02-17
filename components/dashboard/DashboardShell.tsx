'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import type { Profile } from '@/lib/types/database';
import { DashboardProvider } from './DashboardContext';

interface DashboardShellProps {
  profile: Profile;
  children: React.ReactNode;
}

export default function DashboardShell({
  profile,
  children,
}: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <DashboardProvider profile={profile}>
      <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
        <Sidebar
          plan={profile.plan}
          collapsed={sidebarCollapsed}
          mobileOpen={mobileOpen}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onCloseMobile={() => setMobileOpen(false)}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar
            email={profile.email}
            fullName={profile.full_name}
            onMenuClick={() => setMobileOpen(true)}
          />

          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}
