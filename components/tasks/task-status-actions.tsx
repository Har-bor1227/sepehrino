"use client";

import { useTransition } from "react";

import {
  CheckCircle2,
  Circle,
  Clock3,
  Loader2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { updateTaskStatusAction } from "@/lib/actions/task.actions";

type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

type TaskStatusActionsProps = {
  taskId: string;
  currentStatus: TaskStatus;
};

const statusOptions: Array<{
  value: TaskStatus;
  label: string;
  icon: typeof Circle;
  activeClass: string;
}> = [
  {
    value: "TODO",
    label: "در انتظار",
    icon: Circle,
    activeClass:
      "border-slate-300/60 bg-slate-500/8 text-slate-800",
  },
  {
    value: "IN_PROGRESS",
    label: "در حال انجام",
    icon: Clock3,
    activeClass:
      "border-blue-200/55 bg-blue-50/50 text-blue-700",
  },
  {
    value: "COMPLETED",
    label: "تکمیل شده",
    icon: CheckCircle2,
    activeClass:
      "border-emerald-200/55 bg-emerald-50/50 text-emerald-700",
  },
  {
    value: "CANCELLED",
    label: "لغو شده",
    icon: XCircle,
    activeClass:
      "border-red-200/55 bg-red-50/50 text-red-700",
  },
];

export default function TaskStatusActions({
  taskId,
  currentStatus,
}: TaskStatusActionsProps) {
  const router =
    useRouter();

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const handleStatusChange =
    (
      status: TaskStatus,
    ) => {
      if (
        status ===
          currentStatus ||
        isPending
      ) {
        return;
      }

      startTransition(
        async () => {
          const result =
            await updateTaskStatusAction(
              {
                taskId,
                status,
              },
            );

          if (!result.success) {
            toast.error(
              result.message,
            );
            return;
          }

          toast.success(
            "وضعیت Task به‌روزرسانی شد.",
          );

          router.refresh();
        },
      );
    };

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {statusOptions.map(
        (option) => {
          const Icon =
            option.icon;

          const isActive =
            option.value ===
            currentStatus;

          return (
            <button
              key={
                option.value
              }
              type="button"
              disabled={
                isPending ||
                isActive
              }
              onClick={() =>
                handleStatusChange(
                  option.value,
                )
              }
              className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl transition ${
                isActive
                  ? option.activeClass
                  : "border-white/55 bg-white/35 text-slate-600 hover:bg-white/65 hover:text-slate-900"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {isPending &&
              isActive ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Icon className="size-4" />
              )}

              {
                option.label
              }
            </button>
          );
        },
      )}
    </div>
  );
}