"use server";

import { revalidatePath } from "next/cache";
import { ZodError, z } from "zod";

import {
  requireAdmin,
  requireEmployee,
} from "@/lib/auth/guards";

import {
  createEmployee,
  deleteEmployee,
  getEmployeeById,
  toggleEmployeeStatus,
  updateEmployee,
  updateEmployeeHozorinoLink,
} from "@/lib/services/employee.service";
import { prisma } from "@/lib/db/prisma";
import {
  getHozorinoEmployees,
  performHozorinoAttendanceAction,
} from "@/lib/services/hozorino-integration.service";

import type {
  HozorinoAttendanceAction,
  HozorinoEmployee,
} from "@/lib/services/hozorino-integration.service";

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
      fieldErrors?: Record<
        string,
        string[] | undefined
      >;
    };

type HozorinoEmployeesActionResult =
  | {
      success: true;
      employees: HozorinoEmployee[];
    }
  | {
      success: false;
      message: string;
    };

type HozorinoLinkActionResult =
  | {
      success: true;
      employee: {
        id: string;
        name: string;
        email: string;
        role: "EMPLOYEE";
        isActive: boolean;
        hozorinoUserId: string | null;
      };
    }
  | {
      success: false;
      message: string;
    };

type HozorinoAttendanceActionResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      message: string;
    };

const hozorinoLinkSchema = z.object({
  employeeId: z.string().uuid(),

  hozorinoUserId: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .nullable(),
});

function getHozorinoErrorMessage(
  error: unknown,
): string {
  if (!(error instanceof Error)) {
    return "خطایی هنگام ارتباط با حضورینو رخ داد.";
  }

  switch (error.message) {
    case "HOZORINO_API_BASE_URL_NOT_CONFIGURED":
    case "HOZORINO_INTEGRATION_SECRET_NOT_CONFIGURED":
      return "تنظیمات ارتباط با حضورینو کامل نیست.";

    case "HOZORINO_API_BASE_URL_INVALID":
      return "آدرس API حضورینو معتبر نیست.";

    case "HOZORINO_API_CONNECTION_FAILED":
      return "ارتباط با حضورینو برقرار نشد. وضعیت سرور و آدرس API را بررسی کنید.";

    case "HOZORINO_INTEGRATION_UNAUTHORIZED":
      return "احراز هویت ارتباط با حضورینو ناموفق بود.";

    case "HOZORINO_API_INVALID_RESPONSE":
      return "پاسخ دریافتی از حضورینو معتبر نیست.";

    case "HOZORINO_API_REQUEST_FAILED":
    case "HOZORINO_API_REJECTED":
      return "درخواست به حضورینو انجام نشد.";

    case "HOZORINO_EMPLOYEE_NOT_FOUND_OR_INACTIVE":
      return "حساب انتخاب‌شده در حضورینو پیدا نشد یا غیرفعال است.";

    case "HOZORINO_ACCOUNT_ALREADY_LINKED":
      return "این حساب حضورینو قبلاً به کارمند دیگری متصل شده است.";

    case "HOZORINO_EMPLOYEE_ID_INVALID":
      return "حساب انتخاب‌شده در حضورینو معتبر نیست.";

    case "HOZORINO_API_EMPLOYEE_MISMATCH":
      return "شناسه حساب دریافت‌شده از حضورینو با حساب درخواستی مطابقت ندارد.";

    case "HOZORINO_ATTENDANCE_ACTION_INVALID":
      return "نوع عملیات حضور و غیاب معتبر نیست.";

    case "EMPLOYEE_NOT_FOUND":
      return "کارمند موردنظر در فرتاک پیدا نشد.";

    default:
      return "خطایی هنگام ارتباط با حضورینو رخ داد.";
  }
}

export async function createEmployeeAction(
  input: unknown,
): Promise<EmployeeActionResult> {
  try {
    const validated =
      createEmployeeSchema.parse(input);

    const employee =
      await createEmployee(validated);

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
        fieldErrors:
          error.flatten().fieldErrors,
      };
    }

    if (
      error instanceof Error &&
      error.message === "EMAIL_ALREADY_EXISTS"
    ) {
      return {
        success: false,
        message:
          "این ایمیل قبلاً در سیستم ثبت شده است.",
        fieldErrors: {
          email: [
            "این ایمیل قبلاً ثبت شده است.",
          ],
        },
      };
    }

    console.error(
      "createEmployeeAction failed:",
      error,
    );

    return {
      success: false,
      message:
        "خطایی هنگام ایجاد کارمند رخ داد.",
    };
  }
}

export async function updateEmployeeAction(
  employeeId: string,
  input: unknown,
): Promise<EmployeeActionResult> {
  try {
    const validated =
      updateEmployeeSchema.parse(input);

    const employee =
      await updateEmployee(
        employeeId,
        validated,
      );

    revalidatePath("/admin/employees");
    revalidatePath(
      `/admin/employees/${employeeId}/edit`,
    );

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
        fieldErrors:
          error.flatten().fieldErrors,
      };
    }

    if (
      error instanceof Error &&
      error.message === "EMAIL_ALREADY_EXISTS"
    ) {
      return {
        success: false,
        message:
          "این ایمیل قبلاً در سیستم ثبت شده است.",
        fieldErrors: {
          email: [
            "این ایمیل قبلاً ثبت شده است.",
          ],
        },
      };
    }

    if (
      error instanceof Error &&
      error.message === "EMPLOYEE_NOT_FOUND"
    ) {
      return {
        success: false,
        message:
          "کارمند موردنظر پیدا نشد.",
      };
    }

    console.error(
      "updateEmployeeAction failed:",
      error,
    );

    return {
      success: false,
      message:
        "خطایی هنگام ویرایش کارمند رخ داد.",
    };
  }
}

export async function toggleEmployeeStatusAction(
  employeeId: string,
): Promise<EmployeeActionResult> {
  try {
    const employee =
      await toggleEmployeeStatus(
        employeeId,
      );

    revalidatePath("/admin/employees");
    revalidatePath(
      `/admin/employees/${employeeId}/edit`,
    );

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
        message:
          "کارمند موردنظر پیدا نشد.",
      };
    }

    console.error(
      "toggleEmployeeStatusAction failed:",
      error,
    );

    return {
      success: false,
      message:
        "تغییر وضعیت کارمند انجام نشد.",
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
        message:
          "کارمند موردنظر پیدا نشد.",
      };
    }

    if (
      error instanceof Error &&
      error.message ===
        "EMPLOYEE_HAS_DEPENDENCIES"
    ) {
      return {
        success: false,
        message:
          "این کارمند دارای پروژه، تسک یا اطلاعات مرتبط است و فعلاً قابل حذف نیست. حساب را غیرفعال کنید.",
      };
    }

    console.error(
      "deleteEmployeeAction failed:",
      error,
    );

    return {
      success: false,
      message:
        "حذف کارمند انجام نشد.",
    };
  }
}

export async function getEmployeeAction(
  employeeId: string,
) {
  return getEmployeeById(employeeId);
}

export async function getHozorinoEmployeesAction(): Promise<
  HozorinoEmployeesActionResult
> {
  await requireAdmin();

  try {
    const employees =
      await getHozorinoEmployees();

    return {
      success: true,
      employees,
    };
  } catch (error) {
    console.error(
      "getHozorinoEmployeesAction failed:",
      error,
    );

    return {
      success: false,
      message:
        getHozorinoErrorMessage(error),
    };
  }
}

export async function updateEmployeeHozorinoLinkAction(
  employeeId: unknown,
  hozorinoUserId: unknown,
): Promise<HozorinoLinkActionResult> {
  await requireAdmin();

  const validation =
    hozorinoLinkSchema.safeParse({
      employeeId,
      hozorinoUserId,
    });

  if (!validation.success) {
    return {
      success: false,
      message:
        "شناسه کارمند یا حساب حضورینو معتبر نیست.",
    };
  }

  try {
    const employee =
      await updateEmployeeHozorinoLink(
        validation.data.employeeId,
        validation.data.hozorinoUserId,
      );

    revalidatePath("/admin/employees");
    revalidatePath(
      `/admin/employees/${employee.id}/edit`,
    );
    revalidatePath(
      `/admin/employees/${employee.id}`,
    );

    return {
      success: true,
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: "EMPLOYEE",
        isActive: employee.isActive,
        hozorinoUserId:
          employee.hozorinoUserId,
      },
    };
  } catch (error) {
    console.error(
      "updateEmployeeHozorinoLinkAction failed:",
      error,
    );

    return {
      success: false,
      message:
        getHozorinoErrorMessage(error),
    };
  }
}

/**
 * اجرای عملیات حضور و غیاب برای کارمند واردشده به فرتاک.
 *
 * شناسه کارمند حضورینو از اتصال ذخیره‌شده در حساب
 * خود کارمند خوانده می‌شود و از ورودی مرورگر نمی‌آید.
 */
async function runHozorinoAttendanceAction(
  action: HozorinoAttendanceAction,
): Promise<HozorinoAttendanceActionResult> {
  // این بررسی خارج از try می‌ماند تا رفتار احراز هویت
  // و redirect احتمالی requireEmployee حفظ شود.
  const session = await requireEmployee();

  try {
const employee = await prisma.user.findFirst({
  where: {
    id: session.user.id,
    role: "EMPLOYEE",
    isActive: true,
  },
  select: {
    isActive: true,
    hozorinoUserId: true,
  },
});

if (!employee || !employee.isActive) {
  return {
    success: false,
    message:
      "حساب کاربری فعال در فرتاک پیدا نشد.",
  };
}

    const hozorinoUserId =
      employee.hozorinoUserId;

    if (!hozorinoUserId) {
      return {
        success: false,
        message:
          "حساب حضورینوی شما به فرتاک متصل نشده است. از مدیر سیستم بخواهید اتصال حساب را انجام دهد.",
      };
    }

    const result =
      await performHozorinoAttendanceAction(
        hozorinoUserId,
        action,
      );

    if (result.success) {
      revalidatePath("/employee/attendance");
      revalidatePath("/employee/dashboard");
    }

    return result;
  } catch (error) {
    console.error(
      "runHozorinoAttendanceAction failed:",
      error,
    );

    return {
      success: false,
      message:
        getHozorinoErrorMessage(error),
    };
  }
}

/**
 * اکشن ثبت ورود از صفحه کارمند فرتاک.
 */
export async function checkInHozorinoAction(): Promise<HozorinoAttendanceActionResult> {
  return runHozorinoAttendanceAction("checkIn");
}

/**
 * اکشن ثبت خروج نهایی از صفحه کارمند فرتاک.
 */
export async function checkOutHozorinoAction(): Promise<HozorinoAttendanceActionResult> {
  return runHozorinoAttendanceAction("checkOut");
}