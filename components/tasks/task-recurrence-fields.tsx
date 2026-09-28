"use client";

import {
  CalendarDays,
  ChevronDown,
  Repeat2,
} from "lucide-react";

import { PersianDatePicker } from "@/components/ui/persian-date-picker";

export type TaskRecurrenceType =
  | "NONE"
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY";

type RecurrenceErrors = {
  recurrenceType?: string;
  recurrenceStartDate?: string;
  recurrenceWeekdays?: string;
  recurrenceDayOfMonth?: string;
};

type TaskRecurrenceFieldsProps = {
  isRecurring: boolean;
  recurrenceType: TaskRecurrenceType;
  recurrenceStartDate: string;
  recurrenceWeekdays: number[];
  recurrenceDayOfMonth: number | null;
  recurrenceActive: boolean;

  onIsRecurringChange: (
    value: boolean,
  ) => void;

  onRecurrenceTypeChange: (
    value: Exclude<
      TaskRecurrenceType,
      "NONE"
    >,
  ) => void;

  onRecurrenceStartDateChange: (
    value: string,
  ) => void;

  onRecurrenceWeekdaysChange: (
    value: number[],
  ) => void;

  onRecurrenceDayOfMonthChange: (
    value: number | null,
  ) => void;

  onRecurrenceActiveChange?: (
    value: boolean,
  ) => void;

  errors?: RecurrenceErrors;

  showActiveToggle?: boolean;

  disabled?: boolean;
};

const RECURRENCE_OPTIONS = [
  {
    value: "DAILY",
    label: "روزانه",
    description:
      "هر روز یک Occurrence جدید",
  },
  {
    value: "WEEKLY",
    label: "هفتگی",
    description:
      "در روزهای انتخاب‌شده هر هفته",
  },
  {
    value: "MONTHLY",
    label: "ماهانه",
    description:
      "در روز مشخص‌شده هر ماه",
  },
] as const;

const WEEKDAY_OPTIONS = [
  {
    value: 6,
    label: "شنبه",
  },
  {
    value: 7,
    label: "یکشنبه",
  },
  {
    value: 1,
    label: "دوشنبه",
  },
  {
    value: 2,
    label: "سه‌شنبه",
  },
  {
    value: 3,
    label: "چهارشنبه",
  },
  {
    value: 4,
    label: "پنجشنبه",
  },
  {
    value: 5,
    label: "جمعه",
  },
] as const;

const MONTH_DAYS = Array.from(
  { length: 31 },
  (_, index) => index + 1,
);

export default function TaskRecurrenceFields({
  isRecurring,
  recurrenceType,
  recurrenceStartDate,
  recurrenceWeekdays,
  recurrenceDayOfMonth,
  recurrenceActive,
  onIsRecurringChange,
  onRecurrenceTypeChange,
  onRecurrenceStartDateChange,
  onRecurrenceWeekdaysChange,
  onRecurrenceDayOfMonthChange,
  onRecurrenceActiveChange,
  errors,
  showActiveToggle = false,
  disabled = false,
}: TaskRecurrenceFieldsProps) {
  const toggleWeekday = (
    weekday: number,
  ) => {
    const exists =
      recurrenceWeekdays.includes(
        weekday,
      );

    const next = exists
      ? recurrenceWeekdays.filter(
          (value) =>
            value !== weekday,
        )
      : [
          ...recurrenceWeekdays,
          weekday,
        ];

    onRecurrenceWeekdaysChange(
      next.sort(
        (a, b) => a - b,
      ),
    );
  };

  return (
    <section className="space-y-4 rounded-3xl border border-white/55 bg-white/24 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900/7 text-slate-700">
            <Repeat2 className="size-5" />
          </div>

          <div>
            <p className="text-sm font-extrabold text-slate-800">
              تکرار Task
            </p>

            <p className="mt-1 max-w-xl text-xs leading-6 text-slate-400">
              برای Taskهایی که باید طبق یک برنامه مشخص به‌صورت
              روزانه، هفتگی یا ماهانه تکرار شوند.
            </p>
          </div>
        </div>

        <label
          className={`inline-flex cursor-pointer items-center gap-3 ${
            disabled
              ? "cursor-not-allowed opacity-50"
              : ""
          }`}
        >
          <span className="text-sm font-bold text-slate-700">
            Task تکرارشونده
          </span>

          <input
            type="checkbox"
            checked={isRecurring}
            disabled={disabled}
            onChange={(event) =>
              onIsRecurringChange(
                event.target.checked,
              )
            }
            className="peer sr-only"
          />

          <span className="relative h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-slate-900 peer-focus-visible:ring-2 peer-focus-visible:ring-slate-300">
            <span className="absolute right-1 top-1 size-4 rounded-full bg-white shadow-sm transition peer-checked:-translate-x-5" />
          </span>
        </label>
      </div>

      {isRecurring ? (
        <div className="space-y-5 border-t border-white/35 pt-5">
          <div className="grid gap-3 md:grid-cols-3">
            {RECURRENCE_OPTIONS.map(
              (option) => {
                const selected =
                  recurrenceType ===
                  option.value;

                return (
                  <button
                    key={
                      option.value
                    }
                    type="button"
                    disabled={
                      disabled
                    }
                    onClick={() =>
                      onRecurrenceTypeChange(
                        option.value,
                      )
                    }
                    className={`rounded-2xl border p-4 text-right transition ${
                      selected
                        ? "border-slate-900 bg-slate-900 text-white shadow-[0_12px_24px_rgba(15,23,42,0.12)]"
                        : "border-white/60 bg-white/35 text-slate-700 hover:bg-white/65"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-extrabold">
                        {
                          option.label
                        }
                      </span>

                      <span
                        className={`size-3 rounded-full border-2 ${
                          selected
                            ? "border-white bg-white"
                            : "border-slate-300"
                        }`}
                      />
                    </div>

                    <p
                      className={`mt-2 text-[11px] leading-5 ${
                        selected
                          ? "text-white/70"
                          : "text-slate-400"
                      }`}
                    >
                      {
                        option.description
                      }
                    </p>
                  </button>
                );
              },
            )}
          </div>

          {errors?.recurrenceType ? (
            <p className="text-xs font-medium text-red-600">
              {
                errors.recurrenceType
              }
            </p>
          ) : null}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              تاریخ شروع تکرار
            </label>

            <PersianDatePicker
              id="task-recurrence-start"
              value={
                recurrenceStartDate
              }
              onChange={
                onRecurrenceStartDateChange
              }
              error={
                !!errors?.recurrenceStartDate
              }
              placeholder="انتخاب تاریخ شروع"
            />

            {errors?.recurrenceStartDate ? (
              <p className="text-xs font-medium text-red-600">
                {
                  errors
                    .recurrenceStartDate
                }
              </p>
            ) : null}

            <p className="flex items-center gap-1.5 text-[11px] leading-5 text-slate-400">
              <CalendarDays className="size-3.5" />
              Task از این تاریخ وارد برنامه تکرار می‌شود.
            </p>
          </div>

          {recurrenceType ===
          "WEEKLY" ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  روزهای هفته
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  حداقل یک روز باید انتخاب شود.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                {WEEKDAY_OPTIONS.map(
                  (weekday) => {
                    const selected =
                      recurrenceWeekdays.includes(
                        weekday.value,
                      );

                    return (
                      <button
                        key={
                          weekday.value
                        }
                        type="button"
                        disabled={
                          disabled
                        }
                        onClick={() =>
                          toggleWeekday(
                            weekday.value,
                          )
                        }
                        className={`inline-flex min-h-11 items-center justify-center rounded-xl border px-3 py-2 text-xs font-bold transition ${
                          selected
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-white/60 bg-white/35 text-slate-600 hover:bg-white/65"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {
                          weekday.label
                        }
                      </button>
                    );
                  },
                )}
              </div>

              {errors?.recurrenceWeekdays ? (
                <p className="text-xs font-medium text-red-600">
                  {
                    errors
                      .recurrenceWeekdays
                  }
                </p>
              ) : null}
            </div>
          ) : null}

          {recurrenceType ===
          "MONTHLY" ? (
            <div className="space-y-2">
              <label
                htmlFor="task-recurrence-day"
                className="text-sm font-semibold text-slate-700"
              >
                روز ماه
              </label>

              <div className="relative">
                <select
                  id="task-recurrence-day"
                  value={
                    recurrenceDayOfMonth ??
                    ""
                  }
                  disabled={disabled}
                  onChange={(event) =>
                    onRecurrenceDayOfMonthChange(
                      event.target
                        .value
                        ? Number(
                            event
                              .target
                              .value,
                          )
                        : null,
                    )
                  }
                  className="glass-field h-11 w-full appearance-none rounded-xl px-3.5 pl-10 text-sm font-medium text-slate-700 outline-none disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    انتخاب روز ماه
                  </option>

                  {MONTH_DAYS.map(
                    (day) => (
                      <option
                        key={day}
                        value={day}
                      >
                        روز{" "}
                        {day.toLocaleString(
                          "fa-IR",
                        )}
                      </option>
                    ),
                  )}
                </select>

                <ChevronDown className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              </div>

              {errors?.recurrenceDayOfMonth ? (
                <p className="text-xs font-medium text-red-600">
                  {
                    errors
                      .recurrenceDayOfMonth
                  }
                </p>
              ) : null}

              <p className="text-[11px] leading-5 text-slate-400">
                اگر روز انتخاب‌شده در یک ماه وجود نداشته باشد،
                برای آن ماه Occurrence ساخته نمی‌شود.
              </p>
            </div>
          ) : null}

          <div className="rounded-2xl border border-sky-200/45 bg-sky-50/45 p-3.5">
            <p className="text-xs font-bold text-sky-800">
              بدون تاریخ پایان
            </p>

            <p className="mt-1 text-[11px] leading-5 text-sky-700/70">
              تکرار تا زمانی که مدیر آن را متوقف کند ادامه خواهد داشت
              و سابقه Occurrenceهای قبلی حفظ می‌شود.
            </p>
          </div>

          {showActiveToggle &&
          onRecurrenceActiveChange ? (
            <label
              className={`flex items-center justify-between gap-4 rounded-2xl border border-white/55 bg-white/30 p-4 ${
                disabled
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer"
              }`}
            >
              <div>
                <p className="text-sm font-bold text-slate-700">
                  تکرار فعال باشد
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  با خاموش‌کردن این گزینه Occurrence جدیدی ایجاد
                  نمی‌شود، اما تاریخچه قبلی باقی می‌ماند.
                </p>
              </div>

              <input
                type="checkbox"
                checked={
                  recurrenceActive
                }
                disabled={disabled}
                onChange={(event) =>
                  onRecurrenceActiveChange(
                    event.target
                      .checked,
                  )
                }
                className="size-4 accent-slate-900"
              />
            </label>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}