import { z } from "zod";

export const taskStatusSchema = z.enum([
  "TODO",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

export const taskPrioritySchema = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
]);

export const taskRecurrenceTypeSchema = z.enum([
  "NONE",
  "DAILY",
  "WEEKLY",
  "MONTHLY",
]);

const idSchema = z
  .string()
  .trim()
  .min(1, "شناسه معتبر نیست.");

const dateSchema = z.coerce.date({
  error: "تاریخ معتبر نیست.",
});

const recurrenceWeekdaysSchema = z
  .array(
    z
      .number()
      .int("روز هفته باید عدد صحیح باشد.")
      .min(1, "روز هفته نامعتبر است.")
      .max(7, "روز هفته نامعتبر است."),
  )
  .max(7, "حداکثر ۷ روز هفته قابل انتخاب است.")
  .refine(
    (days) => new Set(days).size === days.length,
    "روزهای هفته نمی‌توانند تکراری باشند.",
  );

const assigneeIdsSchema = z
  .array(idSchema)
  .min(1, "حداقل یک مسئول برای Task انتخاب کنید.")
  .refine(
    (ids) => new Set(ids).size === ids.length,
    "مسئول‌های Task نمی‌توانند تکراری باشند.",
  );

export const createTaskSchema = z
  .object({
    projectId: idSchema,

    subProjectId: idSchema,

    title: z
      .string()
      .trim()
      .min(
        2,
        "عنوان Task باید حداقل ۲ کاراکتر باشد.",
      )
      .max(
        255,
        "عنوان Task بیش از حد طولانی است.",
      ),

    description: z
      .string()
      .trim()
      .max(
        5000,
        "توضیحات بیش از حد طولانی است.",
      )
      .optional(),

    assigneeIds: assigneeIdsSchema,

    priority: taskPrioritySchema.default(
      "MEDIUM",
    ),

    deadline: dateSchema
      .nullable()
      .optional(),

    isRecurring: z
      .boolean()
      .default(false),

    recurrenceType:
      taskRecurrenceTypeSchema.default(
        "NONE",
      ),

    recurrenceStartDate: dateSchema
      .nullable()
      .optional(),

    recurrenceEndDate: dateSchema
      .nullable()
      .optional(),

    recurrenceWeekdays:
      recurrenceWeekdaysSchema.default([]),

    recurrenceDayOfMonth: z
      .number()
      .int("روز ماه باید عدد صحیح باشد.")
      .min(
        1,
        "روز ماه باید بین ۱ تا ۳۱ باشد.",
      )
      .max(
        31,
        "روز ماه باید بین ۱ تا ۳۱ باشد.",
      )
      .nullable()
      .optional(),

    recurrenceActive: z
      .boolean()
      .default(true),
  })
  .superRefine((data, ctx) => {
    if (!data.isRecurring) {
      if (data.recurrenceType !== "NONE") {
        ctx.addIssue({
          code: "custom",
          path: ["recurrenceType"],
          message:
            "برای Task معمولی نوع تکرار باید NONE باشد.",
        });
      }

      if (!data.deadline) {
        ctx.addIssue({
          code: "custom",
          path: ["deadline"],
          message:
            "برای Task معمولی وارد کردن Deadline الزامی است.",
        });
      }

      return;
    }

    if (data.recurrenceType === "NONE") {
      ctx.addIssue({
        code: "custom",
        path: ["recurrenceType"],
        message:
          "برای Task تکرارشونده نوع تکرار را انتخاب کنید.",
      });
    }

    if (!data.recurrenceStartDate) {
      ctx.addIssue({
        code: "custom",
        path: ["recurrenceStartDate"],
        message:
          "تاریخ شروع تکرار الزامی است.",
      });
    }

    if (
      data.recurrenceStartDate &&
      data.recurrenceEndDate &&
      data.recurrenceEndDate <
        data.recurrenceStartDate
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["recurrenceEndDate"],
        message:
          "تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد.",
      });
    }

    if (data.recurrenceType === "WEEKLY") {
      if (
        data.recurrenceWeekdays.length === 0
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["recurrenceWeekdays"],
          message:
            "برای تکرار هفتگی حداقل یک روز را انتخاب کنید.",
        });
      }
    }

    if (data.recurrenceType === "MONTHLY") {
      if (
        data.recurrenceDayOfMonth ===
          null ||
        data.recurrenceDayOfMonth ===
          undefined
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["recurrenceDayOfMonth"],
          message:
            "برای تکرار ماهانه روز ماه را انتخاب کنید.",
        });
      }
    }
  });

export const updateTaskSchema = z.object({
  subProjectId: idSchema.optional(),

  title: z
    .string()
    .trim()
    .min(
      2,
      "عنوان Task باید حداقل ۲ کاراکتر باشد.",
    )
    .max(
      255,
      "عنوان Task بیش از حد طولانی است.",
    )
    .optional(),

  description: z
    .string()
    .trim()
    .max(
      5000,
      "توضیحات بیش از حد طولانی است.",
    )
    .nullable()
    .optional(),

  assigneeIds: assigneeIdsSchema.optional(),

  priority: taskPrioritySchema.optional(),

  deadline: dateSchema
    .nullable()
    .optional(),

  isRecurring: z
    .boolean()
    .optional(),

  recurrenceType:
    taskRecurrenceTypeSchema.optional(),

  recurrenceStartDate: dateSchema
    .nullable()
    .optional(),

  recurrenceEndDate: dateSchema
    .nullable()
    .optional(),

  recurrenceWeekdays:
    recurrenceWeekdaysSchema.optional(),

  recurrenceDayOfMonth: z
    .number()
    .int("روز ماه باید عدد صحیح باشد.")
    .min(
      1,
      "روز ماه باید بین ۱ تا ۳۱ باشد.",
    )
    .max(
      31,
      "روز ماه باید بین ۱ تا ۳۱ باشد.",
    )
    .nullable()
    .optional(),

  recurrenceActive: z
    .boolean()
    .optional(),
});

export const updateTaskStatusSchema =
  z.object({
    taskId: idSchema,
    status: taskStatusSchema,
  });

export const setTaskOccurrenceStatusSchema =
  z.object({
    taskId: idSchema,

    occurrenceDate: dateSchema,

    completed: z.boolean(),
  });

export const createCommentSchema = z.object({
  taskId: idSchema,

  content: z
    .string()
    .trim()
    .min(
      1,
      "متن کامنت نمی‌تواند خالی باشد.",
    )
    .max(
      5000,
      "کامنت بیش از حد طولانی است.",
    ),
});

export type CreateTaskInput = z.infer<
  typeof createTaskSchema
>;

export type UpdateTaskInput = z.infer<
  typeof updateTaskSchema
>;

export type UpdateTaskStatusInput =
  z.infer<typeof updateTaskStatusSchema>;

export type SetTaskOccurrenceStatusInput =
  z.infer<
    typeof setTaskOccurrenceStatusSchema
  >;

export type CreateCommentInput = z.infer<
  typeof createCommentSchema
>;