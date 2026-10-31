import "./employee-modern.css";
import { EmployeeSidebar } from "@/components/employee/employee-sidebar";
import { PanelShell } from "@/components/panel/panel-shell";
import { requireEmployee } from "@/lib/auth/guards";
import { getUnreadNotificationCount } from "@/lib/services/notification.service";

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const session = await requireEmployee();
  const unreadNotifications = await getUnreadNotificationCount();

  return (
    <PanelShell>
      <div className="employee-app" dir="rtl">
        <EmployeeSidebar userName={session.user.name} unreadNotifications={unreadNotifications} />
        {/* هر صفحه <main> خودش را دارد؛ این div هدف لینک «پرش به محتوا» در layout اصلی است */}
        <div
          id="main-content"
          tabIndex={-1}
          className="employee-ui min-h-screen min-w-0 pb-[calc(6.25rem+env(safe-area-inset-bottom))] outline-none lg:pb-0 lg:pr-64"
        >
          {children}
        </div>
      </div>
    </PanelShell>
  );
}
