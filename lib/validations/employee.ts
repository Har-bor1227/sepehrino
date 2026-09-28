import { z } from "zod";

export const createEmployeeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "نام باید حداقل ۲ کاراکتر باشد.")
    .max(120, "نام نمی‌تواند بیشتر از ۱۲۰ کاراکتر باشد."),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("ایمیل معتبر نیست.")
    .max(320, "ایمیل بیش از حد طولانی است."),

  password: z
    .string()
    .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد.")
    .max(100, "رمز عبور بیش از حد طولانی است."),

  isActive: z.boolean().default(true),
});

export const updateEmployeeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "نام باید حداقل ۲ کاراکتر باشد.")
    .max(120, "نام نمی‌تواند بیشتر از ۱۲۰ کاراکتر باشد.")
    .optional(),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("ایمیل معتبر نیست.")
    .max(320, "ایمیل بیش از حد طولانی است.")
    .optional(),

  password: z
    .string()
    .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد.")
    .max(100, "رمز عبور بیش از حد طولانی است.")
    .optional(),

  isActive: z.boolean().optional(),
});

export type CreateEmployeeInput = z.infer<
  typeof createEmployeeSchema
>;

export type UpdateEmployeeInput = z.infer<
  typeof updateEmployeeSchema
>;