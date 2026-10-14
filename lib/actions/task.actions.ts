"use server";

import { revalidatePath } from "next/cache";

import {
  completeTaskStage,
  createTask,
  deleteTask,
  updateTask,
  updateTaskStatus,
  setTaskOccurrenceStatus,
} from "@/lib/services/task.service";

import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  setTaskOccurrenceStatusSchema,
} from "@/lib/validations/task";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    switch (error.message) {
      case "PROJECT_NOT_FOUND":
        return "پروژه موردنظر پیدا نشد.";

      case "EMPLOYEE_NOT_FOUND":
        return "کارمند موردنظر پیدا نشد یا فعال نیست.";

      case "EMPLOYEE_NOT_PROJECT_MEMBER":
        return "این کارمند عضو پروژه نیست.";

      case "TASK_NOT_FOUND":
        return "تسک موردنظر پیدا نشد.";

      case "TASK_STAGE_NOT_FOUND":
      case "STAGE_NOT_FOUND":
        return "مرحله موردنظر پیدا نشد.";

      case "TASK_STAGE_FORBIDDEN":
      case "STAGE_FORBIDDEN":
      case "STAGE_ASSIGNEE_ONLY":
        return "فقط مسئول همین مرحله می‌تواند آن را تکمیل کند.";

      case "TASK_STAGE_LOCKED":
      case "STAGE_LOCKED":
        return "این مرحله هنوز فعال نشده است.";

      case "TASK_STAGE_ALREADY_COMPLETED":
      case "STAGE_ALREADY_COMPLETED":
        return "این مرحله قبلاً تکمیل شده است.";

      case "TASK_STAGE_PREVIOUS_NOT_COMPLETED":
      case "PREVIOUS_STAGES_INCOMPLETE":
        return "ابتدا باید مراحل قبلی تکمیل شوند.";

      case "TASK_STAGE_RECURRING_NOT_ALLOWED":
      case "STAGED_TASK_CANNOT_RECUR":
        return "تسک چندمرحله‌ای نمی‌تواند تکرارشونده باشد.";

      case "DEADLINE_REQUIRED":
        return "برای تسک معمولی وارد کردن مهلت انجام الزامی است.";

      case "RECURRENCE_INVALID":
        return "تنظیمات تکرار تسک معتبر نیست.";

      case "RECURRING_TASK_REQUIRED":
        return "این تسک تکرارشونده نیست.";

      case "RECURRING_TASK_STATUS_USE_OCCURRENCE":
        return "برای تسک تکرارشونده باید وضعیت هر نوبت را جداگانه ثبت کنید.";

      case "OCCURRENCE_NOT_SCHEDULED":
        return "برای این تاریخ نوبتی برای تسک وجود ندارد.";

      case "OCCURRENCE_DATE_NOT_ALLOWED":
        return "کارمند فقط می‌تواند نوبت امروز را تکمیل کند.";

      default:
        return error.message || "خطایی در انجام عملیات رخ داد.";
    }
  }

  return "خطایی در انجام عملیات رخ داد.";
}

function revalidateTaskPaths(taskId: string) {
  revalidatePath("/admin/tasks");
  revalidatePath("/admin/projects");
  revalidatePath("/admin/projects/[id]", "page");
  revalidatePath(`/admin/tasks/${taskId}`);

  revalidatePath("/employee/tasks");
  revalidatePath(`/employee/tasks/${taskId}`);
}

function revalidateTaskStagePaths() {
  revalidatePath("/admin/tasks");
  revalidatePath("/admin/tasks/[id]", "page");

  revalidatePath("/admin/projects");
  revalidatePath("/admin/projects/[id]", "page");

  revalidatePath("/employee/tasks");
  revalidatePath("/employee/tasks/[id]", "page");

  revalidatePath("/employee/projects");
  revalidatePath("/employee/projects/[id]", "page");

  revalidatePath("/admin/dashboard");
  revalidatePath("/employee/dashboard");
}

export async function createTaskAction(input: unknown) {
  try {
    const validated = createTaskSchema.parse(input);

    const task = await createTask(validated);

    revalidatePath("/admin/tasks");
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${validated.projectId}`);
    revalidatePath("/admin/dashboard");
    revalidatePath("/employee/tasks");
    revalidatePath("/employee/dashboard");

    return {
      success: true as const,
      task,
    };
  } catch (error) {
    return {
      success: false as const,
      message: getErrorMessage(error),
    };
  }
}

export async function updateTaskAction(
  taskId: string,
  input: unknown,
) {
  try {
    const validated = updateTaskSchema.parse(input);

    const task = await updateTask(taskId, validated);

    revalidateTaskPaths(taskId);

    return {
      success: true as const,
      task,
    };
  } catch (error) {
    return {
      success: false as const,
      message: getErrorMessage(error),
    };
  }
}

export async function updateTaskStatusAction(input: unknown) {
  try {
    const validated = updateTaskStatusSchema.parse(input);

    const task = await updateTaskStatus(
      validated.taskId,
      validated.status,
    );

    revalidateTaskPaths(validated.taskId);

    return {
      success: true as const,
      task,
    };
  } catch (error) {
    return {
      success: false as const,
      message: getErrorMessage(error),
    };
  }
}

/**
 * تکمیل مرحله توسط مسئول همان مرحله
 */
export async function completeTaskStageAction(stageId: string) {
  try {
    if (
      typeof stageId !== "string" ||
      stageId.trim().length === 0
    ) {
      return {
        success: false as const,
        message: "شناسه مرحله معتبر نیست.",
      };
    }

    await completeTaskStage(stageId);

    revalidateTaskStagePaths();

    return {
      success: true as const,
    };
  } catch (error) {
    return {
      success: false as const,
      message: getErrorMessage(error),
    };
  }
}

export async function setTaskOccurrenceStatusAction(input: unknown) {
  try {
    const validated =
      setTaskOccurrenceStatusSchema.parse(input);

    const occurrence = await setTaskOccurrenceStatus(
      validated.taskId,
      validated.occurrenceDate,
      validated.completed,
    );

    revalidateTaskPaths(validated.taskId);
    revalidatePath("/admin/reports");

    return {
      success: true as const,
      occurrence,
    };
  } catch (error) {
    return {
      success: false as const,
      message: getErrorMessage(error),
    };
  }
}

export async function deleteTaskAction(taskId: string) {
  try {
    const task = await deleteTask(taskId);

    revalidatePath("/admin/tasks");
    revalidatePath("/admin/projects");
    revalidatePath("/admin/projects/[id]", "page");
    revalidatePath("/employee/tasks");
    revalidatePath("/admin/dashboard");
    revalidatePath("/employee/dashboard");

    return {
      success: true as const,
      task,
    };
  } catch (error) {
    return {
      success: false as const,
      message: getErrorMessage(error),
    };
  }
}