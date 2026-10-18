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
    | "SUB_PROJECT"
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
  basePath: "/admin" | "/employee";
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    calendar: "persian",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getNotificationConfig(type: NotificationType) {
  switch (type) {
    case "TASK_ASSIGNED":
      return {
        Icon: ListTodo,
        label: "تسک جدید",
        iconClass: "bg-indigo-100 text-indigo-700 ring-indigo-200/80",
        borderClass: "border-indigo-200/80",
        gradientClass: "from-indigo-50/95 via-white to-white",
        badgeClass: "border-indigo-200 bg-indigo-100/80 text-indigo-800",
        dotClass: "bg-indigo-500",
      };

    case "TASK_DEADLINE_NEAR":
      return {
        Icon: Clock3,
        label: "یادآوری مهلت",
        iconClass: "bg-amber-100 text-amber-700 ring-amber-200/80",
        borderClass: "border-amber-200/80",
        gradientClass: "from-amber-50/95 via-white to-white",
        badgeClass: "border-amber-200 bg-amber-100/80 text-amber-800",
        dotClass: "bg-amber-500",
      };

    case "TASK_COMPLETED":
      return {
        Icon: CircleCheck,
        label: "تسک تکمیل‌شده",
        iconClass: "bg-emerald-100 text-emerald-700 ring-emerald-200/80",
        borderClass: "border-emerald-200/80",
        gradientClass: "from-emerald-50/95 via-white to-white",
        badgeClass: "border-emerald-200 bg-emerald-100/80 text-emerald-800",
        dotClass: "bg-emerald-500",
      };

    case "PROJECT_STATUS_CHANGED":
      return {
        Icon: CheckCheck,
        label: "وضعیت پروژه",
        iconClass: "bg-sky-100 text-sky-700 ring-sky-200/80",
        borderClass: "border-sky-200/80",
        gradientClass: "from-sky-50/95 via-white to-white",
        badgeClass: "border-sky-200 bg-sky-100/80 text-sky-800",
        dotClass: "bg-sky-500",
      };
  }
}

export default function NotificationPanel({
  notifications,
  unreadCount,
  basePath,
}: NotificationPanelProps) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleRead = (notification: NotificationItem) => {
    if (notification.readAt) {
      if (
        notification.entityType === "TASK" &&
        notification.entityId
      ) {
        router.push(
          `${basePath}/tasks/${notification.entityId}`,
        );
      }

      return;
    }

    setLoadingId(notification.id);

    startTransition(async () => {
      try {
        const result = await markNotificationAsReadAction(
          notification.id,
        );

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        router.refresh();

        if (
          notification.entityType === "TASK" &&
          notification.entityId
        ) {
          router.push(
            `${basePath}/tasks/${notification.entityId}`,
          );
        }
      } catch {
        toast.error("خواندن اعلان با خطا مواجه شد.");
      } finally {
        setLoadingId(null);
      }
    });
  };

  const handleMarkAll = () => {
    if (unreadCount === 0 || isPending) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await markAllNotificationsAsReadAction();

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success("همه اعلان‌ها خوانده شدند.");
        router.refresh();
      } catch {
        toast.error("علامت‌گذاری اعلان‌ها با خطا مواجه شد.");
      }
    });
  };

  return (
    <section
      dir="rtl"
      className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-xl shadow-slate-900/[0.04]"
    >
      {/* Header */}
      <header className="border-b border-slate-200/70 bg-gradient-to-l from-indigo-50/80 via-white to-slate-50/90 p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3.5 sm:gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-900/15 sm:size-14">
              <Bell className="size-6 sm:size-7" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                  اعلان‌ها
                </h1>

                {unreadCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-extrabold text-rose-700 sm:text-sm">
                    <span className="size-1.5 rounded-full bg-rose-500" />
                    {unreadCount.toLocaleString("fa-IR")} جدید
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm leading-7 text-slate-600 sm:text-base">
                آخرین رویدادها و تغییرات مربوط به تسک‌ها و پروژه‌های شما
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleMarkAll}
            disabled={unreadCount === 0 || isPending}
            className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2.5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-extrabold text-white shadow-md shadow-indigo-900/10 transition duration-200 hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none sm:w-auto sm:text-base"
          >
            {isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <CheckCheck className="size-5" />
            )}

            خواندن همه اعلان‌ها
          </button>
        </div>

        {unreadCount > 0 && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-indigo-100 bg-white/80 p-4 shadow-sm shadow-indigo-950/[0.02]">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <Bell className="size-4.5" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-extrabold leading-6 text-slate-800 sm:text-base">
                اعلان‌های جدید شما
              </p>

              <p className="mt-1 text-sm leading-7 text-slate-600">
                <strong className="font-black text-indigo-700">
                  {unreadCount.toLocaleString("fa-IR")} اعلان
                </strong>{" "}
                هنوز خوانده نشده است.
              </p>
            </div>
          </div>
        )}
      </header>

      {/* Notification list */}
      {notifications.length === 0 ? (
        <div className="bg-gradient-to-b from-slate-50/80 to-white px-5 py-14 text-center sm:py-20">
          <div className="mx-auto flex size-20 items-center justify-center rounded-[1.75rem] border border-slate-200 bg-white text-slate-400 shadow-sm">
            <Bell className="size-9" />
          </div>

          <h2 className="mt-6 text-lg font-black text-slate-800 sm:text-xl">
            فعلاً خبری نیست!
          </h2>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-8 text-slate-600 sm:text-base">
            اعلان‌های مربوط به تسک‌ها و پروژه‌های شما در این بخش نمایش داده می‌شوند.
          </p>
        </div>
      ) : (
        <div className="space-y-3 bg-slate-50/80 p-3 sm:space-y-4 sm:p-5">
          {notifications.map((notification) => {
            const config = getNotificationConfig(notification.type);
            const Icon = config.Icon;
            const unread = !notification.readAt;
            const loading =
              isPending && loadingId === notification.id;

            return (
              <article
                key={notification.id}
                className="min-w-0"
              >
                <button
                  type="button"
                  onClick={() => handleRead(notification)}
                  disabled={loading}
                  aria-label={`مشاهده اعلان: ${notification.title}`}
                  className={[
                    "group relative block w-full min-w-0 overflow-hidden rounded-[1.4rem] border p-4 text-right transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 sm:p-5",
                    unread
                      ? `border ${config.borderClass} bg-gradient-to-l ${config.gradientClass} shadow-sm hover:-translate-y-0.5 hover:shadow-md`
                      : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/80",
                    loading ? "cursor-wait opacity-75" : "",
                  ].join(" ")}
                >
                  {unread && (
                    <span
                      className={`absolute inset-y-4 right-0 w-1 rounded-l-full ${config.dotClass}`}
                    />
                  )}

                  <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                    {/* Icon */}
                    <div
                      className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ring-1 ring-inset transition-transform duration-200 group-hover:scale-105 sm:size-14 ${config.iconClass}`}
                    >
                      {loading ? (
                        <Loader2 className="size-6 animate-spin" />
                      ) : (
                        <Icon className="size-6 sm:size-7" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h2
                          className={`min-w-0 break-words text-base leading-7 sm:text-lg sm:leading-8 ${
                            unread
                              ? "font-black text-slate-900"
                              : "font-bold text-slate-800"
                          }`}
                        >
                          {notification.title}
                        </h2>

                        {unread && (
                          <span
                            className={`size-2 shrink-0 rounded-full ring-4 ring-white/80 ${config.dotClass}`}
                            aria-label="خوانده‌نشده"
                          />
                        )}
                      </div>

                      <p
                        className={`mt-2 break-words text-[15px] leading-8 sm:text-base ${
                          unread
                            ? "font-medium text-slate-700"
                            : "text-slate-600"
                        }`}
                      >
                        {notification.message}
                      </p>

                      {/* Metadata */}
                      <div className="mt-4 flex min-w-0 flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-xs font-extrabold sm:text-sm ${config.badgeClass}`}
                        >
                          {config.label}
                        </span>

                        <span className="inline-flex min-h-8 max-w-full items-center rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-semibold leading-5 text-slate-600 sm:text-sm">
                          <Clock3 className="ml-1.5 size-3.5 shrink-0 text-slate-400" />
                          <span className="break-words">
                            {formatDate(notification.createdAt)}
                          </span>
                        </span>

                        {!unread && (
                          <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 sm:text-sm">
                            <CircleCheck className="size-4" />
                            خوانده شده
                          </span>
                        )}
                      </div>

                      {notification.entityType === "TASK" &&
                        notification.entityId && (
                          <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200/70 pt-3">
                            <span className="inline-flex items-center gap-2 text-sm font-extrabold text-indigo-700 transition-colors group-hover:text-indigo-900 sm:text-base">
                              مشاهده جزئیات تسک
                              <ExternalLink className="size-4 shrink-0" />
                            </span>

                            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100">
                              <ExternalLink className="size-4" />
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}