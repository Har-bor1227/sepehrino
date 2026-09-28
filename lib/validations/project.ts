import { z } from "zod";

export const projectStatusSchema = z.enum([
  "PLANNED",
  "IN_PROGRESS",
  "COMPLETED",
  "ARCHIVED",
]);

export const createProjectSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "نام پروژه باید حداقل ۲ کاراکتر باشد.")
      .max(200, "نام پروژه نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد."),

    description: z
      .string()
      .trim()
      .max(5000, "توضیحات بیش از حد طولانی است.")
      .optional(),

    startDate: z.coerce.date({
      error: "تاریخ شروع معتبر نیست.",
    }),

    deadline: z.coerce.date({
      error: "Deadline معتبر نیست.",
    }),
  })
  .refine(
    (data) => data.deadline >= data.startDate,
    {
      message: "Deadline نمی‌تواند قبل از تاریخ شروع باشد.",
      path: ["deadline"],
    },
  );

export const updateProjectSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "نام پروژه باید حداقل ۲ کاراکتر باشد.")
      .max(200, "نام پروژه نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد.")
      .optional(),

    description: z
      .string()
      .trim()
      .max(5000, "توضیحات بیش از حد طولانی است.")
      .nullable()
      .optional(),

    status: projectStatusSchema.optional(),

    startDate: z.coerce
      .date({
        error: "تاریخ شروع معتبر نیست.",
      })
      .optional(),

    deadline: z.coerce
      .date({
        error: "Deadline معتبر نیست.",
      })
      .optional(),
  })
  .refine(
    (data) =>
      data.startDate === undefined ||
      data.deadline === undefined ||
      data.deadline >= data.startDate,
    {
      message: "Deadline نمی‌تواند قبل از تاریخ شروع باشد.",
      path: ["deadline"],
    },
  );

export const projectMemberSchema = z.object({
  projectId: z
    .string()
    .trim()
    .min(1, "شناسه پروژه معتبر نیست."),

  employeeId: z
    .string()
    .trim()
    .min(1, "شناسه کارمند معتبر نیست."),
});

export type CreateProjectInput = z.infer<
  typeof createProjectSchema
>;

export type UpdateProjectInput = z.infer<
  typeof updateProjectSchema
>;

export type ProjectMemberInput = z.infer<
  typeof projectMemberSchema
>;