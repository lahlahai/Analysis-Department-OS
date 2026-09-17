import Link from "next/link";
import { ArrowLeft, BookOpen, CheckCircle2, FileStack, GitBranch, Layers3, Table2 } from "lucide-react";

const principles = [
  {
    icon: FileStack,
    title: "مرجع واحد للفريق",
    description: "نجمع ملفات الدراسات والمراجع والوثائق في مساحة موحدة بدل تشتتها بين الأجهزة والمحادثات.",
  },
  {
    icon: Table2,
    title: "بيانات سهلة القراءة",
    description: "نعرض المعلومات في جداول واضحة يمكن لصقها من Excel وتعديلها مباشرة مع الحفاظ على ترتيبها.",
  },
  {
    icon: GitBranch,
    title: "تغييرات موثقة",
    description: "يبقى سجل GitHub قريباً من مساحة العمل ليعرف الفريق ما الذي تغير ومتى ومن قام بالتعديل.",
  },
];

const workflow = ["افتح المرجع المناسب", "اقرأ المعلومات في سياقها", "عدّل البيانات عند الحاجة", "شارك الحالة مع الفريق"];

export default function OnboardingPage() {
  return (
    <main className="onboarding-page" dir="rtl">
      <header className="onboarding-header">
        <Link href="/" className="onboarding-brand" aria-label="العودة إلى مساحة العمل">
          <span className="onboarding-mark"><Layers3 size={21} /></span>
          <span>
            <strong>Analysis Department OS</strong>
            <small>منصة تحليل المشاريع</small>
          </span>
        </Link>
        <Link href="/" className="onboarding-header-link">الدخول إلى مساحة العمل <ArrowLeft size={15} /></Link>
      </header>

      <section className="onboarding-hero">
        <div className="onboarding-hero-copy">
          <div className="onboarding-eyebrow"><BookOpen size={14} /> تعريف بالمنصة</div>
          <h1>كل ما يحتاجه فريق تحليل المشاريع، في مكان واحد واضح.</h1>
          <p>
            هدف هذه البرمجية هو توحيد مكان المراجع والملفات ومصادر فريق تحليل المشاريع،
            لتكون المعلومات سهلة الوصول، واضحة السياق، ومقروءة لكل شخص يعمل على المشروع.
          </p>
          <div className="onboarding-actions">
            <Link href="/" className="onboarding-primary-action">ابدأ من مساحة العمل <ArrowLeft size={17} /></Link>
            <span className="onboarding-note">محتوى منظم · قراءة أسرع · تعاون أوضح</span>
          </div>
        </div>
        <div className="onboarding-hero-card" aria-label="ملخص هدف المنصة">
          <div className="onboarding-card-topline"><span /> مساحة الفريق</div>
          <div className="onboarding-card-title">تحليل المشاريع</div>
          <div className="onboarding-card-subtitle">مرجع مشترك للملفات والبيانات والقرارات</div>
          <div className="onboarding-card-lines"><span /><span /><span /></div>
          <div className="onboarding-card-footer"><CheckCircle2 size={15} /> جاهز للقراءة والعمل</div>
        </div>
      </section>

      <section className="onboarding-content">
        <div className="onboarding-section-heading">
          <span>لماذا هذه المنصة؟</span>
          <h2>من التشتت إلى صورة مشتركة للمشروع</h2>
          <p>صُممت لتساعد الفريق على فهم المعلومة والوصول إليها والعمل عليها دون خطوات زائدة.</p>
        </div>
        <div className="onboarding-principles">
          {principles.map(({ icon: Icon, title, description }) => (
            <article className="onboarding-principle" key={title}>
              <div className="onboarding-principle-icon"><Icon size={19} /></div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="onboarding-workflow">
        <div>
          <span className="onboarding-section-label">طريقة الاستخدام</span>
          <h2>مسار بسيط لكل عضو في الفريق</h2>
          <p>ابدأ من المعلومة، افهمها ضمن سياقها، ثم اترك أثراً واضحاً لتستفيد منه بقية الفريق.</p>
        </div>
        <ol className="onboarding-steps">
          {workflow.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span>{step}</li>)}
        </ol>
      </section>

      <footer className="onboarding-footer">
        <span>Analysis Department OS</span>
        <span>مساحة موحدة لمصادر فريق تحليل المشاريع</span>
        <span className="onboarding-development">الموقع ما يزال تحت التطوير</span>
        <span className="onboarding-credit">تصميم وتنفيذ: محمد لحلح</span>
        <Link href="/">العودة إلى المنصة <ArrowLeft size={14} /></Link>
      </footer>
    </main>
  );
}
