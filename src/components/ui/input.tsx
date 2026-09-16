import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("flex h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 font-mono text-[11px] text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-pink-400 focus:bg-white focus:ring-2 focus:ring-pink-100 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />;
}
