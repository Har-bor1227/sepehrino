"use client";

import { useState, useTransition } from "react";

import {
  Controller,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useRouter } from "next/navigation";

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Save,
} from "lucide-react";

import { updateProjectAction } from "@/lib/actions/project.actions";

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

const editProjectFormSchema =
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
          "نام پروژه بیش از حد طولانی است.",
        ),

      description: z
        .string()
        .max(
          5000,
          "توضیحات بیش از حد طولانی است.",
        ),

      status: z.enum([
        "PLANNED",
        "IN_PROGRESS",
        "COMPLETED",
        "ARCHIVED",
      ]),

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
  typeof editProjectFormSchema
>;

type Props = {
  project: {
    id: string;
    title: string;
    description: string | null;
    status:
      | "PLANNED"
      | "IN_PROGRESS"
      | "COMPLETED"
      | "ARCHIVED";
    startDate: string;
    deadline: string;
  };
};

export function EditProjectForm({
  project,
}: Props) {
  const router = useRouter();

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
    setError: setFieldError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(
      editProjectFormSchema,
    ),
    defaultValues: {
      title: project.title,
      description:
        project.description ?? "",
      status: project.status,
      startDate:
        project.startDate,
      deadline:
        project.deadline,
    },
  });

  function onSubmit(
    values: FormValues,
  ) {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result =
        await updateProjectAction(
          project.id,
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
                  "status" ||
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

      setSuccess(
        "اطلاعات پروژه با موفقیت ذخیره شد.",
      );

      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader className="pb-1">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)]">
            <Save className="size-5" />
          </div>

          <div className="min-w-0">
            <CardTitle>
              {project.title}
            </CardTitle>

            <CardDescription className="mt-1">
              مشخصات، وضعیت و زمان‌بندی پروژه را ویرایش کنید.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        <form
          onSubmit={handleSubmit(
            onSubmit,
          )}
          className="space-y-6"
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
            <Label htmlFor="edit-project-title">
              نام پروژه
            </Label>

            <Input
              id="edit-project-title"
              {...register("title")}
            />

            {errors.title ? (
              <p className="text-xs font-medium text-destructive">
                {errors.title.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-project-description">
              توضیحات
            </Label>

            <textarea
              id="edit-project-description"
              rows={5}
              className="glass-field min-h-28 w-full resize-y rounded-xl px-3.5 py-3 text-sm leading-7 text-slate-800 outline-none placeholder:text-slate-400"
              {...register(
                "description",
              )}
            />

            {errors.description ? (
              <p className="text-xs font-medium text-destructive">
                {
                  errors.description
                    .message
                }
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-project-status">
              وضعیت پروژه
            </Label>

            <select
              id="edit-project-status"
              className="glass-field h-11 w-full rounded-xl px-3.5 text-sm font-medium text-slate-700 outline-none"
              {...register("status")}
            >
              <option value="PLANNED">
                برنامه‌ریزی‌شده
              </option>

              <option value="IN_PROGRESS">
                در حال انجام
              </option>

              <option value="COMPLETED">
                تکمیل‌شده
              </option>

              <option value="ARCHIVED">
                آرشیو
              </option>
            </select>

            {errors.status ? (
              <p className="text-xs font-medium text-destructive">
                {errors.status.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-project-start">
                تاریخ شروع
              </Label>

              <Controller
                control={control}
                name="startDate"
                render={({
                  field,
                }) => (
                  <PersianDatePicker
                    id="edit-project-start"
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
              <Label htmlFor="edit-project-deadline">
                Deadline
              </Label>

              <Controller
                control={control}
                name="deadline"
                render={({
                  field,
                }) => (
                  <PersianDatePicker
                    id="edit-project-deadline"
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

          <div className="flex justify-end border-t border-white/40 pt-5">
            <Button
              type="submit"
              size="lg"
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  ذخیره تغییرات
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}