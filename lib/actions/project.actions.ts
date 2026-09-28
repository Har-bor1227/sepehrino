"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import {
  addProjectMember,
  createProject,
  deleteProject,
  removeProjectMember,
  updateProject,
} from "@/lib/services/project.service";

import {
  createProjectSchema,
  projectMemberSchema,
  updateProjectSchema,
} from "@/lib/validations/project";

type ProjectData = {
  id: string;
  title: string;
  description: string | null;
  status:
    | "PLANNED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "ARCHIVED";
  startDate: Date;
  deadline: Date;
};

type ProjectMutationResult =
  | {
      success: true;
      project: ProjectData;
    }
  | {
      success: false;
      message: string;
      fieldErrors?: Record<
        string,
        string[] | undefined
      >;
    };

type SimpleActionResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

export async function createProjectAction(
  input: unknown,
): Promise<ProjectMutationResult> {
  try {
    const validated = createProjectSchema.parse(input);

    const project = await createProject(validated);

    revalidatePath("/admin/projects");

    return {
      success: true,
      project,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message:
          "اطلاعات پروژه معتبر نیست.",
        fieldErrors:
          error.flatten().fieldErrors,
      };
    }

    if (
      error instanceof Error &&
      error.message ===
        "INVALID_PROJECT_DATE_RANGE"
    ) {
      return {
        success: false,
        message:
          "Deadline نمی‌تواند قبل از تاریخ شروع باشد.",
        fieldErrors: {
          deadline: [
            "Deadline نمی‌تواند قبل از تاریخ شروع باشد.",
          ],
        },
      };
    }

    console.error(
      "createProjectAction failed:",
      error,
    );

    return {
      success: false,
      message:
        "ایجاد پروژه انجام نشد.",
    };
  }
}

export async function updateProjectAction(
  projectId: string,
  input: unknown,
): Promise<ProjectMutationResult> {
  try {
    const validated = updateProjectSchema.parse(input);

    const project = await updateProject(
      projectId,
      validated,
    );

    revalidatePath("/admin/projects");
    revalidatePath(
      `/admin/projects/${projectId}`,
    );
    revalidatePath(
      `/admin/projects/${projectId}/edit`,
    );

    return {
      success: true,
      project,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message:
          "اطلاعات پروژه معتبر نیست.",
        fieldErrors:
          error.flatten().fieldErrors,
      };
    }

    if (
      error instanceof Error &&
      error.message ===
        "PROJECT_NOT_FOUND"
    ) {
      return {
        success: false,
        message:
          "پروژه موردنظر پیدا نشد.",
      };
    }

    if (
      error instanceof Error &&
      error.message ===
        "INVALID_PROJECT_DATE_RANGE"
    ) {
      return {
        success: false,
        message:
          "Deadline نمی‌تواند قبل از تاریخ شروع باشد.",
        fieldErrors: {
          deadline: [
            "Deadline نمی‌تواند قبل از تاریخ شروع باشد.",
          ],
        },
      };
    }

    console.error(
      "updateProjectAction failed:",
      error,
    );

    return {
      success: false,
      message:
        "ویرایش پروژه انجام نشد.",
    };
  }
}

export async function deleteProjectAction(
  projectId: string,
): Promise<SimpleActionResult> {
  try {
    await deleteProject(projectId);

    revalidatePath("/admin/projects");

    return {
      success: true,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "PROJECT_NOT_FOUND"
    ) {
      return {
        success: false,
        message:
          "پروژه موردنظر پیدا نشد.",
      };
    }

    if (
      error instanceof Error &&
      error.message === "PROJECT_HAS_TASKS"
    ) {
      return {
        success: false,
        message:
          "این پروژه دارای Task است و فعلاً قابل حذف نیست. در صورت نیاز پروژه را آرشیو کنید.",
      };
    }

    console.error(
      "deleteProjectAction failed:",
      error,
    );

    return {
      success: false,
      message:
        "حذف پروژه انجام نشد.",
    };
  }
}

export async function addProjectMemberAction(
  projectId: string,
  employeeId: string,
): Promise<SimpleActionResult> {
  try {
    const validated = projectMemberSchema.parse({
      projectId,
      employeeId,
    });

    await addProjectMember(
      validated.projectId,
      validated.employeeId,
    );

    revalidatePath(
      `/admin/projects/${projectId}`,
    );
    revalidatePath("/admin/projects");

    return {
      success: true,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message:
          "شناسه پروژه یا کارمند معتبر نیست.",
      };
    }

    if (
      error instanceof Error &&
      error.message === "PROJECT_NOT_FOUND"
    ) {
      return {
        success: false,
        message:
          "پروژه موردنظر پیدا نشد.",
      };
    }

    if (
      error instanceof Error &&
      error.message === "EMPLOYEE_NOT_FOUND"
    ) {
      return {
        success: false,
        message:
          "کارمند فعال موردنظر پیدا نشد.",
      };
    }

    console.error(
      "addProjectMemberAction failed:",
      error,
    );

    return {
      success: false,
      message:
        "افزودن عضو به پروژه انجام نشد.",
    };
  }
}

export async function removeProjectMemberAction(
  projectId: string,
  employeeId: string,
): Promise<SimpleActionResult> {
  try {
    const validated = projectMemberSchema.parse({
      projectId,
      employeeId,
    });

    await removeProjectMember(
      validated.projectId,
      validated.employeeId,
    );

    revalidatePath(
      `/admin/projects/${projectId}`,
    );
    revalidatePath("/admin/projects");

    return {
      success: true,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message:
          "شناسه پروژه یا کارمند معتبر نیست.",
      };
    }

    if (
      error instanceof Error &&
      error.message ===
        "PROJECT_MEMBER_NOT_FOUND"
    ) {
      return {
        success: false,
        message:
          "عضویت موردنظر پیدا نشد.",
      };
    }

    if (
      error instanceof Error &&
      error.message ===
        "PROJECT_MEMBER_HAS_TASKS"
    ) {
      return {
        success: false,
        message:
          "این کارمند Task فعال در پروژه دارد و تا تعیین تکلیف Taskها نمی‌توان عضویت او را حذف کرد.",
      };
    }

    console.error(
      "removeProjectMemberAction failed:",
      error,
    );

    return {
      success: false,
      message:
        "حذف عضو از پروژه انجام نشد.",
    };
  }
}