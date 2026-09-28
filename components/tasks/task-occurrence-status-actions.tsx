"use client";

import {
  useTransition,
} from "react";

import {
  Check,
  CheckCircle2,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

import {
  setTaskOccurrenceStatusAction,
} from "@/lib/actions/task.actions";

type TaskOccurrenceStatusActionsProps = {
  taskId: string;
  occurrenceDate: string;
  completed: boolean;
  disabled?: boolean;
};

function toOccurrenceDate(
  dateKey: string,
) {
  return new Date(
    `${dateKey}T00:00:00.000Z`,
  );
}

export default function TaskOccurrenceStatusActions({
  taskId,
  occurrenceDate,
  completed,
  disabled = false,
}: TaskOccurrenceStatusActionsProps) {
  const [
    isPending,
    startTransition,
  ] = useTransition();

  const nextCompleted =
    !completed;

  function handleToggle() {
    if (
      disabled ||
      isPending
    ) {
      return;
    }

    startTransition(
      async () => {
        const result =
          await setTaskOccurrenceStatusAction(
            {
              taskId,
              occurrenceDate:
                toOccurrenceDate(
                  occurrenceDate,
                ),
              completed:
                nextCompleted,
            },
          );

        if (!result.success) {
          toast.error(
            result.message,
          );
          return;
        }

        toast.success(
          nextCompleted
            ? "Occurrence امروز تکمیل شد."
            : "تکمیل Occurrence لغو شد.",
        );
      },
    );
  }

  if (disabled) {
    return (
      <div className="rounded-2xl border border-white/50 bg-white/25 px-4 py-3 text-xs font-medium leading-6 text-slate-400">
        این Task امروز در برنامه نیست.
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={
        handleToggle
      }
      className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition sm:w-auto ${
        completed
          ? "border-emerald-200/60 bg-emerald-50/70 text-emerald-700 hover:bg-emerald-50"
          : "border-slate-900 bg-slate-900 text-white shadow-[0_10px_22px_rgba(15,23,42,0.12)] hover:bg-slate-800"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : completed ? (
        <>
          <CheckCircle2 className="size-4" />
          انجام امروز ثبت شده
          <RotateCcw className="size-3.5 opacity-60" />
        </>
      ) : (
        <>
          <Check className="size-4" />
          انجام شد برای امروز
        </>
      )}
    </button>
  );
}