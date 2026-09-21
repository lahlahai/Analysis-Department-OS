"use client";

import dynamic from "next/dynamic";
import { FileJson, FileText } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false, loading: () => <div className="grid h-full place-items-center font-mono text-xs text-slate-500">Loading editor…</div> });

interface CodeEditorProps {
  path: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  fontSize?: number;
  direction?: "ltr" | "rtl";
}

export function CodeEditor({ path, value, onChange, readOnly = false, fontSize = 12, direction = "ltr" }: CodeEditorProps) {
  const language = path.endsWith(".json") ? "json" : "markdown";
  return <div className="flex h-full min-h-0 w-full flex-col bg-[#0d131c]" dir={direction}>
    <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2 font-mono text-[10px] text-slate-500" dir="ltr"><span className="text-cyan-300">{language === "json" ? <FileJson size={13} /> : <FileText size={13} />}</span>{path}<span className="ml-auto rounded bg-emerald-400/10 px-1.5 py-0.5 text-[9px] text-emerald-300">UTF-8</span></div>
    <div className={`min-h-0 min-w-0 flex-1 overflow-hidden ${direction === "rtl" ? "story-monaco-rtl" : ""}`} dir={direction}><MonacoEditor height="100%" width="100%" value={value} onChange={(next) => onChange(next ?? "")} language={language} theme="light" options={{ automaticLayout: true, minimap: { enabled: false }, lineNumbers: "on", lineNumbersMinChars: 3, glyphMargin: false, fontFamily: "'IBM Plex Sans Arabic', Arial, sans-serif", fontSize, lineHeight: Math.round(fontSize * 1.8), padding: { top: 16, bottom: 16 }, tabSize: 2, wordWrap: "on", scrollBeyondLastLine: false, renderLineHighlight: "gutter", readOnly }} /></div>
  </div>;
}
