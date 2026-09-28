import * as React from "react";

import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "cn";

function Input({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "glass-field h-11 w-full min-w-0 rounded-xl px-3.5 py-1.5 text-base text-slate-900 placeholder:text-slate-400 outline-none md:text-sm file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-700 aria-invalid:border-red-300 aria-invalid:ring-4 aria-invalid:ring-red-500/10 dark:text-slate-100 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Input };