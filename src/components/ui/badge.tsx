import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva("inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium", {
  variants: {
    variant: {
      default: "border-pink-200 bg-pink-50 text-pink-600",
      secondary: "border-slate-200 bg-slate-50 text-slate-600",
      outline: "border-slate-200 bg-white text-slate-600",
      success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
  },
  defaultVariants: { variant: "default" },
});

export function Badge({ className, variant, ...props }: HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
