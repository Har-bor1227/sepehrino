"use client";

import {
  useEffect,
  useMemo,
} from "react";

import {
  Controller,
  useForm,
  useWatch,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { updateTaskAction } from "@/lib/actions/task.actions";
import { updateTaskSchema } from "@/lib/validations/task";

import { PersianDatePicker } from "@/components/ui/persian-date-picker";
import TaskRecurrenceFields from "@/components/tasks/task-recurrence-fields";

type FormInput = z.input<
  typeof updateTaskSchema
>;

type FormOutput = z.output<
  typeof updateTaskSchema
>;

type EmployeeOption = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
};

type EditTaskFormProps = {
  taskId: string;
  projectId: string;
  defaultValues: {
    title: string;
    description: string;
    assignedToId: string;
    priority:
      | "LOW"
      | "MEDIUM"
      | "HIGH"
      | "URGENT";
    deadline: string;

    isRecurring: boolean;
    recurrenceType:
      | "NONE"
      | "DAILY"
      | "WEEKLY"
      | "MONTHLY";
    recurrenceStartDate: string;
    recurrenceEndDate: string | null;
    recurrenceWeekdays: number[];
    recurrenceDayOfMonth:
      | number
      | null;
    recurrenceActive: boolean;
  };
  employees: EmployeeOption[];
};

const priorityOptions = [
  {
    value: "LOW",
    label: "کم",
  },
  {
    value: "MEDIUM",
    label: "متوسط",
  },
  {
    value: "HIGH",
    label: "زیاد",
  },
  {
    value: "URGENT",
    label: "فوری",
  },
] as const;

export default function EditTaskForm({
  taskId,
  projectId,
  defaultValues,
  employees,
}: EditTaskFormProps) {
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<
    FormInput,
    unknown,
    FormOutput
  >({
    resolver: zodResolver(
      updateTaskSchema,
    ),
    defaultValues: {
      title:
        defaultValues.title,
      description:
        defaultValues.description,
      assignedToId:
        defaultValues.assignedToId,
      priority:
        defaultValues.priority,
      deadline:
        defaultValues.deadline,

      isRecurring:
        defaultValues.isRecurring,
      recurrenceType:
        defaultValues.recurrenceType,
      recurrenceStartDate:
        defaultValues.recurrenceStartDate,
      recurrenceEndDate: null,
      recurrenceWeekdays:
        defaultValues.recurrenceWeekdays,
      recurrenceDayOfMonth:
        defaultValues.recurrenceDayOfMonth,
      recurrenceActive:
        defaultValues.recurrenceActive,
    },
  });

  const [
    selectedEmployeeId,
    deadline,
    isRecurring,
    recurrenceType,
    recurrenceStartDate,
    recurrenceWeekdays,
    recurrenceDayOfMonth,
    recurrenceActive,
  ] = useWatch({
    control,
    name: [
      "assignedToId",
      "deadline",
      "isRecurring",
      "recurrenceType",
      "recurrenceStartDate",
      "recurrenceWeekdays",
      "recurrenceDayOfMonth",
      "recurrenceActive",
    ],
  });

  const activeEmployees =
    useMemo(
      () =>
        employees.filter(
          (employee) =>
            employee.isActive,
        ),
      [employees],
    );

  useEffect(() => {
    const exists =
      activeEmployees.some(
        (employee) =>
          employee.id ===
          selectedEmployeeId,
      );

    if (
      selectedEmployeeId &&
      !exists
    ) {
      setValue(
        "assignedToId",
        "",
      );
    }
  }, [
    activeEmployees,
    selectedEmployeeId,
    setValue,
  ]);

  useEffect(() => {
    if (
      !isRecurring ||
      !recurrenceStartDate
    ) {
      return;
    }

    if (
      deadline !==
      recurrenceStartDate
    ) {
      setValue(
        "deadline",
        recurrenceStartDate,
        {
          shouldValidate: true,
        },
      );
    }
  }, [
    deadline,
    isRecurring,
    recurrenceStartDate,
    setValue,
  ]);

  const handleRecurrenceToggle = (
    enabled: boolean,
  ) => {
    setValue(
      "isRecurring",
      enabled,
      {
        shouldValidate: true,
      },
    );

    if (enabled) {
      setValue(
        "recurrenceType",
        "DAILY",
        {
          shouldValidate: true,
        },
      );

      if (
        typeof deadline ===
          "string" &&
        deadline
      ) {
        setValue(
          "recurrenceStartDate",
          deadline,
          {
            shouldValidate: true,
          },
        );
      }

      setValue(
        "recurrenceActive",
        true,
      );

      return;
    }

    setValue(
      "recurrenceType",
      "NONE",
      {
        shouldValidate: true,
      },
    );

    setValue(
      "recurrenceStartDate",
      null,
    );

    setValue(
      "recurrenceEndDate",
      null,
    );

    setValue(
      "recurrenceWeekdays",
      [],
    );

    setValue(
      "recurrenceDayOfMonth",
      null,
    );

    setValue(
      "recurrenceActive",
      true,
    );
  };

  const onSubmit = async (
    values: FormOutput,
  ) => {
    const payload: FormOutput = {
      ...values,
      recurrenceEndDate:
        null,
    };

    if (
      payload.isRecurring &&
      payload.recurrenceStartDate
    ) {
      payload.deadline =
        payload.recurrenceStartDate;
    }

    const result =
      await updateTaskAction(
        taskId,
        payload,
      );

    if (!result.success) {
      toast.error(
        result.message,
      );
      return;
    }

    toast.success(
      "Task با موفقیت به‌روزرسانی شد.",
    );

    reset({
      title: payload.title,
      description:
        payload.description ?? "",
      assignedToId:
        payload.assignedToId,
      priority:
        payload.priority,
      deadline: payload.deadline
        ? payload.deadline
            .toISOString()
            .slice(0, 10)
        : defaultValues.deadline,

      isRecurring:
        payload.isRecurring ??
        false,

      recurrenceType:
        payload.recurrenceType ??
        "NONE",

      recurrenceStartDate:
        payload
          .recurrenceStartDate
          ? payload
              .recurrenceStartDate
              .toISOString()
              .slice(0, 10)
          : "",

      recurrenceEndDate: null,

      recurrenceWeekdays:
        payload.recurrenceWeekdays ??
        [],

      recurrenceDayOfMonth:
        payload
          .recurrenceDayOfMonth ??
        null,

      recurrenceActive:
        payload
          .recurrenceActive ??
        true,
    });

    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit(
        onSubmit,
      )}
      className="space-y-6"
    >
      <input
        type="hidden"
        value={projectId}
        readOnly
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="edit-task-title"
            className="text-sm font-semibold text-slate-700"
          >
            عنوان Task
          </label>

          <input
            id="edit-task-title"
            {...register("title")}
            className="glass-field h-11 w-full rounded-xl px-3.5 text-sm text-slate-800 outline-none"
          />

          {errors.title ? (
            <p className="text-xs font-medium text-red-600">
              {
                errors.title
                  .message
              }
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="edit-task-assignee"
            className="text-sm font-semibold text-slate-700"
          >
            مسئول Task
          </label>

          <select
            id="edit-task-assignee"
            {...register(
              "assignedToId",
            )}
            className="glass-field h-11 w-full rounded-xl px-3.5 text-sm font-medium text-slate-700 outline-none"
          >
            <option value="">
              انتخاب کارمند
            </option>

            {activeEmployees.map(
              (employee) => (
                <option
                  key={employee.id}
                  value={
                    employee.id
                  }
                >
                  {employee.name} —{" "}
                  {
                    employee.email
                  }
                </option>
              ),
            )}
          </select>

          {errors.assignedToId ? (
            <p className="text-xs font-medium text-red-600">
              {
                errors
                  .assignedToId
                  .message
              }
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="edit-task-priority"
            className="text-sm font-semibold text-slate-700"
          >
            اولویت
          </label>

          <select
            id="edit-task-priority"
            {...register(
              "priority",
            )}
            className="glass-field h-11 w-full rounded-xl px-3.5 text-sm font-medium text-slate-700 outline-none"
          >
            {priorityOptions.map(
              (priority) => (
                <option
                  key={
                    priority.value
                  }
                  value={
                    priority.value
                  }
                >
                  {priority.label}
                </option>
              ),
            )}
          </select>

          {errors.priority ? (
            <p className="text-xs font-medium text-red-600">
              {
                errors
                  .priority
                  .message
              }
            </p>
          ) : null}
        </div>

        {!isRecurring ? (
          <div className="space-y-2">
            <label
              htmlFor="edit-task-deadline"
              className="text-sm font-semibold text-slate-700"
            >
              Deadline
            </label>

            <Controller
              control={control}
              name="deadline"
              render={({
                field,
              }) => (
                <PersianDatePicker
                  id="edit-task-deadline"
                  value={
                    field.value as string
                  }
                  onChange={
                    field.onChange
                  }
                  error={
                    !!errors.deadline
                  }
                  placeholder="انتخاب Deadline"
                />
              )}
            />

            {errors.deadline ? (
              <p className="text-xs font-medium text-red-600">
                {
                  errors
                    .deadline
                    .message
                }
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-2 lg:col-span-2">
          <label
            htmlFor="edit-task-description"
            className="text-sm font-semibold text-slate-700"
          >
            توضیحات
          </label>

          <textarea
            id="edit-task-description"
            {...register(
              "description",
            )}
            rows={5}
            className="glass-field min-h-32 w-full resize-none rounded-xl px-3.5 py-3 text-sm leading-7 text-slate-800 outline-none"
          />

          {errors.description ? (
            <p className="text-xs font-medium text-red-600">
              {
                errors
                  .description
                  .message
              }
            </p>
          ) : null}
        </div>
      </div>

      <TaskRecurrenceFields
        isRecurring={
          !!isRecurring
        }
        recurrenceType={
          (recurrenceType ??
            "NONE") as
            | "NONE"
            | "DAILY"
            | "WEEKLY"
            | "MONTHLY"
        }
        recurrenceStartDate={
          typeof recurrenceStartDate ===
          "string"
            ? recurrenceStartDate
            : ""
        }
        recurrenceWeekdays={
          recurrenceWeekdays ?? []
        }
        recurrenceDayOfMonth={
          recurrenceDayOfMonth ??
          null
        }
        recurrenceActive={
          recurrenceActive ??
          true
        }
        onIsRecurringChange={
          handleRecurrenceToggle
        }
        onRecurrenceTypeChange={(
          value,
        ) =>
          setValue(
            "recurrenceType",
            value,
            {
              shouldValidate:
                true,
            },
          )
        }
        onRecurrenceStartDateChange={(
          value,
        ) =>
          setValue(
            "recurrenceStartDate",
            value,
            {
              shouldValidate:
                true,
            },
          )
        }
        onRecurrenceWeekdaysChange={(
          value,
        ) =>
          setValue(
            "recurrenceWeekdays",
            value,
            {
              shouldValidate:
                true,
            },
          )
        }
        onRecurrenceDayOfMonthChange={(
          value,
        ) =>
          setValue(
            "recurrenceDayOfMonth",
            value,
            {
              shouldValidate:
                true,
            },
          )
        }
        onRecurrenceActiveChange={(
          value,
        ) =>
          setValue(
            "recurrenceActive",
            value,
          )
        }
        showActiveToggle
        errors={{
          recurrenceType:
            errors.recurrenceType
              ?.message,
          recurrenceStartDate:
            errors
              .recurrenceStartDate
              ?.message,
          recurrenceWeekdays:
            errors
              .recurrenceWeekdays
              ?.message,
          recurrenceDayOfMonth:
            errors
              .recurrenceDayOfMonth
              ?.message,
        }}
      />

      <div className="flex justify-end border-t border-white/40 pt-5">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(15,23,42,0.16)] transition hover:-translate-y-px hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}

          {isSubmitting
            ? "در حال ذخیره..."
            : "ذخیره تغییرات"}
        </button>
      </div>
    </form>
  );
}