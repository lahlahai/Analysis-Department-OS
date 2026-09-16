"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function Checkbox({ className, ...props }: CheckboxPrimitive.CheckboxProps) {
  return <CheckboxPrimitive.Root className={cn("peer size-4 shrink-0 rounded border border-slate-300 bg-white ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-pink-500 data-[state=checked]:bg-pink-500", className)} {...props}><CheckboxPrimitive.Indicator className="flex items-center justify-center text-white"><Check size={12} strokeWidth={3} /></CheckboxPrimitive.Indicator></CheckboxPrimitive.Root>;
}
