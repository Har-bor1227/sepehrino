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

      {/* هر صفحه <main> خودش را دارد؛ این div فقط هدف لینک «پرش به محتوا» است */}
      <div
        id="main-content"
        tabIndex={-1}
        className="min-h-screen outline-none lg:pr-64"
      >
        {children}
      </div>
    </PanelShell>
  );
}
