"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({ className, children, ...props }: SelectPrimitive.SelectTriggerProps) {
  return <SelectPrimitive.Trigger className={cn("flex h-8 w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-2.5 font-mono text-[11px] text-slate-800 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100", className)} {...props}>{children}<SelectPrimitive.Icon><ChevronDown size={13} className="text-slate-400" /></SelectPrimitive.Icon></SelectPrimitive.Trigger>;
}

export function SelectContent({ className, children, ...props }: SelectPrimitive.SelectContentProps) {
  return <SelectPrimitive.Portal><SelectPrimitive.Content className={cn("z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white p-1 text-slate-800 shadow-lg", className)} position="popper" {...props}><SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport></SelectPrimitive.Content></SelectPrimitive.Portal>;
}

export function SelectItem({ className, children, ...props }: SelectPrimitive.SelectItemProps) {
  return <SelectPrimitive.Item className={cn("relative flex w-full cursor-default select-none items-center rounded px-2 py-1.5 font-mono text-[11px] outline-none focus:bg-pink-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} {...props}><SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText><SelectPrimitive.ItemIndicator className="absolute left-2"><Check size={13} className="text-pink-500" /></SelectPrimitive.ItemIndicator></SelectPrimitive.Item>;
}
