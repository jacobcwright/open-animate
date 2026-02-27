'use client';

import { useSidebar } from './sidebar-provider';
import { cn } from '@/lib/utils';

export function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <main
      className={cn(
        'p-8 max-w-6xl transition-all duration-200',
        isCollapsed ? 'ml-16' : 'ml-60'
      )}
    >
      {children}
    </main>
  );
}
