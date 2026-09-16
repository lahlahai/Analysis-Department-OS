"use client";

/* The avatar URL comes from GitHub's trusted API response. */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { Clock3, ExternalLink, GitCommitHorizontal, RefreshCw, UserRound } from "lucide-react";

interface RepositoryCommit {
  sha: string;
  shortSha: string;
  url: string;
  message: string;
  user: string;
  userName: string;
  avatarUrl: string | null;
  userUrl: string | null;
  date: string | null;
}

type LoadState = "loading" | "ready" | "error";

function relativeTime(date: string | null) {
  if (!date) return "وقت غير معروف";
  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
  if (elapsedMinutes < 1) return "الآن";
  if (elapsedMinutes < 60) return `منذ ${elapsedMinutes} دقيقة`;
  if (elapsedMinutes < 120) return "منذ ساعة";
  if (elapsedMinutes < 1440) return `منذ ${Math.floor(elapsedMinutes / 60)} ساعات`;
  if (elapsedMinutes < 2880) return "أمس";
  return `منذ ${Math.floor(elapsedMinutes / 1440)} أيام`;
}

export function ChangeLogPanel() {
  const [commits, setCommits] = useState<RepositoryCommit[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function loadCommits() {
      try {
        const response = await fetch("/api/github/commits", { cache: "no-store" });
        const payload = await response.json() as { commits?: RepositoryCommit[]; error?: string };
        if (!response.ok) throw new Error(payload.error ?? "تعذر جلب سجل GitHub.");
        if (!cancelled) {
          setCommits(payload.commits ?? []);
          setLoadState("ready");
          setErrorMessage("");
        }
      } catch (error) {
        if (!cancelled) {
          setLoadState("error");
          setErrorMessage(error instanceof Error ? error.message : "تعذر جلب سجل GitHub.");
        }
      }
    }

    void loadCommits();
    const interval = window.setInterval(loadCommits, 60_000);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, [refreshKey]);

  return <section className={`change-log-panel shrink-0 border-t border-slate-200 bg-white ${isOpen ? "h-[148px]" : "h-9"}`} dir="rtl">
    <div className="flex h-9 items-center gap-2 border-b border-slate-200 bg-slate-50 px-4"><GitCommitHorizontal size={14} className="text-pink-600" /><span className="font-mono text-[10px] font-semibold text-slate-700">سجل تعديلات المستودع</span><span className="rounded bg-pink-100 px-1.5 py-0.5 text-[9px] text-pink-700">GitHub</span><span className="mr-auto flex items-center gap-1 text-[10px] text-slate-500">{loadState === "ready" ? <><span className="size-1.5 rounded-full bg-emerald-500" />تحديث تلقائي كل دقيقة</> : loadState === "loading" ? "جارٍ جلب التعديلات…" : <span className="text-rose-600">تعذر التحديث</span>}</span><button type="button" onClick={() => setRefreshKey((current) => current + 1)} className="mr-1 rounded p-1 text-slate-400 transition hover:bg-pink-50 hover:text-pink-600" title="تحديث سجل التعديلات"><RefreshCw size={12} className={loadState === "loading" ? "animate-spin" : ""} /></button><button type="button" onClick={() => setIsOpen((current) => !current)} className="mr-1 text-slate-400 transition hover:text-pink-600" title={isOpen ? "طي سجل التعديلات" : "فتح سجل التعديلات"}>{isOpen ? "⌄" : "⌃"}</button></div>
    {isOpen && <div className="h-[109px] overflow-auto px-4 py-1">{loadState === "loading" && <div className="flex h-full items-center justify-center gap-2 text-xs text-slate-500"><RefreshCw size={13} className="animate-spin text-pink-600" />جارٍ تحميل سجل GitHub…</div>}{loadState === "error" && <div className="flex h-full items-center justify-center gap-2 text-xs text-rose-600"><span>{errorMessage}</span><button type="button" onClick={() => setRefreshKey((current) => current + 1)} className="rounded border border-rose-200 px-2 py-1 text-[10px] hover:bg-rose-50">إعادة المحاولة</button></div>}{loadState === "ready" && commits.map((commit) => <div key={commit.sha} className="flex items-center gap-3 border-b border-slate-100 py-2 last:border-0"><div className="grid size-6 shrink-0 place-items-center overflow-hidden rounded-full bg-pink-50 text-pink-600">{commit.avatarUrl ? <img src={commit.avatarUrl} alt="" className="size-full" /> : <UserRound size={13} />}</div><div className="min-w-0 flex-1"><a href={commit.url} target="_blank" rel="noreferrer" className="block truncate text-[11px] font-medium text-slate-800 hover:text-pink-700" title={commit.message}>{commit.message}<ExternalLink size={10} className="mr-1 inline" /></a><div className="mt-0.5 flex items-center gap-2 text-[9px] text-slate-500"><a href={commit.userUrl ?? `https://github.com/${commit.user}`} target="_blank" rel="noreferrer" className="font-medium text-slate-700 hover:text-pink-700">{commit.userName}</a><span dir="ltr">@{commit.user}</span><span dir="ltr">{commit.shortSha}</span></div></div><div className="flex shrink-0 items-center gap-1 text-[10px] text-slate-500"><Clock3 size={12} />{relativeTime(commit.date)}</div></div>)}{loadState === "ready" && commits.length === 0 && <div className="flex h-full items-center justify-center text-xs text-slate-500">لا توجد تعديلات في هذا الفرع.</div>}</div>}
  </section>;
}
