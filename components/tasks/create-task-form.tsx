"use client";

import { useEffect, useMemo } from "react";

import {
  Controller,
  useForm,
  useWatch,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarDays,
  Check,
  ChevronDown,
  ListOrdered,
  Loader2,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { createTaskAction } from "@/lib/actions/task.actions";
import { createTaskSchema } from "@/lib/validations/task";

import { PersianDatePicker } from "@/components/ui/persian-date-picker";
import TaskRecurrenceFields from "@/components/tasks/task-recurrence-fields";

type FormInput = z.input<typeof createTaskSchema>;
type FormOutput = z.output<typeof createTaskSchema>;

type TaskStageFormValue = NonNullable<
  FormInput["stages"]
>[number];

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

const subProjectLabels: Record<ProjectSubProjectType, string> = {
  WEB_DESIGN: "طراحی سایت",
  SEO: "سئو",
  SOCIAL_MEDIA: "سوشال مدیا",
  PHOTOGRAPHY: "عکاسی",
  VIDEOGRAPHY: "فیلمبرداری",
  TEASER_PRODUCTION: "تیزرسازی",
  CATALOG: "کاتالوگ",
  BRAND_IDENTITY_DESIGN: "طراحی هویت بصری",
  CRM_MANAGEMENT: "مدیریت CRM",
  BOOTH_CONSTRUCTION: "غرفه سازی",
  PROGRAMMING: "برنامه نویسی",
};

function createEmptyStage(): TaskStageFormValue {
  return {
    title: "",
    description: "",
    assigneeId: "",
  };
}

function getInitialStages(): TaskStageFormValue[] {
  return [createEmptyStage(), createEmptyStage()];
}

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
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(createTaskSchema),

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
      stages: [],
    },
  });

  const selectedProjectId =
    useWatch({
      control,
      name: "projectId",
    }) ?? "";

  const selectedSubProjectId =
    useWatch({
      control,
      name: "subProjectId",
    }) ?? "";

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
    }) ?? false;

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

  const watchedStages =
    useWatch({
      control,
      name: "stages",
    });

  const stages = (
    watchedStages ?? []
  ) as TaskStageFormValue[];

  const isStaged = stages.length > 0;

  const selectedProject = useMemo(
    () =>
      projects.find(
        (project) => project.id === selectedProjectId,
      ),
    [projects, selectedProjectId],
  );

  const availableEmployees = useMemo(() => {
    if (!selectedProject) {
      return [];
    }

    return selectedProject.members
      .filter((member) => member.user.isActive)
      .map((member) => member.user);
  }, [selectedProject]);

  const selectedSubProject = useMemo(
    () =>
      selectedProject?.subProjects.find(
        (subProject) =>
          subProject.id === selectedSubProjectId,
      ) ?? null,
    [selectedProject, selectedSubProjectId],
  );

  useEffect(() => {
    if (!selectedProjectId) {
      setValue("subProjectId", "", {
        shouldValidate: true,
      });

      setValue("assigneeIds", [], {
        shouldValidate: true,
      });

      const hasAssignedStages = stages.some(
        (stage) => Boolean(stage.assigneeId),
      );

      if (hasAssignedStages) {
        setValue(
          "stages",
          stages.map((stage) => ({
            ...stage,
            assigneeId: "",
          })),
          {
            shouldValidate: true,
          },
        );
      }

      return;
    }

    const selectedSubProjectStillValid =
      selectedProject?.subProjects.some(
        (subProject) =>
          subProject.id === selectedSubProjectId,
      ) ?? false;

    if (!selectedSubProjectStillValid) {
      setValue("subProjectId", "", {
        shouldValidate: true,
      });
    }

    const availableEmployeeIds = new Set(
      availableEmployees.map((employee) => employee.id),
    );

    const validAssigneeIds = assigneeIds.filter((id) =>
      availableEmployeeIds.has(id),
    );

    if (validAssigneeIds.length !== assigneeIds.length) {
      setValue("assigneeIds", validAssigneeIds, {
        shouldValidate: true,
      });
    }

    const nextStages = stages.map((stage) => ({
      ...stage,
      assigneeId:
        stage.assigneeId &&
        availableEmployeeIds.has(stage.assigneeId)
          ? stage.assigneeId
          : "",
    }));

    const stageAssignmentsChanged = nextStages.some(
      (stage, index) =>
        stage.assigneeId !== stages[index]?.assigneeId,
    );

    if (stageAssignmentsChanged) {
      setValue("stages", nextStages, {
        shouldValidate: true,
      });
    }
  }, [
    selectedProjectId,
    selectedProject,
    selectedSubProjectId,
    availableEmployees,
    assigneeIds,
    stages,
    setValue,
  ]);

  useEffect(() => {
    if (!isRecurring || !recurrenceStartDate) {
      return;
    }

    if (deadline !== recurrenceStartDate) {
      setValue("deadline", recurrenceStartDate, {
        shouldValidate: true,
      });
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
    const nextProjectId = event.target.value;

    setValue("projectId", nextProjectId, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setValue("subProjectId", "", {
      shouldValidate: true,
      shouldDirty: true,
    });

    setValue("assigneeIds", [], {
      shouldValidate: true,
      shouldDirty: true,
    });

    if (stages.length > 0) {
      setValue(
        "stages",
        stages.map((stage) => ({
          ...stage,
          assigneeId: "",
        })),
        {
          shouldValidate: true,
          shouldDirty: true,
        },
      );
    }
  };

  const toggleAssignee = (employeeId: string) => {
    const next = assigneeIds.includes(employeeId)
      ? assigneeIds.filter((id) => id !== employeeId)
      : [...assigneeIds, employeeId];

    setValue("assigneeIds", next, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const updateStage = (
    index: number,
    changes: Partial<TaskStageFormValue>,
  ) => {
    const nextStages = [...stages];

    if (!nextStages[index]) {
      return;
    }

    nextStages[index] = {
      ...nextStages[index],
      ...changes,
    };

    setValue("stages", nextStages, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleAddStage = () => {
    setValue("stages", [...stages, createEmptyStage()], {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleRemoveStage = (index: number) => {
    if (stages.length <= 2) {
      toast.error("تسک چندمرحله‌ای باید حداقل دو مرحله داشته باشد.");
      return;
    }

    setValue(
      "stages",
      stages.filter((_, stageIndex) => stageIndex !== index),
      {
        shouldValidate: true,
        shouldDirty: true,
      },
    );
  };

  const handleRecurrenceToggle = (enabled: boolean) => {
    setValue("isRecurring", enabled, {
      shouldValidate: true,
    });

    if (enabled) {
      setValue("recurrenceType", "DAILY", {
        shouldValidate: true,
      });

      if (typeof deadline === "string" && deadline) {
        setValue("recurrenceStartDate", deadline, {
          shouldValidate: true,
        });
      }

      setValue("recurrenceActive", true);
      return;
    }

    setValue("recurrenceType", "NONE", {
      shouldValidate: true,
    });

    setValue("recurrenceStartDate", null);
    setValue("recurrenceEndDate", null);
    setValue("recurrenceWeekdays", []);
    setValue("recurrenceDayOfMonth", null);
    setValue("recurrenceActive", true);
  };

  const handleTaskModeChange = (staged: boolean) => {
    if (staged) {

      setValue("assigneeIds", [], {
        shouldValidate: true,
        shouldDirty: true,
      });

      setValue("stages", getInitialStages(), {
        shouldValidate: true,
        shouldDirty: true,
      });

      return;
    }

    setValue("stages", [], {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const onSubmit = async (values: FormOutput) => {
    const submittedStages = values.stages ?? [];
    const isStagedTask = submittedStages.length > 0;

    const payload: FormOutput = {
      ...values,
      stages: submittedStages,
      recurrenceEndDate: null,
    };


    if (payload.isRecurring && payload.recurrenceStartDate) {
      payload.deadline = payload.recurrenceStartDate;
    }

    const result = await createTaskAction(payload);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(
      isStagedTask
        ? "تسک چندمرحله‌ای با موفقیت ایجاد شد."
        : "تسک با موفقیت ایجاد شد.",
    );

    reset({
      projectId: values.projectId,
      subProjectId: values.subProjectId,
      title: "",
      description: "",
      assigneeIds: isStagedTask
        ? []
        : values.assigneeIds,
      priority: "MEDIUM",
      deadline: "",
      isRecurring: false,
      recurrenceType: "NONE",
      recurrenceStartDate: null,
      recurrenceEndDate: null,
      recurrenceWeekdays: [],
      recurrenceDayOfMonth: null,
      recurrenceActive: true,
      stages: isStagedTask
        ? submittedStages.map((stage) => ({
            ...stage,
            title: "",
            description: "",
          }))
        : [],
    });

    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
      dir="rtl"
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="task-title"
            className="text-sm font-semibold text-slate-700"
          >
            عنوان تسک
          </label>

          <input
            id="task-title"
            {...register("title")}
            placeholder="مثلاً تولید ریلز نپال"
            className="glass-field h-11 w-full rounded-xl px-3.5 text-right text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />

          {errors.title ? (
            <p className="text-xs font-medium text-red-600">
              {errors.title.message}
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
            value={selectedProjectId}
            onChange={handleProjectChange}
            className="glass-field h-11 w-full rounded-xl px-3.5 text-right text-sm font-medium text-slate-700 outline-none"
          >
            <option value="">انتخاب پروژه</option>

            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>

          {errors.projectId ? (
            <p className="text-xs font-medium text-red-600">
              {errors.projectId.message}
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
            {...register("subProjectId")}
            disabled={!selectedProjectId}
            className="glass-field h-11 w-full rounded-xl px-3.5 text-right text-sm font-medium text-slate-700 outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">
              {!selectedProjectId
                ? "ابتدا پروژه را انتخاب کنید"
                : "انتخاب زیرپروژه"}
            </option>

            {selectedProject?.subProjects.map((subProject) => (
              <option key={subProject.id} value={subProject.id}>
                {subProjectLabels[subProject.type]}
              </option>
            ))}
          </select>

          {errors.subProjectId ? (
            <p className="text-xs font-medium text-red-600">
              {errors.subProjectId.message}
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
            {...register("priority")}
            className="glass-field h-11 w-full rounded-xl px-3.5 text-right text-sm font-medium text-slate-700 outline-none"
          >
            {priorityOptions.map((priority) => (
              <option
                key={priority.value}
                value={priority.value}
              >
                {priority.label}
              </option>
            ))}
          </select>

          {errors.priority ? (
            <p className="text-xs font-medium text-red-600">
              {errors.priority.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-3 lg:col-span-2">
          <label className="text-sm font-semibold text-slate-700">
            نوع تسک
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleTaskModeChange(false)}
              aria-pressed={!isStaged}
              className={[
                "flex min-h-24 items-start gap-3 rounded-2xl border p-4 text-right transition",
                !isStaged
                  ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                  : "border-white/60 bg-white/40 text-slate-700 hover:bg-white/60",
              ].join(" ")}
            >
              <span
                className={[
                  "flex size-10 shrink-0 items-center justify-center rounded-xl",
                  !isStaged
                    ? "bg-white/10"
                    : "bg-slate-100",
                ].join(" ")}
              >
                <Users
                  className={[
                    "size-5",
                    !isStaged
                      ? "text-white"
                      : "text-slate-600",
                  ].join(" ")}
                />
              </span>

              <span className="min-w-0">
                <span className="block text-sm font-bold">
                  تسک معمولی
                </span>

                <span
                  className={[
                    "mt-1 block text-xs leading-6",
                    !isStaged
                      ? "text-slate-300"
                      : "text-slate-500",
                  ].join(" ")}
                >
                  واگذاری مستقیم تسک به یک یا چند کارمند
                </span>
              </span>

              {!isStaged ? (
                <Check className="mr-auto size-4 shrink-0" />
              ) : null}
            </button>

            <button
              type="button"
              onClick={() => handleTaskModeChange(true)}
              aria-pressed={isStaged}
              className={[
                "flex min-h-24 items-start gap-3 rounded-2xl border p-4 text-right transition",
                isStaged
                  ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                  : "border-white/60 bg-white/40 text-slate-700 hover:bg-white/60",
              ].join(" ")}
            >
              <span
                className={[
                  "flex size-10 shrink-0 items-center justify-center rounded-xl",
                  isStaged
                    ? "bg-white/10"
                    : "bg-slate-100",
                ].join(" ")}
              >
                <ListOrdered
                  className={[
                    "size-5",
                    isStaged
                      ? "text-white"
                      : "text-slate-600",
                  ].join(" ")}
                />
              </span>

              <span className="min-w-0">
                <span className="block text-sm font-bold">
                  تسک چندمرحله‌ای
                </span>

                <span
                  className={[
                    "mt-1 block text-xs leading-6",
                    isStaged
                      ? "text-slate-300"
                      : "text-slate-500",
                  ].join(" ")}
                >
                  هر مرحله مسئول خودش را دارد و مراحل به‌ترتیب فعال می‌شوند
                </span>
              </span>

              {isStaged ? (
                <Check className="mr-auto size-4 shrink-0" />
              ) : null}
            </button>
          </div>
        </div>

        {isStaged ? (
          <div className="space-y-4 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  مراحل انجام تسک
                </h3>

                <p className="mt-1 text-xs leading-6 text-slate-500">
                  مرحله اول ابتدا فعال می‌شود. مسئول هر مرحله پس از اتمام کار،
                  مرحله بعدی را فعال می‌کند.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                {stages.length.toLocaleString("fa-IR")} مرحله
              </span>
            </div>

            <div className="space-y-3">
              {stages.map((stage, index) => {
                const stageErrors =
                  errors.stages?.[index];

                return (
                  <section
                    key={`task-stage-${index}`}
                    className="relative rounded-2xl border border-slate-200/80 bg-white/45 p-4 sm:p-5"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                        {(
                          index + 1
                        ).toLocaleString("fa-IR")}
                      </span>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-slate-800">
                          مرحله {(
                            index + 1
                          ).toLocaleString("fa-IR")}
                        </h4>

                        <p className="mt-1 text-xs text-slate-500">
                          {index === 0
                            ? "این مرحله پس از ایجاد تسک فعال می‌شود."
                            : "بعد از تکمیل مراحل قبلی فعال می‌شود."}
                        </p>
                      </div>

                      {stages.length > 2 ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveStage(index)
                          }
                          aria-label={`حذف مرحله ${index + 1}`}
                          className="flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      ) : null}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label
                          htmlFor={`stage-title-${index}`}
                          className="text-sm font-semibold text-slate-700"
                        >
                          عنوان مرحله
                        </label>

                        <input
                          id={`stage-title-${index}`}
                          value={stage.title ?? ""}
                          onChange={(event) =>
                            updateStage(index, {
                              title: event.target.value,
                            })
                          }
                          placeholder={
                            index === 0
                              ? "مثلاً فیلمبرداری"
                              : "مثلاً تدوین ویدئو"
                          }
                          className="glass-field h-11 w-full rounded-xl px-3.5 text-right text-sm text-slate-800 outline-none placeholder:text-slate-400"
                        />

                        {stageErrors?.title?.message ? (
                          <p className="text-xs font-medium text-red-600">
                            {stageErrors.title.message}
                          </p>
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor={`stage-assignee-${index}`}
                          className="text-sm font-semibold text-slate-700"
                        >
                          مسئول این مرحله
                        </label>

                        <div className="relative">
                          <select
                            id={`stage-assignee-${index}`}
                            value={stage.assigneeId ?? ""}
                            onChange={(event) =>
                              updateStage(index, {
                                assigneeId: event.target.value,
                              })
                            }
                            disabled={!selectedProjectId}
                            className="glass-field h-11 w-full appearance-none rounded-xl px-3.5 pl-10 text-right text-sm font-medium text-slate-700 outline-none disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">
                              {!selectedProjectId
                                ? "ابتدا پروژه را انتخاب کنید"
                                : "انتخاب مسئول مرحله"}
                            </option>

                            {availableEmployees.map((employee) => (
                              <option
                                key={employee.id}
                                value={employee.id}
                              >
                                {employee.name}
                              </option>
                            ))}
                          </select>

                          <ChevronDown className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        </div>

                        {stageErrors?.assigneeId?.message ? (
                          <p className="text-xs font-medium text-red-600">
                            {stageErrors.assigneeId.message}
                          </p>
                        ) : null}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label
                          htmlFor={`stage-description-${index}`}
                          className="text-sm font-semibold text-slate-700"
                        >
                          توضیحات مرحله
                          <span className="mr-1 font-normal text-slate-400">
                            (اختیاری)
                          </span>
                        </label>

                        <textarea
                          id={`stage-description-${index}`}
                          value={stage.description ?? ""}
                          onChange={(event) =>
                            updateStage(index, {
                              description: event.target.value,
                            })
                          }
                          rows={2}
                          placeholder="جزئیات و خروجی مورد انتظار این مرحله..."
                          className="glass-field min-h-20 w-full resize-y rounded-xl px-3.5 py-3 text-right text-sm leading-7 text-slate-800 outline-none placeholder:text-slate-400"
                        />

                        {stageErrors?.description?.message ? (
                          <p className="text-xs font-medium text-red-600">
                            {stageErrors.description.message}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleAddStage}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/30 px-4 text-sm font-semibold text-slate-600 transition hover:border-slate-500 hover:bg-white/60 hover:text-slate-900"
            >
              <Plus className="size-4" />
              افزودن مرحله جدید
            </button>

            <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-xs leading-6 text-blue-900">
              مسئولان مراحل بعدی از ابتدا مشخص می‌شوند، اما تا زمان تکمیل مرحله
              قبلی، نوبت انجام مرحله آن‌ها فعال نخواهد بود. با تکمیل آخرین مرحله،
              خود تسک نیز تکمیل می‌شود.
            </div>
          </div>
        ) : (
          <div className="space-y-3 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-sm font-semibold text-slate-700">
                مسئول‌های تسک
              </label>

              {selectedProject ? (
                <span className="text-xs font-medium text-slate-400">
                  {assigneeIds.length.toLocaleString("fa-IR")} نفر انتخاب شده
                </span>
              ) : null}
            </div>

            {!selectedProjectId ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/20 px-4 py-5 text-sm text-slate-400">
                ابتدا پروژه را انتخاب کنید.
              </div>
            ) : availableEmployees.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-red-200 bg-red-50/50 px-4 py-5 text-sm font-medium text-red-600">
                این پروژه عضو فعال برای واگذاری تسک ندارد.
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {availableEmployees.map((employee) => {
                  const isSelected = assigneeIds.includes(employee.id);

                  return (
                    <button
                      key={employee.id}
                      type="button"
                      onClick={() => toggleAssignee(employee.id)}
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
                          {employee.name}
                        </span>

                        <span
                          className={[
                            "mt-0.5 block truncate text-xs",
                            isSelected
                              ? "text-slate-300"
                              : "text-slate-400",
                          ].join(" ")}
                        >
                          {employee.email}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {errors.assigneeIds ? (
              <p className="text-xs font-medium text-red-600">
                {errors.assigneeIds.message}
              </p>
            ) : null}
          </div>
        )}

        {!isRecurring ? (
          <div className="space-y-2 lg:col-span-2">
            <label
              htmlFor="task-deadline"
              className="text-sm font-semibold text-slate-700"
            >
              مهلت انجام
            </label>

            <Controller
              control={control}
              name="deadline"
              render={({ field }) => (
                <PersianDatePicker
                  id="task-deadline"
                  value={field.value as string}
                  onChange={field.onChange}
                  error={!!errors.deadline}
                  placeholder="انتخاب مهلت انجام"
                />
              )}
            />

            {errors.deadline ? (
              <p className="text-xs font-medium text-red-600">
                {errors.deadline.message}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-2 lg:col-span-2">
          <label
            htmlFor="task-description"
            className="text-sm font-semibold text-slate-700"
          >
            توضیحات تسک
          </label>

          <textarea
            id="task-description"
            {...register("description")}
            rows={5}
            placeholder="توضیحات کلی مربوط به تسک..."
            className="glass-field min-h-32 w-full resize-none rounded-xl px-3.5 py-3 text-right text-sm leading-7 text-slate-800 outline-none placeholder:text-slate-400"
          />

          {errors.description ? (
            <p className="text-xs font-medium text-red-600">
              {errors.description.message}
            </p>
          ) : null}
        </div>
      </div>

<TaskRecurrenceFields
  isRecurring={isRecurring}
  recurrenceType={
    (recurrenceType ?? "NONE") as
      | "NONE"
      | "DAILY"
      | "WEEKLY"
      | "MONTHLY"
  }
  recurrenceStartDate={
    typeof recurrenceStartDate === "string"
      ? recurrenceStartDate
      : ""
  }
  recurrenceWeekdays={recurrenceWeekdays ?? []}
  recurrenceDayOfMonth={recurrenceDayOfMonth ?? null}
  recurrenceActive={recurrenceActive ?? true}
  onIsRecurringChange={handleRecurrenceToggle}
  onRecurrenceTypeChange={(value) =>
    setValue("recurrenceType", value, {
      shouldValidate: true,
    })
  }
  onRecurrenceStartDateChange={(value) =>
    setValue("recurrenceStartDate", value, {
      shouldValidate: true,
    })
  }
  onRecurrenceWeekdaysChange={(value) =>
    setValue("recurrenceWeekdays", value, {
      shouldValidate: true,
    })
  }
  onRecurrenceDayOfMonthChange={(value) =>
    setValue("recurrenceDayOfMonth", value, {
      shouldValidate: true,
    })
  }
  onRecurrenceActiveChange={(value) =>
    setValue("recurrenceActive", value)
  }
  errors={{
    recurrenceType: errors.recurrenceType?.message,
    recurrenceStartDate: errors.recurrenceStartDate?.message,
    recurrenceWeekdays: errors.recurrenceWeekdays?.message,
    recurrenceDayOfMonth: errors.recurrenceDayOfMonth?.message,
  }}
/>

      {selectedProject ? (
        <div className="rounded-3xl border border-white/55 bg-white/24 p-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span className="text-slate-400">
              پروژه:
              <strong className="mr-1 text-slate-700">
                {selectedProject.title}
              </strong>
            </span>

            <span className="text-slate-400">
              زیرپروژه:
              <strong className="mr-1 text-slate-700">
                {selectedSubProject
                  ? subProjectLabels[selectedSubProject.type]
                  : "انتخاب نشده"}
              </strong>
            </span>

            <span className="text-slate-400">
              {isStaged ? "مراحل:" : "مسئول‌ها:"}
              <strong className="mr-1 text-slate-700">
                {isStaged
                  ? stages.length.toLocaleString("fa-IR")
                  : assigneeIds.length.toLocaleString("fa-IR")}{" "}
                {isStaged ? "مرحله" : "نفر"}
              </strong>
            </span>

            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
              <CalendarDays className="size-3.5" />
              {isRecurring
                ? "تاریخ شروع تکرار با تقویم شمسی"
                : "مهلت انجام با تقویم شمسی"}
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
            : isStaged
              ? "ایجاد تسک چندمرحله‌ای"
              : "ایجاد تسک"}
        </button>
      </div>
    </form>
  );
}