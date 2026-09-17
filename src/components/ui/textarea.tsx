import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("flex min-h-16 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 font-sans text-xs leading-relaxed text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/15 shadow-2xs", className)} {...props} />;
}
