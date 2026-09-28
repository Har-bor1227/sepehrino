import { EmployeeSidebar } from "@/components/employee/employee-sidebar";
import { PanelShell } from "@/components/panel/panel-shell";
import { requireEmployee } from "@/lib/auth/guards";
import {
  getUnreadNotificationCount,
} from "@/lib/services/notification.service";

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session =
    await requireEmployee();

  const unreadNotifications =
    await getUnreadNotificationCount();

  return (
    <PanelShell>
      <EmployeeSidebar
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