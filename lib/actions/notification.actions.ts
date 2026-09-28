
"use server";

import { revalidatePath } from "next/cache";

import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/services/notification.service";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    switch (error.message) {
      case "NOTIFICATION_NOT_FOUND":
        return "اعلان موردنظر پیدا نشد.";

      default:
        return (
          error.message ||
          "خطایی در انجام عملیات رخ داد."
        );
    }
  }

  return "خطایی در انجام عملیات رخ داد.";
}

export async function markNotificationAsReadAction(
  notificationId: string,
) {
  try {
    const result =
      await markNotificationAsRead(
        notificationId,
      );

    revalidatePath("/admin/notifications");
    revalidatePath("/employee/notifications");

    return {
      success: true as const,
      result,
    };
  } catch (error) {
    return {
      success: false as const,
      message: getErrorMessage(error),
    };
  }
}

export async function markAllNotificationsAsReadAction() {
  try {
    const result =
      await markAllNotificationsAsRead();

    revalidatePath("/admin/notifications");
    revalidatePath("/employee/notifications");

    return {
      success: true as const,
      result,
    };
  } catch (error) {
    return {
      success: false as const,
      message: getErrorMessage(error),
    };
  }
}

