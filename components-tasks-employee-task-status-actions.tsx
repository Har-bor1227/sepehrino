
"use client";

import { useState, useTransition } from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { updateTaskStatusAction } from "@/lib/actions/task.actions";

type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

type EmployeeTaskStatusActionsProps = {
  taskId: string;
  currentStatus: TaskStatus;
};

const STATUS_OPTIONS: {
  value: TaskStatus;
  label: string;
}[] = [
  {
    value: "TODO",
    label: "در انتظار",
  },
  {
    value: "IN_PROGRESS",
    label: "در حال انجام",
  },
  {
    value: "COMPLETED",
    label: "تکمیل شده",
  },
  {
    value: "CANCELLED",
    label: "لغو شده",
  },
];

export function EmployeeTaskStatusActions({
  taskId,
  currentStatus,
}: EmployeeTaskStatusActionsProps) {
  const [isPending, startTransition] =
    useTransition();

  const [open, setOpen] = useState(false);

  function changeStatus(
    nextStatus: TaskStatus,
  ) {
    if (
      nextStatus === currentStatus ||
      isPending
    ) {
      setOpen(false);
      return;
    }

    setOpen(false);

    startTransition(async () => {
      const result =
        await updateTaskStatusAction({
          taskId,
          status: nextStatus,
        });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(
        "وضعیت Task با موفقیت بروزرسانی شد.",
      );
    });
  }

  const currentLabel =
    STATUS_OPTIONS.find(
      (option) =>
        option.value === currentStatus,
    )?.label ?? "وضعیت";

  return (
    <div className="relative">
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          setOpen((value) => !value)
        }
        className="inline-flex h-10 min-w-[148px] items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-2">
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          ) : (
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
          )}

          <span className="truncate">
            {currentLabel}
          </span>
        </span>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="بستن منوی وضعیت"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-20 cursor-default"
          />

          <div className="absolute left-0 top-12 z-30 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
            {STATUS_OPTIONS.map(
              (option) => {
                const selected =
                  option.value ===
                  currentStatus;

                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      changeStatus(
                        option.value,
                      )
                    }
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-right text-sm transition ${
                      selected
                        ? "bg-slate-100 font-semibold text-slate-900"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span>
                      {option.label}
                    </span>

                    {selected && (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                );
              },
            )}
          </div>
        </>
      )}
    </div>
  );
}

