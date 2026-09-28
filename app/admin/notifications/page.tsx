import { requireAdmin } from "@/lib/auth/guards";
import {
  getUnreadNotificationCount,
  getUserNotifications,
} from "@/lib/services/notification.service";

import NotificationPanel from "@/components/notifications/notification-panel";

export default async function AdminNotificationsPage() {
  await requireAdmin();

  const [
    notifications,
    unreadCount,
  ] = await Promise.all([
    getUserNotifications(),
    getUnreadNotificationCount(),
  ]);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1000px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <NotificationPanel
          basePath="/admin"
          unreadCount={unreadCount}
          notifications={notifications.map(
            (notification) => ({
              ...notification,
              readAt:
                notification.readAt?.toISOString() ??
                null,
              createdAt:
                notification.createdAt.toISOString(),
            }),
          )}
        />
      </div>
    </main>
  );
}