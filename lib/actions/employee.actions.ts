"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import {
  createEmployee,
  deleteEmployee,
  getEmployeeById,
  toggleEmployeeStatus,
  updateEmployee,
} from "@/lib/services/employee.service";

import {
  createEmployeeSchema,
  updateEmployeeSchema,
} from "@/lib/validations/employee";

type EmployeeActionResult =
  | {
      success: true;
      employee: {
        id: string;
        name: string;
        email: string;
        role: "EMPLOYEE";
        isActive: boolean;
      };
    }
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

export async function createEmployeeAction(
  input: unknown,
): Promise<EmployeeActionResult> {
  try {
    const validated = createEmployeeSchema.parse(input);

    const employee = await createEmployee(validated);

    revalidatePath("/admin/employees");

    return {
      success: true,
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: "EMPLOYEE",
        isActive: employee.isActive,
      },
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: "اطلاعات واردشده معتبر نیست.",
        fieldErrors: error.flatten().fieldErrors,
      };
    }

    if (
      error instanceof Error &&
      error.message === "EMAIL_ALREADY_EXISTS"
    ) {
      return {
        success: false,
        message: "این ایمیل قبلاً در سیستم ثبت شده است.",
        fieldErrors: {
          email: ["این ایمیل قبلاً ثبت شده است."],
        },
      };
    }

    console.error("createEmployeeAction failed:", error);

    return {
      success: false,
      message: "خطایی هنگام ایجاد کارمند رخ داد.",
    };
  }
}

export async function updateEmployeeAction(
  employeeId: string,
  input: unknown,
): Promise<EmployeeActionResult> {
  try {
    const validated = updateEmployeeSchema.parse(input);

    const employee = await updateEmployee(
      employeeId,
      validated,
    );

    revalidatePath("/admin/employees");
    revalidatePath(`/admin/employees/${employeeId}/edit`);

    return {
      success: true,
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: "EMPLOYEE",
        isActive: employee.isActive,
      },
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: "اطلاعات واردشده معتبر نیست.",
        fieldErrors: error.flatten().fieldErrors,
      };
    }

    if (
      error instanceof Error &&
      error.message === "EMAIL_ALREADY_EXISTS"
    ) {
      return {
        success: false,
        message: "این ایمیل قبلاً در سیستم ثبت شده است.",
        fieldErrors: {
          email: ["این ایمیل قبلاً ثبت شده است."],
        },
      };
    }

    if (
      error instanceof Error &&
      error.message === "EMPLOYEE_NOT_FOUND"
    ) {
      return {
        success: false,
        message: "کارمند موردنظر پیدا نشد.",
      };
    }

    console.error("updateEmployeeAction failed:", error);

    return {
      success: false,
      message: "خطایی هنگام ویرایش کارمند رخ داد.",
    };
  }
}

export async function toggleEmployeeStatusAction(
  employeeId: string,
): Promise<EmployeeActionResult> {
  try {
    const employee = await toggleEmployeeStatus(
      employeeId,
    );

    revalidatePath("/admin/employees");
    revalidatePath(`/admin/employees/${employeeId}/edit`);

    return {
      success: true,
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: "EMPLOYEE",
        isActive: employee.isActive,
      },
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "EMPLOYEE_NOT_FOUND"
    ) {
      return {
        success: false,
        message: "کارمند موردنظر پیدا نشد.",
      };
    }

    console.error(
      "toggleEmployeeStatusAction failed:",
      error,
    );

    return {
      success: false,
      message: "تغییر وضعیت کارمند انجام نشد.",
    };
  }
}

export async function deleteEmployeeAction(
  employeeId: string,
): Promise<EmployeeActionResult> {
  try {
    await deleteEmployee(employeeId);

    revalidatePath("/admin/employees");

    return {
      success: true,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "EMPLOYEE_NOT_FOUND"
    ) {
      return {
        success: false,
        message: "کارمند موردنظر پیدا نشد.",
      };
    }

    if (
      error instanceof Error &&
      error.message === "EMPLOYEE_HAS_DEPENDENCIES"
    ) {
      return {
        success: false,
        message:
          "این کارمند دارای پروژه، Task یا اطلاعات مرتبط است و فعلاً قابل حذف نیست. حساب را غیرفعال کنید.",
      };
    }

    console.error("deleteEmployeeAction failed:", error);

    return {
      success: false,
      message: "حذف کارمند انجام نشد.",
    };
  }
}

export async function getEmployeeAction(
  employeeId: string,
) {
  return getEmployeeById(employeeId);
}