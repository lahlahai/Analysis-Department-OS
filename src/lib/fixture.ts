import { citizenServicesDocumentSchema, diagramLayoutSchema, componentsDocumentSchema, entitiesDocumentSchema, jobCardCatalogSchema, projectDocumentSchema, relationshipsDocumentSchema } from "@/domain/schemas";
import jobCardCatalogDocument from "../../.software/job-card-catalog.json";
import citizenServicesDocument from "../../.software/citizen-services.json";
import type { DiagramLayout, SoftwareModel } from "@/domain/types";

const jsonDocument = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;

const projectDocument = {
  version: "1.0",
  project: {
    name: "دائرة التخطيط العمراني — بلدية مدينة حماة",
    description: "توثيق بصري للمهام والإجراءات والوثائق التنظيمية في دائرة التخطيط العمراني.",
    repository: "hama-municipality/urban-planning",
  },
};

const componentsDocument = {
  version: "1.0",
  components: [
    { id: "technical-affairs", name: "مدير الشؤون الفنية", type: "component", description: "المرجعية الإدارية المباشرة لدائرة التنظيم العمراني.", metadata: { owner: "الإدارة" } },
    { id: "urban-planning", name: "دائرة التنظيم العمراني", type: "service", description: "تدير التخطيط والتنظيم والاستملاك والإفراز.", metadata: { owner: "دائرة التنظيم العمراني" } },
    { id: "planning-regulation", name: "شعبة التخطيط والتنظيم العمراني", type: "component", description: "تعد الدراسات وتؤمن بيانات المخطط التنظيمي وتتابع اللجان.", metadata: { owner: "التخطيط والتنظيم" } },
    { id: "map-secretariat", name: "شعبة أمانة الخارطة", type: "component", description: "تحفظ الدراسات والمخططات وتصدر بيانات الوضع التخطيطي.", metadata: { owner: "أمانة الخارطة" } },
    { id: "expropriation-plans", name: "شعبة تنظيم المخططات الاستملاكية", type: "component", description: "تنظم مخططات الاستملاك وتدقق معاملات الإفراز.", metadata: { owner: "المخططات الاستملاكية" } },
    { id: "urban-committee", name: "اللجنة العمرانية", type: "external-system", description: "تراجع المعاملات وتصدر القرارات وفق الأصول.", metadata: { owner: "اللجان" } },
    { id: "regional-committee", name: "اللجنة الإقليمية", type: "external-system", description: "تستقبل الأضابير المحالة وتتابع قراراتها.", metadata: { owner: "اللجان" } },
    { id: "public-authorities", name: "الدوائر والجهات العامة", type: "external-system", description: "تزود الدائرة بالمعلومات والوثائق اللازمة لتوسيع المخطط.", metadata: { owner: "جهات خارجية" } },
    { id: "applicant", name: "صاحب العلاقة", type: "actor", description: "يقدم طلبات البيانات والاستملاك والإفراز.", metadata: { owner: "المتعاملون" } },
    { id: "one-stop-window", name: "النافذة الواحدة", type: "component", description: "تسجل طلب المواطن وتستقبل مرفقاته.", metadata: { owner: "الاستقبال" } },
    { id: "general-registry", name: "الديوان العام", type: "component", description: "يقيد الطلب ويحيله إلى الجهة الإدارية التالية.", metadata: { owner: "الديوان" } },
    { id: "technical-registry", name: "ديوان الشؤون الفنية", type: "component", description: "يقيد الطلب فنيًا قبل إحالته إلى دائرة التخطيط العمراني.", metadata: { owner: "الشؤون الفنية" } },
    { id: "urban-planning-mail", name: "بريد دائرة التخطيط العمراني", type: "component", description: "يوجه الطلب إلى الشعبة المختصة.", metadata: { owner: "دائرة التنظيم العمراني" } },
    { id: "drafter-reviewer", name: "الرسامة والمدقق", type: "component", description: "ينفذ الخدمة ويعد الرد والصفحة المصورة ويوقع فنيًا.", metadata: { owner: "التنفيذ الفني" } },
    { id: "technical-affairs-head", name: "رئيس قسم الشؤون الفنية", type: "component", description: "يراجع الرد ويوقع ويصادق عليه.", metadata: { owner: "الشؤون الفنية" } },
    { id: "city-manager", name: "مدير المدينة", type: "component", description: "يوقع توقيعًا شكليًا ويضع الختم.", metadata: { owner: "الإدارة العليا" } },
  ],
};

const entitiesDocument = {
  version: "1.0",
  entities: [
    { id: "real-estate", name: "العقار", description: "العقار محل الدراسة أو المعاملة.", fields: [{ name: "id", type: "string", required: true }, { name: "planningStatus", type: "string", required: true }, { name: "administrativeBoundary", type: "boolean", required: true }] },
    { id: "regulatory-plan", name: "المخطط التنظيمي", description: "المخطط المعتمد وحدوده ومنطقة الحماية.", fields: [{ name: "id", type: "string", required: true }, { name: "version", type: "string", required: true }, { name: "approvedAt", type: "date", required: false }] },
    { id: "planning-study", name: "الدراسة التخطيطية", description: "دراسة تعديل أو تفصيل مرتبطة بالمخطط التنظيمي.", fields: [{ name: "id", type: "string", required: true }, { name: "kind", type: "تعديلية | تفصيلية", required: true }, { name: "status", type: "مسودة | مصدقة", required: true }] },
    { id: "transaction-file", name: "المعاملة والأضبارة", description: "الطلب والبريد والوثائق المتداولة في الإجراء.", fields: [{ name: "id", type: "string", required: true }, { name: "kind", type: "استملاك | إفراز | تخصيص", required: true }, { name: "status", type: "string", required: true }] },
    { id: "expropriation-map", name: "مخطط الاستملاك", description: "مخطط يبين العقارات والوضع الاستملاكي والبيانات التخطيطية.", fields: [{ name: "id", type: "string", required: true }, { name: "parcelCount", type: "number", required: true }, { name: "approved", type: "boolean", required: true }] },
    { id: "subdivision-plan", name: "مخطط الإفراز", description: "مخطط إفراز طابقي أو عادي مع مخططه المساحي.", fields: [{ name: "id", type: "string", required: true }, { name: "kind", type: "طابقي | عادي", required: true }, { name: "approved", type: "boolean", required: true }] },
    { id: "planning-certificate", name: "بيان الوضع التخطيطي", description: "بيان يوضح الصفة العمرانية وموقع العقار والمرجع القانوني.", fields: [{ name: "id", type: "string", required: true }, { name: "planningZone", type: "string", required: true }, { name: "legalReference", type: "string", required: false }] },
    { id: "committee-decision", name: "قرار اللجنة", description: "قرار اللجنة العمرانية أو الإقليمية ونتيجة الإحالة.", fields: [{ name: "id", type: "string", required: true }, { name: "committee", type: "العمرانية | الإقليمية", required: true }, { name: "decision", type: "string", required: true }] },
  ],
};

const relationshipsDocument = {
  version: "1.0",
  relationships: [
    { id: "technical-affairs-manages-urban-planning", source: "technical-affairs", target: "urban-planning", type: "contains", label: "إشراف إداري", direction: "forward" },
    { id: "urban-planning-contains-planning", source: "urban-planning", target: "planning-regulation", type: "contains", label: "تتبع تنظيمي", direction: "forward" },
    { id: "urban-planning-contains-map", source: "urban-planning", target: "map-secretariat", type: "contains", label: "تتبع تنظيمي", direction: "forward" },
    { id: "urban-planning-contains-expropriation", source: "urban-planning", target: "expropriation-plans", type: "contains", label: "تتبع تنظيمي", direction: "forward" },
    { id: "public-authorities-supply-documents", source: "public-authorities", target: "planning-regulation", type: "data-flow", label: "معلومات ووثائق", direction: "forward" },
    { id: "planning-study-uses-regulatory-plan", source: "planning-study", target: "regulatory-plan", type: "relationship", label: "تعديل أو تفصيل", direction: "forward" },
    { id: "transaction-concerns-real-estate", source: "transaction-file", target: "real-estate", type: "relationship", label: "تخص العقار", direction: "forward" },
    { id: "real-estate-has-certificate", source: "real-estate", target: "planning-certificate", type: "relationship", label: "له بيان", direction: "forward" },
    { id: "expropriation-map-covers-real-estate", source: "expropriation-map", target: "real-estate", type: "relationship", label: "يشمل", direction: "forward" },
    { id: "subdivision-plan-covers-real-estate", source: "subdivision-plan", target: "real-estate", type: "relationship", label: "يفرز", direction: "forward" },
    { id: "transaction-produces-expropriation-map", source: "transaction-file", target: "expropriation-map", type: "data-flow", label: "ينتج مخططًا", direction: "forward" },
    { id: "transaction-produces-subdivision-plan", source: "transaction-file", target: "subdivision-plan", type: "data-flow", label: "ينتج مخططًا", direction: "forward" },
    { id: "urban-committee-reviews-transaction", source: "urban-committee", target: "transaction-file", type: "calls", label: "مراجعة وإحالة", direction: "forward" },
    { id: "regional-committee-reviews-transaction", source: "regional-committee", target: "transaction-file", type: "calls", label: "إحالة وقرار", direction: "forward" },
    { id: "committee-produces-decision", source: "transaction-file", target: "committee-decision", type: "data-flow", label: "قرار اللجنة", direction: "forward" },
    { id: "applicant-submits-transaction", source: "applicant", target: "transaction-file", type: "data-flow", label: "طلب معاملة", direction: "forward" },
    { id: "map-secretariat-to-planning", source: "map-secretariat", target: "planning-regulation", type: "calls", label: "تدقيق وتخطيط", direction: "forward" },
    { id: "planning-to-committee", source: "planning-regulation", target: "urban-committee", type: "calls", label: "إحالة للدراسة", direction: "forward" },
    { id: "map-to-expropriation", source: "map-secretariat", target: "expropriation-plans", type: "calls", label: "مخطط استملاك", direction: "forward" },
    { id: "expropriation-to-committee", source: "expropriation-plans", target: "urban-committee", type: "calls", label: "مراجعة اللجنة", direction: "forward" },
    { id: "transaction-to-map-secretariat", source: "transaction-file", target: "map-secretariat", type: "calls", label: "تحقق من الوضع التخطيطي", direction: "forward" },
    { id: "applicant-to-one-stop-window", source: "applicant", target: "one-stop-window", type: "data-flow", label: "تقديم الطلب والمرفقات", direction: "forward" },
    { id: "one-stop-to-general-registry", source: "one-stop-window", target: "general-registry", type: "calls", label: "قيد الطلب", direction: "forward" },
    { id: "general-to-technical-registry", source: "general-registry", target: "technical-registry", type: "calls", label: "إحالة للديوان الفني", direction: "forward" },
    { id: "technical-registry-to-mail", source: "technical-registry", target: "urban-planning-mail", type: "calls", label: "تسجيل وإحالة", direction: "forward" },
    { id: "mail-to-drafter-reviewer", source: "urban-planning-mail", target: "drafter-reviewer", type: "calls", label: "إحالة حسب الشعبة", direction: "forward" },
    { id: "drafter-to-technical-head", source: "drafter-reviewer", target: "technical-affairs-head", type: "data-flow", label: "رد موقع فنيًا", direction: "forward" },
    { id: "technical-head-to-city-manager", source: "technical-affairs-head", target: "city-manager", type: "calls", label: "مصادقة وتوقيع", direction: "forward" },
    { id: "drafter-returns-to-applicant", source: "drafter-reviewer", target: "applicant", type: "data-flow", label: "إرجاع لاستكمال المعلومات", direction: "forward" },
    { id: "technical-head-returns-to-drafter", source: "technical-affairs-head", target: "drafter-reviewer", type: "calls", label: "إعادة للمراجعة", direction: "forward" },
  ],
};

const diagramDocument = (diagram: DiagramLayout["diagram"], nodes: DiagramLayout["nodes"], edges: DiagramLayout["edges"]) => jsonDocument({ version: "1.0", diagram, nodes, edges });

const documentationOverview = [
  "# التوثيق الأساسي للنظام",
  "",
  "## المجال الموثق",
  "",
  "دائرة التخطيط العمراني في بلدية مدينة حماة، بما يشمل دائرة التنظيم العمراني والشعب واللجان والمعاملات المرتبطة بالعقارات.",
  "",
  "## المخططات المتاحة",
  "",
  "- ERD يربط العقار بالمخطط والدراسة والمعاملة والمخططات والقرارات.",
  "- Flowchart يوضح انتقال المعاملة من صاحب العلاقة إلى المراجعة والإحالة.",
  "- Workflow يوضح سير الاستملاك والإفراز بين الوحدات.",
  "- Process diagram يوضح إجراء دراسة العقار وإصدار القرار.",
  "",
  "للتفاصيل، افتح ملف hama-urban-planning-department.md.",
  "",
].join("\\n");

const documentationSummary = [
  "# دائرة التخطيط العمراني في بلدية مدينة حماة",
  "",
  "## ملخص وظيفي",
  "",
  "توثق هذه الصفحة الهيكل والمهام المستخرجة من أربع بطاقات وصف وظيفي. المرجع الكامل محفوظ في ملف المشروع، وتبقى الأرقام القانونية غير المحسومة بحاجة إلى اعتماد رسمي.",
  "",
  "## الوحدات والأدوار",
  "",
  "- مدير الشؤون الفنية.",
  "- رئيس دائرة التنظيم العمراني.",
  "- رئيس شعبة التخطيط والتنظيم العمراني.",
  "- رئيس شعبة أمانة الخارطة.",
  "- رئيس شعبة تنظيم المخططات الاستملاكية.",
  "- اللجنة العمرانية واللجنة الإقليمية.",
  "",
  "## الأعمال المركزية",
  "",
  "1. إعداد وتصديق الدراسات التخطيطية التعديلية والتفصيلية.",
  "2. متابعة توسعة المخطط التنظيمي وحدوده ومنطقة الحماية.",
  "3. إصدار بيانات الوضع التخطيطي للعقارات.",
  "4. إعداد وتدقيق مخططات الاستملاك ومشاريع الإفراز.",
  "5. إحالة الأضابير إلى اللجان ومتابعة قراراتها.",
  "6. حفظ المخططات والدراسات والمخططات النهائية المصدقة.",
  "",
  "## التدفق المختصر",
  "",
  "استلام الطلب ← دراسة الوثائق ← تدقيق الوضع التخطيطي ← إعداد المخطط أو الدراسة ← الإحالة والتصديق ← الحفظ",
  "",
].join("\\n");

export const fixtureFiles: Record<string, string> = {
  ".software/project.json": jsonDocument(projectDocument),
  ".software/components.json": jsonDocument(componentsDocument),
  ".software/entities.json": jsonDocument(entitiesDocument),
  ".software/relationships.json": jsonDocument(relationshipsDocument),
  ".software/diagrams/system.json": diagramDocument({ id: "system", name: "الهيكل التنظيمي", type: "architecture" }, [
    { id: "technical-affairs", position: { x: 520, y: 40 }, width: 250, height: 132 }, { id: "urban-planning", position: { x: 520, y: 250 }, width: 250, height: 132 }, { id: "planning-regulation", position: { x: 80, y: 480 }, width: 250, height: 132 }, { id: "map-secretariat", position: { x: 380, y: 480 }, width: 250, height: 132 }, { id: "expropriation-plans", position: { x: 680, y: 480 }, width: 250, height: 132 }, { id: "urban-committee", position: { x: 980, y: 480 }, width: 250, height: 132 },
  ], [
    { id: "technical-affairs-manages-urban-planning", source: "technical-affairs", target: "urban-planning" }, { id: "urban-planning-contains-planning", source: "urban-planning", target: "planning-regulation" }, { id: "urban-planning-contains-map", source: "urban-planning", target: "map-secretariat" }, { id: "urban-planning-contains-expropriation", source: "urban-planning", target: "expropriation-plans" },
  ]),
  ".software/diagrams/erd.json": diagramDocument({ id: "erd", name: "بيانات المعاملات والعقارات", type: "erd" }, [
    { id: "real-estate", position: { x: 70, y: 80 }, width: 250, height: 170 }, { id: "regulatory-plan", position: { x: 370, y: 80 }, width: 250, height: 150 }, { id: "planning-study", position: { x: 670, y: 80 }, width: 250, height: 150 }, { id: "planning-certificate", position: { x: 970, y: 80 }, width: 250, height: 150 }, { id: "transaction-file", position: { x: 70, y: 380 }, width: 250, height: 170 }, { id: "expropriation-map", position: { x: 370, y: 380 }, width: 250, height: 170 }, { id: "subdivision-plan", position: { x: 670, y: 380 }, width: 250, height: 170 }, { id: "committee-decision", position: { x: 970, y: 380 }, width: 250, height: 150 },
  ], [
    { id: "planning-study-uses-regulatory-plan", source: "planning-study", target: "regulatory-plan" }, { id: "transaction-concerns-real-estate", source: "transaction-file", target: "real-estate" }, { id: "real-estate-has-certificate", source: "real-estate", target: "planning-certificate" }, { id: "expropriation-map-covers-real-estate", source: "expropriation-map", target: "real-estate" }, { id: "subdivision-plan-covers-real-estate", source: "subdivision-plan", target: "real-estate" }, { id: "transaction-produces-expropriation-map", source: "transaction-file", target: "expropriation-map" }, { id: "transaction-produces-subdivision-plan", source: "transaction-file", target: "subdivision-plan" }, { id: "committee-produces-decision", source: "transaction-file", target: "committee-decision" },
  ]),
  ".software/diagrams/flow.json": diagramDocument({ id: "flow", name: "تدفق معاملة التخطيط", type: "flowchart" }, [
    { id: "applicant", position: { x: 40, y: 210 }, width: 220, height: 125 }, { id: "transaction-file", position: { x: 330, y: 210 }, width: 240, height: 150 }, { id: "map-secretariat", position: { x: 650, y: 210 }, width: 250, height: 132 }, { id: "planning-regulation", position: { x: 980, y: 210 }, width: 250, height: 132 }, { id: "urban-committee", position: { x: 1310, y: 210 }, width: 240, height: 132 },
  ], [
    { id: "applicant-submits-transaction", source: "applicant", target: "transaction-file" }, { id: "transaction-to-map-secretariat", source: "transaction-file", target: "map-secretariat" }, { id: "map-secretariat-to-planning", source: "map-secretariat", target: "planning-regulation" }, { id: "planning-to-committee", source: "planning-regulation", target: "urban-committee" },
  ]),
  ".software/diagrams/workflow.json": diagramDocument({ id: "workflow", name: "سير عمل الاستملاك والإفراز", type: "workflow" }, [
    { id: "applicant", position: { x: 40, y: 210 }, width: 220, height: 125 }, { id: "transaction-file", position: { x: 320, y: 210 }, width: 240, height: 150 }, { id: "map-secretariat", position: { x: 620, y: 210 }, width: 250, height: 132 }, { id: "expropriation-plans", position: { x: 930, y: 210 }, width: 250, height: 132 }, { id: "urban-committee", position: { x: 1240, y: 210 }, width: 240, height: 132 }, { id: "regional-committee", position: { x: 1240, y: 470 }, width: 240, height: 132 },
  ], [
    { id: "applicant-submits-transaction", source: "applicant", target: "transaction-file" }, { id: "transaction-to-map-secretariat", source: "transaction-file", target: "map-secretariat" }, { id: "map-to-expropriation", source: "map-secretariat", target: "expropriation-plans" }, { id: "expropriation-to-committee", source: "expropriation-plans", target: "urban-committee" },
  ]),
  ".software/diagrams/process.json": diagramDocument({ id: "process", name: "إجراء دراسة العقار", type: "process" }, [
    { id: "real-estate", position: { x: 50, y: 220 }, width: 240, height: 170 }, { id: "planning-certificate", position: { x: 360, y: 220 }, width: 250, height: 150 }, { id: "planning-study", position: { x: 680, y: 220 }, width: 250, height: 150 }, { id: "regulatory-plan", position: { x: 1000, y: 220 }, width: 250, height: 150 }, { id: "transaction-file", position: { x: 1320, y: 220 }, width: 250, height: 170 }, { id: "committee-decision", position: { x: 1320, y: 500 }, width: 250, height: 150 },
  ], [
    { id: "real-estate-has-certificate", source: "real-estate", target: "planning-certificate" }, { id: "planning-study-uses-regulatory-plan", source: "planning-study", target: "regulatory-plan" }, { id: "transaction-concerns-real-estate", source: "transaction-file", target: "real-estate" }, { id: "committee-produces-decision", source: "transaction-file", target: "committee-decision" },
  ]),
  ".software/diagrams/component.json": diagramDocument({ id: "component", name: "مكوّنات دائرة التنظيم", type: "component" }, [
    { id: "urban-planning", position: { x: 80, y: 200 } }, { id: "planning-regulation", position: { x: 420, y: 200 } }, { id: "map-secretariat", position: { x: 760, y: 200 } }, { id: "expropriation-plans", position: { x: 1100, y: 200 } },
  ], [
    { id: "urban-planning-contains-planning", source: "urban-planning", target: "planning-regulation" }, { id: "urban-planning-contains-map", source: "urban-planning", target: "map-secretariat" }, { id: "urban-planning-contains-expropriation", source: "urban-planning", target: "expropriation-plans" },
  ]),
  ".software/diagrams/citizen-services-sequence.json": diagramDocument({ id: "citizen-services-sequence", name: "تسلسل طلبات المواطنين", type: "sequence" }, [
    { id: "applicant", position: { x: 40, y: 220 }, width: 220, height: 125 }, { id: "one-stop-window", position: { x: 320, y: 220 }, width: 230, height: 132 }, { id: "general-registry", position: { x: 610, y: 220 }, width: 220, height: 132 }, { id: "technical-registry", position: { x: 890, y: 220 }, width: 230, height: 132 }, { id: "urban-planning-mail", position: { x: 1180, y: 220 }, width: 250, height: 132 }, { id: "drafter-reviewer", position: { x: 1490, y: 220 }, width: 230, height: 132 }, { id: "technical-affairs-head", position: { x: 1780, y: 220 }, width: 250, height: 132 }, { id: "city-manager", position: { x: 2090, y: 220 }, width: 220, height: 132 },
  ], [
    { id: "applicant-to-one-stop-window", source: "applicant", target: "one-stop-window" }, { id: "one-stop-to-general-registry", source: "one-stop-window", target: "general-registry" }, { id: "general-to-technical-registry", source: "general-registry", target: "technical-registry" }, { id: "technical-registry-to-mail", source: "technical-registry", target: "urban-planning-mail" }, { id: "mail-to-drafter-reviewer", source: "urban-planning-mail", target: "drafter-reviewer" }, { id: "drafter-to-technical-head", source: "drafter-reviewer", target: "technical-affairs-head" }, { id: "technical-head-to-city-manager", source: "technical-affairs-head", target: "city-manager" },
  ]),
  "docs/architecture/overview.md": documentationOverview,
  "docs/architecture/hama-urban-planning-department.md": documentationSummary,
  "docs/requirements/citizen-services.md": "# طلبات المواطنين — دائرة التنظيم العمراني\n\nيتضمن الكتالوج ثمانية طلبات: دمج عقارين، شراء فضلة، كروكي، الاستعلام عن الوضع التنظيمي للعقار، استعلام تغيير استخدام عقار، موافقة مبدئية على تنظيم مشروع إفراز طابقي أو جوار، استفسار عن مصاعد بانورامية وشروط التركيب، وترخيص صيدلية.\n\nالمراحل الموحدة: النافذة الواحدة ← الديوان العام ← دائرة التنظيم والتخطيط العمراني ← إعداد الرد والتوقيع ← المصادقة والختم أو الإحالة إلى الجهة المختصة.\n\nالتفاصيل المنظمة موجودة في .software/citizen-services.json.\n",
  "docs/studies/hama-urban-planning/README.md": "# دراسة دائرة التخطيط العمراني في بلدية مدينة حماة\n\nتبدأ هذه الدراسة من ملف التوثيق الوظيفي، ثم تُضاف إليها متطلبات المديرية ونموذج البيانات والإجراءات وقرارات الاعتماد.\n\nالمخططات الأربعة موجودة في .software/diagrams/: ERD وFlowchart وWorkflow وProcess diagram.\n",
};

export interface FixtureWorkspace {
  model: SoftwareModel;
  layouts: DiagramLayout[];
  files: Record<string, string>;
  jobCards: ReturnType<typeof jobCardCatalogSchema.parse>["cards"];
  citizenServices: ReturnType<typeof citizenServicesDocumentSchema.parse>["services"];
}

type CitizenService = ReturnType<typeof citizenServicesDocumentSchema.parse>["services"][number];

function citizenServiceTableDocument(service: CitizenService) {
  const rows = [
    ["اسم الطلب", service.name],
    ["النوع", service.kind === "service" ? "خدمة" : "استعلام"],
    ["المجال", service.domain],
    ["الوحدة", service.unit],
    ["الوصف", service.description],
    ["الاستخدام", service.usage],
    ["المديرية", service.directorate],
    ["الدائرة", service.department],
    ["القناة", service.channel],
    ["الأولوية", service.priority],
    ["الحقول المطلوبة", service.requiredFields.join("، ")],
    ["المرفقات", service.attachments.join("، ") || "لا يوجد"],
    ["الاستجابة", service.response],
  ];
  return `${JSON.stringify({ version: "1.0", serviceId: service.id, columns: ["البيان", "التفاصيل"], rows, columnWidths: [180, 520], rowHeights: rows.map(() => 36) }, null, 2)}\n`;
}

export function loadFixtureWorkspace(): FixtureWorkspace {
  const project = projectDocumentSchema.parse(JSON.parse(fixtureFiles[".software/project.json"])).project;
  const components = componentsDocumentSchema.parse(JSON.parse(fixtureFiles[".software/components.json"])).components;
  const entities = entitiesDocumentSchema.parse(JSON.parse(fixtureFiles[".software/entities.json"])).entities;
  const relationships = relationshipsDocumentSchema.parse(JSON.parse(fixtureFiles[".software/relationships.json"])).relationships;
  const layouts = Object.entries(fixtureFiles).filter(([path]) => path.includes("/diagrams/")).map(([, contents]) => diagramLayoutSchema.parse(JSON.parse(contents)));
  const jobCardDocument = jobCardCatalogSchema.parse(jobCardCatalogDocument);
  const citizenServices = citizenServicesDocumentSchema.parse(citizenServicesDocument);
  const citizenServiceFiles = Object.fromEntries(citizenServices.services.map((service) => [`قسم التنظيم والتخطيط العمراني/${service.id}.json`, citizenServiceTableDocument(service)]));
  const files = { ...fixtureFiles, ...citizenServiceFiles, ".software/job-card-catalog.json": `${JSON.stringify(jobCardDocument, null, 2)}\n`, ".software/citizen-services.json": `${JSON.stringify(citizenServices, null, 2)}\n` };
  return { model: { project: { ...project, version: "1.0" }, components, entities, relationships }, layouts, files, jobCards: jobCardDocument.cards, citizenServices: citizenServices.services };
}
