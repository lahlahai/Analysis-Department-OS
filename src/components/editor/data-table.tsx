"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { ClipboardPaste, Plus, Trash2 } from "lucide-react";

interface TableData {
  columns: string[];
  rows: string[][];
  columnWidths: number[];
  rowHeights: number[];
}

type TableMetadata = Record<string, unknown>;

interface DataTableEditorProps {
  path: string;
  value: string;
  onChange: (value: string) => void;
}

interface CellPosition {
  row: number;
  column: number;
}

interface ResizeState {
  type: "column" | "row";
  index: number;
  startPosition: number;
  initialSize: number;
}

const defaultColumns = ["العمود 1", "العمود 2", "العمود 3"];
const DEFAULT_COLUMN_WIDTH = 180;
const MIN_COLUMN_WIDTH = 90;
const MAX_COLUMN_WIDTH = 600;
const DEFAULT_ROW_HEIGHT = 36;
const MIN_ROW_HEIGHT = 26;
const MAX_ROW_HEIGHT = 240;

function cellValue(value: unknown) {
  if (value === null || value === undefined) return "";
  return typeof value === "string" ? value : typeof value === "object" ? JSON.stringify(value) : String(value);
}

function boundedSize(value: unknown, fallback: number, minimum: number, maximum: number) {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? Math.min(maximum, Math.max(minimum, Math.round(numberValue))) : fallback;
}

function normalizeTable(columns: string[], rows: string[][], columnWidths: number[] = [], rowHeights: number[] = []): TableData {
  const width = Math.max(columns.length, ...rows.map((row) => row.length), 1);
  const normalizedRows = rows.length
    ? rows.map((row) => Array.from({ length: width }, (_, index) => row[index] ?? ""))
    : [Array(width).fill("")];

  return {
    columns: Array.from({ length: width }, (_, index) => columns[index]?.trim() || `العمود ${index + 1}`),
    rows: normalizedRows,
    columnWidths: Array.from({ length: width }, (_, index) => boundedSize(columnWidths[index], DEFAULT_COLUMN_WIDTH, MIN_COLUMN_WIDTH, MAX_COLUMN_WIDTH)),
    rowHeights: Array.from({ length: normalizedRows.length }, (_, index) => boundedSize(rowHeights[index], DEFAULT_ROW_HEIGHT, MIN_ROW_HEIGHT, MAX_ROW_HEIGHT)),
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
        return normalizeTable(
          document.columns.map(cellValue),
          document.rows.map((row) => Array.isArray(row) ? row.map(cellValue) : [cellValue(row)]),
          Array.isArray(document.columnWidths) ? document.columnWidths : [],
          Array.isArray(document.rowHeights) ? document.rowHeights : [],
        );
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

function readTableMetadata(value: string): TableMetadata {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const metadata = { ...(parsed as TableMetadata) };
    delete metadata.version;
    delete metadata.columns;
    delete metadata.rows;
    delete metadata.columnWidths;
    delete metadata.rowHeights;
    return metadata;
  } catch {
    return {};
  }
}

export function emptyDataTableDocument() {
  return `${JSON.stringify({
    version: "1.0",
    links: [],
    columns: defaultColumns,
    rows: [Array(defaultColumns.length).fill("")],
    columnWidths: defaultColumns.map(() => DEFAULT_COLUMN_WIDTH),
    rowHeights: [DEFAULT_ROW_HEIGHT],
  }, null, 2)}\n`;
}

function serializeTable(table: TableData, metadata: TableMetadata = {}) {
  return `${JSON.stringify({
    ...metadata,
    version: "1.0",
    columns: table.columns,
    rows: table.rows,
    columnWidths: table.columnWidths,
    rowHeights: table.rowHeights,
  }, null, 2)}\n`;
}

export function DataTableEditor({ path, value, onChange }: DataTableEditorProps) {
  const [table, setTable] = useState<TableData>(() => parseTableDocument(value));
  const [focusedCell, setFocusedCell] = useState<CellPosition>({ row: 0, column: 0 });
  const [resizeCursor, setResizeCursor] = useState<"col-resize" | "row-resize" | "">("");
  const tableRef = useRef(table);
  const resizeRef = useRef<ResizeState | null>(null);
  const metadataRef = useRef<TableMetadata>(readTableMetadata(value));

  useEffect(() => {
    metadataRef.current = readTableMetadata(value);
  }, [value]);

  useEffect(() => {
    tableRef.current = table;
  }, [table]);

  useEffect(() => {
    document.body.style.cursor = resizeCursor;
    document.body.style.userSelect = resizeCursor ? "none" : "";
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [resizeCursor]);

  useEffect(() => {
    function resize(event: PointerEvent) {
      const resizeState = resizeRef.current;
      if (!resizeState) return;

      const current = tableRef.current;
      const position = resizeState.type === "column" ? event.clientX : event.clientY;
      const direction = resizeState.type === "column" ? -1 : 1;
      const nextSize = boundedSize(
        resizeState.initialSize + (position - resizeState.startPosition) * direction,
        resizeState.initialSize,
        resizeState.type === "column" ? MIN_COLUMN_WIDTH : MIN_ROW_HEIGHT,
        resizeState.type === "column" ? MAX_COLUMN_WIDTH : MAX_ROW_HEIGHT,
      );

      const next = resizeState.type === "column"
        ? { ...current, columnWidths: current.columnWidths.map((width, index) => index === resizeState.index ? nextSize : width) }
        : { ...current, rowHeights: current.rowHeights.map((height, index) => index === resizeState.index ? nextSize : height) };
      tableRef.current = next;
      setTable(next);
      onChange(serializeTable(next, metadataRef.current));
    }

    function stopResize() {
      resizeRef.current = null;
      setResizeCursor("");
    }

    window.addEventListener("pointermove", resize);
    window.addEventListener("pointerup", stopResize);
    return () => {
      window.removeEventListener("pointermove", resize);
      window.removeEventListener("pointerup", stopResize);
    };
  }, [onChange]);

  function updateTable(next: TableData) {
    const normalized = normalizeTable(next.columns, next.rows, next.columnWidths, next.rowHeights);
    tableRef.current = normalized;
    setTable(normalized);
    onChange(serializeTable(normalized, metadataRef.current));
  }

  function beginResize(event: ReactPointerEvent<HTMLButtonElement>, type: ResizeState["type"], index: number) {
    event.preventDefault();
    event.stopPropagation();
    resizeRef.current = {
      type,
      index,
      startPosition: type === "column" ? event.clientX : event.clientY,
      initialSize: type === "column" ? table.columnWidths[index] : table.rowHeights[index],
    };
    setResizeCursor(type === "column" ? "col-resize" : "row-resize");
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
    updateTable({
      ...table,
      columns: [...table.columns, `العمود ${table.columns.length + 1}`],
      rows: table.rows.map((row) => [...row, ""]),
    });
  }

  function removeRow(rowIndex: number) {
    updateTable({ ...table, rows: table.rows.filter((_, index) => index !== rowIndex), rowHeights: table.rowHeights.filter((_, index) => index !== rowIndex) });
  }

  function removeColumn(columnIndex: number) {
    if (table.columns.length === 1) return;
    updateTable({
      ...table,
      columns: table.columns.filter((_, index) => index !== columnIndex),
      rows: table.rows.map((row) => row.filter((_, index) => index !== columnIndex)),
      columnWidths: table.columnWidths.filter((_, index) => index !== columnIndex),
    });
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
    updateTable({
      ...table,
      columns: [...table.columns, ...Array(Math.max(0, width - table.columns.length)).fill("").map((_, index) => `العمود ${table.columns.length + index + 1}`)],
      rows,
    });
  }

  const tableWidth = 40 + table.columnWidths.reduce((total, width) => total + width, 0);

  return (
    <div className="official-data-table flex h-full min-h-0 flex-col bg-slate-50" dir="rtl" onPaste={handlePaste}>
      <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-5 py-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">جدول البيانات</div>
          <div className="mt-0.5 font-mono text-[10px] text-slate-500" dir="ltr">{path}</div>
        </div>
        <div className="mr-auto flex items-center gap-2">
          <button type="button" onClick={addColumn} className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 transition hover:border-pink-300 hover:bg-pink-50 hover:text-pink-700"><Plus size={13} />عمود</button>
          <button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 rounded-md bg-pink-600 px-2.5 py-1.5 text-xs text-white transition hover:bg-pink-700"><Plus size={13} />صف</button>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 bg-pink-50 px-5 py-2 text-xs text-pink-800">
        <ClipboardPaste size={14} />
        <span>الصق خلايا Excel مباشرة داخل الجدول باستخدام Ctrl + V</span>
        <span className="mr-auto text-[10px] text-pink-600">{table.rows.length} صف · {table.columns.length} أعمدة</span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-5">
        <div className="w-max min-w-full overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
          <table className="table-fixed border-collapse text-right text-xs" dir="rtl" style={{ width: tableWidth }}>
            <colgroup>
              {table.columnWidths.map((width, columnIndex) => <col key={`column-size-${columnIndex}`} style={{ width }} />)}
              <col style={{ width: 40 }} />
            </colgroup>
            <thead>
              <tr className="bg-slate-100">
                {table.columns.map((column, columnIndex) => (
                  <th key={`column-${columnIndex}`} className="border-b border-l border-slate-300 p-0" style={{ width: table.columnWidths[columnIndex] }}>
                    <div className="relative flex h-10 min-w-0 items-center">
                      <span className="w-9 shrink-0 border-l border-slate-200 px-2 py-2 text-center text-[10px] font-normal text-slate-400">{String.fromCharCode(65 + columnIndex)}</span>
                      <input value={column} onChange={(event) => updateColumn(columnIndex, event.target.value)} className="min-w-0 flex-1 bg-transparent px-2 py-2 font-semibold text-slate-700 outline-none focus:bg-pink-50" aria-label={`اسم العمود ${columnIndex + 1}`} />
                      <button type="button" onClick={() => removeColumn(columnIndex)} className="mr-1 shrink-0 rounded p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600" title="حذف العمود"><Trash2 size={12} /></button>
                      <button type="button" onPointerDown={(event) => beginResize(event, "column", columnIndex)} className="absolute inset-y-0 left-0 z-20 w-2 cursor-col-resize touch-none bg-transparent transition hover:bg-pink-400" aria-label={`تغيير عرض العمود ${columnIndex + 1}`} title="اسحب لتغيير عرض العمود" />
                    </div>
                  </th>
                ))}
                <th className="border-b border-slate-300 p-0" aria-label="إجراءات الصف" />
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`} className="group border-b border-slate-200 last:border-0 hover:bg-pink-50/30" style={{ height: table.rowHeights[rowIndex] }}>
                  {table.columns.map((_, columnIndex) => (
                    <td key={`cell-${rowIndex}-${columnIndex}`} className="border-l border-slate-200 p-0" style={{ width: table.columnWidths[columnIndex] }}>
                      <input value={row[columnIndex] ?? ""} onFocus={() => setFocusedCell({ row: rowIndex, column: columnIndex })} onChange={(event) => updateCell(rowIndex, columnIndex, event.target.value)} className="block h-full min-h-[26px] w-full min-w-0 bg-transparent px-2 py-2 text-slate-800 outline-none focus:bg-pink-50 focus:ring-1 focus:ring-inset focus:ring-pink-400" aria-label={`الصف ${rowIndex + 1}، العمود ${columnIndex + 1}`} />
                    </td>
                  ))}
                  <td className="relative w-10 p-1 text-center"><button type="button" onClick={() => removeRow(rowIndex)} className="rounded p-1 text-slate-300 opacity-0 transition hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100" title="حذف الصف"><Trash2 size={12} /></button><button type="button" onPointerDown={(event) => beginResize(event, "row", rowIndex)} className="absolute inset-x-0 bottom-0 z-20 h-2 cursor-row-resize touch-none bg-transparent transition hover:bg-pink-400" aria-label={`تغيير ارتفاع الصف ${rowIndex + 1}`} title="اسحب لتغيير ارتفاع الصف" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" onClick={addRow} className="mt-3 flex items-center gap-1.5 rounded-md border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-500 transition hover:border-pink-300 hover:bg-pink-50 hover:text-pink-700"><Plus size={13} />إضافة صف جديد</button>
        <p className="mt-2 text-[10px] text-slate-400">اسحب الحد الأيسر من عنوان العمود لتغيير عرضه، أو الحد السفلي للصف لتغيير ارتفاعه.</p>
      </div>
    </div>
  );
}
