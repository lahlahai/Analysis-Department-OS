# مهمة المشروع

ابنِ تطبيق ويب احترافي باسم مؤقت **Software Architect Workspace**، موجه للمطورين ومهندسي البرمجيات، يساعدهم على إنشاء وتوثيق وإدارة مخططات هندسة البرمجيات من خلال واجهة واحدة.

الهدف الأساسي ليس بناء أداة رسم عامة، وإنما بناء **File-first Software Engineering Workspace** تكون فيه ملفات JSON وMarkdown داخل GitHub هي مصدر الحقيقة، بينما تكون المخططات واجهة بصرية لهذه الملفات.

---

# المبدأ الأساسي

يجب ألا يستخدم التطبيق أي قاعدة بيانات لتخزين بيانات المشاريع.

لا تستخدم:

* PostgreSQL
* MySQL
* MongoDB
* Supabase Database
* Prisma
* Firebase Database
* Redis

المصدر الوحيد لبيانات المشروع هو:

```text
GitHub Repository
        ↓
JSON + Markdown
        ↓
Next.js
        ↓
React Flow
```

Vercel يستخدم لاستضافة التطبيق وتشغيل API routes/server actions عند الحاجة فقط.

---

# التقنية الإلزامية

استخدم:

* Next.js أحدث إصدار مستقر
* App Router
* TypeScript
* React
* Tailwind CSS
* shadcn/ui
* React Flow مناسبة لكل diagrams 
* ELK.js أو مكتبة مناسبة للـautomatic graph layout
* Monaco Editor
* Zod
* GitHub OAuth
* GitHub REST API أو GraphQL API
* Mermaid للـMarkdown diagrams عند الحاجة
* Lucide Icons

يجب أن يكون الكود TypeScript بالكامل.

استخدم Server Components افتراضيًا، واستخدم Client Components فقط عندما تكون هناك حاجة للتفاعل في المتصفح.

---

# فلسفة التطبيق

المستخدم يجب أن يشعر أنه يعمل داخل:

```text
VS Code
+
GitHub
+
Architecture Designer
+
Documentation System
```

وليس داخل برنامج رسم تقليدي.

لا تجعل المستخدم مضطرًا إلى رسم كل شيء يدويًا.

المستخدم يستطيع:

1. إنشاء نموذج للنظام.
2. إضافة Entities.
3. إضافة Services.
4. إضافة Components.
5. إضافة APIs.
6. إضافة Actors.
7. إنشاء العلاقات.
8. كتابة المتطلبات.
9. كتابة التوثيق.
10. توليد المخططات تلقائيًا من النموذج.
11. تعديل المخطط بصريًا.
12. حفظ التغييرات إلى GitHub.

---

# بنية ملفات المشروع

عندما يرتبط Repository بالتطبيق، استخدم مجلدًا خاصًا:

```text
.software/
```

مثال:

```text
.software/
├── project.json
├── requirements.json
├── domains.json
├── entities.json
├── components.json
├── services.json
├── apis.json
├── events.json
├── decisions.json
└── diagrams/
    ├── system.json
    ├── container.json
    ├── component.json
    ├── database.json
    ├── checkout-sequence.json
    └── deployment.json

docs/
├── requirements/
├── architecture/
├── api/
└── decisions/
```

يجب أن تكون هذه الملفات human-readable وAI-readable وGit-friendly.

---

# تصميم JSON

استخدم Schemas واضحة وقابلة للتوسع.

مثال:

```json
{
  "version": "1.0",
  "project": {
    "name": "Example Application",
    "description": "Example software system"
  }
}
```

مثال Entity:

```json
{
  "id": "user",
  "name": "User",
  "description": "System user",
  "fields": [
    {
      "name": "id",
      "type": "UUID",
      "required": true
    },
    {
      "name": "email",
      "type": "string",
      "required": true
    }
  ]
}
```

مثال Component:

```json
{
  "id": "payment-service",
  "name": "Payment Service",
  "type": "service",
  "description": "Handles payments"
}
```

مثال relationship:

```json
{
  "source": "order-service",
  "target": "payment-service",
  "type": "dependency",
  "label": "creates payment"
}
```

استخدم Zod للتحقق من جميع ملفات JSON قبل استخدامها.

---

# أهم فصل معماري

افصل بشكل صارم بين:

## Software Model

يمثل حقيقة النظام:

```text
Entities
Services
Components
APIs
Actors
Events
Relationships
```

و:

## Diagram Layout

يمثل طريقة عرض النظام:

```text
x
y
width
height
collapsed
position
style
```

لا تضع معلومات النظام الأساسية داخل ملفات الـlayout.

مثلاً:

```text
components.json
```

يحتوي على:

```json
{
  "id": "api",
  "name": "API",
  "type": "service"
}
```

بينما:

```text
diagrams/system.json
```

يحتوي على:

```json
{
  "nodes": [
    {
      "id": "api",
      "position": {
        "x": 500,
        "y": 300
      }
    }
  ]
}
```

---

# أنواع المخططات

أنشئ Architecture تسمح بدعم الأنواع التالية:

## Architecture

* System Context
* Container
* Component
* Deployment

## UML

* Class Diagram
* Sequence Diagram
* Activity Diagram
* State Diagram
* Use Case Diagram

## Data

* ERD
* Database Schema
* Data Flow Diagram

## General

* Flowchart
* Workflow
* Dependency Graph
* Network Diagram
* Mind Map

لا تحاول تنفيذ جميع الأنواع بشكل كامل في أول مرحلة.

ابدأ بـ:

1. Architecture
2. ERD
3. Flowchart
4. Sequence
5. Component
6. Class

ثم وسّع النظام.

---

# React Flow

استخدم React Flow كمحرك الرسم الأساسي.

لا تستخدم Nodes عادية فقط.

أنشئ Custom Nodes احترافية:

```text
ApplicationNode
ServiceNode
DatabaseNode
EntityNode
ActorNode
ApiNode
QueueNode
EventNode
ComponentNode
ExternalSystemNode
```

كل Node يجب أن يحتوي:

* Icon
* Title
* Type
* Description
* Metadata
* Handles مناسبة

مثال:

```text
┌─────────────────────────┐
│ ⚙ Payment Service       │
│                         │
│ Handles payments        │
│                         │
│ REST API                │
└─────────────────────────┘
```

---

# Edges

أنشئ أنواعًا مختلفة من العلاقات:

```text
dependency
data-flow
relationship
event
calls
contains
uses
extends
implements
```

ويجب أن يستطيع المستخدم تغيير:

* Label
* Direction
* Style
* Arrow
* Relationship type

---

# Automatic Layout

استخدم ELK.js أو dagre عند الحاجة.

أضف:

```text
Auto Layout
Fit View
Zoom
Pan
Minimap
Grid
Snap to Grid
```

يجب أن يستطيع المستخدم اختيار:

```text
Auto Layout
Horizontal
Vertical
Tree
Layered
```

---

# واجهة المستخدم

صمم واجهة احترافية موجهة للمطورين.

لا تستخدم تصميمًا يشبه أدوات التصميم الرسومي العامة.

التصميم يجب أن يكون قريبًا من:

```text
VS Code
Linear
GitHub
Vercel
Raycast
```

استخدم:

* Dark mode
* Light mode
* Keyboard shortcuts
* Command palette
* Context menus
* Resizable panels
* Breadcrumbs
* Tabs
* Search
* File tree

---

# Layout

استخدم الواجهة التالية:

```text
┌──────────────────────────────────────────────────────────────┐
│ Logo │ Project │ Branch │ Save │ Generate │ Validate │ AI   │
├──────────────┬───────────────────────────────┬───────────────┤
│              │                               │               │
│ File Tree    │       Diagram Canvas          │ Inspector     │
│              │                               │               │
│ .software    │                               │ Node          │
│ docs         │                               │ Properties    │
│              │                               │               │
│ Diagrams     │                               │ Relationships │
│              │                               │               │
├──────────────┴───────────────────────────────┴───────────────┤
│ Status │ Git │ Validation │ Changes │ Errors                 │
└──────────────────────────────────────────────────────────────┘
```

---

# File Explorer

يجب أن يستطيع المستخدم رؤية:

```text
.software/
docs/
```

والتنقل بين الملفات.

عند اختيار:

```text
architecture.json
```

يمكن عرض محرر JSON.

وعند اختيار:

```text
architecture diagram
```

يظهر React Flow.

---

# Monaco Editor

ادمج Monaco Editor لتوفير محرر ملفات داخل التطبيق.

يجب دعم:

* JSON
* Markdown
* Mermaid
* YAML لاحقًا

أضف:

* Syntax highlighting
* Formatting
* Validation
* Search
* Line numbers

---

# Markdown

يجب أن تكون ملفات Markdown مواطنًا من الدرجة الأولى داخل التطبيق.

مثال:

```md
# Checkout

## Purpose

Allows users to purchase products.

## Actors

- Customer

## Components

- Checkout Service
- Order Service
- Payment Service

## Flow

1. Customer submits checkout.
2. Order is created.
3. Payment is processed.
4. Order becomes paid.
```

اعرض Markdown بشكل جميل، مع دعم Mermaid.

---

# GitHub Integration

أضف:

```text
Sign in with GitHub
```

بعد تسجيل الدخول:

```text
Repositories
```

يستطيع المستخدم اختيار Repository.

لا تنسخ المشروع إلى قاعدة بيانات.

اقرأ الملفات مباشرة من GitHub.

---

# Git Operations

دعم:

```text
Read repository
Read file
Create file
Update file
Delete file
Create branch
Commit changes
Create Pull Request
```

ابدأ بالعمليات الأساسية:

```text
Read
Update
Commit
```

ثم أضف Branch وPull Request.

---

# Unsaved Changes

يجب أن يعرف التطبيق الفرق بين:

```text
GitHub version
```

و:

```text
Current editor state
```

أظهر:

```text
Unsaved changes
```

قبل مغادرة الصفحة.

---

# Git Diff

عند وجود تغييرات اعرض للمستخدم:

```text
Modified:
.software/components.json
.software/diagrams/system.json
docs/architecture/overview.md
```

ثم يستطيع مراجعة Diff قبل Commit.

---

# Validation

أنشئ نظام Validation.

اكتشف مثلاً:

```text
Missing node reference
Duplicate entity ID
Invalid relationship
Broken diagram reference
Invalid JSON
Unknown component
Circular dependency
```

اعرض المشاكل في:

```text
Problems Panel
```

مثل VS Code.

---

# AI Architecture Assistant

صمم Architecture تسمح لاحقًا بدمج AI.

لا تربط التطبيق بمزود AI واحد.

أنشئ abstraction:

```typescript
interface AIProvider {
  analyzeProject(): Promise<Analysis>
  generateDiagram(): Promise<Diagram>
  suggestArchitecture(): Promise<Suggestion[]>
  validateArchitecture(): Promise<Issue[]>
}
```

الـAI يجب أن يستطيع لاحقًا:

```text
Analyze Repository
Generate Architecture
Generate Diagram
Explain Architecture
Find Missing Relationships
Detect Architecture Drift
Generate Documentation
Update Documentation
```

لكن لا تجعل AI مطلوبًا لتشغيل التطبيق الأساسي.

---

# Codex وAntigravity Compatibility

يجب أن تكون الملفات الناتجة:

1. سهلة القراءة للإنسان.
2. سهلة القراءة لـCodex.
3. سهلة القراءة لـAntigravity.
4. مناسبة لـGit diff.
5. مستقرة في البنية.
6. غير مرتبطة بقاعدة بيانات.

لا تخزن البيانات بصيغة proprietary.

لا تستخدم binary format.

لا تجعل المخططات عبارة عن صور فقط.

الهدف:

```text
Developer
   ↓
JSON / Markdown
   ↓
GitHub
   ↓
Codex / Antigravity
   ↓
Source Code
```

وفي الاتجاه الآخر:

```text
Code
   ↓
Codex
   ↓
JSON / Markdown
   ↓
Software Architecture UI
```

---

# Import

أضف لاحقًا إمكانية:

```text
Import Mermaid
Import PlantUML
Import OpenAPI
Import SQL Schema
```

لكن لا تجعلها جزءًا إلزاميًا من MVP.

---

# Export

دعم:

```text
JSON
Markdown
Mermaid
SVG
PNG
PDF
```

يجب أن يكون SVG عالي الجودة وقابلًا للاستخدام في Documentation.

---

# Project Templates

أضف Templates:

```text
Blank Project
Web Application
REST API
Microservices
Next.js Application
Laravel Application
E-commerce
SaaS
Mobile Backend
```

عند اختيار Template يتم إنشاء ملفات `.software`.

---

# Command Palette

أضف:

```text
Ctrl/Cmd + K
```

وتحتوي:

```text
Create Diagram
Create Entity
Create Service
Create Component
Generate Architecture
Auto Layout
Validate Project
Open File
Search
Commit Changes
Create Pull Request
```

---

# Keyboard Shortcuts

أضف اختصارات شبيهة بالمحررات البرمجية:

```text
Ctrl/Cmd + S     Save
Ctrl/Cmd + K     Command Palette
Ctrl/Cmd + P     Quick Open
Delete           Delete node
Ctrl/Cmd + Z     Undo
Ctrl/Cmd + Shift + Z Redo
```

---

# جودة الكود

اتبع:

* Clean Architecture
* SOLID
* Strong typing
* Reusable components
* Small modules
* No duplicated logic
* No giant components
* No `any` إلا عند الضرورة القصوى
* Proper error handling
* Loading states
* Empty states
* Error states

افصل:

```text
UI
Domain Model
Diagram Engine
GitHub Integration
File Parser
Validation
AI
```

ولا تضع GitHub logic داخل React components.

---

# الأمان

GitHub OAuth يجب أن يستخدم أقل صلاحيات ممكنة.

لا تخزن GitHub access tokens في localStorage.

لا تعرض tokens للـclient إذا أمكن تجنب ذلك.

تحقق من جميع الملفات القادمة من GitHub قبل parsing.

لا تنفذ أي كود قادم من repository.

تعامل مع ملفات المشروع على أنها untrusted input.

---

# Vercel

يجب أن يكون المشروع جاهزًا للنشر على Vercel.

استخدم:

```text
Next.js
Vercel
GitHub OAuth
GitHub API
```

لا تعتمد على filesystem الخاص بـVercel لتخزين بيانات دائمة.

---

# MVP

لا تحاول بناء كل شيء دفعة واحدة.

المرحلة الأولى يجب أن تحتوي فقط على:

### GitHub

* Login
* Repository selection
* Read files
* Write files
* Commit

### Files

* `.software/project.json`
* `.software/components.json`
* `.software/entities.json`
* `.software/diagrams/*.json`
* Markdown documentation

### Diagrams

* Architecture
* ERD
* Flowchart
* Sequence
* Component

### Editor

* React Flow
* Custom Nodes
* Custom Edges
* Monaco
* Markdown viewer
* JSON editor

### UX

* File tree
* Canvas
* Inspector
* Problems panel
* Dark/Light mode
* Keyboard shortcuts

---

# ما لا يجب بناؤه في MVP

لا تضف:

* Database
* Team management
* Billing
* Chat
* Social features
* Complex permissions
* Cloud storage
* Real-time collaboration
* Mobile application
* Advanced AI agents

ركز على تجربة المطور الأساسية.

---

# معيار النجاح

بعد الانتهاء يجب أن أستطيع:

1. تسجيل الدخول باستخدام GitHub.
2. اختيار Repository.
3. إنشاء `.software/`.
4. إنشاء Architecture Diagram.
5. إضافة Services وDatabases وAPIs.
6. إنشاء العلاقات بينها.
7. حفظ الـdiagram كـJSON.
8. كتابة Markdown documentation.
9. تعديل JSON من Monaco.
10. رؤية التعديل مباشرة في React Flow.
11. تعديل المخطط بصريًا وتحديث JSON.
12. رؤية Git diff.
13. Commit التغييرات إلى GitHub.
14. فتح Repository من Codex وقراءة نفس الملفات.
15. تشغيل المشروع بالكامل على Vercel بدون قاعدة بيانات.

---

# قاعدة مهمة جدًا أثناء التطوير

لا تبدأ بكتابة عشرات الملفات والكود دفعة واحدة.

ابدأ بتحليل المتطلبات وإنشاء:

```text
ARCHITECTURE.md
DATA_MODEL.md
FILE_FORMAT.md
COMPONENTS.md
```

ثم نفّذ المشروع على مراحل صغيرة.

بعد كل مرحلة:

```text
Typecheck
Lint
Build
Test
```

وتأكد أن التطبيق يعمل قبل الانتقال للمرحلة التالية.

لا تستخدم حلولًا مؤقتة يصعب التخلص منها لاحقًا.

أريد كودًا production-ready وقابلًا للتوسع، مع الحفاظ على بساطة الـMVP.

# النتيجة المطلوبة

أريد منصة يشعر المستخدم أنها:

**"VS Code لهندسة البرمجيات والمخططات، ومتصلة مباشرة بـGitHub."**

المبدأ:

```text
Files are the source of truth.
GitHub is the project storage.
JSON describes the software model.
Markdown describes the knowledge.
React Flow visualizes the model.
Codex and Antigravity can read and modify the same files.
Vercel hosts the application.
No database.
```
