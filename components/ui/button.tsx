import { Button as ButtonPrimitive } from "@base-ui/react/button";
import {
  cva,
  type VariantProps,
} from "class-variance-authority";

import { cn } from "cn";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/15 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-slate-900/10 bg-slate-900 text-white shadow-[0_10px_24px_rgba(15,23,42,0.15)] hover:-translate-y-px hover:bg-slate-800 hover:shadow-[0_14px_30px_rgba(15,23,42,0.18)]",

        outline:
          "border-white/65 bg-white/45 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_6px_18px_rgba(15,23,42,0.05)] backdrop-blur-xl hover:-translate-y-px hover:border-white/85 hover:bg-white/65 hover:text-slate-900",

        secondary:
          "border-white/55 bg-slate-200/50 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl hover:bg-slate-200/75 aria-expanded:bg-slate-200/75",

        ghost:
          "bg-transparent text-slate-600 hover:bg-white/48 hover:text-slate-900 aria-expanded:bg-white/55",

        destructive:
          "border-red-200/50 bg-red-50/65 text-red-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl hover:bg-red-100/75 focus-visible:border-red-300/50 focus-visible:ring-red-300/20",

        link:
          "h-auto bg-transparent p-0 text-primary underline-offset-4 hover:underline",
      },

      size: {
        default:
          "h-10 gap-2 px-3.5 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",

        xs:
          "h-7 gap-1 rounded-lg px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",

        sm:
          "h-9 gap-1.5 rounded-xl px-3 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",

        lg:
          "h-11 gap-2 px-4.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",

        icon:
          "size-10",

        "icon-xs":
          "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3",

        "icon-sm":
          "size-9 rounded-xl",

        "icon-lg":
          "size-11",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(
        buttonVariants({
          variant,
          size,
          className,
        }),
      )}
      {...props}
    />
  );
}

export {
  Button,
  buttonVariants,
};