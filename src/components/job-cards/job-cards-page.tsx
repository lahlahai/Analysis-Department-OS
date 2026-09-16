"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, BriefcaseBusiness, Database, Search } from "lucide-react";
import type { JobCardDefinition } from "@/domain/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface JobCardsPageProps {
  cards: JobCardDefinition[];
  domains: string[];
  activeDomain: string;
  onDomainChange: (domain: string) => void;
  onRequestAttach?: (card: JobCardDefinition) => void;
}

export function JobCardsPage({ cards, domains, activeDomain, onDomainChange, onRequestAttach }: JobCardsPageProps) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(cards[0]?.id ?? null);
  const filteredCards = useMemo(() => cards.filter((card) => (activeDomain === "الكل" || card.domain === activeDomain) && `${card.table} ${card.domain} ${card.description}`.toLowerCase().includes(query.toLowerCase().trim())), [activeDomain, cards, query]);
  const selectedCard = filteredCards.find((card) => card.id === selectedId) ?? filteredCards[0];

  return <div className="flex h-full min-h-0 flex-col bg-slate-50 text-slate-800" dir="rtl">
    <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4"><div><div className="flex items-center gap-2 text-lg font-semibold text-slate-900"><BriefcaseBusiness size={20} className="text-pink-600" />البطاقات الوظيفية</div><p className="mt-1 text-xs text-slate-500">كتالوج قابل لإعادة الاستخدام داخل دراسات المديريات.</p></div><Badge variant="secondary">{cards.length} بطاقة</Badge></header>
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-5 lg:flex-row">
      <section className="min-w-0 flex-1"><div className="mb-4 flex items-center gap-3"><div className="relative min-w-0 flex-1"><Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث باسم الجدول أو المجال…" className="pr-9" /></div><span className="shrink-0 text-xs text-slate-500">{filteredCards.length} نتيجة</span></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{filteredCards.map((card) => <button key={card.id} type="button" onClick={() => setSelectedId(card.id)} className={`rounded-xl border bg-white p-4 text-right shadow-sm transition hover:-translate-y-0.5 hover:border-pink-300 hover:shadow-md ${selectedCard?.id === card.id ? "border-pink-500 ring-1 ring-pink-100" : "border-slate-200"}`}><div className="mb-3 flex items-start justify-between gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-pink-50 text-pink-600"><Database size={17} /></span><Badge variant="secondary" className="max-w-[65%] truncate">{card.domain}</Badge></div><div className="file-name text-sm font-semibold text-slate-900" dir="ltr">{card.table}</div><p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{card.description}</p></button>)}</div>{filteredCards.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">لا توجد بطاقات مطابقة للبحث.</div>}</section>
      <aside className="h-fit w-full shrink-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:w-[330px]">{selectedCard ? <><div className="flex items-start justify-between gap-3"><div><div className="text-xs text-slate-500">المجال</div><div className="mt-1 text-sm font-medium text-slate-800">{selectedCard.domain}</div></div><span className="grid size-10 place-items-center rounded-lg bg-pink-50 text-pink-600"><Database size={18} /></span></div><div className="mt-6 text-xs text-slate-500">اسم الجدول</div><div className="file-name mt-1 text-lg font-semibold text-slate-950" dir="ltr">{selectedCard.table}</div><p className="mt-4 text-sm leading-7 text-slate-600">{selectedCard.description}</p><div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs leading-6 text-slate-500">ستتمكن لاحقًا من إرفاق هذه البطاقة بملف دراسة مديرية، مع الاحتفاظ بمرجعها وملاحظات الدراسة.</div><Button className="mt-5 w-full" variant="outline" onClick={() => onRequestAttach?.(selectedCard)}><ArrowUpRight size={15} />تجهيزها لدراسة مديرية</Button></> : <div className="py-8 text-center text-sm text-slate-500">اختر بطاقة لعرض تفاصيلها.</div>}</aside>
    </div>
  </div>;
}

export function JobCardsSidebar({ cards, domains, activeDomain, onDomainChange }: Pick<JobCardsPageProps, "cards" | "domains" | "activeDomain" | "onDomainChange">) {
  return <div className="min-h-0 flex-1 overflow-auto px-2 py-3"><div className="mb-2 px-2 text-[10px] font-semibold text-slate-500">مجالات البطاقات</div><button type="button" onClick={() => onDomainChange("الكل")} className={`mb-1 flex w-full items-center justify-between rounded-md px-3 py-2 text-right text-xs ${activeDomain === "الكل" ? "bg-pink-50 text-pink-700" : "text-slate-600 hover:bg-slate-100"}`}><span>كل المجالات</span><span>{cards.length}</span></button>{domains.filter((domain) => domain !== "الكل").map((domain) => <button type="button" key={domain} onClick={() => onDomainChange(domain)} className={`mb-1 flex w-full items-center justify-between rounded-md px-3 py-2 text-right text-xs ${activeDomain === domain ? "bg-pink-50 text-pink-700" : "text-slate-600 hover:bg-slate-100"}`}><span className="truncate">{domain}</span><span>{cards.filter((card) => card.domain === domain).length}</span></button>)}</div>;
}
