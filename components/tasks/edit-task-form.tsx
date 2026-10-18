"use client";

import { useEffect, useMemo } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  Clock3,
  Info,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { updateTaskAction } from "@/lib/actions/task.actions";
import { updateTaskSchema } from "@/lib/validations/task";

import { PersianDatePicker } from "@/components/ui/persian-date-picker";
import TaskRecurrenceFields from "@/components/tasks/task-recurrence-fields";

type FormInput = z.input<typeof updateTaskSchema>;
type FormOutput = z.output<typeof updateTaskSchema>;

type StageStatus = "LOCKED" | "IN_PROGRESS" | "COMPLETED";

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

type EmployeeOption = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
};

type SubProjectOption = {
  id: string;
  type: ProjectSubProjectType;
};

type StageEditorDefault = {
  id: string;
  title: string;
  description: string | null;
  position: number;
  status: StageStatus;
  assigneeId: string;
  activatedAt: Date | string | null;
  completedAt: Date | string | null;
  completedById: string | null;
  assigneeName?: string;
  completedByName?: string | null;
};

type StageFormValue = NonNullable<
  FormInput["stages"]
>[number];

type EditTaskFormProps = {
  taskId: string;
  projectId: string;
  isStaged?: boolean;

  defaultStages?: StageEditorDefault[];

  defaultValues: {
    subProjectId: string;
    title: string;
    description: string;
    assigneeIds: string[];
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    deadline: string;

    isRecurring: boolean;
    recurrenceType: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY";
    recurrenceStartDate: string;
    recurrenceEndDate: string | null;
    recurrenceWeekdays: number[];
    recurrenceDayOfMonth: number | null;
    recurrenceActive: boolean;
  };

  employees: EmployeeOption[];
  subProjects: SubProjectOption[];
};

const priorityOptions = [
  { value: "LOW", label: "کم" },
  { value: "MEDIUM", label: "متوسط" },
  { value: "HIGH", label: "زیاد" },
  { value: "URGENT", label: "فوری" },
] as const;

const stageStatusOptions: {
  value: StageStatus;
  label: string;
}[] = [
  { value: "LOCKED", label: "قفل‌شده" },
  { value: "IN_PROGRESS", label: "در حال انجام" },
  { value: "COMPLETED", label: "تکمیل‌شده" },
];

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

function formatDateTimeLocal(value: unknown): string {
  if (!value) {
    return "";
  }

  const date =
    value instanceof Date
      ? value
      : new Date(String(value));

  if (!Number.isFinite(date.getTime())) {
    return "";
  }

  const pad = (part: number) =>
    String(part).padStart(2, "0");

  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  ].join("T");
}

function toStageFormValue(
  stage: StageEditorDefault,
): StageFormValue {
  return {
    id: stage.id,
    title: stage.title,
    description: stage.description,
    position: stage.position,
    status: stage.status,
    assigneeId: stage.assigneeId,
    activatedAt: formatDateTimeLocal(stage.activatedAt) || null,
    completedAt: formatDateTimeLocal(stage.completedAt) || null,
    completedById: stage.completedById,
  };
}

function renumberStages<T extends { position: number }>(
  stages: T[],
): T[] {
  return stages.map((stage, index) => ({
    ...stage,
    position: index + 1,
  }));
}

export default function EditTaskForm({
  taskId,
  projectId,
  isStaged = false,
  defaultStages,
  defaultValues,
  employees,
  subProjects,
}: EditTaskFormProps) {
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(updateTaskSchema),

    defaultValues: {
      subProjectId: defaultValues.subProjectId,
      title: defaultValues.title,
      description: defaultValues.description,
      assigneeIds: defaultValues.assigneeIds,
      priority: defaultValues.priority,
      deadline: defaultValues.deadline,

      isRecurring: isStaged
        ? false
        : defaultValues.isRecurring,

      recurrenceType: isStaged
        ? "NONE"
        : defaultValues.recurrenceType,

      recurrenceStartDate: isStaged
        ? null
        : defaultValues.recurrenceStartDate,

      recurrenceEndDate: null,

      recurrenceWeekdays: isStaged
        ? []
        : defaultValues.recurrenceWeekdays,

      recurrenceDayOfMonth: isStaged
        ? null
        : defaultValues.recurrenceDayOfMonth,

      recurrenceActive: isStaged
        ? true
        : defaultValues.recurrenceActive,

      ...(defaultStages
        ? {
            stages: defaultStages.map(toStageFormValue),
          }
        : {}),
    },
  });

  const {
    fields: stageFields,
    append: appendStage,
    remove: removeStage,
    move: moveStage,
    replace: replaceStages,
  } = useFieldArray({
    control,
    name: "stages",
    keyName: "formKey",
  });

  const selectedSubProjectId = useWatch({
    control,
    name: "subProjectId",
  });

  const assigneeIds =
    useWatch({
      control,
      name: "assigneeIds",
    }) ?? [];

  const watchedStages =
    useWatch({
      control,
      name: "stages",
    }) ?? [];

  const deadline = useWatch({
    control,
    name: "deadline",
  });

  const isRecurring =
    useWatch({
      control,
      name: "isRecurring",
    }) ?? false;

  const recurrenceType = useWatch({
    control,
    name: "recurrenceType",
  });

  const recurrenceStartDate = useWatch({
    control,
    name: "recurrenceStartDate",
  });

  const recurrenceWeekdays = useWatch({
    control,
    name: "recurrenceWeekdays",
  });

  const recurrenceDayOfMonth = useWatch({
    control,
    name: "recurrenceDayOfMonth",
  });

  const recurrenceActive = useWatch({
    control,
    name: "recurrenceActive",
  });

  const activeEmployees = useMemo(
    () => employees.filter((employee) => employee.isActive),
    [employees],
  );

  const selectedSubProject = useMemo(
    () =>
      subProjects.find(
        (subProject) =>
          subProject.id === selectedSubProjectId,
      ) ?? null,
    [subProjects, selectedSubProjectId],
  );

  const displayedAssigneeIds = isStaged
    ? [
        ...new Set(
          watchedStages
            .map((stage) => stage?.assigneeId)
            .filter(
              (id): id is string =>
                typeof id === "string" && id.length > 0,
            ),
        ),
      ]
    : assigneeIds;

  /*
   * بعد از ذخیره و router.refresh، شناسه مراحل جدید از سرور
   * دوباره دریافت می‌شود. فهرست مرحله‌ها با داده تازه همگام می‌شود.
   */
  useEffect(() => {
    if (!isStaged || !defaultStages) {
      return;
    }

    replaceStages(
      defaultStages.map(toStageFormValue),
    );
  }, [
    isStaged,
    defaultStages,
    replaceStages,
  ]);

  useEffect(() => {
    if (isStaged) {
      return;
    }

    const availableEmployeeIds = new Set(
      activeEmployees.map((employee) => employee.id),
    );

    const validAssigneeIds = assigneeIds.filter((id) =>
      availableEmployeeIds.has(id),
    );

    if (validAssigneeIds.length !== assigneeIds.length) {
      setValue("assigneeIds", validAssigneeIds, {
        shouldValidate: true,
      });
    }
  }, [
    isStaged,
    activeEmployees,
    assigneeIds,
    setValue,
  ]);

  useEffect(() => {
    const subProjectExists = subProjects.some(
      (subProject) =>
        subProject.id === selectedSubProjectId,
    );

    if (selectedSubProjectId && !subProjectExists) {
      setValue("subProjectId", "", {
        shouldValidate: true,
      });
    }
  }, [
    subProjects,
    selectedSubProjectId,
    setValue,
  ]);

  useEffect(() => {
    if (isStaged || !isRecurring || !recurrenceStartDate) {
      return;
    }

    if (deadline !== recurrenceStartDate) {
      setValue("deadline", recurrenceStartDate, {
        shouldValidate: true,
      });
    }
  }, [
    isStaged,
    deadline,
    isRecurring,
    recurrenceStartDate,
    setValue,
  ]);

  const toggleAssignee = (employeeId: string) => {
    if (isStaged) {
      return;
    }

    const next = assigneeIds.includes(employeeId)
      ? assigneeIds.filter((id) => id !== employeeId)
      : [...assigneeIds, employeeId];

    setValue("assigneeIds", next, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleRecurrenceToggle = (enabled: boolean) => {
    if (isStaged && enabled) {
      toast.error(
        "تسک چندمرحله‌ای نمی‌تواند تکرارشونده باشد.",
      );
      return;
    }

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

  const moveStageTo = (
    index: number,
    direction: -1 | 1,
  ) => {
    const targetIndex = index + direction;

    if (
      targetIndex < 0 ||
      targetIndex >= stageFields.length
    ) {
      return;
    }

    moveStage(index, targetIndex);

    const currentStages = getValues("stages") ?? [];

    setValue(
      "stages",
      renumberStages(currentStages),
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  };

  const removeStageAt = (index: number) => {
    const currentStage = watchedStages[index];

    const isPersistedStage = Boolean(currentStage?.id);

    if (
      isPersistedStage &&
      !window.confirm(
        "حذف این مرحله، سابقه مرتبط با همین مرحله را نیز از تسک حذف می‌کند. آیا ادامه می‌دهید؟",
      )
    ) {
      return;
    }

    removeStage(index);

    const remainingStages = getValues("stages") ?? [];

    setValue(
      "stages",
      renumberStages(remainingStages),
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  };

  const handleAddStage = () => {
    if (!isStaged || !defaultStages) {
      toast.error("اطلاعات مراحل هنوز بارگذاری نشده است.");
      return;
    }

    const currentStages = getValues("stages") ?? [];

    const assigneeId =
      activeEmployees[0]?.id ??
      employees[0]?.id ??
      "";

    if (!assigneeId) {
      toast.error(
        "برای اضافه کردن مرحله، ابتدا یک کارمند به پروژه اضافه کنید.",
      );
      return;
    }

    const shouldActivateImmediately =
      currentStages.length > 0 &&
      currentStages.every(
        (stage) => stage.status === "COMPLETED",
      );

    appendStage({
      title: "",
      description: "",
      position: currentStages.length + 1,
      status: shouldActivateImmediately
        ? "IN_PROGRESS"
        : "LOCKED",
      assigneeId,
      activatedAt: shouldActivateImmediately
        ? formatDateTimeLocal(new Date())
        : null,
      completedAt: null,
      completedById: null,
    });

    const nextStages = getValues("stages") ?? [];

    setValue(
      "stages",
      renumberStages(nextStages),
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  };

  const onSubmit = async (values: FormOutput) => {
    if (isStaged && !defaultStages) {
      toast.error(
        "اطلاعات مراحل هنوز به فرم متصل نشده است.",
      );
      return;
    }

    const payload: FormOutput = {
      ...values,
      recurrenceEndDate: null,
    };

    if (isStaged) {
      const stageValues = renumberStages(
        values.stages ?? [],
      ).map((stage) => ({
        ...stage,
        description:
          stage.description?.trim() || null,
        activatedAt: stage.activatedAt ?? null,
        completedAt: stage.completedAt ?? null,
        completedById: stage.completedById ?? null,
      }));

      payload.stages = stageValues;

      payload.assigneeIds = [
        ...new Set(
          stageValues.map((stage) => stage.assigneeId),
        ),
      ];

      payload.isRecurring = false;
      payload.recurrenceType = "NONE";
      payload.recurrenceStartDate = null;
      payload.recurrenceEndDate = null;
      payload.recurrenceWeekdays = [];
      payload.recurrenceDayOfMonth = null;
      payload.recurrenceActive = true;
    } else if (
      payload.isRecurring &&
      payload.recurrenceStartDate
    ) {
      payload.deadline = payload.recurrenceStartDate;
    }

    const result = await updateTaskAction(taskId, payload);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("تسک با موفقیت به‌روزرسانی شد.");

    reset({
      subProjectId: payload.subProjectId ?? "",
      title: payload.title ?? "",
      description: payload.description ?? "",
      assigneeIds: payload.assigneeIds ?? [],
      priority: payload.priority ?? "MEDIUM",

      deadline: payload.deadline
        ? payload.deadline.toISOString().slice(0, 10)
        : defaultValues.deadline,

      isRecurring: payload.isRecurring ?? false,
      recurrenceType: payload.recurrenceType ?? "NONE",

      recurrenceStartDate: payload.recurrenceStartDate
        ? payload.recurrenceStartDate.toISOString().slice(0, 10)
        : "",

      recurrenceEndDate: null,
      recurrenceWeekdays: payload.recurrenceWeekdays ?? [],
      recurrenceDayOfMonth:
        payload.recurrenceDayOfMonth ?? null,
      recurrenceActive: payload.recurrenceActive ?? true,

      ...(payload.stages
        ? {
            stages: payload.stages.map((stage) => ({
              ...stage,
              activatedAt:
                formatDateTimeLocal(stage.activatedAt) || null,
              completedAt:
                formatDateTimeLocal(stage.completedAt) || null,
            })),
          }
        : {}),
    });

    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
      dir="rtl"
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
            عنوان تسک
          </label>

          <input
            id="edit-task-title"
            {...register("title")}
            className="glass-field h-11 w-full rounded-xl px-3.5 text-right text-sm text-slate-800 outline-none"
          />

          {errors.title ? (
            <p className="text-xs font-medium text-red-600">
              {errors.title.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="edit-task-sub-project"
            className="text-sm font-semibold text-slate-700"
          >
            زیرپروژه
          </label>

          <select
            id="edit-task-sub-project"
            {...register("subProjectId")}
            className="glass-field h-11 w-full rounded-xl px-3.5 text-right text-sm font-medium text-slate-700 outline-none"
          >
            <option value="">انتخاب زیرپروژه</option>

            {subProjects.map((subProject) => (
              <option
                key={subProject.id}
                value={subProject.id}
              >
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

        <div className="space-y-3 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-sm font-semibold text-slate-700">
              {isStaged ? "مسئولان مراحل" : "مسئول‌های تسک"}
            </label>

            <span className="text-xs font-medium text-slate-400">
              {displayedAssigneeIds.length.toLocaleString("fa-IR")} نفر
            </span>
          </div>

          {isStaged ? (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 size-5 shrink-0 text-indigo-700" />

                <div>
                  <p className="text-sm font-bold text-indigo-900">
                    مسئولان از طریق مراحل تعیین می‌شوند.
                  </p>

                  <p className="mt-1 text-xs leading-6 text-slate-600">
                    با تغییر مسئول یک مرحله، تخصیص‌های تسک نیز هنگام ذخیره
                    با مسئولان مراحل هماهنگ می‌شوند.
                  </p>
                </div>
              </div>

              {displayedAssigneeIds.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {displayedAssigneeIds.map((employeeId) => {
                    const employee = employees.find(
                      (item) => item.id === employeeId,
                    );

                    return (
                      <span
                        key={employeeId}
                        className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-white/80 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700"
                      >
                        <Check className="size-4 text-indigo-600" />
                        {employee?.name ?? "مسئول ثبت‌شده در مراحل"}
                      </span>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ) : activeEmployees.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-red-200 bg-red-50/50 px-4 py-5 text-sm font-medium text-red-600">
              این پروژه عضو فعال برای واگذاری تسک ندارد.
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {activeEmployees.map((employee) => {
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

          {!isStaged && errors.assigneeIds ? (
            <p className="text-xs font-medium text-red-600">
              {errors.assigneeIds.message}
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

        {!isRecurring || isStaged ? (
          <div className="space-y-2">
            <label
              htmlFor="edit-task-deadline"
              className="text-sm font-semibold text-slate-700"
            >
              مهلت انجام
            </label>

            <Controller
              control={control}
              name="deadline"
              render={({ field }) => (
                <PersianDatePicker
                  id="edit-task-deadline"
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
            htmlFor="edit-task-description"
            className="text-sm font-semibold text-slate-700"
          >
            توضیحات تسک
          </label>

          <textarea
            id="edit-task-description"
            {...register("description")}
            rows={5}
            className="glass-field min-h-32 w-full resize-none rounded-xl px-3.5 py-3 text-right text-sm leading-7 text-slate-800 outline-none"
          />

          {errors.description ? (
            <p className="text-xs font-medium text-red-600">
              {errors.description.message}
            </p>
          ) : null}
        </div>
      </div>

      {isStaged ? (
        <section className="overflow-hidden rounded-3xl border border-indigo-200/80 bg-white/60">
          <div className="flex flex-col gap-4 border-b border-indigo-100 bg-gradient-to-l from-indigo-50 to-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
                  <Clock3 className="size-5" />
                </span>

                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    مدیریت مراحل تسک
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    مشخصات، مسئول، ترتیب، وضعیت و زمان‌های هر مرحله را ویرایش کنید.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-xl border border-indigo-100 bg-white px-3 py-2 text-sm font-extrabold text-indigo-800">
                {stageFields.length.toLocaleString("fa-IR")} مرحله
              </span>

              <button
                type="button"
                onClick={handleAddStage}
                disabled={!defaultStages}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="size-4" />
                افزودن مرحله
              </button>
            </div>
          </div>

          {!defaultStages ? (
            <div className="m-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-700" />

              <p className="text-sm leading-7 text-amber-900">
                اطلاعات مراحل هنوز از صفحه جزئیات به این فرم ارسال نشده است.
                برای فعال‌شدن ویرایش، لازم است اتصال داده‌های مراحل در صفحه
                جزئیات تسک نیز انجام شود.
              </p>
            </div>
          ) : (
            <div className="space-y-4 p-4 sm:p-5">
              {stageFields.map((stage, index) => {
                const currentStage = watchedStages[index];

                const currentStageDefault =
                  defaultStages.find(
                    (item) => item.id === currentStage?.id,
                  );

                const currentAssigneeId =
                  currentStage?.assigneeId ?? "";

                const currentCompletedById =
                  currentStage?.completedById ?? null;

                const currentCompletedByName =
                  employees.find(
                    (employee) =>
                      employee.id === currentCompletedById,
                  )?.name ??
                  currentStageDefault?.completedByName ??
                  "کاربر ثبت‌شده فعلی";

                const assigneeExists = employees.some(
                  (employee) =>
                    employee.id === currentAssigneeId,
                );

                const completedByExists =
                  currentCompletedById
                    ? employees.some(
                        (employee) =>
                          employee.id === currentCompletedById,
                      )
                    : true;

                return (
                  <article
                    key={stage.formKey}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-100 text-sm font-black text-indigo-800">
                          {(index + 1).toLocaleString("fa-IR")}
                        </span>

                        <div>
                          <p className="text-sm font-extrabold text-slate-900">
                            {currentStage?.title?.trim() ||
                              `مرحله ${index + 1}`}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {currentStage?.status === "COMPLETED"
                              ? "تکمیل‌شده"
                              : currentStage?.status === "IN_PROGRESS"
                                ? "در حال انجام"
                                : "قفل‌شده"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => moveStageTo(index, -1)}
                          disabled={index === 0}
                          aria-label="انتقال مرحله به بالا"
                          className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <ArrowUp className="size-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => moveStageTo(index, 1)}
                          disabled={index === stageFields.length - 1}
                          aria-label="انتقال مرحله به پایین"
                          className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <ArrowDown className="size-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => removeStageAt(index)}
                          aria-label="حذف مرحله"
                          className="flex size-9 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-4 p-4 sm:grid-cols-2">
                      <input
                        type="hidden"
                        {...register(`stages.${index}.id`)}
                      />

                      <input
                        type="hidden"
                        {...register(`stages.${index}.position`, {
                          valueAsNumber: true,
                        })}
                      />

                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-sm font-bold text-slate-700">
                          عنوان مرحله
                        </label>

                        <input
                          {...register(`stages.${index}.title`)}
                          className="glass-field h-11 w-full rounded-xl px-3.5 text-right text-sm text-slate-800 outline-none"
                          placeholder="مثلاً فیلم‌برداری"
                        />

                        {errors.stages?.[index]?.title ? (
                          <p className="text-xs font-medium text-red-600">
                            {errors.stages[index]?.title?.message}
                          </p>
                        ) : null}
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-sm font-bold text-slate-700">
                          توضیحات مرحله
                        </label>

                        <textarea
                          {...register(`stages.${index}.description`)}
                          rows={3}
                          className="glass-field min-h-24 w-full resize-y rounded-xl px-3.5 py-3 text-right text-sm leading-7 text-slate-800 outline-none"
                          placeholder="جزئیات موردنیاز برای انجام این مرحله"
                        />

                        {errors.stages?.[index]?.description ? (
                          <p className="text-xs font-medium text-red-600">
                            {errors.stages[index]?.description?.message}
                          </p>
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">
                          مسئول مرحله
                        </label>

                        <select
                          {...register(`stages.${index}.assigneeId`)}
                          className="glass-field h-11 w-full rounded-xl px-3 text-right text-sm text-slate-800 outline-none"
                        >
                          {!assigneeExists &&
                          currentAssigneeId ? (
                            <option value={currentAssigneeId}>
                              {currentStageDefault?.assigneeName ??
                                "مسئول فعلی ثبت‌شده"}
                            </option>
                          ) : null}

                          {employees.map((employee) => (
                            <option
                              key={employee.id}
                              value={employee.id}
                            >
                              {employee.name}
                              {!employee.isActive
                                ? " (غیرفعال)"
                                : ""}
                            </option>
                          ))}
                        </select>

                        {errors.stages?.[index]?.assigneeId ? (
                          <p className="text-xs font-medium text-red-600">
                            {errors.stages[index]?.assigneeId?.message}
                          </p>
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">
                          وضعیت مرحله
                        </label>

                        <select
                          {...register(`stages.${index}.status`)}
                          className="glass-field h-11 w-full rounded-xl px-3 text-right text-sm font-semibold text-slate-800 outline-none"
                        >
                          {stageStatusOptions.map((option) => (
                            <option
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>

                        {errors.stages?.[index]?.status ? (
                          <p className="text-xs font-medium text-red-600">
                            {errors.stages[index]?.status?.message}
                          </p>
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">
                          تاریخ و ساعت فعال‌شدن
                        </label>

                        <Controller
                          control={control}
                          name={`stages.${index}.activatedAt`}
                          render={({ field }) => (
                            <input
                              type="datetime-local"
                              value={formatDateTimeLocal(field.value)}
                              onChange={(event) =>
                                field.onChange(
                                  event.target.value || null,
                                )
                              }
                              className="glass-field h-11 w-full min-w-0 rounded-xl px-3 text-left text-sm text-slate-800 outline-none"
                              dir="ltr"
                            />
                          )}
                        />

                        <p className="text-xs leading-5 text-slate-500">
                          زمانی که این مرحله برای شروع کار فعال شده است.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">
                          تاریخ و ساعت تکمیل
                        </label>

                        <Controller
                          control={control}
                          name={`stages.${index}.completedAt`}
                          render={({ field }) => (
                            <input
                              type="datetime-local"
                              value={formatDateTimeLocal(field.value)}
                              onChange={(event) =>
                                field.onChange(
                                  event.target.value || null,
                                )
                              }
                              className="glass-field h-11 w-full min-w-0 rounded-xl px-3 text-left text-sm text-slate-800 outline-none"
                              dir="ltr"
                            />
                          )}
                        />

                        <p className="text-xs leading-5 text-slate-500">
                          زمان ثبت‌شده برای تکمیل و تحویل مرحله.
                        </p>
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-sm font-bold text-slate-700">
                          شخص تکمیل‌کننده
                        </label>

                        <select
                          {...register(`stages.${index}.completedById`)}
                          className="glass-field h-11 w-full rounded-xl px-3 text-right text-sm text-slate-800 outline-none"
                        >
                          <option value="">
                            بدون ثبت‌کننده
                          </option>

                          {currentCompletedById &&
                          !completedByExists ? (
                            <option value={currentCompletedById}>
                              {currentCompletedByName}
                            </option>
                          ) : null}

                          {employees.map((employee) => (
                            <option
                              key={employee.id}
                              value={employee.id}
                            >
                              {employee.name}
                            </option>
                          ))}
                        </select>

                        <p className="text-xs leading-5 text-slate-500">
                          این فیلد برای اصلاح سابقه ثبت‌کننده تکمیل است.
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}

              {stageFields.length < 2 ? (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-700" />

                  <p className="text-sm leading-7 text-amber-900">
                    یک تسک چندمرحله‌ای باید حداقل دو مرحله داشته باشد.
                    پیش از ذخیره، مراحل موردنیاز را اضافه کنید.
                  </p>
                </div>
              ) : null}

              {errors.stages?.message ? (
                <p className="text-sm font-semibold text-red-600">
                  {errors.stages.message}
                </p>
              ) : null}

              <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
                <Info className="mt-0.5 size-5 shrink-0 text-amber-700" />

                <p className="text-xs leading-7 text-amber-900">
                  تغییر وضعیت و زمان‌ها بر اطلاعات گردش کار اثر می‌گذارد.
                  حذف مرحله ثبت‌شده نیز می‌تواند سابقه همان مرحله را از بین ببرد.
                  پیش از ذخیره، اطلاعات و ترتیب مراحل را بررسی کنید.
                </p>
              </div>
            </div>
          )}
        </section>
      ) : (
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
          showActiveToggle
          errors={{
            recurrenceType: errors.recurrenceType?.message,
            recurrenceStartDate:
              errors.recurrenceStartDate?.message,
            recurrenceWeekdays:
              errors.recurrenceWeekdays?.message,
            recurrenceDayOfMonth:
              errors.recurrenceDayOfMonth?.message,
          }}
        />
      )}

      <div className="rounded-3xl border border-white/55 bg-white/24 p-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="text-slate-400">
            زیرپروژه:
            <strong className="mr-1 text-slate-700">
              {selectedSubProject
                ? subProjectLabels[selectedSubProject.type]
                : "انتخاب نشده"}
            </strong>
          </span>

          <span className="text-slate-400">
            {isStaged ? "مسئولان مراحل:" : "مسئول‌ها:"}
            <strong className="mr-1 text-slate-700">
              {displayedAssigneeIds.length.toLocaleString("fa-IR")} نفر
            </strong>
          </span>

          {isStaged ? (
            <span className="text-xs font-medium text-indigo-700">
              گردش مراحل قابل ویرایش است
            </span>
          ) : null}
        </div>
      </div>

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

          {isSubmitting ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </button>
      </div>
    </form>
  );
}