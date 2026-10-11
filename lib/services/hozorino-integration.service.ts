import "server-only";

import { z } from "zod";

const HozorinoEmployeeSchema = z.object({
  id: z.string().min(1),
  username: z.string().min(1),
  firstName: z.string(),
  lastName: z.string(),
});

const HozorinoResponseSchema = z.discriminatedUnion(
  "success",
  [
    z.object({
      success: z.literal(true),
      employees: z.array(HozorinoEmployeeSchema),
    }),
    z.object({
      success: z.literal(false),
      message: z.string().optional(),
    }),
  ],
);

const HozorinoAttendanceSchema = z.object({
  workDate: z.string(),

  state: z.enum([
    "PRESENT",
    "WORKING",
    "ABSENT",
    "LEAVE",
    "HOLIDAY",
    "NON_WORKING",
    "FUTURE",
  ]),

  stateLabel: z.string(),

  isWorkingDay: z.boolean(),
  isHoliday: z.boolean(),
  isLeave: z.boolean(),
  isFuture: z.boolean(),

  scheduledStartMinutes: z.number(),
  scheduledEndMinutes: z.number(),
  scheduledMinutes: z.number(),

  checkIn: z.string().nullable(),
  checkOut: z.string().nullable(),

  workedMinutes: z.number(),
  temporaryExitMinutes: z.number(),

  lateMinutes: z.number(),
  earlyLeaveMinutes: z.number(),
  overtimeMinutes: z.number(),
  underworkMinutes: z.number(),
  balanceMinutes: z.number(),

  hasAttendance: z.boolean(),
  isComplete: z.boolean(),

  attendanceStatus: z
    .enum(["OPEN", "COMPLETED", "MANUAL"])
    .nullable(),

  note: z.string().nullable(),

  holiday: z
    .object({
      title: z.string(),
      description: z.string().nullable(),
    })
    .nullable(),

  leave: z
    .object({
      type: z.enum([
        "ANNUAL",
        "SICK",
        "UNPAID",
        "OTHER",
      ]),
      reason: z.string().nullable(),
    })
    .nullable(),

  temporaryExits: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["TEMPORARY", "MISSION"]),
      status: z.enum(["OPEN", "COMPLETED"]),
      startedAt: z.string(),
      endedAt: z.string().nullable(),
      reason: z.string().nullable(),
      note: z.string().nullable(),
    }),
  ),
});

const HozorinoAttendanceResponseSchema =
  z.discriminatedUnion("success", [
    z.object({
      success: z.literal(true),

      employee: z.object({
        id: z.string(),
        firstName: z.string(),
        lastName: z.string(),
      }),

      attendance: HozorinoAttendanceSchema,
    }),

    z.object({
      success: z.literal(false),
      message: z.string().optional(),
    }),
  ]);

const HozorinoAttendanceActionResponseSchema =
  z.discriminatedUnion("success", [
    z.object({
      success: z.literal(true),
      message: z.string().optional(),
    }),

    z.object({
      success: z.literal(false),
      message: z.string().optional(),
    }),
  ]);

export type HozorinoEmployee = z.infer<
  typeof HozorinoEmployeeSchema
>;

export type HozorinoAttendance = z.infer<
  typeof HozorinoAttendanceSchema
>;

export type HozorinoAttendanceResult = {
  employee: {
    id: string;
    firstName: string;
    lastName: string;
  };
  attendance: HozorinoAttendance;
};

export type HozorinoAttendanceAction =
  | "checkIn"
  | "checkOut";

export type HozorinoAttendanceActionResult = {
  success: boolean;
  message: string;
};

function getHozorinoApiConfig() {
  const baseUrl =
    process.env.HOZORINO_API_BASE_URL?.trim();

  const secret =
    process.env.HOZORINO_INTEGRATION_SECRET?.trim();

  if (!baseUrl) {
    throw new Error(
      "HOZORINO_API_BASE_URL_NOT_CONFIGURED",
    );
  }

  if (!secret || secret.length < 32) {
    throw new Error(
      "HOZORINO_INTEGRATION_SECRET_NOT_CONFIGURED",
    );
  }

  let parsedBaseUrl: URL;

  try {
    parsedBaseUrl = new URL(baseUrl);
  } catch {
    throw new Error(
      "HOZORINO_API_BASE_URL_INVALID",
    );
  }

  if (
    parsedBaseUrl.protocol !== "https:" &&
    !(
      parsedBaseUrl.protocol === "http:" &&
      ["localhost", "127.0.0.1", "::1"].includes(
        parsedBaseUrl.hostname,
      )
    )
  ) {
    throw new Error(
      "HOZORINO_API_BASE_URL_INVALID",
    );
  }

  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    secret,
  };
}

async function requestHozorino(
  path: string,
  options: {
    method?: "GET" | "POST";
    body?: Record<string, unknown>;
  } = {},
): Promise<unknown> {
  const {
    baseUrl,
    secret,
  } = getHozorinoApiConfig();

  const method = options.method ?? "GET";

  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${secret}`,
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;

  try {
    response = await fetch(
      `${baseUrl}${path}`,
      {
        method,
        headers,

        ...(options.body
          ? {
              body: JSON.stringify(options.body),
            }
          : {}),

        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      },
    );
  } catch {
    throw new Error(
      "HOZORINO_API_CONNECTION_FAILED",
    );
  }

  if (
    response.status === 401 ||
    response.status === 403
  ) {
    throw new Error(
      "HOZORINO_INTEGRATION_UNAUTHORIZED",
    );
  }

  if (response.status === 404) {
    throw new Error(
      "HOZORINO_EMPLOYEE_NOT_FOUND_OR_INACTIVE",
    );
  }

  if (!response.ok) {
    throw new Error(
      "HOZORINO_API_REQUEST_FAILED",
    );
  }

  try {
    return await response.json();
  } catch {
    throw new Error(
      "HOZORINO_API_INVALID_RESPONSE",
    );
  }
}

export async function getHozorinoEmployees(): Promise<
  HozorinoEmployee[]
> {
  const payload = await requestHozorino(
    "/api/integrations/sepehrino/employees",
  );

  const result =
    HozorinoResponseSchema.safeParse(payload);

  if (!result.success) {
    throw new Error(
      "HOZORINO_API_INVALID_RESPONSE",
    );
  }

  if (!result.data.success) {
    throw new Error(
      "HOZORINO_API_REJECTED",
    );
  }

  return result.data.employees;
}

export async function getHozorinoAttendance(
  userId: string,
): Promise<HozorinoAttendanceResult> {
  const normalizedUserId = userId.trim();

  if (
    !normalizedUserId ||
    normalizedUserId.length > 100
  ) {
    throw new Error(
      "HOZORINO_EMPLOYEE_ID_INVALID",
    );
  }

  const payload = await requestHozorino(
    `/api/integrations/sepehrino/attendance?userId=${encodeURIComponent(normalizedUserId)}`,
  );

  const result =
    HozorinoAttendanceResponseSchema.safeParse(
      payload,
    );

  if (!result.success) {
    throw new Error(
      "HOZORINO_API_INVALID_RESPONSE",
    );
  }

  if (!result.data.success) {
    throw new Error(
      "HOZORINO_API_REJECTED",
    );
  }

  if (
    result.data.employee.id !== normalizedUserId
  ) {
    throw new Error(
      "HOZORINO_API_EMPLOYEE_MISMATCH",
    );
  }

  return {
    employee: result.data.employee,
    attendance: result.data.attendance,
  };
}

/**
 * درخواست ثبت ورود یا خروج نهایی در حضورینو.
 *
 * این تابع فقط برای استفاده در سمت سرور است.
 * شناسه ارسالی باید در اکشن سمت سرور فرتاک از
 * ارتباط معتبر حساب کارمند استخراج شده باشد،
 * نه مستقیماً از ورودی مرورگر.
 */
export async function performHozorinoAttendanceAction(
  userId: string,
  action: HozorinoAttendanceAction,
): Promise<HozorinoAttendanceActionResult> {
  const normalizedUserId = userId.trim();

  if (
    !normalizedUserId ||
    normalizedUserId.length > 100
  ) {
    throw new Error(
      "HOZORINO_EMPLOYEE_ID_INVALID",
    );
  }

  if (
    action !== "checkIn" &&
    action !== "checkOut"
  ) {
    throw new Error(
      "HOZORINO_ATTENDANCE_ACTION_INVALID",
    );
  }

  const payload = await requestHozorino(
    "/api/integrations/sepehrino/attendance",
    {
      method: "POST",
      body: {
        userId: normalizedUserId,
        action,
      },
    },
  );

  const result =
    HozorinoAttendanceActionResponseSchema.safeParse(
      payload,
    );

  if (!result.success) {
    throw new Error(
      "HOZORINO_API_INVALID_RESPONSE",
    );
  }

  if (!result.data.success) {
    return {
      success: false,
      message:
        result.data.message ??
        "عملیات حضور و غیاب انجام نشد.",
    };
  }

  return {
    success: true,
    message:
      result.data.message ??
      (
        action === "checkIn"
          ? "ورود شما با موفقیت ثبت شد."
          : "خروج شما با موفقیت ثبت شد."
      ),
  };
}