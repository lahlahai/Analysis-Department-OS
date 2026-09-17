"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({ className, children, ...props }: SelectPrimitive.SelectTriggerProps) {
  return <SelectPrimitive.Trigger className={cn("flex h-8 w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 font-sans text-xs text-slate-900 outline-none transition-all focus:border-slate-900 focus:ring-2 focus:ring-slate-900/15 shadow-2xs", className)} {...props}>{children}<SelectPrimitive.Icon><ChevronDown size={14} className="text-slate-500" /></SelectPrimitive.Icon></SelectPrimitive.Trigger>;
}

export function SelectContent({ className, children, ...props }: SelectPrimitive.SelectContentProps) {
  return <SelectPrimitive.Portal><SelectPrimitive.Content className={cn("z-50 min-w-[8rem] overflow-hidden rounded-xl border border-slate-300 bg-white p-1.5 text-slate-900 shadow-xl border-slate-900/15", className)} position="popper" {...props}><SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport></SelectPrimitive.Content></SelectPrimitive.Portal>;
}

export function SelectItem({ className, children, ...props }: SelectPrimitive.SelectItemProps) {
  return <SelectPrimitive.Item className={cn("relative flex w-full cursor-default select-none items-center rounded-md px-2 py-1.5 font-sans text-xs outline-none focus:bg-slate-100 focus:text-slate-950 data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} {...props}><SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText><SelectPrimitive.ItemIndicator className="absolute left-2"><Check size={14} className="text-slate-900" /></SelectPrimitive.ItemIndicator></SelectPrimitive.Item>;
}
