"use client";

import {
  useState,
  useEffect,
  useTransition,
} from "react";

import {
  Check,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import {
  updateTaskStatusAction,
} from "@/lib/actions/task.actions";

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

  const [open, setOpen] =
    useState(false);

  function changeStatus(
    nextStatus: TaskStatus,
  ) {
    if (
      nextStatus ===
        currentStatus ||
      isPending
    ) {
      setOpen(false);
      return;
    }

    setOpen(false);

    startTransition(async () => {
      const result =
        await updateTaskStatusAction(
          {
            taskId,
            status:
              nextStatus,
          },
        );

      if (!result.success) {
        toast.error(
          result.message,
        );
        return;
      }

      toast.success(
        "وضعیت Task با موفقیت بروزرسانی شد.",
      );
    });
  }

  useEffect(() => {
    if (!open) return;
    function dismiss(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, [open]);

  const currentLabel =
    STATUS_OPTIONS.find(
      (option) =>
        option.value ===
        currentStatus,
    )?.label ??
    "وضعیت";

  return (
    <div className="relative w-full sm:w-auto">
      <label className="relative block sm:hidden">
        <span className="sr-only">تغییر وضعیت تسک</span>
        <select
          aria-label="تغییر وضعیت تسک"
          value={currentStatus}
          disabled={isPending}
          onChange={(event) => changeStatus(event.target.value as TaskStatus)}
          className="min-h-12 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pl-10 text-sm font-bold text-slate-800 shadow-sm disabled:opacity-60"
        >
          {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
      </label>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          setOpen(
            (value) => !value,
          )
        }
        className="hidden h-11 min-w-[168px] items-center justify-between sm:inline-flex gap-3 rounded-2xl border border-border bg-card px-3.5 text-sm font-semibold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_7px_18px_rgba(15,23,42,0.05)] transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-2">
          {isPending ? (
            <Loader2 className="size-4 animate-spin text-slate-400" />
          ) : (
            <span className="size-2.5 rounded-full bg-slate-400" />
          )}

          <span className="truncate">
            {currentLabel}
          </span>
        </span>

        <ChevronDown
          className={`size-4 shrink-0 text-slate-400 transition-transform ${
            open
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="بستن منوی وضعیت"
            onClick={() =>
              setOpen(false)
            }
            className="fixed inset-0 z-20 cursor-default"
          />

          <div role="menu" aria-label="انتخاب وضعیت تسک" className="absolute left-0 top-[calc(100%+0.5rem)] z-30 w-52 overflow-hidden rounded-3xl border border-border bg-card p-2 shadow-[0_24px_60px_rgba(15,23,42,0.15)]">
            {STATUS_OPTIONS.map(
              (option) => {
                const selected =
                  option.value ===
                  currentStatus;

                return (
                  <button
                    key={
                      option.value
                    }
                    type="button"
                    role="menuitemradio"
                    aria-checked={selected}
                    disabled={
                      isPending
                    }
                    onClick={() =>
                      changeStatus(
                        option.value,
                      )
                    }
                    className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-right text-sm transition ${
                      selected
                        ? "bg-slate-900 font-bold text-white shadow-[0_8px_18px_rgba(15,23,42,0.12)]"
                        : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                    }`}
                  >
                    <span>
                      {
                        option.label
                      }
                    </span>

                    {selected ? (
                      <Check className="size-4" />
                    ) : null}
                  </button>
                );
              },
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}