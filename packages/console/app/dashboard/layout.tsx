import { Sidebar } from '@/components/sidebar';
import { SidebarProvider } from '@/components/sidebar-provider';
import { DashboardContent } from '@/components/dashboard-content';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-surface bg-grid">
        <div className="relative z-10">
          <Sidebar />
          <DashboardContent>{children}</DashboardContent>
        </div>
      </div>
    </SidebarProvider>
  );
}
