import {
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  Circle,
  Repeat2,
  UserRound,
  XCircle,
} from "lucide-react";

import { getAdminRecurringTasksToday } from "@/lib/services/task.service";

type RecurrenceType =
  | "NONE"
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY";

const RECURRENCE_LABELS: Record<
  RecurrenceType,
  string
> = {
  NONE: "عادی",
  DAILY: "روزانه",
  WEEKLY: "هفتگی",
  MONTHLY: "ماهانه",
};

function formatTime(date: Date) {
  return new Intl.DateTimeFormat(
    "fa-IR",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat(
    "fa-IR",
    {
      calendar: "persian",
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  ).format(date);
}

export default async function RecurringTasksToday() {
  const tasks =
    await getAdminRecurringTasksToday();

  return (
    <section
      className="mt-8 rounded-[2rem] border border-slate-200/70 bg-white/75 p-4 shadow-sm backdrop-blur-xl sm:p-6"
      dir="rtl"
    >
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <Repeat2 className="size-5" />
            </div>

            <div>
              <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">
                وضعیت تسک‌های تکرارشونده امروز
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                بررسی انجام شدن تسک‌های برنامه‌ریزی‌شده توسط کارمندان
              </p>
            </div>
          </div>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
          <CalendarCheck2 className="size-3.5" />
          {formatDate(new Date())}
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-10 text-center">
          <Repeat2 className="mx-auto size-8 text-slate-300" />

          <p className="mt-3 text-sm font-bold text-slate-600">
            امروز هیچ تسک تکرارشونده‌ای در برنامه نیست.
          </p>

          <p className="mt-1 text-xs text-slate-400">
            در صورت وجود تسک روزانه، هفتگی یا ماهانه، وضعیت آن در این بخش نمایش داده می‌شود.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {tasks.map((task) => {
            const completed =
              task.todayOccurrence
                ?.completed ??
              false;

            return (
              <div
                key={task.id}
                className={`rounded-2xl border p-4 transition ${
                  completed
                    ? "border-emerald-200/70 bg-emerald-50/40"
                    : "border-amber-200/70 bg-amber-50/35"
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-extrabold text-slate-900">
                        {task.title}
                      </h3>

                      <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-700">
                        <Repeat2 className="size-3" />

                        {
                          RECURRENCE_LABELS[
                            task
                              .recurrenceType
                          ]
                        }
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                      <span>
                        {
                          task.project
                            .title
                        }
                      </span>

                      <span className="inline-flex items-start gap-1">
                        <UserRound className="mt-0.5 size-3.5 shrink-0" />

                        {task.assignees.length >
                        0 ? (
                          <span className="flex flex-wrap items-center gap-1.5">
                            {task.assignees.map(
                              (
                                assignee,
                              ) => (
                                <span
                                  key={
                                    assignee
                                      .user
                                      .id
                                  }
                                  className="inline-flex rounded-full bg-white/65 px-2 py-1 font-semibold text-slate-600"
                                >
                                  {
                                    assignee
                                      .user
                                      .name
                                  }
                                </span>
                              ),
                            )}
                          </span>
                        ) : (
                          <span>
                            بدون کارمند
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    {completed ? (
                      <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-100/70 px-3 py-2 text-xs font-extrabold text-emerald-700">
                        <CheckCircle2 className="size-4" />
                        انجام شده

                        {task
                          .todayOccurrence
                          ?.completedAt ? (
                          <span className="inline-flex items-center gap-1 border-r border-emerald-200 pr-2 font-medium">
                            <Clock3 className="size-3.5" />

                            {formatTime(
                              task
                                .todayOccurrence
                                .completedAt,
                            )}
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-100/70 px-3 py-2 text-xs font-extrabold text-amber-700">
                        <Circle className="size-4" />
                        هنوز انجام نشده
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tasks.length > 0 ? (
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-600" />
            انجام شده
          </span>

          <span className="inline-flex items-center gap-1.5">
            <XCircle className="size-3.5 text-amber-600" />
            انجام نشده
          </span>

          <span className="mr-auto font-medium">
            مجموع:{" "}
            {tasks.length.toLocaleString(
              "fa-IR",
            )}{" "}
            تسک
          </span>
        </div>
      ) : null}
    </section>
  );
}