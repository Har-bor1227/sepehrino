"use server";

import { revalidatePath } from "next/cache";

import {
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

function getErrorMessage(
  error: unknown,
) {
  if (error instanceof Error) {
    switch (error.message) {
      case "PROJECT_NOT_FOUND":
        return "پروژه موردنظر پیدا نشد.";

      case "EMPLOYEE_NOT_FOUND":
        return "کارمند موردنظر پیدا نشد یا فعال نیست.";

      case "EMPLOYEE_NOT_PROJECT_MEMBER":
        return "این کارمند عضو پروژه نیست.";

      case "TASK_NOT_FOUND":
        return "Task موردنظر پیدا نشد.";

      case "DEADLINE_REQUIRED":
        return "برای Task معمولی وارد کردن Deadline الزامی است.";

      case "RECURRENCE_INVALID":
        return "تنظیمات تکرار Task معتبر نیست.";

      case "RECURRING_TASK_REQUIRED":
        return "این Task تکرارشونده نیست.";

      case "RECURRING_TASK_STATUS_USE_OCCURRENCE":
        return "برای Task تکرارشونده باید وضعیت هر نوبت را جداگانه ثبت کنید.";

      case "OCCURRENCE_NOT_SCHEDULED":
        return "برای این تاریخ نوبتی برای Task وجود ندارد.";

      case "OCCURRENCE_DATE_NOT_ALLOWED":
        return "کارمند فقط می‌تواند نوبت امروز را تکمیل کند.";

      default:
        return (
          error.message ||
          "خطایی در انجام عملیات رخ داد."
        );
    }
  }

  return "خطایی در انجام عملیات رخ داد.";
}

function revalidateTaskPaths(
  taskId: string,
) {
  revalidatePath(
    "/admin/tasks",
  );

  revalidatePath(
    "/admin/projects",
  );

  revalidatePath(
    "/admin/projects/[id]",
    "page",
  );

  revalidatePath(
    `/admin/tasks/${taskId}`,
  );

  revalidatePath(
    "/employee/tasks",
  );

  revalidatePath(
    `/employee/tasks/${taskId}`,
  );
}

export async function createTaskAction(
  input: unknown,
) {
  try {
    const validated =
      createTaskSchema.parse(input);

    const task =
      await createTask(
        validated,
      );

    revalidatePath(
      "/admin/tasks",
    );

    revalidatePath(
      "/admin/projects",
    );

    revalidatePath(
      `/admin/projects/${validated.projectId}`,
    );

    return {
      success: true as const,
      task,
    };
  } catch (error) {
    return {
      success: false as const,
      message:
        getErrorMessage(error),
    };
  }
}

export async function updateTaskAction(
  taskId: string,
  input: unknown,
) {
  try {
    const validated =
      updateTaskSchema.parse(input);

    const task =
      await updateTask(
        taskId,
        validated,
      );

    revalidateTaskPaths(
      taskId,
    );

    return {
      success: true as const,
      task,
    };
  } catch (error) {
    return {
      success: false as const,
      message:
        getErrorMessage(error),
    };
  }
}

export async function updateTaskStatusAction(
  input: unknown,
) {
  try {
    const validated =
      updateTaskStatusSchema.parse(
        input,
      );

    const task =
      await updateTaskStatus(
        validated.taskId,
        validated.status,
      );

    revalidateTaskPaths(
      validated.taskId,
    );

    return {
      success: true as const,
      task,
    };
  } catch (error) {
    return {
      success: false as const,
      message:
        getErrorMessage(error),
    };
  }
}

export async function setTaskOccurrenceStatusAction(
  input: unknown,
) {
  try {
    const validated =
      setTaskOccurrenceStatusSchema.parse(
        input,
      );

    const occurrence =
      await setTaskOccurrenceStatus(
        validated.taskId,
        validated.occurrenceDate,
        validated.completed,
      );

    revalidateTaskPaths(
      validated.taskId,
    );

    revalidatePath(
      "/admin/reports",
    );

    return {
      success: true as const,
      occurrence,
    };
  } catch (error) {
    return {
      success: false as const,
      message:
        getErrorMessage(error),
    };
  }
}

export async function deleteTaskAction(
  taskId: string,
) {
  try {
    const task =
      await deleteTask(
        taskId,
      );

    revalidatePath(
      "/admin/tasks",
    );

    revalidatePath(
      "/admin/projects",
    );

    revalidatePath(
      "/admin/projects/[id]",
      "page",
    );

    revalidatePath(
      "/employee/tasks",
    );

    return {
      success: true as const,
      task,
    };
  } catch (error) {
    return {
      success: false as const,
      message:
        getErrorMessage(error),
    };
  }
}