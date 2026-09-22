"use client";

import { Check, Clipboard, ClipboardCheck, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { ServicePermissionMatrix } from "@/domain/types";
import { cn } from "@/lib/cn";

interface PermissionMatrixViewProps {
  matrix: ServicePermissionMatrix;
  title?: string;
  subtitle?: string;
  itemLabel?: string;
  variant?: "grant" | "action";
}

const actionPermissionCodes = [
  ["C", "إنشاء"],
  ["R", "عرض / قراءة"],
  ["U", "تعديل"],
  ["D", "حذف"],
  ["S", "إرسال"],
  ["F", "إحالة"],
  ["RT", "إرجاع"],
  ["AP", "اعتماد"],
  ["RJ", "رفض"],
  ["VR", "تدقيق / مطابقة"],
  ["SG", "توقيع"],
  ["CM", "إضافة ملاحظات"],
  ["RC", "طلب استكمال"],
  ["RE", "إعادة دراسة"],
  ["DL", "تنزيل"],
  ["PR", "طباعة"],
  ["SR", "بحث"],
  ["FT", "تصفية"],
  ["NT", "إشعار"],
  ["AU", "الاطلاع على سجل التدقيق"],
  ["MG", "إدارة الصلاحيات"],
  ["AD", "إدارة بيانات النظام"],
] as const;

function splitMarkdownRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function parsePermissionMatrix(content: string) {
  const rows = content
    .replaceAll("\r\n", "\n")
    .split("\n")
    .filter((line) => line.trim().startsWith("|"))
    .map(splitMarkdownRow);

  const rawHeaders = rows[0] ?? [];
  const rawBody = rows.slice(1).filter((row) => !row.every((cell) => /^:?-{3,}:?$/.test(cell)));
  const hasNumberColumn = rawHeaders[0] === "#" && /الإجراء|الصلاحية/.test(rawHeaders[1] ?? "");
  const headers = hasNumberColumn ? rawHeaders.slice(1) : rawHeaders;
  const body = hasNumberColumn ? rawBody.map((row) => row.slice(1)) : rawBody;
  return { headers, body };
}

function PermissionName({ value }: { value: string }) {
  const match = /^(.*?)\s*\(`([^`]+)`\)\s*$/.exec(value);
  if (!match) return <span className="font-semibold text-slate-800">{value.replaceAll("`", "").replaceAll("**", "")}</span>;

  return (
    <div className="flex min-w-60 flex-col gap-1">
      <span className="font-semibold text-slate-900">{match[1].trim()}</span>
      <code className="w-fit rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-500" dir="ltr">
        {match[2]}
      </code>
    </div>
  );
}

function PermissionValue({ value, variant }: { value: string; variant: "grant" | "action" }) {
  const normalized = value.replaceAll("`", "").trim();
  const isDenied = normalized === "—" || normalized === "-" || normalized === "";
  const isConditional = normalized === "✓*";
  const isGranted = normalized === "✓" || isConditional;

  if (variant === "action") {
    const conditionalAction = normalized.endsWith("*");
    return (
      <span
        className={cn(
          "mx-auto inline-flex min-w-9 items-center justify-center rounded-md px-2 py-1 font-mono text-[11px] font-bold ring-1",
          isDenied && "bg-slate-100 text-slate-400 ring-slate-200",
          !isDenied && conditionalAction && "bg-amber-100 text-amber-800 ring-amber-200",
          !isDenied && !conditionalAction && "bg-sky-50 text-sky-700 ring-sky-200",
        )}
        title={isDenied ? "غير متاح" : conditionalAction ? "إجراء مشروط" : "إجراء متاح"}
        dir="ltr"
      >
        {isDenied ? "—" : normalized}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "mx-auto inline-flex min-w-8 items-center justify-center rounded-full px-2 py-1 text-xs font-bold",
        isConditional && "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
        isGranted && !isConditional && "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
        !isGranted && "bg-slate-100 text-slate-400 ring-1 ring-slate-200",
      )}
      title={isConditional ? "صلاحية مشروطة" : isGranted ? "مسموح" : "غير مسموح"}
    >
      {isGranted ? <><Check size={13} strokeWidth={3} />{isConditional && <sup>*</sup>}</> : "—"}
    </span>
  );
}

export function PermissionMatrixView({
  matrix,
  title = "مصفوفة الصلاحيات الكاملة",
  subtitle = "Full Permission Matrix",
  itemLabel = "صلاحية",
  variant = "grant",
}: PermissionMatrixViewProps) {
  const { headers, body } = parsePermissionMatrix(matrix.content);
  const roleCount = Math.max(0, headers.length - 1);
  const [copied, setCopied] = useState(false);

  async function copyTable() {
    const cleanCell = (value: string) => value.replaceAll("**", "").replaceAll("`", "").trim();
    const text = [headers, ...body].map((row) => row.map(cleanCell).join("\t")).join("\n");

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const helper = document.createElement("textarea");
      helper.value = text;
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.appendChild(helper);
      helper.select();
      document.execCommand("copy");
      helper.remove();
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className="flex h-full min-h-[320px] w-full flex-col overflow-hidden bg-slate-50" dir="rtl">
      <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-slate-900 text-[#e0c98d] shadow-sm">
              <ShieldCheck size={19} />
            </span>
            <div>
              <h2 className="font-sans text-sm font-bold text-slate-950 sm:text-base">{title}</h2>
              <p className="mt-0.5 text-[10px] text-slate-500 sm:text-xs" dir="ltr">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-semibold sm:text-xs">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600">{body.length} {itemLabel}</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600">{roleCount} دورًا</span>
            <button type="button" onClick={copyTable} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-slate-700 shadow-2xs transition hover:border-[#b49a63] hover:bg-[#fbf7ee] hover:text-[#8f733a]" title="نسخ الجدول إلى Excel" aria-label="نسخ الجدول إلى Excel">
              {copied ? <ClipboardCheck size={13} /> : <Clipboard size={13} />}
              <span>{copied ? "تم النسخ" : "نسخ الجدول"}</span>
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-2 text-[10px] text-slate-600 sm:text-xs">
          {variant === "grant" ? (
            <>
              <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-500" />مسموح</span>
              <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber-500" />مسموح بشروط *</span>
              <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-slate-300" />غير مسموح</span>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber-500" />تشير النجمة * إلى إجراء مشروط</span>
          )}
          <span className="mr-auto text-slate-400">مرّر أفقيًا لعرض جميع الأدوار</span>
        </div>
        {variant === "action" && (
          <div className="mt-3 border-t border-slate-100 pt-3">
            <h3 className="mb-2 text-[11px] font-bold text-slate-800 sm:text-xs">دليل رموز الصلاحيات</h3>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-8">
              {actionPermissionCodes.map(([code, label]) => (
                <div key={code} className="flex min-w-0 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5">
                  <code className="inline-flex min-w-8 shrink-0 justify-center rounded bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white" dir="ltr">{code}</code>
                  <span className="truncate text-[10px] font-medium text-slate-700" title={label}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-5">
        <div className="min-w-max overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="border-separate border-spacing-0 text-right text-xs" dir="rtl">
            <thead>
              <tr>
                {headers.map((header, columnIndex) => (
                  <th
                    key={`${header}-${columnIndex}`}
                    className={cn(
                      "sticky top-0 z-20 min-w-32 border-b border-l border-slate-200 bg-slate-900 px-3 py-3 text-center font-bold leading-5 text-white first:min-w-72 first:text-right",
                      columnIndex === 0 && "right-0 z-30",
                    )}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, rowIndex) => (
                <tr key={`${row[0]}-${rowIndex}`} className="group">
                  {headers.map((_, columnIndex) => (
                    <td
                      key={columnIndex}
                      className={cn(
                        "h-16 border-b border-l border-slate-200 bg-white px-3 py-2 text-center transition-colors group-hover:bg-[#fbf7ee]",
                        columnIndex === 0 && "sticky right-0 z-10 bg-white text-right shadow-[-6px_0_10px_-10px_rgba(15,23,42,0.5)] group-hover:bg-[#fbf7ee]",
                      )}
                    >
                      {columnIndex === 0
                        ? <PermissionName value={row[columnIndex] ?? ""} />
                        : <PermissionValue value={row[columnIndex] ?? "—"} variant={variant} />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
