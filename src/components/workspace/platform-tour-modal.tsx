"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  GitBranch,
  Layers3,
  Table2,
  FileCode2,
  Sparkles,
  Search,
  Check,
  WandSparkles,
  CircleDot,
  FileJson,
  Building2,
  ExternalLink,
  Keyboard,
  Workflow,
  Database,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export interface TourStep {
  id: string;
  title: string;
  badge: string;
  description: string;
  icon: typeof Compass;
  accentColor: string;
  bullets: Array<{ title: string; desc: string }>;
  tip?: string;
  actionHint?: string;
  targetView?: "files" | "citizen-services";
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "مرحباً بك في منصة قسم فريق تحليل المشاريع",
    badge: "نظرة عامة والهدف",
    description:
        "المنصة المتكاملة لتوحيد جهود فريق تحليل المشاريع وهندسة المتطلبات والمبرمجين في مكان واحد منظم، يربط التوثيق وقواميس البيانات ومستودع GitHub مباشرة.",
    icon: Layers3,
    accentColor: "emerald",
    bullets: [
      {
        title: "مرجع مركزي موحد",
        desc: "الاستغناء عن تشتت الملفات في المحادثات والأجهزة الشخصية وجمعها في مساحة منظمة وموثوقة.",
      },
      {
        title: "هندسة متطلبات ثنائية المنظور",
        desc: "صياغة فنية وتشغيلية تجيب عن تساؤلات الإدارة والمهندسين بدقة ووضوح تام.",
      },
      {
        title: "مزامنة مباشرة مع GitHub",
        desc: "كل تعديل يُحفظ في ملفات JSON قياسية ويتم رفعه بضغطة زر لمستودع المشروع.",
      },
    ],
    tip: "يمكنك التنقل بين خطوات الجولة باستخدام الأسهم أو لوحة المفاتيح في أي وقت.",
  },
  {
    id: "header-tools",
    title: "شريط الأدوات والتحكم العلوي (Header Bar)",
    badge: "الإجراءات والمزامنة",
    description:
      "يوفر الشريط العلوي وصولاً سريعاً لعمليات الحفظ وفحص الأخطاء التشخيصية.",
    icon: WandSparkles,
    accentColor: "amber",
    bullets: [
      {
        title: "زر الحفظ الذكي (Save)",
        desc: "يعرض عداداً لحظياً للملفات المعدلة ويقوم بحفظها محلياً ورفعها لمستودع GitHub.",
      },
      {
        title: "فحص التحقق (Validation & Diagnostics)",
        desc: "يقوم باختبار صحة بنية البيانات، العلاقات، وروابط النماذج المعمارية ويكتشف التعارضات.",
      },
    ],
    tip: "لاحظ مؤشر الفرع والمسار في أعلى الصفحة لمعرفة الملف والمستودع النشط حالياً.",
  },
  {
    id: "explorer-section",
    title: "مستكشف الملفات والمجلدات (Project File Explorer)",
    badge: "الشجرة الهيكلية",
    description:
      "الشريط الجانبي يتيح لك تصفح وتنظيم جميع ملفات المشروع وطلبات الخدمات وقواميس البيانات بكفاءة وسرعة.",
    icon: Search,
    accentColor: "blue",
    bullets: [
      {
        title: "هيكلية مجلدات نظيفة",
        desc: "تصفح مجلدات `.software` و `docs` و `قسم التنظيم والتخطيط العمراني` بدون تشعبات معقدة.",
      },
      {
        title: "إنشاء وتعديل فوري",
        desc: "إمكانية إنشاء ملفات ومجلدات جديدة وإعادة تسميتها أو حذفها بضغطة زر.",
      },
      {
        title: "الروابط السريعة (Quick Links)",
        desc: "روابط سريعة مثبتة لـ Google Drive و GitHub و OneDrive لربط مساحة العمل بمصادر الفريق.",
      },
    ],
    tip: "يمكنك طي مستكشف الملفات أو شريط الروابط الجانبي في أي وقت لتوسيع مساحة العمل.",
  },
  {
    id: "citizen-services",
    title: "ملفات طلبات الخدمات (قسم التنظيم والتخطيط العمراني)",
    badge: "الخدمات البلدية والتوصيف",
    description:
      "كل خدمة بلدية وعمرانية لها ملف JSON مستقل ومنظم في مجلد قسم التنظيم والتخطيط العمراني، يحتوي على كافة بيانات التوصيف وقاموس الحقول والجدول.",
    icon: Building2,
    accentColor: "emerald",
    bullets: [
      {
        title: "8 طلبات خدمات قياسية",
        desc: "تشمل مخطط الموقع، فرز العقارات، ترخيص البناء، رخصة الهدم، تصريح الإشغال، وغيرها.",
      },
      {
        title: "إجابة شاملة لجميع التساؤلات",
        desc: "تفاصيل المهلة (1-3 أيام)، الرسوم (9700 ل.س)، الإطار القانوني، مسار المعالجة، وشروط الرفض.",
      },
      {
        title: "تخزين ومزامنة نقية",
        desc: "البيانات تُخزن في ملف JSON قياسي بدون تعقيد، وتُرفع مباشرة إلى GitHub.",
      },
    ],
    tip: "انقر على أي ملف خدمة في المستكشف لفتح التوصيف المنظم وجدول البيانات فوراً.",
  },
  {
    id: "dual-editor-mode",
    title: "محرر التوصيف المنظم وقاموس البيانات (Dual-Tab Editor)",
    badge: "التوصيف وجداول البيانات",
    description:
      "بيئة قراءة وتحرير ثنائية التبويب تجمع بين التوصيف الشامل وجدول البيانات التفاعلي.",
    icon: Table2,
    accentColor: "amber",
    bullets: [
      {
        title: "تبويب التوصيف المنظم للطلب",
        desc: "تصميم Shadcn أنيق يجيب عن كافة الأسئلة: الإطار القانوني، مسار العمل، قاموس الحقول، شروط المرفقات، وحالات الرفض والإرجاع.",
      },
      {
        title: "تبويب جدول البيانات (Spreadsheet)",
        desc: "محرر شبكي تفاعلي يسمح بإدخال وتعديل البيانات، النسخ واللصق من Excel، وإضافة وحذف الأعمدة والصفوف.",
      },
      {
        title: "الحفظ التلقائي في ملف JSON",
        desc: "كل بيانات التوصيف والجدول تُحفظ تلقائياً في ملف الخدمة لتكون جاهزة للمزامنة مع مستودع GitHub.",
      },
    ],
    tip: "يمكنك التبديل بين تبويبي التوصيف المنظم وجدول البيانات أعلى صفحة المحرر في أي وقت.",
  },
];

interface PlatformTourModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateSection?: (section: "files" | "citizen-services") => void;
}

export function PlatformTourModal({ open, onOpenChange, onNavigateSection }: PlatformTourModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const step = TOUR_STEPS[currentStepIndex];
  const totalSteps = TOUR_STEPS.length;
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === totalSteps - 1;

  useEffect(() => {
    if (!open) {
      // Reset the tour when it closes; this effect synchronizes modal state with its visibility.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentStepIndex(0);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentStepIndex((prev) => (prev < totalSteps - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentStepIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, totalSteps, onOpenChange]);

  const handleNext = () => {
    if (isLast) {
      onOpenChange(false);
      return;
    }
    setCurrentStepIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (isFirst) return;
    setCurrentStepIndex((prev) => prev - 1);
  };

  const StepIcon = step.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl"
      >
        {/* Top Header Banner */}
        <div className="relative border-b border-slate-200 bg-gradient-to-l from-[#002d29] via-[#003b36] to-[#004d46] px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl border border-white/20 bg-[#b49a63] text-slate-950 shadow-md">
                <Compass size={22} className="animate-spin-slow" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-white">
                  جولة إرشادية في منصة قسم تحليل المشاريع
                </DialogTitle>
                <DialogDescription className="text-xs text-[#d8c9a5]">
                  دليلك التفاعلي لفهم ميزات وأدوات المنصة وإمكانياتها الشاملة
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-white/20 bg-white/10 text-white font-mono text-xs">
                {currentStepIndex + 1} / {totalSteps}
              </Badge>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 flex gap-1.5">
            {TOUR_STEPS.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  idx === currentStepIndex
                    ? "bg-[#e0c98d] shadow-sm"
                    : idx < currentStepIndex
                    ? "bg-white/60"
                    : "bg-white/20 hover:bg-white/40"
                }`}
                title={s.title}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-6 space-y-5">
          {/* Step Header */}
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 shadow-xs">
              <StepIcon size={24} className="text-[#8f733a]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[11px] font-medium bg-[#f5efe2] text-[#7a6231] border-[#b49a63]/30">
                  {step.badge}
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-slate-900 leading-snug">{step.title}</h3>
              <p className="text-xs leading-relaxed text-slate-600">{step.description}</p>
            </div>
          </div>

          <Separator className="bg-slate-100" />

          {/* Bullets Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {step.bullets.map((b, idx) => (
              <Card key={idx} className="border-slate-200/80 bg-slate-50/60 shadow-none transition-all hover:bg-white hover:shadow-xs">
                <CardContent className="p-3.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    <span>{b.title}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tip Box */}
          {step.tip && (
            <div className="flex items-center gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50/70 px-4 py-2.5 text-xs text-amber-900">
              <Sparkles size={16} className="text-amber-600 shrink-0" />
              <span className="leading-relaxed">
                <strong>تلميح عملي:</strong> {step.tip}
              </span>
            </div>
          )}
        </div>

        {/* Footer Navigation Controls */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/90 px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Keyboard size={14} className="text-slate-400" />
            <span className="hidden sm:inline">استخدم الأسهم <strong>←</strong> و <strong>→</strong> للتنقل</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={isFirst}
              className="gap-1.5"
            >
              <ArrowRight size={14} />
              السابق
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleNext}
              className="gap-1.5 bg-[#003b36] hover:bg-[#002d29] text-white"
            >
              {isLast ? (
                <>
                  <Check size={14} />
                  إنهاء واستكشاف المنصة
                </>
              ) : (
                <>
                  التالي
                  <ArrowLeft size={14} />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
