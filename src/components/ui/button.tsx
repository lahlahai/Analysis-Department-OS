import type { ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger";

const buttonVariants = cva("inline-flex items-center justify-center gap-2 rounded-lg border font-sans text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100", {
  variants: {
    variant: {
      primary: "border-slate-950 bg-slate-900 px-3 text-slate-50 shadow-sm hover:bg-slate-800 hover:border-slate-900",
      secondary: "border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200/80 hover:border-slate-400",
      outline: "border-slate-300 bg-white text-slate-900 shadow-2xs hover:bg-slate-100 hover:border-slate-400 hover:text-slate-950",
      ghost: "border-transparent bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900",
      danger: "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-400",
    },
    size: { sm: "h-7 px-2.5 text-[11px]", md: "h-8 px-3", icon: "size-8 shrink-0" },
  },
  defaultVariants: { variant: "secondary", size: "md" },
});

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
