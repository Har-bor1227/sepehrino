import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { PanelShell } from "@/components/panel/panel-shell";
import { requireAdmin } from "@/lib/auth/guards";
import {
  getUnreadNotificationCount,
} from "@/lib/services/notification.service";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session =
    await requireAdmin();

  const unreadNotifications =
    await getUnreadNotificationCount();

  return (
    <PanelShell>
      <AdminSidebar
        userName={session.user.name}
        unreadNotifications={
          unreadNotifications
        }
      />

      <main className="min-h-screen lg:pr-64">
        {children}
      </main>
    </PanelShell>
  );
}