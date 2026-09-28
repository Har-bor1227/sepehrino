"use client";

import { useState, useTransition } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  UserPlus,
} from "lucide-react";

import { createEmployeeAction } from "@/lib/actions/employee.actions";
import { createEmployeeSchema } from "@/lib/validations/employee";

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

type CreateEmployeeFormValues = z.input<
  typeof createEmployeeSchema
>;

export function CreateEmployeeForm() {
  const [isPending, startTransition] =
    useTransition();

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  const [serverError, setServerError] =
    useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateEmployeeFormValues>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      isActive: true,
    },
  });

  function onSubmit(
    values: CreateEmployeeFormValues,
  ) {
    setServerError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result =
        await createEmployeeAction(values);

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
              field === "password" ||
              field === "isActive"
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

      if (!("employee" in result)) {
        setServerError(
          "کارمند ایجاد شد اما پاسخ سرور کامل نبود.",
        );
        return;
      }

      reset({
        name: "",
        email: "",
        password: "",
        isActive: true,
      });

      setSuccessMessage(
        `کارمند «${result.employee.name}» با موفقیت ایجاد شد.`,
      );
    });
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-1">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/60 bg-slate-900 text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)]">
            <UserPlus className="size-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle>
                افزودن کارمند
              </CardTitle>

              <span className="glass-chip rounded-full px-2 py-1 text-[10px] font-semibold text-slate-500">
                حساب جدید
              </span>
            </div>

            <CardDescription className="mt-1">
              حساب کاربری جدید برای یکی از اعضای تیم ایجاد کنید.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
        >
          {serverError ? (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200/60 bg-red-50/65 p-4 text-sm text-red-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span className="leading-6">
                {serverError}
              </span>
            </div>
          ) : null}

          {successMessage ? (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200/60 bg-emerald-50/65 p-4 text-sm text-emerald-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              <span className="leading-6">
                {successMessage}
              </span>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="employee-name">
              نام و نام خانوادگی
            </Label>

            <Input
              id="employee-name"
              placeholder="مثلاً علی رضایی"
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
            <Label htmlFor="employee-email">
              ایمیل
            </Label>

            <Input
              id="employee-email"
              type="email"
              inputMode="email"
              dir="ltr"
              placeholder="employee@example.com"
              autoComplete="email"
              {...register("email")}
            />

            {errors.email ? (
              <p className="text-xs font-medium text-destructive">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="employee-password">
              رمز عبور اولیه
            </Label>

            <Input
              id="employee-password"
              type="password"
              dir="ltr"
              placeholder="حداقل ۸ کاراکتر"
              autoComplete="new-password"
              {...register("password")}
            />

            {errors.password ? (
              <p className="text-xs font-medium text-destructive">
                {errors.password.message}
              </p>
            ) : (
              <p className="text-xs leading-6 text-slate-400">
                کارمند می‌تواند بعداً رمز عبور خود را تغییر دهد.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-white/55 bg-white/30 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="size-4" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  حساب فعال
                </p>

                <p className="mt-1 text-xs leading-6 text-slate-400">
                  کارمند جدید پس از ایجاد، فعال و آماده استفاده خواهد بود.
                </p>
              </div>
            </div>
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
                <UserPlus className="size-4" />
                ایجاد کارمند
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}