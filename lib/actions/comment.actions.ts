
"use server";

import { revalidatePath } from "next/cache";

import {
  createComment,
} from "@/lib/services/comment.service";

import {
  createCommentSchema,
} from "@/lib/validations/task";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    switch (error.message) {
      case "TASK_NOT_FOUND":
        return "Task موردنظر پیدا نشد.";

      case "FORBIDDEN":
        return "شما اجازه انجام این عملیات را ندارید.";

      default:
        return (
          error.message ||
          "خطایی در انجام عملیات رخ داد."
        );
    }
  }

  return "خطایی در انجام عملیات رخ داد.";
}

export async function createCommentAction(
  input: unknown,
) {
  try {
    const validated =
      createCommentSchema.parse(input);

    const comment = await createComment(
      validated.taskId,
      validated.content,
    );

    revalidatePath(
      `/admin/tasks/${validated.taskId}`,
    );

    revalidatePath(
      `/employee/tasks/${validated.taskId}`,
    );

    revalidatePath("/admin/tasks");
    revalidatePath("/employee/tasks");

    return {
      success: true as const,
      comment,
    };
  } catch (error) {
    return {
      success: false as const,
      message: getErrorMessage(error),
    };
  }
}

