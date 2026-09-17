"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function Checkbox({ className, ...props }: CheckboxPrimitive.CheckboxProps) {
  return <CheckboxPrimitive.Root className={cn("peer size-4 shrink-0 rounded-md border border-slate-400 bg-white ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-slate-900 data-[state=checked]:bg-slate-900 shadow-2xs transition-all", className)} {...props}><CheckboxPrimitive.Indicator className="flex items-center justify-center text-slate-50"><Check size={12} strokeWidth={3} /></CheckboxPrimitive.Indicator></CheckboxPrimitive.Root>;
}
