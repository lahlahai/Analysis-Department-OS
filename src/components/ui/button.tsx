import type { ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger";

const buttonVariants = cva("inline-flex items-center justify-center gap-2 rounded-md border font-mono text-[11px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40", {
  variants: {
    variant: {
      primary: "border-cyan-400/40 bg-cyan-400 px-3 text-slate-950 hover:bg-cyan-300",
      secondary: "border-white/10 bg-white/[0.07] text-slate-200 hover:border-white/20 hover:bg-white/[0.12]",
      outline: "border-white/15 bg-transparent text-slate-300 hover:bg-white/[0.07]",
      ghost: "border-transparent bg-transparent text-slate-400 hover:bg-white/[0.07] hover:text-slate-100",
      danger: "border-rose-400/30 bg-rose-400/10 text-rose-300 hover:bg-rose-400/20",
    },
    size: { sm: "h-7 px-2.5", md: "h-8 px-3", icon: "size-8" },
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
