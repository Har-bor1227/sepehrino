"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  CircleCheck,
  Clock3,
  ExternalLink,
  ListTodo,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import {
  markAllNotificationsAsReadAction,
  markNotificationAsReadAction,
} from "@/lib/actions/notification.actions";

type NotificationType =
  | "TASK_ASSIGNED"
  | "TASK_DEADLINE_NEAR"
  | "TASK_COMPLETED"
  | "PROJECT_STATUS_CHANGED";

type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType:
    | "USER"
    | "PROJECT"
    | "TASK"
    | "COMMENT"
    | "ATTACHMENT"
    | "NOTIFICATION"
    | "SYSTEM"
    | null;
  entityId: string | null;
  readAt: string | null;
  createdAt: string;
};

type NotificationPanelProps = {
  notifications: NotificationItem[];
  unreadCount: number;
  basePath:
    | "/admin"
    | "/employee";
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    "fa-IR",
    {
      calendar: "persian",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(
    new Date(value),
  );
}

function getIcon(
  type: NotificationType,
) {
  switch (type) {
    case "TASK_ASSIGNED":
      return ListTodo;

    case "TASK_DEADLINE_NEAR":
      return Clock3;

    case "TASK_COMPLETED":
      return CircleCheck;

    case "PROJECT_STATUS_CHANGED":
      return CheckCheck;
  }
}

function getNotificationTone(
  type: NotificationType,
  unread: boolean,
) {
  if (!unread) {
    return {
      icon:
        "bg-slate-900/7 text-slate-500",
      dot: "bg-slate-300",
    };
  }

  switch (type) {
    case "TASK_DEADLINE_NEAR":
      return {
        icon:
          "bg-amber-500/10 text-amber-600",
        dot: "bg-amber-500",
      };

    case "TASK_COMPLETED":
      return {
        icon:
          "bg-emerald-500/10 text-emerald-600",
        dot: "bg-emerald-500",
      };

    case "PROJECT_STATUS_CHANGED":
      return {
        icon:
          "bg-blue-500/10 text-blue-600",
        dot: "bg-blue-500",
      };

    case "TASK_ASSIGNED":
    default:
      return {
        icon:
          "bg-slate-900/8 text-slate-700",
        dot: "bg-slate-900",
      };
  }
}

export default function NotificationPanel({
  notifications,
  unreadCount,
  basePath,
}: NotificationPanelProps) {
  const router =
    useRouter();

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const [
    loadingId,
    setLoadingId,
  ] =
    useState<string | null>(
      null,
    );

  const handleRead = (
    notification: NotificationItem,
  ) => {
    if (notification.readAt) {
      if (
        notification.entityType ===
          "TASK" &&
        notification.entityId
      ) {
        router.push(
          `${basePath}/tasks/${notification.entityId}`,
        );
      }

      return;
    }

    setLoadingId(
      notification.id,
    );

    startTransition(
      async () => {
        const result =
          await markNotificationAsReadAction(
            notification.id,
          );

        setLoadingId(null);

        if (!result.success) {
          toast.error(
            result.message,
          );

          return;
        }

        router.refresh();

        if (
          notification.entityType ===
            "TASK" &&
          notification.entityId
        ) {
          router.push(
            `${basePath}/tasks/${notification.entityId}`,
          );
        }
      },
    );
  };

  const handleMarkAll =
    () => {
      if (
        unreadCount === 0 ||
        isPending
      ) {
        return;
      }

      startTransition(
        async () => {
          const result =
            await markAllNotificationsAsReadAction();

          if (
            !result.success
          ) {
            toast.error(
              result.message,
            );

            return;
          }

          toast.success(
            "همه اعلان‌ها خوانده شدند.",
          );

          router.refresh();
        },
      );
    };

  return (
    <section className="glass-card overflow-hidden rounded-[2rem]">
      <div className="border-b border-white/40 p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="glass-icon flex size-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900/7">
              <Bell className="size-5 text-slate-600" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900">
                  اعلان‌ها
                </h1>

                {unreadCount >
                0 ? (
                  <span className="rounded-full border border-red-200/40 bg-red-50/45 px-2.5 py-1 text-[10px] font-extrabold text-red-600">
                    {unreadCount.toLocaleString(
                      "fa-IR",
                    )}{" "}
                    جدید
                  </span>
                ) : null}
              </div>

              <p className="mt-1 text-sm text-slate-400">
                اعلان‌های مربوط به پروژه و Taskهای شما
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={
              handleMarkAll
            }
            disabled={
              unreadCount === 0 ||
              isPending
            }
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/60 bg-white/38 px-4 text-sm font-semibold text-slate-700 transition hover:bg-white/65 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCheck className="size-4" />
            )}

            خواندن همه
          </button>
        </div>
      </div>

      {unreadCount >
      0 ? (
        <div className="border-b border-white/35 bg-slate-900/[0.025] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3 rounded-2xl border border-white/45 bg-white/25 px-4 py-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-900/7">
              <Bell className="size-3.5 text-slate-500" />
            </span>

            <p className="text-sm text-slate-500">
              <strong className="font-extrabold text-slate-800">
                {unreadCount.toLocaleString(
                  "fa-IR",
                )}
              </strong>{" "}
              اعلان خوانده‌نشده دارید.
            </p>
          </div>
        </div>
      ) : null}

      {notifications.length ===
      0 ? (
        <div className="soft-grid flex min-h-72 flex-col items-center justify-center px-6 text-center">
          <div className="glass-icon flex size-16 items-center justify-center rounded-3xl">
            <Bell className="size-7 text-slate-400" />
          </div>

          <h2 className="mt-5 text-base font-extrabold text-slate-800">
            اعلان جدیدی ندارید
          </h2>

          <p className="mt-2 max-w-sm text-sm leading-7 text-slate-400">
            اعلان‌های جدید مربوط به Taskها و پروژه‌ها در این بخش نمایش داده می‌شوند.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-white/30">
          {notifications.map(
            (
              notification,
            ) => {
              const Icon =
                getIcon(
                  notification.type,
                );

              const unread =
                !notification.readAt;

              const tone =
                getNotificationTone(
                  notification.type,
                  unread,
                );

              const loading =
                isPending &&
                loadingId ===
                  notification.id;

              return (
                <article
                  key={
                    notification.id
                  }
                  className={`transition ${
                    unread
                      ? "bg-white/18"
                      : "bg-transparent"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      handleRead(
                        notification,
                      )
                    }
                    disabled={
                      loading
                    }
                    className="w-full p-5 text-right transition hover:bg-white/24 sm:p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${tone.icon}`}
                      >
                        {loading ? (
                          <Loader2 className="size-5 animate-spin" />
                        ) : (
                          <Icon className="size-5" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2
                                className={`text-sm leading-6 ${
                                  unread
                                    ? "font-extrabold text-slate-900"
                                    : "font-bold text-slate-700"
                                }`}
                              >
                                {
                                  notification.title
                                }
                              </h2>

                              {unread ? (
                                <span
                                  className={`size-2 shrink-0 rounded-full ${tone.dot}`}
                                />
                              ) : null}
                            </div>

                            <p className="mt-2 text-sm leading-7 text-slate-500">
                              {
                                notification.message
                              }
                            </p>
                          </div>

                          {notification.entityType ===
                            "TASK" &&
                          notification.entityId ? (
                            <span className="hidden shrink-0 rounded-xl bg-white/35 p-2 text-slate-400 sm:block">
                              <ExternalLink className="size-4" />
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <span className="glass-chip rounded-full px-3 py-1.5 text-[11px] font-medium text-slate-400">
                            {formatDate(
                              notification.createdAt,
                            )}
                          </span>

                          {notification.entityType ===
                            "TASK" &&
                          notification.entityId ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/50 bg-white/25 px-3 py-1.5 text-[11px] font-bold text-slate-500">
                              مشاهده Task
                              <ExternalLink className="size-3.5" />
                            </span>
                          ) : null}

                          {!unread ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
                              خوانده شده
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </button>
                </article>
              );
            },
          )}
        </div>
      )}
    </section>
  );
}