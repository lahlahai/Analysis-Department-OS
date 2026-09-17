import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("flex h-8 w-full rounded-lg border border-slate-300 bg-white px-3 font-sans text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/15 disabled:cursor-not-allowed disabled:opacity-50 shadow-2xs", className)} {...props} />;
}
