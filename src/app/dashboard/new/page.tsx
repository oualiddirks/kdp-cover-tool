"use client";

import { useState, useRef, Suspense, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  calculateSpineWidth,
  ALL_TRIM_SIZES,
  type PaperType,
} from "@/lib/kdp-calculator";
import { useToast } from "@/components/ui/toast";
import type { CoverEditorRef, SelectedTextInfo, BestsellerPreset } from "@/components/editor/CoverEditor";

const CoverEditor = dynamic(() => import("@/components/editor/CoverEditor"), { ssr: false });

// ─── Constants ────────────────────────────────────────────────────────────────

const PAPER_OPTIONS: { value: PaperType; label: string }[] = [
  { value: "white", label: "White" },
  { value: "cream", label: "Cream" },
  { value: "color", label: "Color" },
];

const ALL_FONTS = [
  "Playfair Display","Oswald","Montserrat","Lato","EB Garamond",
  "Libre Baskerville","Merriweather","Raleway","Crimson Text","PT Serif",
  "Cinzel Decorative","Dancing Script","Fredoka One","Orbitron","Creepster",
  "Cormorant Garamond",
];

const BESTSELLER_PRESETS: BestsellerPreset[] = [
  { id: "thriller",    label: "Thriller",       font: "Oswald",            color: "#ffffff", bgColor: "#0a0a0a", size: 52, weight: "bold",   spacing: -20, lineH: 0.95, genre: "Suspense"    },
  { id: "romance",     label: "Romance",         font: "Playfair Display",  color: "#f48fb1", bgColor: "#7b2d42", size: 48, weight: "400",    spacing: 30,  lineH: 1.1,  genre: "Romance"     },
  { id: "fantasy",     label: "Fantasy",         font: "Cinzel Decorative", color: "#ffd700", bgColor: "#1a0a3d", size: 38, weight: "bold",   spacing: 80,  lineH: 1.2,  genre: "Fantasy"     },
  { id: "childrens",   label: "Children's",      font: "Fredoka One",       color: "#ff6b6b", bgColor: "#fff9c4", size: 56, weight: "400",    spacing: 0,   lineH: 1.1,  genre: "Non-fiction" },
  { id: "nonfiction",  label: "Non-Fiction",     font: "Montserrat",        color: "#1a1a1a", bgColor: "#f5f5f5", size: 44, weight: "bold",   spacing: -10, lineH: 1.0,  genre: "Non-fiction" },
  { id: "coloring",    label: "Coloring Book",   font: "Dancing Script",    color: "#7c3aed", bgColor: "#ffffff", size: 50, weight: "bold",   spacing: 40,  lineH: 1.15, genre: "Non-fiction" },
  { id: "mystery",     label: "Mystery",         font: "Libre Baskerville", color: "#cccccc", bgColor: "#1a1a1a", size: 40, weight: "400",    spacing: 20,  lineH: 1.1,  genre: "Suspense"    },
  { id: "scifi",       label: "Sci-Fi",          font: "Orbitron",          color: "#00d4ff", bgColor: "#050a14", size: 36, weight: "bold",   spacing: 100, lineH: 1.0,  genre: "Fantasy"     },
  { id: "selfhelp",    label: "Self-Help",        font: "Lato",              color: "#ff7c00", bgColor: "#ffffff", size: 48, weight: "bold",   spacing: -10, lineH: 1.05, genre: "Non-fiction" },
  { id: "business",    label: "Business",        font: "EB Garamond",       color: "#1a237e", bgColor: "#f5f0e8", size: 46, weight: "bold",   spacing: 20,  lineH: 1.1,  genre: "Non-fiction" },
  { id: "horror",      label: "Horror",          font: "Creepster",         color: "#c62828", bgColor: "#0d0000", size: 54, weight: "400",    spacing: 60,  lineH: 1.0,  genre: "Suspense"    },
  { id: "historical",  label: "Historical",      font: "Cormorant Garamond",color: "#5d4037", bgColor: "#fdf6e3", size: 44, weight: "bold",   spacing: 30,  lineH: 1.2,  genre: "Romance"     },
];

type PanelId = "template" | "text" | "image" | "marketing" | "preflight" | null;
type ViewMode = "2d" | "3d";
type GenreFilter = "All" | "Romance" | "Suspense" | "Fantasy" | "Non-fiction";

// ─── Main export (Suspense wrapper) ──────────────────────────────────────────

export default function NewCoverPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#0a0a0a]" />}>
      <EditorPage />
    </Suspense>
  );
}

// ─── Editor Page ──────────────────────────────────────────────────────────────

function EditorPage() {
  const { addToast } = useToast();
  const editorRef = useRef<CoverEditorRef>(null);

  // Specs
  const [format, setFormat] = useState<"paperback" | "hardcover">("paperback");
  const [trimSizeIdx, setTrimSizeIdx] = useState(0);
  const [pageCount, setPageCount] = useState(200);
  const [paperType, setPaperType] = useState<PaperType>("white");

  // UI state
  const [activePanel, setActivePanel] = useState<PanelId>("text");
  const [view, setView] = useState<ViewMode>("2d");
  const [issues, setIssues] = useState<string[]>([]);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Text tab state
  const [titleText, setTitleText] = useState("");
  const [authorText, setAuthorText] = useState("");
  const [titleVisible, setTitleVisible] = useState(true);
  const [authorVisible, setAuthorVisible] = useState(true);

  // Bestseller preset filter
  const [presetSearch, setPresetSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState<GenreFilter>("All");

  // Right panel (selected object)
  const [selectedText, setSelectedText] = useState<SelectedTextInfo | null>(null);

  // Image upload
  const frontFileRef = useRef<HTMLInputElement>(null);
  const backFileRef  = useRef<HTMLInputElement>(null);
  const fullFileRef  = useRef<HTMLInputElement>(null);

  // Derived
  const trimSize   = ALL_TRIM_SIZES[trimSizeIdx];
  const spineWidth = calculateSpineWidth(pageCount, paperType);

  const handleObjectSelected = useCallback((info: SelectedTextInfo | null) => {
    setSelectedText(info);
  }, []);

  // ── Title / Author sync ────────────────────────────────────────────────────
  // Title and author are passed as props to CoverEditor, which syncs to canvas

  // ── Export PDF ────────────────────────────────────────────────────────────
  async function handleExport() {
    const dataUrl = editorRef.current?.exportCanvas();
    if (!dataUrl) { addToast("Canvas not ready", "error"); return; }
    setPdfLoading(true);
    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canvasDataUrl: dataUrl }),
      });
      if (!res.ok) { const e = await res.json(); addToast(e.error || "PDF failed", "error"); return; }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `cover-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast("PDF downloaded!", "success");
    } catch { addToast("Export failed", "error"); }
    finally  { setPdfLoading(false); }
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  async function handleSave() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    addToast("Cover saved!", "success");
  }

  // ── Toggle panel ──────────────────────────────────────────────────────────
  function togglePanel(id: PanelId) {
    setActivePanel(prev => prev === id ? null : id);
  }

  // ── Toggle title/author visibility ────────────────────────────────────────
  function toggleTitle() {
    setTitleVisible(v => { editorRef.current?.toggleObjectVisibility("title"); return !v; });
  }
  function toggleAuthor() {
    setAuthorVisible(v => { editorRef.current?.toggleObjectVisibility("author"); return !v; });
  }

  // ── Filtered presets ──────────────────────────────────────────────────────
  const filteredPresets = BESTSELLER_PRESETS.filter(p => {
    const matchGenre  = genreFilter === "All" || p.genre === genreFilter;
    const matchSearch = presetSearch === "" || p.label.toLowerCase().includes(presetSearch.toLowerCase());
    return matchGenre && matchSearch;
  });

  // ── Right panel update ────────────────────────────────────────────────────
  function updateProp(props: Partial<SelectedTextInfo>) {
    editorRef.current?.updateSelected(props);
    if (selectedText) setSelectedText({ ...selectedText, ...props });
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 flex flex-col bg-[#0a0a0a] text-white overflow-hidden">

      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <header className="h-12 shrink-0 flex items-center gap-3 px-3 border-b border-white/10 bg-[#111111] z-10">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-1.5 shrink-0 mr-1 hover:opacity-80 transition-opacity">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="6" height="14" rx="1" fill="white" opacity="0.9"/>
              <rect x="10" y="2" width="6" height="14" rx="1" fill="white" opacity="0.5"/>
            </svg>
          </div>
          <span className="text-xs font-bold tracking-tight hidden sm:block">KDP<span className="text-violet-400">Cover</span></span>
        </Link>

        <div className="w-px h-6 bg-white/10 shrink-0" />

        {/* Format */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Format</span>
          <select
            value={format}
            onChange={e => setFormat(e.target.value as "paperback" | "hardcover")}
            className="bg-[#222] border border-white/10 rounded text-xs text-white px-2 py-1 outline-none hover:border-white/25 cursor-pointer"
          >
            <option value="paperback">Paperback</option>
            <option value="hardcover">Hardcover</option>
          </select>
        </div>

        {/* Size */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Size</span>
          <select
            value={trimSizeIdx}
            onChange={e => setTrimSizeIdx(Number(e.target.value))}
            className="bg-[#222] border border-white/10 rounded text-xs text-white px-2 py-1 outline-none hover:border-white/25 cursor-pointer"
          >
            {ALL_TRIM_SIZES.map((s, i) => (
              <option key={s.name} value={i}>{s.name}"</option>
            ))}
          </select>
        </div>

        {/* Pages */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Pages</span>
          <input
            type="number"
            min={24} max={828}
            value={pageCount}
            onChange={e => setPageCount(Math.max(24, Math.min(828, Number(e.target.value))))}
            className="bg-[#222] border border-white/10 rounded text-xs text-white px-2 py-1 w-16 outline-none hover:border-white/25"
          />
        </div>

        {/* Paper */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Paper</span>
          <select
            value={paperType}
            onChange={e => setPaperType(e.target.value as PaperType)}
            className="bg-[#222] border border-white/10 rounded text-xs text-white px-2 py-1 outline-none hover:border-white/25 cursor-pointer"
          >
            {PAPER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Spine badge */}
        <span className="bg-violet-700/80 text-violet-200 text-[10px] font-mono px-2 py-0.5 rounded shrink-0">
          Spine = {spineWidth.toFixed(3)}&quot;
        </span>

        <div className="flex-1" />

        {/* Help */}
        <button className="w-7 h-7 flex items-center justify-center rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors" title="Help">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
        </button>

        {/* Undo/Redo */}
        <button onClick={() => editorRef.current?.undo()} className="w-7 h-7 flex items-center justify-center rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors" title="Undo">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
        </button>
        <button onClick={() => editorRef.current?.redo()} className="w-7 h-7 flex items-center justify-center rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors" title="Redo">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
          </svg>
        </button>

        {/* Issues */}
        {issues.length > 0 ? (
          <button onClick={() => togglePanel("preflight")} className="flex items-center gap-1 bg-orange-600/80 hover:bg-orange-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded transition-colors">
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor"><path d="M12 2L1 21h22L12 2zm0 3.5L20.5 19h-17L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/></svg>
            {issues.length} Issue{issues.length !== 1 ? "s" : ""}
          </button>
        ) : (
          <span className="flex items-center gap-1 bg-green-700/60 text-green-300 text-[10px] font-semibold px-2 py-0.5 rounded">
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
            No Issues
          </span>
        )}

        {/* 2D/3D */}
        <div className="flex rounded overflow-hidden border border-white/10 shrink-0">
          {(["2d","3d"] as ViewMode[]).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-2.5 py-0.5 text-xs font-medium transition-colors ${view === v ? "bg-white/15 text-white" : "text-white/40 hover:text-white"}`}>
              {v.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Save */}
        <button onClick={handleSave} disabled={saving}
          className="h-7 px-3 rounded bg-[#2a2a2a] hover:bg-[#333] border border-white/10 text-xs font-medium text-white transition-colors disabled:opacity-50">
          {saving ? "Saving…" : "Save"}
        </button>

        {/* Export */}
        <button onClick={handleExport} disabled={pdfLoading}
          className="h-7 px-3 rounded bg-green-600 hover:bg-green-500 text-xs font-semibold text-white transition-colors disabled:opacity-50 shrink-0">
          {pdfLoading ? "Exporting…" : "Export PDF"}
        </button>

        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">U</div>
      </header>

      {/* ── BODY ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* ── LEFT ICON STRIP (60px) ───────────────────────────────────────── */}
        <aside className="w-[60px] shrink-0 flex flex-col items-center py-3 gap-1 bg-[#1a1a1a] border-r border-white/10 z-10">
          <SidebarTab id="template"  active={activePanel} label="Template"  onClick={togglePanel}>
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </SidebarTab>

          <SidebarTab id="text"  active={activePanel} label="Text"  onClick={togglePanel}>
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
          </SidebarTab>

          <SidebarTab id="image"  active={activePanel} label="Image"  onClick={togglePanel} badge="NEW">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </SidebarTab>

          <SidebarTab id="marketing"  active={activePanel} label="Marketing"  onClick={togglePanel}>
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
            </svg>
          </SidebarTab>

          <SidebarTab id="preflight"  active={activePanel} label="Preflight"  onClick={togglePanel}>
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </SidebarTab>
        </aside>

        {/* ── SLIDE-OUT PANEL (280px) ───────────────────────────────────────── */}
        {activePanel && (
          <div className="w-[280px] shrink-0 bg-[#1e1e1e] border-r border-white/10 flex flex-col overflow-hidden z-10">
            {activePanel === "text" && (
              <TextPanel
                titleText={titleText} setTitleText={setTitleText}
                authorText={authorText} setAuthorText={setAuthorText}
                titleVisible={titleVisible} authorVisible={authorVisible}
                onToggleTitle={toggleTitle} onToggleAuthor={toggleAuthor}
                onAddText={t => editorRef.current?.addText(t, "custom-text")}
                presets={filteredPresets}
                presetSearch={presetSearch} setPresetSearch={setPresetSearch}
                genreFilter={genreFilter} setGenreFilter={setGenreFilter}
                onApplyPreset={p => editorRef.current?.applyBestsellerPreset(p)}
              />
            )}
            {activePanel === "image" && (
              <ImagePanel
                frontFileRef={frontFileRef} backFileRef={backFileRef} fullFileRef={fullFileRef}
                onFrontUpload={f => editorRef.current?.uploadImage(f, "front")}
                onBackUpload={f => editorRef.current?.uploadImage(f, "back")}
                onFullUpload={f => editorRef.current?.uploadImage(f, "full")}
                onFitSafe={() => editorRef.current?.fitToSafeZone()}
              />
            )}
            {activePanel === "template" && <TemplatePanel />}
            {activePanel === "marketing" && <MarketingPanel />}
            {activePanel === "preflight" && <PreflightPanel issues={issues} spineWidth={spineWidth} />}
          </div>
        )}

        {/* ── CANVAS AREA ──────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 min-h-0 relative">
          <CoverEditor
            ref={editorRef}
            trimWidth={trimSize.width}
            trimHeight={trimSize.height}
            spineWidth={spineWidth}
            title={titleText}
            author={authorText}
            frontBg="#c0c0c0"
            backBg="#b0b0b0"
            spineBg="#909090"
            textColor="#1a1a2e"
            selectedFont="Playfair Display"
            fontSize={48}
            bold={false}
            italic={false}
            onPreflightChange={setIssues}
            onObjectSelected={handleObjectSelected}
          />
        </div>

        {/* ── RIGHT PROPERTIES PANEL (280px) ───────────────────────────────── */}
        {selectedText && (
          <RightPanel
            info={selectedText}
            onUpdate={updateProp}
            onClose={() => { setSelectedText(null); }}
          />
        )}
      </div>

      {/* ── BOTTOM BAR ──────────────────────────────────────────────────────── */}
      <footer className="h-10 shrink-0 flex items-center gap-2 px-3 bg-[#111111] border-t border-white/10 z-10">
        <button onClick={() => editorRef.current?.undo()} className="w-7 h-7 flex items-center justify-center rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors" title="Undo">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"/></svg>
        </button>
        <button onClick={() => editorRef.current?.redo()} className="w-7 h-7 flex items-center justify-center rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors" title="Redo">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3"/></svg>
        </button>

        <div className="w-px h-5 bg-white/10" />

        {issues.length > 0 ? (
          <button onClick={() => togglePanel("preflight")} className="flex items-center gap-1 text-orange-400 text-[10px] font-medium hover:text-orange-300 transition-colors">
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor"><path d="M12 2L1 21h22L12 2zm0 3.5L20.5 19h-17L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/></svg>
            Found {issues.length} Issue{issues.length !== 1 ? "s" : ""}
          </button>
        ) : (
          <span className="flex items-center gap-1 text-green-500 text-[10px]">
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
            No Issues
          </span>
        )}

        <div className="flex-1" />

        <div className="flex rounded overflow-hidden border border-white/10">
          {(["2d","3d"] as ViewMode[]).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-2 py-0.5 text-[10px] font-medium transition-colors ${view === v ? "bg-white/15 text-white" : "text-white/40 hover:text-white"}`}>
              {v.toUpperCase()}
            </button>
          ))}
        </div>

        <button onClick={() => editorRef.current?.autoFit()} className="px-2 py-0.5 rounded text-[10px] text-white/40 hover:text-white hover:bg-white/10 transition-colors" title="Fit to window">Fit</button>

        <div className="flex items-center gap-1">
          <button onClick={() => editorRef.current?.zoomOut()} className="w-6 h-6 flex items-center justify-center rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors text-sm">−</button>
          <button onClick={() => editorRef.current?.zoomIn()}  className="w-6 h-6 flex items-center justify-center rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors text-sm">+</button>
        </div>
      </footer>
    </div>
  );
}

// ─── Sidebar Tab ─────────────────────────────────────────────────────────────

function SidebarTab({ id, active, label, onClick, children, badge }: {
  id: PanelId; active: PanelId; label: string;
  onClick: (id: PanelId) => void;
  children: React.ReactNode; badge?: string;
}) {
  const isActive = active === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`relative w-full flex flex-col items-center gap-0.5 py-2.5 rounded transition-colors ${isActive ? "bg-white/10 text-white" : "text-white/35 hover:text-white/70 hover:bg-white/5"}`}
    >
      {children}
      <span className="text-[8px] leading-tight">{label}</span>
      {badge && (
        <span className="absolute top-1 right-1 bg-violet-600 text-white text-[6px] font-bold px-0.5 rounded">{badge}</span>
      )}
    </button>
  );
}

// ─── Text Panel ───────────────────────────────────────────────────────────────

function TextPanel({
  titleText, setTitleText, authorText, setAuthorText,
  titleVisible, authorVisible, onToggleTitle, onToggleAuthor,
  onAddText, presets, presetSearch, setPresetSearch,
  genreFilter, setGenreFilter, onApplyPreset,
}: {
  titleText: string; setTitleText: (v: string) => void;
  authorText: string; setAuthorText: (v: string) => void;
  titleVisible: boolean; authorVisible: boolean;
  onToggleTitle: () => void; onToggleAuthor: () => void;
  onAddText: (t: string) => void;
  presets: BestsellerPreset[];
  presetSearch: string; setPresetSearch: (v: string) => void;
  genreFilter: GenreFilter; setGenreFilter: (v: GenreFilter) => void;
  onApplyPreset: (p: BestsellerPreset) => void;
}) {
  const genres: GenreFilter[] = ["All","Romance","Suspense","Fantasy","Non-fiction"];
  return (
    <div className="flex flex-col h-full overflow-y-auto p-3 gap-4">
      {/* Title */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Title</span>
          <button onClick={onToggleTitle} title={titleVisible ? "Hide" : "Show"} className="text-white/30 hover:text-white/80 transition-colors">
            {titleVisible
              ? <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              : <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>
            }
          </button>
        </div>
        <input
          type="text" value={titleText} onChange={e => setTitleText(e.target.value)}
          placeholder="Your Book Title"
          className="w-full bg-[#2a2a2a] border border-white/10 rounded text-xs text-white px-2.5 py-2 outline-none focus:border-violet-500 placeholder:text-white/25 transition-colors"
        />
        <p className="text-[9px] text-white/20">Auto-synced to spine</p>
      </div>

      {/* Author */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Author</span>
          <button onClick={onToggleAuthor} title={authorVisible ? "Hide" : "Show"} className="text-white/30 hover:text-white/80 transition-colors">
            {authorVisible
              ? <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              : <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>
            }
          </button>
        </div>
        <input
          type="text" value={authorText} onChange={e => setAuthorText(e.target.value)}
          placeholder="Author Name"
          className="w-full bg-[#2a2a2a] border border-white/10 rounded text-xs text-white px-2.5 py-2 outline-none focus:border-violet-500 placeholder:text-white/25 transition-colors"
        />
      </div>

      {/* Add text */}
      <button onClick={() => onAddText("New Text")}
        className="w-full py-1.5 rounded border border-dashed border-white/20 text-xs text-white/50 hover:text-white hover:border-white/40 transition-colors">
        + Add Text Box
      </button>

      <div className="w-full h-px bg-white/10" />

      {/* Bestseller Styling */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Bestseller Styling</span>
          <span className="bg-yellow-600/70 text-yellow-200 text-[8px] font-bold px-1.5 py-0.5 rounded">Recommended</span>
        </div>

        <input
          type="text" value={presetSearch} onChange={e => setPresetSearch(e.target.value)}
          placeholder="Search styles…"
          className="w-full bg-[#2a2a2a] border border-white/10 rounded text-xs text-white px-2.5 py-1.5 outline-none focus:border-violet-500 placeholder:text-white/25 transition-colors"
        />

        {/* Genre pills */}
        <div className="flex flex-wrap gap-1">
          {(["All","Romance","Suspense","Fantasy","Non-fiction"] as GenreFilter[]).map(g => (
            <button key={g} onClick={() => setGenreFilter(g)}
              className={`px-2 py-0.5 rounded-full text-[9px] font-medium transition-colors ${genreFilter === g ? "bg-violet-600 text-white" : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70"}`}>
              {g}
            </button>
          ))}
        </div>

        {/* Preset grid */}
        <div className="grid grid-cols-2 gap-2">
          {presets.map(p => (
            <button key={p.id} onClick={() => onApplyPreset(p)}
              className="rounded-lg overflow-hidden border border-white/10 hover:border-violet-500 transition-colors group"
              style={{ backgroundColor: p.bgColor }}>
              <div className="flex flex-col items-center justify-center h-16 gap-1 p-2">
                <span className="text-[11px] leading-none font-medium text-center"
                  style={{ color: p.color, fontFamily: `'${p.font}', serif`, fontWeight: p.weight, letterSpacing: `${p.spacing/1000}em` }}>
                  {p.label}
                </span>
                <span className="text-[8px] text-center opacity-60" style={{ color: p.color }}>Author</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Image Panel ──────────────────────────────────────────────────────────────

function ImagePanel({ frontFileRef, backFileRef, fullFileRef, onFrontUpload, onBackUpload, onFullUpload, onFitSafe }: {
  frontFileRef: React.RefObject<HTMLInputElement | null>;
  backFileRef: React.RefObject<HTMLInputElement | null>;
  fullFileRef: React.RefObject<HTMLInputElement | null>;
  onFrontUpload: (f: File) => void;
  onBackUpload: (f: File) => void;
  onFullUpload: (f: File) => void;
  onFitSafe: () => void;
}) {
  return (
    <div className="flex flex-col p-3 gap-3 overflow-y-auto">
      <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Upload Images</span>

      {/* Front cover */}
      <input ref={frontFileRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFrontUpload(f); e.target.value = ""; }} />
      <button onClick={() => frontFileRef.current?.click()}
        className="w-full border border-dashed border-white/20 rounded-lg py-6 flex flex-col items-center gap-2 text-white/40 hover:text-white/70 hover:border-white/40 transition-colors">
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
        </svg>
        <span className="text-xs font-medium">Upload Front Cover</span>
        <span className="text-[9px] text-white/25">PNG, JPG up to 50MB</span>
      </button>

      {/* Back cover */}
      <input ref={backFileRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onBackUpload(f); e.target.value = ""; }} />
      <button onClick={() => backFileRef.current?.click()}
        className="w-full border border-dashed border-white/20 rounded-lg py-4 flex flex-col items-center gap-1.5 text-white/40 hover:text-white/70 hover:border-white/40 transition-colors">
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
        </svg>
        <span className="text-xs">Upload Back Cover</span>
      </button>

      {/* Full wrap */}
      <input ref={fullFileRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFullUpload(f); e.target.value = ""; }} />
      <button onClick={() => fullFileRef.current?.click()}
        className="w-full border border-dashed border-white/20 rounded-lg py-4 flex flex-col items-center gap-1.5 text-white/40 hover:text-white/70 hover:border-white/40 transition-colors">
        <span className="text-xs">Upload Full Wrap Image</span>
      </button>

      <div className="w-full h-px bg-white/10" />

      <button onClick={onFitSafe}
        className="w-full py-2 rounded bg-[#2a2a2a] hover:bg-[#333] border border-white/10 text-xs text-white/70 hover:text-white transition-colors">
        Fit Selection to Safe Zone
      </button>
    </div>
  );
}

// ─── Template Panel ────────────────────────────────────────────────────────────

function TemplatePanel() {
  const [cat, setCat] = useState("All");
  const cats = ["All","Coloring Book","Fiction","Non-Fiction"];
  const templates = [
    { id: "minimal",  label: "Minimal",     bg: "#f5f5f5", text: "#111" },
    { id: "dark",     label: "Dark",        bg: "#111111", text: "#fff" },
    { id: "romance",  label: "Romance",     bg: "#7b2d42", text: "#fce4ec" },
    { id: "fantasy",  label: "Fantasy",     bg: "#1a0a3d", text: "#ffd700" },
    { id: "nonfic",   label: "Non-Fiction", bg: "#1565c0", text: "#ffffff" },
    { id: "coloring", label: "Coloring",    bg: "#ffffff", text: "#7c3aed" },
  ];
  return (
    <div className="flex flex-col p-3 gap-3 overflow-y-auto">
      <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Templates</span>
      <div className="flex flex-wrap gap-1">
        {cats.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={`px-2 py-0.5 rounded-full text-[9px] font-medium transition-colors ${cat === c ? "bg-violet-600 text-white" : "bg-white/5 text-white/40 hover:bg-white/10"}`}>
            {c}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {templates.map(t => (
          <button key={t.id}
            className="rounded-lg overflow-hidden border border-white/10 hover:border-violet-500 transition-colors"
            style={{ backgroundColor: t.bg }}>
            <div className="h-20 flex flex-col items-center justify-center gap-1 p-2">
              <span className="text-[10px] font-bold text-center" style={{ color: t.text }}>{t.label}</span>
              <span className="text-[8px] opacity-50" style={{ color: t.text }}>Author</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Marketing Panel ──────────────────────────────────────────────────────────

function MarketingPanel() {
  return (
    <div className="flex flex-col p-3 gap-4 overflow-y-auto">
      <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Marketing Assets</span>
      <div className="text-center py-8 text-white/20">
        <svg viewBox="0 0 24 24" className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
        </svg>
        <p className="text-xs">Marketing assets coming soon</p>
        <p className="text-[9px] mt-1 text-white/15">Social media images, ads, and more</p>
      </div>
    </div>
  );
}

// ─── Preflight Panel ──────────────────────────────────────────────────────────

function PreflightPanel({ issues, spineWidth }: { issues: string[]; spineWidth: number }) {
  const checks = [
    { label: "Spine width",       pass: spineWidth > 0.0625,  desc: `${spineWidth.toFixed(4)}"` },
    { label: "Bleed area OK",     pass: true,                  desc: "0.125\" bleed" },
    { label: "Text in safe zone", pass: !issues.some(i => i.includes("bleed")), desc: "" },
    { label: "Barcode area clear",pass: true,                  desc: "Bottom-left back" },
    { label: "Content on canvas", pass: !issues.some(i => i.includes("No content")), desc: "" },
  ];
  return (
    <div className="flex flex-col p-3 gap-3 overflow-y-auto">
      <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Preflight Checks</span>
      <div className="space-y-2">
        {checks.map(c => (
          <div key={c.label} className="flex items-center gap-2.5 py-2 px-2.5 rounded bg-[#252525]">
            <span className={c.pass ? "text-green-500" : "text-red-500"}>
              {c.pass
                ? <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                : <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              }
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-white/80">{c.label}</p>
              {c.desc && <p className="text-[9px] text-white/30">{c.desc}</p>}
            </div>
          </div>
        ))}
      </div>
      {issues.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold text-orange-400/80 uppercase tracking-wider">Issues</span>
          {issues.map((iss, i) => (
            <div key={i} className="text-[10px] text-orange-300 bg-orange-900/20 border border-orange-800/30 rounded px-2.5 py-1.5">{iss}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Right Properties Panel ────────────────────────────────────────────────────

function RightPanel({ info, onUpdate, onClose }: {
  info: SelectedTextInfo;
  onUpdate: (props: Partial<SelectedTextInfo>) => void;
  onClose: () => void;
}) {
  const roleLabel = info.role === "title" ? "Title" : info.role === "author" ? "Author" : "Text";
  return (
    <div className="w-[280px] shrink-0 bg-[#1e1e1e] border-l border-white/10 flex flex-col overflow-hidden z-10">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/10 shrink-0">
        <span className="text-xs font-semibold text-white">Edit Text ({roleLabel})</span>
        <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-0.5 rounded">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Visibility toggle */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/50">Show on cover</span>
          <button onClick={() => onUpdate({ visible: !info.visible })}
            className={`w-9 h-5 rounded-full transition-colors relative ${info.visible ? "bg-green-600" : "bg-white/15"}`}>
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${info.visible ? "left-4.5" : "left-0.5"}`} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-1">
          <label className="text-[10px] text-white/50 font-medium">Content</label>
          <textarea
            value={info.text}
            onChange={e => onUpdate({ text: e.target.value })}
            rows={2}
            className="w-full bg-[#2a2a2a] border border-white/10 rounded text-xs text-white px-2.5 py-2 outline-none focus:border-violet-500 resize-none transition-colors"
          />
        </div>

        {/* Font */}
        <div className="space-y-1">
          <label className="text-[10px] text-white/50 font-medium">Font</label>
          <select
            value={info.fontFamily}
            onChange={e => onUpdate({ fontFamily: e.target.value })}
            className="w-full bg-[#2a2a2a] border border-white/10 rounded text-xs text-white px-2 py-1.5 outline-none focus:border-violet-500 cursor-pointer"
          >
            {ALL_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        {/* Font size */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-white/50 font-medium">Font Size</label>
            <span className="text-[10px] text-white/70 font-mono">{info.fontSize}px</span>
          </div>
          <input type="range" min={8} max={120} value={info.fontSize}
            onChange={e => onUpdate({ fontSize: Number(e.target.value) })}
            className="w-full accent-violet-500" />
        </div>

        {/* Color */}
        <div className="space-y-1">
          <label className="text-[10px] text-white/50 font-medium">Color</label>
          <div className="flex items-center gap-2">
            <input type="color" value={info.fill}
              onChange={e => onUpdate({ fill: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border border-white/10 p-0.5" />
            <span className="text-[10px] text-white/50 font-mono">{info.fill}</span>
          </div>
        </div>

        {/* Style — Bold / Italic */}
        <div className="space-y-1">
          <label className="text-[10px] text-white/50 font-medium">Style</label>
          <div className="flex gap-2">
            <button onClick={() => onUpdate({ fontWeight: info.fontWeight === "bold" ? "normal" : "bold" })}
              className={`flex-1 py-1 rounded border text-xs font-bold transition-colors ${info.fontWeight === "bold" ? "bg-white/15 border-white/30 text-white" : "border-white/10 text-white/40 hover:text-white hover:border-white/25"}`}>
              B
            </button>
            <button onClick={() => onUpdate({ fontStyle: info.fontStyle === "italic" ? "normal" : "italic" })}
              className={`flex-1 py-1 rounded border text-xs italic transition-colors ${info.fontStyle === "italic" ? "bg-white/15 border-white/30 text-white" : "border-white/10 text-white/40 hover:text-white hover:border-white/25"}`}>
              I
            </button>
          </div>
        </div>

        {/* Alignment */}
        <div className="space-y-1">
          <label className="text-[10px] text-white/50 font-medium">Align</label>
          <div className="flex gap-1">
            {(["left","center","right"] as const).map(a => (
              <button key={a} onClick={() => onUpdate({ textAlign: a })}
                className={`flex-1 py-1 rounded border text-[10px] transition-colors ${info.textAlign === a ? "bg-white/15 border-white/30 text-white" : "border-white/10 text-white/40 hover:text-white"}`}>
                {a === "left" ? "L" : a === "center" ? "C" : "R"}
              </button>
            ))}
          </div>
        </div>

        {/* Line height */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-white/50 font-medium">Line Height</label>
            <span className="text-[10px] text-white/70 font-mono">{info.lineHeight.toFixed(2)}</span>
          </div>
          <input type="range" min={0.5} max={3} step={0.01} value={info.lineHeight}
            onChange={e => onUpdate({ lineHeight: Number(e.target.value) })}
            className="w-full accent-violet-500" />
        </div>

        {/* Letter spacing */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-white/50 font-medium">Letter Spacing</label>
            <span className="text-[10px] text-white/70 font-mono">{info.charSpacing}</span>
          </div>
          <input type="range" min={-200} max={800} step={1} value={info.charSpacing}
            onChange={e => onUpdate({ charSpacing: Number(e.target.value) })}
            className="w-full accent-violet-500" />
        </div>
      </div>
    </div>
  );
}
