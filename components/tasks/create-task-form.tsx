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
  CalendarDays,
  Loader2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { createTaskAction } from "@/lib/actions/task.actions";
import { createTaskSchema } from "@/lib/validations/task";

import { PersianDatePicker } from "@/components/ui/persian-date-picker";
import TaskRecurrenceFields from "@/components/tasks/task-recurrence-fields";

type FormInput = z.input<
  typeof createTaskSchema
>;

type FormOutput = z.output<
  typeof createTaskSchema
>;

type ProjectOption = {
  id: string;
  title: string;
  status:
    | "PLANNED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "ARCHIVED";
  members: Array<{
    user: {
      id: string;
      name: string;
      email: string;
      isActive: boolean;
    };
  }>;
};

type CreateTaskFormProps = {
  projects: ProjectOption[];
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

export default function CreateTaskForm({
  projects,
}: CreateTaskFormProps) {
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
      createTaskSchema,
    ),
    defaultValues: {
      projectId: "",
      title: "",
      description: "",
      assignedToId: "",
      priority: "MEDIUM",
      deadline: "",
      isRecurring: false,
      recurrenceType: "NONE",
      recurrenceStartDate: null,
      recurrenceEndDate: null,
      recurrenceWeekdays: [],
      recurrenceDayOfMonth: null,
      recurrenceActive: true,
    },
  });

  const [
    selectedProjectId,
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
      "projectId",
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

  const selectedProject =
    useMemo(
      () =>
        projects.find(
          (project) =>
            project.id ===
            selectedProjectId,
        ),
      [
        projects,
        selectedProjectId,
      ],
    );

  const availableEmployees =
    useMemo(() => {
      if (!selectedProject) {
        return [];
      }

      return selectedProject.members
        .filter(
          (member) =>
            member.user.isActive,
        )
        .map(
          (member) =>
            member.user,
        );
    }, [selectedProject]);

  useEffect(() => {
    if (!selectedProjectId) {
      setValue(
        "assignedToId",
        "",
      );
      return;
    }

    const stillValid =
      availableEmployees.some(
        (employee) =>
          employee.id ===
          selectedEmployeeId,
      );

    if (!stillValid) {
      setValue(
        "assignedToId",
        "",
      );
    }
  }, [
    selectedProjectId,
    selectedEmployeeId,
    availableEmployees,
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
      await createTaskAction(
        payload,
      );

    if (!result.success) {
      toast.error(
        result.message,
      );
      return;
    }

    toast.success(
      "Task با موفقیت ایجاد شد.",
    );

    reset({
      projectId:
        values.projectId,
      title: "",
      description: "",
      assignedToId:
        values.assignedToId,
      priority: "MEDIUM",
      deadline: "",
      isRecurring: false,
      recurrenceType: "NONE",
      recurrenceStartDate: null,
      recurrenceEndDate: null,
      recurrenceWeekdays: [],
      recurrenceDayOfMonth: null,
      recurrenceActive: true,
    });

    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="task-title"
            className="text-sm font-semibold text-slate-700"
          >
            عنوان Task
          </label>

          <input
            id="task-title"
            {...register("title")}
            placeholder="مثلاً طراحی صفحه داشبورد"
            className="glass-field h-11 w-full rounded-xl px-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />

          {errors.title ? (
            <p className="text-xs font-medium text-red-600">
              {
                errors.title.message
              }
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="task-project"
            className="text-sm font-semibold text-slate-700"
          >
            پروژه
          </label>

          <select
            id="task-project"
            {...register(
              "projectId",
            )}
            className="glass-field h-11 w-full rounded-xl px-3.5 text-sm font-medium text-slate-700 outline-none"
          >
            <option value="">
              انتخاب پروژه
            </option>

            {projects.map(
              (project) => (
                <option
                  key={project.id}
                  value={
                    project.id
                  }
                >
                  {project.title}
                </option>
              ),
            )}
          </select>

          {errors.projectId ? (
            <p className="text-xs font-medium text-red-600">
              {
                errors
                  .projectId
                  .message
              }
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="task-assignee"
            className="text-sm font-semibold text-slate-700"
          >
            مسئول Task
          </label>

          <select
            id="task-assignee"
            {...register(
              "assignedToId",
            )}
            disabled={
              !selectedProjectId
            }
            className="glass-field h-11 w-full rounded-xl px-3.5 text-sm font-medium text-slate-700 outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">
              {!selectedProjectId
                ? "ابتدا پروژه را انتخاب کنید"
                : availableEmployees.length ===
                    0
                  ? "این پروژه کارمند فعالی ندارد"
                  : "انتخاب کارمند"}
            </option>

            {availableEmployees.map(
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
            htmlFor="task-priority"
            className="text-sm font-semibold text-slate-700"
          >
            اولویت
          </label>

          <select
            id="task-priority"
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
          <div className="space-y-2 lg:col-span-2">
            <label
              htmlFor="task-deadline"
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
                  id="task-deadline"
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
            htmlFor="task-description"
            className="text-sm font-semibold text-slate-700"
          >
            توضیحات
          </label>

          <textarea
            id="task-description"
            {...register(
              "description",
            )}
            rows={5}
            placeholder="توضیحات مربوط به Task..."
            className="glass-field min-h-32 w-full resize-none rounded-xl px-3.5 py-3 text-sm leading-7 text-slate-800 outline-none placeholder:text-slate-400"
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

      {selectedProject ? (
        <div className="rounded-3xl border border-white/55 bg-white/24 p-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span className="text-slate-400">
              پروژه:
              <strong className="mr-1 text-slate-700">
                {
                  selectedProject.title
                }
              </strong>
            </span>

            <span className="text-slate-400">
              اعضای فعال:
              <strong className="mr-1 text-slate-700">
                {availableEmployees.length.toLocaleString(
                  "fa-IR",
                )}
              </strong>
            </span>

            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
              <CalendarDays className="size-3.5" />
              {isRecurring
                ? "تاریخ شروع تکرار با تقویم شمسی"
                : "Deadline با تقویم شمسی"}
            </span>
          </div>
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(15,23,42,0.16)] transition hover:-translate-y-px hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}

          {isSubmitting
            ? "در حال ایجاد..."
            : "ایجاد Task"}
        </button>
      </div>
    </form>
  );
}