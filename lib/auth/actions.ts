"use server";

import { z } from "zod";

import { authenticateUser } from "@/lib/auth/login";
import {
  createSession,
  deleteSession,
} from "@/lib/auth/session";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("ایمیل واردشده معتبر نیست."),

  password: z
    .string()
    .min(1, "رمز عبور را وارد کنید."),
});

export type LoginActionResult =
  | {
      success: true;
      role: "ADMIN" | "EMPLOYEE";
    }
  | {
      success: false;
      message: string;
    };

export async function loginAction(
  formData: FormData,
): Promise<LoginActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "اطلاعات ورود نامعتبر است.",
    };
  }

  const result = await authenticateUser(
    parsed.data.email,
    parsed.data.password,
  );

  if (!result.success) {
    if (result.reason === "ACCOUNT_DISABLED") {
      return {
        success: false,
        message: "حساب کاربری شما غیرفعال شده است.",
      };
    }

    return {
      success: false,
      message: "ایمیل یا رمز عبور اشتباه است.",
    };
  }

  await createSession(result.user.id);

  return {
    success: true,
    role: result.user.role,
  };
}

export async function logoutAction() {
  await deleteSession();
}