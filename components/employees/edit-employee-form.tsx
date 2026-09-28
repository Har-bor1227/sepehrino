"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Save,
} from "lucide-react";

import { updateEmployeeAction } from "@/lib/actions/employee.actions";
import { updateEmployeeSchema } from "@/lib/validations/employee";

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

type EditEmployeeFormValues = z.input<
  typeof updateEmployeeSchema
>;

type EditEmployeeFormProps = {
  employee: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
  };
};

export function EditEmployeeForm({
  employee,
}: EditEmployeeFormProps) {
  const router = useRouter();

  const [isPending, startTransition] =
    useTransition();

  const [serverError, setServerError] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<EditEmployeeFormValues>({
    resolver: zodResolver(
      updateEmployeeSchema,
    ),
    defaultValues: {
      name: employee.name,
      email: employee.email,
      password: "",
    },
  });

  function onSubmit(
    values: EditEmployeeFormValues,
  ) {
    setServerError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result =
        await updateEmployeeAction(
          employee.id,
          {
            ...values,
            ...(values.password === ""
              ? {
                  password: undefined,
                }
              : {}),
          },
        );

      if (!result.success) {
        setServerError(result.message);

        if (result.fieldErrors) {
          for (const [
            field,
            messages,
          ] of Object.entries(
            result.fieldErrors,
          )) {
            const message = messages?.[0];

            if (!message) {
              continue;
            }

            if (
              field === "name" ||
              field === "email" ||
              field === "password"
            ) {
              setError(field, {
                type: "server",
                message,
              });
            }
          }
        }

        return;
      }

      setSuccessMessage(
        "اطلاعات کارمند با موفقیت ذخیره شد.",
      );

      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader className="pb-1">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/60 bg-slate-900 text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)]">
            <Save className="size-5" />
          </div>

          <div className="min-w-0">
            <CardTitle>
              {employee.name}
            </CardTitle>

            <CardDescription className="mt-1">
              اطلاعات حساب، ایمیل و رمز عبور کارمند را مدیریت کنید.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          noValidate
        >
          {serverError ? (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200/60 bg-red-50/65 p-4 text-sm text-red-700">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />

              <span className="leading-6">
                {serverError}
              </span>
            </div>
          ) : null}

          {successMessage ? (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200/60 bg-emerald-50/65 p-4 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />

              <span className="leading-6">
                {successMessage}
              </span>
            </div>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-employee-name">
                نام و نام خانوادگی
              </Label>

              <Input
                id="edit-employee-name"
                autoComplete="name"
                {...register("name")}
              />

              {errors.name ? (
                <p className="text-xs font-medium text-destructive">
                  {errors.name.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-employee-email">
                ایمیل
              </Label>

              <Input
                id="edit-employee-email"
                type="email"
                inputMode="email"
                dir="ltr"
                autoComplete="email"
                {...register("email")}
              />

              {errors.email ? (
                <p className="text-xs font-medium text-destructive">
                  {errors.email.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-3xl border border-white/55 bg-white/24 p-5">
            <div className="mb-4">
              <p className="text-sm font-bold text-slate-800">
                امنیت حساب
              </p>

              <p className="mt-1 text-xs leading-6 text-slate-400">
                فقط زمانی رمز عبور را وارد کنید که قصد تغییر آن را دارید.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-employee-password">
                رمز عبور جدید
              </Label>

              <Input
                id="edit-employee-password"
                type="password"
                dir="ltr"
                placeholder="برای تغییر وارد کنید"
                autoComplete="new-password"
                {...register("password")}
              />

              {errors.password ? (
                <p className="text-xs font-medium text-destructive">
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            <p className="mt-3 text-xs leading-6 text-slate-400">
              خالی گذاشتن این فیلد، رمز عبور فعلی را حفظ می‌کند.
            </p>
          </div>

          <div className="flex justify-end">
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