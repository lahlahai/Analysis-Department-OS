"use client";

import { useState, type ClipboardEvent } from "react";
import { ClipboardPaste, Plus, Trash2 } from "lucide-react";

interface TableData {
  columns: string[];
  rows: string[][];
}

interface DataTableEditorProps {
  path: string;
  value: string;
  onChange: (value: string) => void;
}

interface CellPosition {
  row: number;
  column: number;
}

const defaultColumns = ["العمود 1", "العمود 2", "العمود 3"];

function cellValue(value: unknown) {
  if (value === null || value === undefined) return "";
  return typeof value === "string" ? value : typeof value === "object" ? JSON.stringify(value) : String(value);
}

function normalizeTable(columns: string[], rows: string[][]): TableData {
  const width = Math.max(columns.length, ...rows.map((row) => row.length), 1);
  return {
    columns: Array.from({ length: width }, (_, index) => columns[index]?.trim() || `العمود ${index + 1}`),
    rows: rows.length ? rows.map((row) => Array.from({ length: width }, (_, index) => row[index] ?? "")) : [Array(width).fill("")],
  };
}

function splitDelimitedText(value: string) {
  const lines = value.replaceAll("\r", "").split("\n").filter((line) => line.length > 0);
  if (!lines.length) return [];
  const delimiter = lines.some((line) => line.includes("\t")) ? "\t" : ",";
  return lines.map((line) => line.split(delimiter).map((cell) => cell.trim()));
}

function tableFromArray(items: unknown[]): TableData {
  if (!items.length) return normalizeTable(defaultColumns, []);
  if (items.every((item) => Array.isArray(item))) {
    const matrix = items.map((item) => (item as unknown[]).map(cellValue));
    return normalizeTable(matrix[0] ?? defaultColumns, matrix.slice(1));
  }
  const records = items.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item));
  if (!records.length) return normalizeTable(["القيمة"], items.map((item) => [cellValue(item)]));
  const columns = Array.from(new Set(records.flatMap((record) => Object.keys(record))));
  return normalizeTable(columns, records.map((record) => columns.map((column) => cellValue(record[column]))));
}

function parseTableDocument(value: string): TableData {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const document = parsed as Record<string, unknown>;
      if (Array.isArray(document.columns) && Array.isArray(document.rows)) {
        return normalizeTable(document.columns.map(cellValue), document.rows.map((row) => Array.isArray(row) ? row.map(cellValue) : [cellValue(row)]));
      }
      const arrayProperty = Object.values(document).find((item) => Array.isArray(item));
      if (Array.isArray(arrayProperty)) return tableFromArray(arrayProperty);
      return normalizeTable(["الخاصية", "القيمة"], Object.entries(document).map(([key, item]) => [key, cellValue(item)]));
    }
    if (Array.isArray(parsed)) return tableFromArray(parsed);
  } catch {
    const matrix = splitDelimitedText(value);
    if (matrix.length) return normalizeTable(matrix[0], matrix.slice(1));
  }
  return normalizeTable(defaultColumns, []);
}

export function emptyDataTableDocument() {
  return `${JSON.stringify({ version: "1.0", columns: defaultColumns, rows: [Array(defaultColumns.length).fill("")] }, null, 2)}\n`;
}

function serializeTable(table: TableData) {
  return `${JSON.stringify({ version: "1.0", columns: table.columns, rows: table.rows }, null, 2)}\n`;
}

export function DataTableEditor({ path, value, onChange }: DataTableEditorProps) {
  const [table, setTable] = useState<TableData>(() => parseTableDocument(value));
  const [focusedCell, setFocusedCell] = useState<CellPosition>({ row: 0, column: 0 });

  function updateTable(next: TableData) {
    const normalized = normalizeTable(next.columns, next.rows);
    setTable(normalized);
    onChange(serializeTable(normalized));
  }

  function updateCell(row: number, column: number, valueToSet: string) {
    const rows = table.rows.map((current, rowIndex) => rowIndex === row ? current.map((cell, columnIndex) => columnIndex === column ? valueToSet : cell) : current);
    updateTable({ ...table, rows });
  }

  function addRow() {
    updateTable({ ...table, rows: [...table.rows, Array(table.columns.length).fill("")] });
    setFocusedCell({ row: table.rows.length, column: 0 });
  }

  function addColumn() {
    updateTable({ columns: [...table.columns, `العمود ${table.columns.length + 1}`], rows: table.rows.map((row) => [...row, ""]) });
  }

  function removeRow(rowIndex: number) {
    updateTable({ ...table, rows: table.rows.filter((_, index) => index !== rowIndex) });
  }

  function removeColumn(columnIndex: number) {
    if (table.columns.length === 1) return;
    updateTable({ columns: table.columns.filter((_, index) => index !== columnIndex), rows: table.rows.map((row) => row.filter((_, index) => index !== columnIndex)) });
  }

  function updateColumn(columnIndex: number, valueToSet: string) {
    updateTable({ ...table, columns: table.columns.map((column, index) => index === columnIndex ? valueToSet : column) });
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    const pastedText = event.clipboardData.getData("text/plain");
    if (!pastedText.includes("\t") && !pastedText.includes("\n")) return;
    event.preventDefault();
    const matrix = splitDelimitedText(pastedText);
    if (!matrix.length) return;
    const start = focusedCell;
    const width = Math.max(table.columns.length, start.column + Math.max(...matrix.map((row) => row.length)));
    const rows = table.rows.map((row) => [...row, ...Array(Math.max(0, width - row.length)).fill("")]);
    while (rows.length < start.row + matrix.length) rows.push(Array(width).fill(""));
    matrix.forEach((row, rowOffset) => row.forEach((cell, columnOffset) => { rows[start.row + rowOffset][start.column + columnOffset] = cell; }));
    updateTable({ columns: [...table.columns, ...Array(Math.max(0, width - table.columns.length)).fill("").map((_, index) => `العمود ${table.columns.length + index + 1}`)], rows });
  }

  return <div className="flex h-full min-h-0 flex-col bg-slate-50" dir="rtl" onPaste={handlePaste}>
    <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-5 py-3"><div><div className="text-sm font-semibold text-slate-900">جدول البيانات</div><div className="mt-0.5 font-mono text-[10px] text-slate-500" dir="ltr">{path}</div></div><div className="mr-auto flex items-center gap-2"><button type="button" onClick={addColumn} className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 transition hover:border-pink-300 hover:bg-pink-50 hover:text-pink-700"><Plus size={13} />عمود</button><button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 rounded-md bg-pink-600 px-2.5 py-1.5 text-xs text-white transition hover:bg-pink-700"><Plus size={13} />صف</button></div></div>
    <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 bg-pink-50 px-5 py-2 text-xs text-pink-800"><ClipboardPaste size={14} /><span>الصق خلايا Excel مباشرة داخل الجدول باستخدام Ctrl + V</span><span className="mr-auto text-[10px] text-pink-600">{table.rows.length} صف · {table.columns.length} أعمدة</span></div>
    <div className="min-h-0 flex-1 overflow-auto p-5"><div className="min-w-[720px] overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm"><table className="w-full border-collapse text-right text-xs"><thead><tr className="bg-slate-100">{table.columns.map((column, columnIndex) => <th key={`column-${columnIndex}`} className="border-b border-l border-slate-300 p-0"><div className="flex min-w-[150px] items-center"><span className="w-9 shrink-0 border-l border-slate-200 px-2 py-2 text-center text-[10px] font-normal text-slate-400">{String.fromCharCode(65 + columnIndex)}</span><input value={column} onChange={(event) => updateColumn(columnIndex, event.target.value)} className="min-w-0 flex-1 bg-transparent px-2 py-2 font-semibold text-slate-700 outline-none focus:bg-pink-50" aria-label={`اسم العمود ${columnIndex + 1}`} /><button type="button" onClick={() => removeColumn(columnIndex)} className="mr-1 rounded p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600" title="حذف العمود"><Trash2 size={12} /></button></div></th>)}</tr></thead><tbody>{table.rows.map((row, rowIndex) => <tr key={`row-${rowIndex}`} className="group border-b border-slate-200 last:border-0 hover:bg-pink-50/30"><td className="sticky right-0 w-12 border-l border-slate-200 bg-slate-50 px-2 py-2 text-center text-[10px] text-slate-400">{rowIndex + 1}</td>{table.columns.map((_, columnIndex) => <td key={`cell-${rowIndex}-${columnIndex}`} className="border-l border-slate-200 p-0"><input value={row[columnIndex] ?? ""} onFocus={() => setFocusedCell({ row: rowIndex, column: columnIndex })} onChange={(event) => updateCell(rowIndex, columnIndex, event.target.value)} className="block w-full min-w-[150px] bg-transparent px-2 py-2 text-slate-800 outline-none focus:bg-pink-50 focus:ring-1 focus:ring-inset focus:ring-pink-400" aria-label={`الصف ${rowIndex + 1}، العمود ${columnIndex + 1}`} /></td>)}<td className="w-9 p-1"><button type="button" onClick={() => removeRow(rowIndex)} className="rounded p-1 text-slate-300 opacity-0 transition hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100" title="حذف الصف"><Trash2 size={12} /></button></td></tr>)}</tbody></table></div><button type="button" onClick={addRow} className="mt-3 flex items-center gap-1.5 rounded-md border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-500 transition hover:border-pink-300 hover:bg-pink-50 hover:text-pink-700"><Plus size={13} />إضافة صف جديد</button></div>
  </div>;
}
