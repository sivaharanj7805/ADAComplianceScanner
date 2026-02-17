'use client';

import { createContext, useContext } from 'react';
import type { Profile } from '@/lib/types/database';

interface DashboardContextValue {
  profile: Profile;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  return (
    <DashboardContext.Provider value={{ profile }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error('useDashboard must be used inside <DashboardProvider>');
  }
  return ctx;
}
