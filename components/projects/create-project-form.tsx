"use client";

import { useState, useTransition } from "react";

import {
  Controller,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  FolderPlus,
  Loader2,
} from "lucide-react";

import { createProjectAction } from "@/lib/actions/project.actions";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PersianDatePicker } from "@/components/ui/persian-date-picker";

const createProjectFormSchema =
  z
    .object({
      title: z
        .string()
        .trim()
        .min(
          2,
          "نام پروژه حداقل ۲ کاراکتر باشد.",
        )
        .max(
          200,
          "نام پروژه نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد.",
        ),

      description: z
        .string()
        .max(
          5000,
          "توضیحات نمی‌تواند بیشتر از ۵۰۰۰ کاراکتر باشد.",
        ),

      startDate: z
        .string()
        .min(
          1,
          "تاریخ شروع را انتخاب کنید.",
        ),

      deadline: z
        .string()
        .min(
          1,
          "Deadline را انتخاب کنید.",
        ),
    })
    .refine(
      (data) =>
        new Date(data.deadline) >=
        new Date(data.startDate),
      {
        message:
          "Deadline نمی‌تواند قبل از تاریخ شروع باشد.",
        path: [
          "deadline",
        ],
      },
    );

type FormValues = z.infer<
  typeof createProjectFormSchema
>;

export function CreateProjectForm() {
  const [isPending, startTransition] =
    useTransition();

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError: setFieldError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(
      createProjectFormSchema,
    ),
    defaultValues: {
      title: "",
      description: "",
      startDate: "",
      deadline: "",
    },
  });

  function onSubmit(
    values: FormValues,
  ) {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result =
        await createProjectAction(
          values,
        );

      if (!result.success) {
        setError(result.message);

        if (result.fieldErrors) {
          for (const [
            field,
            messages,
          ] of Object.entries(
            result.fieldErrors,
          )) {
            const message =
              messages?.[0];

            if (
              message &&
              (field ===
                "title" ||
                field ===
                  "description" ||
                field ===
                  "startDate" ||
                field ===
                  "deadline")
            ) {
              setFieldError(
                field,
                {
                  type: "server",
                  message,
                },
              );
            }
          }
        }

        return;
      }

      reset();

      setSuccess(
        `پروژه «${result.project.title}» با موفقیت ایجاد شد.`,
      );
    });
  }

  return (
    <Card className="relative z-[100] h-fit !overflow-visible">
      <CardHeader className="pb-1">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)]">
            <FolderPlus className="size-5" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>
                ایجاد پروژه
              </CardTitle>

              <span className="glass-chip rounded-full px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                پروژه جدید
              </span>
            </div>

            <CardDescription className="mt-1">
              یک فضای جدید برای مدیریت کارها و اعضای تیم ایجاد کنید.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        <form
          onSubmit={handleSubmit(
            onSubmit,
          )}
          className="space-y-5"
          noValidate
        >
          {error ? (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200/60 bg-red-50/65 p-4 text-sm text-red-700">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />

              <span className="leading-6">
                {error}
              </span>
            </div>
          ) : null}

          {success ? (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200/60 bg-emerald-50/65 p-4 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />

              <span className="leading-6">
                {success}
              </span>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="project-title">
              نام پروژه
            </Label>

            <Input
              id="project-title"
              placeholder="مثلاً طراحی وب‌سایت"
              {...register("title")}
            />

            {errors.title ? (
              <p className="text-xs font-medium text-destructive">
                {errors.title.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-description">
              توضیحات
            </Label>

            <textarea
              id="project-description"
              rows={4}
              placeholder="توضیحات پروژه..."
              className="glass-field min-h-24 w-full resize-y rounded-xl px-3.5 py-3 text-sm leading-7 text-slate-800 outline-none placeholder:text-slate-400"
              {...register(
                "description",
              )}
            />

            {errors.description ? (
              <p className="text-xs font-medium text-destructive">
                {errors.description.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="project-start-date">
                تاریخ شروع
              </Label>

              <Controller
                control={control}
                name="startDate"
                render={({
                  field,
                }) => (
                  <PersianDatePicker
                    id="project-start-date"
                    value={
                      field.value
                    }
                    onChange={
                      field.onChange
                    }
                    error={
                      !!errors.startDate
                    }
                    placeholder="انتخاب تاریخ شروع"
                  />
                )}
              />

              {errors.startDate ? (
                <p className="text-xs font-medium text-destructive">
                  {
                    errors.startDate
                      .message
                  }
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-deadline">
                Deadline
              </Label>

              <Controller
                control={control}
                name="deadline"
                render={({
                  field,
                }) => (
                  <PersianDatePicker
                    id="project-deadline"
                    value={
                      field.value
                    }
                    onChange={
                      field.onChange
                    }
                    error={
                      !!errors.deadline
                    }
                    placeholder="انتخاب Deadline"
                  />
                )}
              />

              {errors.deadline ? (
                <p className="text-xs font-medium text-destructive">
                  {
                    errors.deadline
                      .message
                  }
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-white/55 bg-white/24 p-4">
            <div className="glass-icon flex size-9 shrink-0 items-center justify-center rounded-xl">
              <CalendarDays className="size-4 text-slate-500" />
            </div>

            <p className="text-xs leading-6 text-slate-400">
              تاریخ‌ها در تقویم شمسی انتخاب می‌شوند و برای ثبت پروژه به‌صورت امن به مقدار تاریخ موردنیاز سیستم تبدیل می‌شوند.
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                در حال ایجاد...
              </>
            ) : (
              <>
                <FolderPlus className="size-4" />
                ایجاد پروژه
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}