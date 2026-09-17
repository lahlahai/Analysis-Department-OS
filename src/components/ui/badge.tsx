import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 font-sans text-[10px] font-semibold transition-colors", {
  variants: {
    variant: {
      default: "border-[#b49a63]/50 bg-[#f7eed9] text-[#7a6231]",
      secondary: "border-slate-300 bg-slate-100 text-slate-800",
      outline: "border-slate-900/30 bg-white text-slate-900",
      success: "border-emerald-300 bg-emerald-50 text-emerald-800",
      destructive: "border-rose-200 bg-rose-50 text-rose-700",
    },
  },
  defaultVariants: { variant: "default" },
});

export function Badge({ className, variant, ...props }: HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
