"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  LogIn,
  LogOut,
  LoaderCircle,
} from "lucide-react";

import {
  checkInHozorinoAction,
  checkOutHozorinoAction,
} from "@/lib/actions/employee.actions";

import type {
  HozorinoAttendance,
} from "@/lib/services/hozorino-integration.service";

type AttendanceActionsProps = {
  attendance: HozorinoAttendance;
};

type ActionFeedback = {
  success: boolean;
  message: string;
};

export function AttendanceActions({
  attendance,
}: AttendanceActionsProps) {
  const router = useRouter();

  const [isPending, startTransition] =
    useTransition();

  const [feedback, setFeedback] =
    useState<ActionFeedback | null>(null);

  const isWorkingDay =
    attendance.isWorkingDay &&
    !attendance.isHoliday &&
    !attendance.isLeave &&
    !attendance.isFuture;

  const hasCheckedIn =
    Boolean(attendance.checkIn);

  const hasCheckedOut =
    Boolean(attendance.checkOut);

  const hasOpenTemporaryExit =
    attendance.temporaryExits.some(
      (exit) => exit.status === "OPEN",
    );

  function submitAction(
    action: "checkIn" | "checkOut",
  ) {
    if (isPending) {
      return;
    }

    setFeedback(null);

    startTransition(async () => {
      try {
        const result =
          action === "checkIn"
            ? await checkInHozorinoAction()
            : await checkOutHozorinoAction();

        setFeedback(result);

        if (result.success) {
          router.refresh();
        }
      } catch {
        setFeedback({
          success: false,
          message:
            "ارتباط با سامانه برقرار نشد. وضعیت حضور خود را دوباره بررسی کنید.",
        });
      }
    });
  }

  return (
    <section
      dir="rtl"
      aria-labelledby="attendance-actions-title"
      className="glass-strong rounded-[2rem] p-5 sm:p-6 lg:p-7"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2
            id="attendance-actions-title"
            className="text-lg font-extrabold text-slate-900"
          >
            عملیات حضور و غیاب
          </h2>

          <p className="mt-2 text-sm leading-7 text-slate-500">
            ثبت ورود و خروج مستقیماً در حضورینو انجام می‌شود.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!hasCheckedIn && isWorkingDay ? (
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                submitAction("checkIn")
              }
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(5,150,105,0.16)] transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <LoaderCircle className="size-5 animate-spin" />
              ) : (
                <LogIn className="size-5" />
              )}

              ثبت ورود
            </button>
          ) : null}

          {hasCheckedIn && !hasCheckedOut ? (
            <button
              type="button"
              disabled={isPending || hasOpenTemporaryExit}
              onClick={() =>
                submitAction("checkOut")
              }
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(15,23,42,0.14)] transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-900/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <LoaderCircle className="size-5 animate-spin" />
              ) : (
                <LogOut className="size-5" />
              )}

              ثبت خروج نهایی
            </button>
          ) : null}

          {hasCheckedIn && hasCheckedOut ? (
            <div className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
              <CheckCircle2 className="size-5" />
              ورود و خروج امروز ثبت شده است
            </div>
          ) : null}
        </div>
      </div>

      {!hasCheckedIn && !isWorkingDay ? (
        <div
          role="status"
          className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/60 p-4"
        >
          <Clock3 className="mt-0.5 size-5 shrink-0 text-slate-500" />

          <p className="text-sm leading-7 text-slate-600">
            {attendance.isHoliday
              ? "امروز تعطیل رسمی است و امکان ثبت ورود وجود ندارد."
              : attendance.isLeave
                ? "برای امروز مرخصی تأییدشده دارید."
                : attendance.isFuture
                  ? "هنوز امکان ثبت حضور برای این روز وجود ندارد."
                  : "امروز طبق برنامه حضورینو روز کاری شما نیست."}
          </p>
        </div>
      ) : null}

      {hasOpenTemporaryExit && hasCheckedIn && !hasCheckedOut ? (
        <div
          role="status"
          className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-700" />

          <p className="text-sm leading-7 text-amber-900">
            یک خروج موقت یا مأموریت باز دارید. برای ثبت خروج نهایی، ابتدا باید بازگشت خود را در حضورینو ثبت کنید.
          </p>
        </div>
      ) : null}

      {feedback ? (
        <div
          role={feedback.success ? "status" : "alert"}
          aria-live="polite"
          className={`mt-5 flex items-start gap-3 rounded-2xl border p-4 ${
            feedback.success
              ? "border-emerald-200 bg-emerald-50/70 text-emerald-800"
              : "border-rose-200 bg-rose-50/70 text-rose-800"
          }`}
        >
          {feedback.success ? (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
          )}

          <p className="text-sm leading-7">
            {feedback.message}
          </p>
        </div>
      ) : null}
    </section>
  );
}