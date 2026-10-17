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

/**
 * اطلاعات موقعیت مکانی دریافت‌شده از مرورگر.
 *
 * این داده‌ها ورودی غیرقابل‌اعتماد هستند و در سمت سرور
 * اعتبارسنجی می‌شوند.
 */
const attendanceLocationSchema = z
  .object({
    latitude: z.number().finite().min(-90).max(90),
    longitude: z.number().finite().min(-180).max(180),
    accuracy: z.number().finite().min(0).max(100_000),
  })
  .strict();

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

/**
 * محاسبه فاصله دو مختصات جغرافیایی بر حسب متر.
 */
function calculateDistanceInMeters(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number,
): number {
  const earthRadiusMeters = 6_371_000;

  const toRadians = (degrees: number) =>
    (degrees * Math.PI) / 180;

  const latitudeDifference = toRadians(
    latitude2 - latitude1,
  );

  const longitudeDifference = toRadians(
    longitude2 - longitude1,
  );

  const firstLatitude = toRadians(latitude1);
  const secondLatitude = toRadians(latitude2);

  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDifference / 2) ** 2;

  const safeHaversine = Math.min(
    1,
    Math.max(0, haversine),
  );

  return (
    earthRadiusMeters *
    2 *
    Math.atan2(
      Math.sqrt(safeHaversine),
      Math.sqrt(1 - safeHaversine),
    )
  );
}

/**
 * بررسی موقعیت مکانی هنگام ثبت ورود.
 *
 * تنظیمات محیطی:
 * ATTENDANCE_GEOFENCE_ENABLED=true
 * ATTENDANCE_COMPANY_LATITUDE
 * ATTENDANCE_COMPANY_LONGITUDE
 * ATTENDANCE_GEOFENCE_RADIUS_METERS=100
 * ATTENDANCE_GEOFENCE_MAX_ACCURACY_METERS=100
 *
 * تا زمانی که قابلیت فعال نشده باشد، رفتار قبلی حفظ می‌شود.
 */
function validateAttendanceLocation(
  location: unknown,
): string | null {
  const isGeofenceEnabled =
    process.env.ATTENDANCE_GEOFENCE_ENABLED
      ?.trim()
      .toLowerCase() === "true";

  if (!isGeofenceEnabled) {
    return null;
  }

  const latitudeValue =
    process.env.ATTENDANCE_COMPANY_LATITUDE;

  const longitudeValue =
    process.env.ATTENDANCE_COMPANY_LONGITUDE;

  const radiusMeters = Number(
    process.env.ATTENDANCE_GEOFENCE_RADIUS_METERS ??
      "100",
  );

  const maxAccuracyMeters = Number(
    process.env.ATTENDANCE_GEOFENCE_MAX_ACCURACY_METERS ??
      "100",
  );

  if (
    !latitudeValue?.trim() ||
    !longitudeValue?.trim()
  ) {
    return "تنظیمات محدوده جغرافیایی شرکت کامل نیست. لطفاً موضوع را به مدیر سامانه اطلاع دهید.";
  }

  const companyLatitude = Number(latitudeValue);
  const companyLongitude = Number(longitudeValue);

  if (
    !Number.isFinite(companyLatitude) ||
    companyLatitude < -90 ||
    companyLatitude > 90 ||
    !Number.isFinite(companyLongitude) ||
    companyLongitude < -180 ||
    companyLongitude > 180 ||
    !Number.isFinite(radiusMeters) ||
    radiusMeters <= 0 ||
    radiusMeters > 100_000 ||
    !Number.isFinite(maxAccuracyMeters) ||
    maxAccuracyMeters <= 0 ||
    maxAccuracyMeters > 100_000
  ) {
    return "تنظیمات محدوده جغرافیایی شرکت معتبر نیست. لطفاً موضوع را به مدیر سامانه اطلاع دهید.";
  }

  const validation =
    attendanceLocationSchema.safeParse(location);

  if (!validation.success) {
    return "برای ثبت ورود، دریافت موقعیت مکانی معتبر ضروری است. دسترسی به موقعیت مکانی را فعال کنید و دوباره تلاش کنید.";
  }

  const {
    latitude,
    longitude,
    accuracy,
  } = validation.data;

  if (accuracy > maxAccuracyMeters) {
    return "دقت موقعیت مکانی کافی نیست. GPS را روشن کنید و دوباره تلاش کنید.";
  }

  const distance = calculateDistanceInMeters(
    companyLatitude,
    companyLongitude,
    latitude,
    longitude,
  );

  if (distance > radiusMeters) {
    return "شما در محدوده مجاز شرکت نیستید؛ ثبت ورود انجام نشد.";
  }

  return null;
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
  location?: unknown,
): Promise<HozorinoAttendanceActionResult> {
  // رفتار احراز هویت و redirect احتمالی حفظ می‌شود.
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

    // کنترل محدوده فقط برای ثبت ورود اجرا می‌شود.
    // کنترل در سمت سرور است و به رابط کاربری وابسته نیست.
    if (action === "checkIn") {
      const locationError =
        validateAttendanceLocation(location);

      if (locationError) {
        return {
          success: false,
          message: locationError,
        };
      }
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
 *
 * مختصات در ورودی اجباری نشده‌اند تا تا زمان فعال‌سازی
 * قابلیت، رفتار فعلی سیستم حفظ شود.
 */
export async function checkInHozorinoAction(
  location?: unknown,
): Promise<HozorinoAttendanceActionResult> {
  return runHozorinoAttendanceAction(
    "checkIn",
    location,
  );
}

/**
 * اکشن ثبت خروج نهایی از صفحه کارمند فرتاک.
 */
export async function checkOutHozorinoAction(): Promise<HozorinoAttendanceActionResult> {
  return runHozorinoAttendanceAction("checkOut");
}