"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bold,
  CloudUpload,
  Eye,
  FileText,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List as ListIcon,
  ListOrdered,
  Minus,
  Pencil,
  Plus,
  Redo2,
  RotateCcw,
  Table2,
  Undo2,
} from "lucide-react";
import type { ServiceUserStory } from "@/domain/types";

interface UserStoryDocumentViewProps {
  story: ServiceUserStory;
  onChange: (content: string) => void;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderInlineMarkdown(value: string) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/_([^_]+)_/g, "<em>$1</em>");
}

function splitTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableSeparator(line: string) {
  const cells = splitTableRow(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function markdownToHtml(markdown: string) {
  const lines = markdown.replaceAll("\r\n", "\n").split("\n");
  const blocks: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      blocks.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
      blocks.push("<hr>");
      index += 1;
      continue;
    }

    if (line.includes("|") && index + 1 < lines.length && isTableSeparator(lines[index + 1])) {
      const headers = splitTableRow(line);
      index += 2;
      const rows: string[][] = [];

      while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }

      blocks.push(
        `<div class="user-story-table-wrap"><table><thead><tr>${headers
          .map((cell) => `<th>${renderInlineMarkdown(cell)}</th>`)
          .join("")}</tr></thead><tbody>${rows
          .map(
            (row) =>
              `<tr>${headers
                .map((_, cellIndex) => `<td>${renderInlineMarkdown(row[cellIndex] ?? "")}</td>`)
                .join("")}</tr>`,
          )
          .join("")}</tbody></table></div>`,
      );
      continue;
    }

    const unordered = /^\s*[-+*]\s+(.+)$/.exec(line);
    const ordered = /^\s*\d+[.)]\s+(.+)$/.exec(line);
    if (unordered || ordered) {
      const listTag = unordered ? "ul" : "ol";
      const items: string[] = [];

      while (index < lines.length) {
        const match = listTag === "ul"
          ? /^\s*[-+*]\s+(.+)$/.exec(lines[index])
          : /^\s*\d+[.)]\s+(.+)$/.exec(lines[index]);
        if (!match) break;
        items.push(`<li>${renderInlineMarkdown(match[1])}</li>`);
        index += 1;
      }

      blocks.push(`<${listTag}>${items.join("")}</${listTag}>`);
      continue;
    }

    const paragraph: string[] = [line.trim()];
    index += 1;
    while (index < lines.length && lines[index].trim()) {
      const next = lines[index];
      if (
        /^(#{1,6})\s+/.test(next) ||
        /^\s*[-+*]\s+/.test(next) ||
        /^\s*\d+[.)]\s+/.test(next) ||
        /^\s*([-*_])(?:\s*\1){2,}\s*$/.test(next) ||
        (next.includes("|") && index + 1 < lines.length && isTableSeparator(lines[index + 1]))
      ) {
        break;
      }
      paragraph.push(next.trim());
      index += 1;
    }
    blocks.push(`<p>${paragraph.map(renderInlineMarkdown).join("<br>")}</p>`);
  }

  return blocks.join("");
}

function inlineHtmlToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
  if (!(node instanceof HTMLElement)) return "";

  const content = Array.from(node.childNodes).map(inlineHtmlToMarkdown).join("");
  const tag = node.tagName.toLowerCase();

  if (tag === "strong" || tag === "b") return `**${content}**`;
  if (tag === "em" || tag === "i") return `*${content}*`;
  if (tag === "code") return `\`${content}\``;
  if (tag === "br") return "\n";
  if (tag === "a") return `[${content}](${node.getAttribute("href") ?? ""})`;
  return content;
}

function listToMarkdown(list: HTMLElement, depth = 0): string[] {
  const ordered = list.tagName.toLowerCase() === "ol";
  const lines: string[] = [];
  const items = Array.from(list.children).filter((child) => child.tagName.toLowerCase() === "li");

  items.forEach((item, itemIndex) => {
    const content = Array.from(item.childNodes)
      .filter((child) => !(child instanceof HTMLElement && ["ul", "ol"].includes(child.tagName.toLowerCase())))
      .map(inlineHtmlToMarkdown)
      .join("")
      .trim();
    lines.push(`${"  ".repeat(depth)}${ordered ? `${itemIndex + 1}.` : "*"} ${content}`);

    Array.from(item.children)
      .filter((child) => ["ul", "ol"].includes(child.tagName.toLowerCase()))
      .forEach((nested) => lines.push(...listToMarkdown(nested as HTMLElement, depth + 1)));
  });

  return lines;
}

function tableToMarkdown(table: HTMLTableElement) {
  const rows = Array.from(table.rows).map((row) =>
    Array.from(row.cells).map((cell) => inlineHtmlToMarkdown(cell).replaceAll("|", "\\|").trim()),
  );
  if (!rows.length) return [];

  const columnCount = Math.max(...rows.map((row) => row.length));
  const normalizedRows = rows.map((row) => Array.from({ length: columnCount }, (_, index) => row[index] ?? ""));
  return [
    `| ${normalizedRows[0].join(" | ")} |`,
    `| ${Array.from({ length: columnCount }, () => "---").join(" | ")} |`,
    ...normalizedRows.slice(1).map((row) => `| ${row.join(" | ")} |`),
  ];
}

function editorHtmlToMarkdown(editor: HTMLElement) {
  const lines: string[] = [];

  const appendBlock = (blockLines: string[]) => {
    if (lines.length && lines.at(-1) !== "") lines.push("");
    lines.push(...blockLines, "");
  };

  Array.from(editor.children).forEach((element) => {
    const tag = element.tagName.toLowerCase();
    if (/^h[1-6]$/.test(tag)) {
      appendBlock([`${"#".repeat(Number(tag[1]))} ${inlineHtmlToMarkdown(element).trim()}`]);
    } else if (tag === "p" || tag === "div" && !element.classList.contains("user-story-table-wrap")) {
      appendBlock([inlineHtmlToMarkdown(element).trim()]);
    } else if (tag === "ul" || tag === "ol") {
      appendBlock(listToMarkdown(element as HTMLElement));
    } else if (tag === "hr") {
      appendBlock(["---"]);
    } else if (tag === "table") {
      appendBlock(tableToMarkdown(element as HTMLTableElement));
    } else if (element.classList.contains("user-story-table-wrap")) {
      const table = element.querySelector("table");
      if (table) appendBlock(tableToMarkdown(table));
    } else {
      appendBlock([inlineHtmlToMarkdown(element).trim()]);
    }
  });

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

export function UserStoryDocumentView({ story, onChange }: UserStoryDocumentViewProps) {
  const [fontSize, setFontSize] = useState(16);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const editorRef = useRef<HTMLDivElement>(null);
  const lastEmittedContent = useRef<string | null>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (mode !== "edit" || !editor) return;
    if (story.content === lastEmittedContent.current && editor.childNodes.length > 0) return;
    editor.innerHTML = markdownToHtml(story.content);
  }, [mode, story.content]);

  const decreaseFontSize = () => setFontSize((current) => Math.max(12, current - 1));
  const increaseFontSize = () => setFontSize((current) => Math.min(28, current + 1));

  const emitChange = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const markdown = editorHtmlToMarkdown(editor);
    lastEmittedContent.current = markdown;
    onChange(markdown);
  };

  const runCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    emitChange();
  };

  const insertTable = () => {
    runCommand(
      "insertHTML",
      '<div class="user-story-table-wrap"><table><thead><tr><th>عنوان العمود</th><th>عنوان العمود</th></tr></thead><tbody><tr><td>محتوى</td><td>محتوى</td></tr></tbody></table></div><p><br></p>',
    );
  };

  return (
    <div className="flex h-full min-h-[320px] w-full flex-col overflow-hidden bg-white" dir="rtl">
      <div className="flex min-h-12 shrink-0 items-center gap-2 border-b border-slate-200 bg-slate-900 px-3 font-sans text-[11px] text-slate-200 sm:px-4">
        <FileText size={14} className="text-[#e0c98d]" />
        <span className="truncate font-semibold">قصة المستخدم — طلب دمج عقارين</span>
        <button
          type="button"
          onClick={() => setMode((current) => current === "view" ? "edit" : "view")}
          className="mr-auto inline-flex shrink-0 items-center gap-1.5 rounded-md border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white transition hover:bg-white/15"
        >
          {mode === "view" ? <Pencil size={11} /> : <Eye size={11} />}
          {mode === "view" ? "تعديل النص" : "عرض المستند"}
        </button>
        <span className="hidden shrink-0 items-center gap-1.5 rounded-md bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-200 sm:flex">
          <CloudUpload size={11} /> الحفظ تلقائي
        </span>
        <div className="flex shrink-0 items-center gap-1 rounded-md border border-white/10 bg-white/5 p-0.5" aria-label="التحكم بحجم الخط">
          <button type="button" onClick={decreaseFontSize} disabled={fontSize <= 12} className="grid size-6 place-items-center rounded text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40" title="تصغير الخط" aria-label="تصغير الخط">
            <Minus size={13} />
          </button>
          <button type="button" onClick={() => setFontSize(16)} className="min-w-10 rounded px-1 text-center font-mono text-[10px] text-cyan-200 transition hover:bg-white/10" title="إعادة حجم الخط الافتراضي" aria-label="إعادة حجم الخط الافتراضي">
            {fontSize}px
          </button>
          <button type="button" onClick={increaseFontSize} disabled={fontSize >= 28} className="grid size-6 place-items-center rounded text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40" title="تكبير الخط" aria-label="تكبير الخط">
            <Plus size={13} />
          </button>
          <button type="button" onClick={() => setFontSize(16)} className="hidden size-6 place-items-center rounded text-slate-300 transition hover:bg-white/10 hover:text-white sm:grid" title="إعادة الحجم الافتراضي" aria-label="إعادة الحجم الافتراضي">
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {mode === "edit" && (
        <div className="flex min-h-10 shrink-0 items-center gap-1 overflow-x-auto border-b border-slate-200 bg-slate-50 px-3 py-1" aria-label="أدوات تنسيق النص">
          <EditorButton label="تراجع" onClick={() => runCommand("undo")}><Undo2 size={14} /></EditorButton>
          <EditorButton label="إعادة" onClick={() => runCommand("redo")}><Redo2 size={14} /></EditorButton>
          <span className="mx-1 h-5 w-px shrink-0 bg-slate-200" />
          <EditorButton label="عنوان رئيسي" onClick={() => runCommand("formatBlock", "h1")}><Heading1 size={15} /></EditorButton>
          <EditorButton label="عنوان ثانوي" onClick={() => runCommand("formatBlock", "h2")}><Heading2 size={15} /></EditorButton>
          <EditorButton label="عنوان فرعي" onClick={() => runCommand("formatBlock", "h3")}><Heading3 size={15} /></EditorButton>
          <span className="mx-1 h-5 w-px shrink-0 bg-slate-200" />
          <EditorButton label="خط عريض" onClick={() => runCommand("bold")}><Bold size={14} /></EditorButton>
          <EditorButton label="خط مائل" onClick={() => runCommand("italic")}><Italic size={14} /></EditorButton>
          <EditorButton label="قائمة نقطية" onClick={() => runCommand("insertUnorderedList")}><ListIcon size={15} /></EditorButton>
          <EditorButton label="قائمة مرقمة" onClick={() => runCommand("insertOrderedList")}><ListOrdered size={15} /></EditorButton>
          <EditorButton label="إدراج جدول" onClick={insertTable}><Table2 size={15} /></EditorButton>
        </div>
      )}

      <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-[#f4f5f7]">
        {mode === "view" ? (
          <article
            dir="rtl"
            lang="ar"
            aria-label="عرض قصة المستخدم"
            className="user-story-visual-editor absolute inset-0 overflow-auto bg-white px-6 py-6 text-right text-slate-900 sm:px-10 lg:px-[8%]"
            style={{ fontFamily: '"IBM Plex Sans Arabic", Arial, sans-serif', fontSize: `${fontSize}px` }}
            dangerouslySetInnerHTML={{ __html: markdownToHtml(story.content) }}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            dir="rtl"
            lang="ar"
            role="textbox"
            aria-multiline="true"
            aria-label="محرر مرئي لقصة المستخدم"
            data-placeholder="ابدأ بكتابة قصة المستخدم..."
            onInput={emitChange}
            onBlur={emitChange}
            className="user-story-visual-editor absolute inset-0 overflow-auto bg-white px-6 py-6 text-right text-slate-900 outline-none selection:bg-[#b49a63]/25 sm:px-10 lg:px-[8%]"
            style={{ fontFamily: '"IBM Plex Sans Arabic", Arial, sans-serif', fontSize: `${fontSize}px` }}
          />
        )}
      </div>
    </div>
  );
}

function EditorButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className="grid size-7 shrink-0 place-items-center rounded border border-transparent text-slate-600 transition hover:border-slate-200 hover:bg-white hover:text-slate-950 hover:shadow-xs"
      title={label}
      aria-label={label}
    >
      {children}
    </button>
  );
}
