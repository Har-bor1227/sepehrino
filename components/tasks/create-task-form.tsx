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
  Check,
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

type ProjectSubProjectType =
  | "WEB_DESIGN"
  | "SEO"
  | "SOCIAL_MEDIA"
  | "PHOTOGRAPHY"
  | "VIDEOGRAPHY"
  | "TEASER_PRODUCTION"
  | "CATALOG"
  | "BRAND_IDENTITY_DESIGN"
  | "CRM_MANAGEMENT"
  | "BOOTH_CONSTRUCTION"
  | "PROGRAMMING";

type ProjectOption = {
  id: string;
  title: string;
  status:
    | "PLANNED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "ARCHIVED";

  subProjects: Array<{
    id: string;
    type: ProjectSubProjectType;
  }>;

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

const subProjectLabels: Record<
  ProjectSubProjectType,
  string
> = {
  WEB_DESIGN: "طراحی سایت",
  SEO: "سئو",
  SOCIAL_MEDIA: "سوشال مدیا",
  PHOTOGRAPHY: "عکاسی",
  VIDEOGRAPHY: "فیلمبرداری",
  TEASER_PRODUCTION: "تیزرسازی",
  CATALOG: "کاتالوگ",
  BRAND_IDENTITY_DESIGN:
    "طراحی هویت بصری",
  CRM_MANAGEMENT: "مدیریت CRM",
  BOOTH_CONSTRUCTION:
    "غرفه سازی",
  PROGRAMMING: "برنامه نویسی",
};

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
      subProjectId: "",
      title: "",
      description: "",
      assigneeIds: [],
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

  const selectedProjectId =
    useWatch({
      control,
      name: "projectId",
    });

  const selectedSubProjectId =
    useWatch({
      control,
      name: "subProjectId",
    });

  const assigneeIds =
    useWatch({
      control,
      name: "assigneeIds",
    }) ?? [];

  const deadline =
    useWatch({
      control,
      name: "deadline",
    });

  const isRecurring =
    useWatch({
      control,
      name: "isRecurring",
    });

  const recurrenceType =
    useWatch({
      control,
      name: "recurrenceType",
    });

  const recurrenceStartDate =
    useWatch({
      control,
      name: "recurrenceStartDate",
    });

  const recurrenceWeekdays =
    useWatch({
      control,
      name: "recurrenceWeekdays",
    });

  const recurrenceDayOfMonth =
    useWatch({
      control,
      name: "recurrenceDayOfMonth",
    });

  const recurrenceActive =
    useWatch({
      control,
      name: "recurrenceActive",
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

  const selectedSubProject =
    useMemo(
      () =>
        selectedProject?.subProjects.find(
          (subProject) =>
            subProject.id ===
            selectedSubProjectId,
        ) ?? null,

      [
        selectedProject,
        selectedSubProjectId,
      ],
    );

  useEffect(() => {
    if (!selectedProjectId) {
      setValue(
        "subProjectId",
        "",
        {
          shouldValidate: true,
        },
      );

      setValue(
        "assigneeIds",
        [],
        {
          shouldValidate: true,
        },
      );

      return;
    }

    const selectedSubProjectStillValid =
      selectedProject?.subProjects.some(
        (subProject) =>
          subProject.id ===
          selectedSubProjectId,
      ) ?? false;

    if (
      !selectedSubProjectStillValid
    ) {
      setValue(
        "subProjectId",
        "",
        {
          shouldValidate: true,
        },
      );
    }

    const availableEmployeeIds =
      new Set(
        availableEmployees.map(
          (employee) =>
            employee.id,
        ),
      );

    const validAssigneeIds =
      assigneeIds.filter(
        (id) =>
          availableEmployeeIds.has(
            id,
          ),
      );

    if (
      validAssigneeIds.length !==
      assigneeIds.length
    ) {
      setValue(
        "assigneeIds",
        validAssigneeIds,
        {
          shouldValidate: true,
        },
      );
    }
  }, [
    selectedProjectId,
    selectedProject,
    selectedSubProjectId,
    availableEmployees,
    assigneeIds,
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

  const handleProjectChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const nextProjectId =
      event.target.value;

    setValue(
      "projectId",
      nextProjectId,
      {
        shouldValidate: true,
        shouldDirty: true,
      },
    );

    setValue(
      "subProjectId",
      "",
      {
        shouldValidate: true,
        shouldDirty: true,
      },
    );

    setValue(
      "assigneeIds",
      [],
      {
        shouldValidate: true,
        shouldDirty: true,
      },
    );
  };

  const toggleAssignee = (
    employeeId: string,
  ) => {
    const current =
      assigneeIds;

    const next =
      current.includes(
        employeeId,
      )
        ? current.filter(
            (id) =>
              id !== employeeId,
          )
        : [
            ...current,
            employeeId,
          ];

    setValue(
      "assigneeIds",
      next,
      {
        shouldValidate: true,
        shouldDirty: true,
      },
    );
  };

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

      subProjectId:
        values.subProjectId,

      title: "",

      description: "",

      assigneeIds:
        values.assigneeIds,

      priority:
        "MEDIUM",

      deadline: "",

      isRecurring:
        false,

      recurrenceType:
        "NONE",

      recurrenceStartDate:
        null,

      recurrenceEndDate:
        null,

      recurrenceWeekdays: [],

      recurrenceDayOfMonth:
        null,

      recurrenceActive:
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
      dir="rtl"
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
            className="glass-field h-11 w-full rounded-xl px-3.5 text-right text-sm text-slate-800 outline-none placeholder:text-slate-400"
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
            htmlFor="task-project"
            className="text-sm font-semibold text-slate-700"
          >
            پروژه
          </label>

          <select
            id="task-project"
            value={
              selectedProjectId ??
              ""
            }
            onChange={
              handleProjectChange
            }
            className="glass-field h-11 w-full rounded-xl px-3.5 text-right text-sm font-medium text-slate-700 outline-none"
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
            htmlFor="task-sub-project"
            className="text-sm font-semibold text-slate-700"
          >
            زیرپروژه
          </label>

          <select
            id="task-sub-project"
            {...register(
              "subProjectId",
            )}
            disabled={
              !selectedProjectId
            }
            className="glass-field h-11 w-full rounded-xl px-3.5 text-right text-sm font-medium text-slate-700 outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">
              {!selectedProjectId
                ? "ابتدا پروژه را انتخاب کنید"
                : "انتخاب زیرپروژه"}
            </option>

            {selectedProject?.subProjects.map(
              (subProject) => (
                <option
                  key={
                    subProject.id
                  }
                  value={
                    subProject.id
                  }
                >
                  {
                    subProjectLabels[
                      subProject
                        .type
                    ]
                  }
                </option>
              ),
            )}
          </select>

          {errors.subProjectId ? (
            <p className="text-xs font-medium text-red-600">
              {
                errors
                  .subProjectId
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
            className="glass-field h-11 w-full rounded-xl px-3.5 text-right text-sm font-medium text-slate-700 outline-none"
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
                  {
                    priority.label
                  }
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

        <div className="space-y-3 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-sm font-semibold text-slate-700">
              مسئول‌های Task
            </label>

            {selectedProject ? (
              <span className="text-xs font-medium text-slate-400">
                {
                  assigneeIds.length.toLocaleString(
                    "fa-IR",
                  )
                }{" "}
                نفر انتخاب شده
              </span>
            ) : null}
          </div>

          {!selectedProjectId ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/20 px-4 py-5 text-sm text-slate-400">
              ابتدا پروژه را انتخاب کنید.
            </div>
          ) : availableEmployees.length ===
            0 ? (
            <div className="rounded-2xl border border-dashed border-red-200 bg-red-50/50 px-4 py-5 text-sm font-medium text-red-600">
              این پروژه عضو فعال برای
              واگذاری Task ندارد.
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {availableEmployees.map(
                (employee) => {
                  const isSelected =
                    assigneeIds.includes(
                      employee.id,
                    );

                  return (
                    <button
                      key={
                        employee.id
                      }
                      type="button"
                      onClick={() =>
                        toggleAssignee(
                          employee.id,
                        )
                      }
                      className={[
                        "flex min-h-16 items-center gap-3 rounded-2xl border px-3.5 py-3 text-right transition",
                        isSelected
                          ? "border-slate-900 bg-slate-900 text-white shadow-[0_12px_24px_rgba(15,23,42,0.12)]"
                          : "border-white/60 bg-white/30 text-slate-700 hover:bg-white/50",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "flex size-5 shrink-0 items-center justify-center rounded-md border",
                          isSelected
                            ? "border-white/20 bg-white text-slate-900"
                            : "border-slate-300 bg-white/50",
                        ].join(" ")}
                      >
                        {isSelected ? (
                          <Check className="size-3.5" />
                        ) : null}
                      </span>

                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">
                          {
                            employee.name
                          }
                        </span>

                        <span
                          className={[
                            "mt-0.5 block truncate text-xs",
                            isSelected
                              ? "text-slate-300"
                              : "text-slate-400",
                          ].join(" ")}
                        >
                          {
                            employee.email
                          }
                        </span>
                      </span>
                    </button>
                  );
                },
              )}
            </div>
          )}

          {errors.assigneeIds ? (
            <p className="text-xs font-medium text-red-600">
              {
                errors
                  .assigneeIds
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
            className="glass-field min-h-32 w-full resize-none rounded-xl px-3.5 py-3 text-right text-sm leading-7 text-slate-800 outline-none placeholder:text-slate-400"
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
          recurrenceWeekdays ??
          []
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
            errors
              .recurrenceType
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
              زیرپروژه:
              <strong className="mr-1 text-slate-700">
                {selectedSubProject
                  ? subProjectLabels[
                      selectedSubProject
                        .type
                    ]
                  : "انتخاب نشده"}
              </strong>
            </span>

            <span className="text-slate-400">
              مسئول‌ها:
              <strong className="mr-1 text-slate-700">
                {
                  assigneeIds.length.toLocaleString(
                    "fa-IR",
                  )
                }{" "}
                نفر
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