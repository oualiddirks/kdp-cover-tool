"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import {
  calculateSpineWidth,
  calculateFullCoverWidth,
  calculateFullCoverHeight,
  ALL_TRIM_SIZES,
  type PaperType,
} from "@/lib/kdp-calculator";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";
import type { CoverEditorRef } from "@/components/editor/CoverEditor";

const CoverEditor = dynamic(
  () => import("@/components/editor/CoverEditor"),
  { ssr: false }
);

const PRESETS = [
  { id: "thriller",   label: "Thriller",      bg: "#0a0a0a", textColor: "#ffffff", font: "Oswald",          spine: "#1a1a1a" },
  { id: "romance",    label: "Romance",        bg: "#7b2d42", textColor: "#fce4ec", font: "Playfair Display", spine: "#5a1f30" },
  { id: "fantasy",    label: "Fantasy",        bg: "#1a0a3d", textColor: "#ffd700", font: "EB Garamond",      spine: "#110728" },
  { id: "childrens",  label: "Children's",     bg: "#ff6b6b", textColor: "#ffffff", font: "Raleway",          spine: "#e05050" },
  { id: "nonfiction", label: "Non-Fiction",    bg: "#f5f5f5", textColor: "#1a1a1a", font: "Montserrat",       spine: "#dddddd" },
  { id: "coloring",   label: "Coloring Book",  bg: "#ffffff", textColor: "#2d2d2d", font: "Crimson Text",     spine: "#eeeeee" },
];

const FONTS = [
  "Playfair Display","Merriweather","Oswald","Raleway","Crimson Text",
  "Lato","Montserrat","EB Garamond","Libre Baskerville","Bebas Neue","PT Serif",
];

const PAPER_OPTIONS: { value: PaperType; label: string }[] = [
  { value: "white", label: "White" },
  { value: "cream", label: "Cream" },
  { value: "color", label: "Color" },
];

type PanelId = "template" | "text" | "image" | "bg" | "preflight" | null;

export default function NewCoverPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#0a0a0a]" />}>
      <EditorPage />
    </Suspense>
  );
}

function EditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const editorRef = useRef<CoverEditorRef>(null);

  // Book specs
  const [title,         setTitle]         = useState("");
  const [author,        setAuthor]        = useState("");
  const [pages,         setPages]         = useState(200);
  const [paperType,     setPaperType]     = useState<PaperType>("white");
  const [trimSizeIndex, setTrimSizeIndex] = useState(1);
  const [finish,        setFinish]        = useState<"matte" | "glossy">("matte");
  const [backDesc,      setBackDesc]      = useState("");

  // Design
  const [frontBg,      setFrontBg]      = useState("#c0c0c0");
  const [backBg,       setBackBg]       = useState("#b0b0b0");
  const [spineBg,      setSpineBg]      = useState("#909090");
  const [textColor,    setTextColor]    = useState("#ffffff");
  const [selectedFont, setSelectedFont] = useState("Playfair Display");
  const [fontSize,     setFontSize]     = useState(36);
  const [bold,         setBold]         = useState(false);
  const [italic,       setItalic]       = useState(false);
  const [uploadIntent, setUploadIntent] = useState<"front" | "full">("front");

  // UI
  const [activePanel,  setActivePanel]  = useState<PanelId>(null);
  const [view3D,       setView3D]       = useState(false);
  const [zoom,         setZoom]         = useState(1);
  const [issues,       setIssues]       = useState<string[]>([]);
  const [canvasReady,  setCanvasReady]  = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [pdfLoading,   setPdfLoading]   = useState(false);
  const [savedCoverId, setSavedCoverId] = useState<string | null>(null);

  const selectedTrim = ALL_TRIM_SIZES[trimSizeIndex];
  const spineWidth   = calculateSpineWidth(pages, paperType);

  // Load URL params (from templates)
  useEffect(() => {
    const t  = searchParams.get("title");
    const pg = searchParams.get("pages");
    const ts = searchParams.get("trimSize");
    if (t)  setTitle(t);
    if (pg) setPages(Math.max(24, parseInt(pg) || 200));
    if (ts) { const idx = ALL_TRIM_SIZES.findIndex((s) => s.name === ts); if (idx >= 0) setTrimSizeIndex(idx); }
  }, [searchParams]);

  const togglePanel = (id: PanelId) => setActivePanel((prev) => (prev === id ? null : id));

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const row = {
        user_id: user.id,
        title:   title  || "Untitled Cover",
        author:  author || "Unknown Author",
        page_count:       pages,
        paper_type:       paperType,
        trim_size:        selectedTrim.name,
        cover_finish:     finish,
        back_cover_text:  backDesc,
        spine_width:      spineWidth,
        full_width:       calculateFullCoverWidth(selectedTrim.width, pages, paperType),
        full_height:      calculateFullCoverHeight(selectedTrim.height),
        status: "draft",
      };

      if (savedCoverId) {
        await supabase.from("covers").update(row).eq("id", savedCoverId);
      } else {
        const { data, error } = await supabase.from("covers").insert(row).select().single();
        if (error) { addToast("Failed to save: " + error.message, "error"); return; }
        setSavedCoverId(data.id);
      }
      addToast("Cover saved!", "success");
    } catch {
      addToast("Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Download PDF ──────────────────────────────────────────────────────────
  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      const canvasDataUrl = editorRef.current?.exportCanvas() ?? undefined;

      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverId: savedCoverId ?? undefined, canvasDataUrl }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        addToast((err as { error?: string }).error || "PDF generation failed", "error");
        return;
      }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `kdp-cover-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast("PDF downloaded!", "success");
    } catch {
      addToast("Failed to generate PDF", "error");
    } finally {
      setPdfLoading(false);
    }
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 flex flex-col bg-[#0a0a0a] text-white overflow-hidden" style={{ zIndex: 50 }}>

      {/* ══ TOP BAR ══════════════════════════════════════════════════════════ */}
      <div className="h-12 flex items-center gap-2 px-3 border-b border-[#1e1e1e] shrink-0 bg-[#111111]">

        {/* Back */}
        <Link href="/dashboard" className="text-[#555] hover:text-white transition-colors shrink-0 p-1">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        <div className="w-px h-5 bg-[#2a2a2a] shrink-0" />

        {/* Format */}
        <select className="bg-[#1a1a1a] border border-[#2a2a2a] text-white text-xs rounded px-2 py-1.5 outline-none cursor-pointer shrink-0 hover:border-[#444]">
          <option>Paperback</option>
          <option>Hardcover</option>
        </select>

        {/* Trim Size */}
        <select value={trimSizeIndex} onChange={(e) => setTrimSizeIndex(Number(e.target.value))}
          className="bg-[#1a1a1a] border border-[#2a2a2a] text-white text-xs rounded px-2 py-1.5 outline-none cursor-pointer shrink-0 hover:border-[#444]">
          {ALL_TRIM_SIZES.map((s, i) => (
            <option key={s.name} value={i}>{s.name} in</option>
          ))}
        </select>

        {/* Pages */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] text-[#555]">Pages</span>
          <input type="number" value={pages}
            onChange={(e) => setPages(Math.max(24, Math.min(828, parseInt(e.target.value) || 24)))}
            min={24} max={828}
            className="w-16 bg-[#1a1a1a] border border-[#2a2a2a] text-white text-xs rounded px-2 py-1.5 outline-none text-center hover:border-[#444] focus:border-[#a78bfa]" />
        </div>

        {/* Paper */}
        <select value={paperType} onChange={(e) => setPaperType(e.target.value as PaperType)}
          className="bg-[#1a1a1a] border border-[#2a2a2a] text-white text-xs rounded px-2 py-1.5 outline-none cursor-pointer shrink-0 hover:border-[#444]">
          {PAPER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Spine badge */}
        <div className="flex items-center gap-1.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2.5 py-1.5 shrink-0">
          <span className="text-[11px] text-[#555]">Spine =</span>
          <span className="text-xs font-semibold text-[#a78bfa]">{spineWidth.toFixed(4)}&quot;</span>
        </div>

        <div className="flex-1" />

        {/* Zoom */}
        <div className="flex items-center gap-1 shrink-0">
          <button type="button" onClick={() => editorRef.current?.zoomOut()}
            className="w-6 h-6 rounded bg-[#1a1a1a] border border-[#2a2a2a] text-[#666] hover:text-white flex items-center justify-center text-sm leading-none transition-colors">−</button>
          <span className="text-[11px] text-[#555] w-9 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => editorRef.current?.zoomIn()}
            className="w-6 h-6 rounded bg-[#1a1a1a] border border-[#2a2a2a] text-[#666] hover:text-white flex items-center justify-center text-sm leading-none transition-colors">+</button>
          <button type="button" onClick={() => editorRef.current?.autoFit()}
            className="text-[10px] text-[#555] hover:text-white px-2 py-1.5 rounded border border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#444] transition-colors font-medium ml-0.5">Fit</button>
        </div>

        <div className="w-px h-5 bg-[#2a2a2a] shrink-0" />

        {/* 2D / 3D toggle */}
        <button type="button" onClick={() => setView3D((v) => !v)}
          className={`px-2.5 py-1.5 rounded text-xs font-semibold border transition-colors shrink-0 ${
            view3D
              ? "bg-[#a78bfa] border-[#a78bfa] text-white"
              : "bg-[#1a1a1a] border-[#2a2a2a] text-[#666] hover:text-white hover:border-[#444]"
          }`}>
          {view3D ? "3D" : "2D"}
        </button>

        {/* Issues badge */}
        {canvasReady && issues.length > 0 && (
          <button type="button" onClick={() => togglePanel("preflight")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20 transition-colors shrink-0">
            <span>⚠</span>
            <span>Found {issues.length} Issue{issues.length !== 1 ? "s" : ""}</span>
          </button>
        )}
        {canvasReady && issues.length === 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <span>✓</span><span>Ready</span>
          </div>
        )}

        <div className="w-px h-5 bg-[#2a2a2a] shrink-0" />

        {/* Save */}
        <button type="button" onClick={handleSave} disabled={loading}
          className="px-3 py-1.5 rounded text-xs font-medium bg-[#1a1a1a] border border-[#2a2a2a] text-[#888] hover:text-white hover:border-[#444] disabled:opacity-50 transition-colors shrink-0">
          {loading ? "Saving…" : savedCoverId ? "✓ Saved" : "Save"}
        </button>

        {/* Download PDF */}
        <button type="button" onClick={handleDownloadPdf} disabled={pdfLoading}
          className="px-3 py-1.5 rounded text-xs font-semibold bg-[#a78bfa] hover:bg-[#9061f9] disabled:opacity-60 transition-colors text-white shrink-0">
          {pdfLoading ? "Generating…" : "Export PDF"}
        </button>
      </div>

      {/* ══ MAIN AREA ══════════════════════════════════════════════════════════ */}
      <div className="flex flex-1 min-h-0">

        {/* ── LEFT ICON STRIP (60px) ─────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-1 py-3 border-r border-[#1e1e1e] bg-[#111111] shrink-0" style={{ width: 60 }}>
          {[
            {
              id: "template" as PanelId, label: "Template",
              icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
            },
            {
              id: "text" as PanelId, label: "Text",
              icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25H3.75" /></svg>,
            },
            {
              id: "image" as PanelId, label: "Image",
              icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>,
            },
            {
              id: "bg" as PanelId, label: "BG",
              icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" /></svg>,
            },
            {
              id: "preflight" as PanelId, label: "Preflight",
              icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
            },
          ].map(({ id, label, icon }) => (
            <button key={id} type="button" onClick={() => togglePanel(id)} title={label}
              className={`flex flex-col items-center gap-0.5 w-12 py-2.5 rounded-lg transition-colors ${
                activePanel === id
                  ? "bg-[#a78bfa]/20 text-[#a78bfa]"
                  : "text-[#444] hover:text-[#888] hover:bg-[#1a1a1a]"
              } ${id === "preflight" && issues.length > 0 ? "text-orange-400" : ""}`}>
              {icon}
              <span className="text-[8px] font-medium leading-none mt-0.5">{label}</span>
              {id === "preflight" && issues.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-orange-400 mt-0.5" />
              )}
            </button>
          ))}
        </div>

        {/* ── SLIDE-IN PANEL ────────────────────────────────────────────── */}
        <div
          className="shrink-0 border-r border-[#1e1e1e] bg-[#111111] overflow-hidden transition-all duration-200"
          style={{ width: activePanel ? 280 : 0 }}
        >
          {activePanel && (
            <div className="w-[280px] h-full overflow-y-auto p-4 space-y-4">

              {/* TEMPLATE */}
              {activePanel === "template" && <>
                <h3 className="text-[10px] font-semibold text-[#555] uppercase tracking-widest">Genre Presets</h3>
                <div className="grid grid-cols-2 gap-2">
                  {PRESETS.map((preset) => (
                    <button key={preset.id} type="button"
                      onClick={() => { setFrontBg(preset.bg); setBackBg(preset.bg); setSpineBg(preset.spine); setTextColor(preset.textColor); setSelectedFont(preset.font); }}
                      className="rounded-xl border border-[#2a2a2a] hover:border-[#a78bfa]/40 overflow-hidden transition-all group">
                      <div className="h-14 flex items-center justify-center text-xs font-bold px-1"
                        style={{ backgroundColor: preset.bg, color: preset.textColor, fontFamily: preset.font }}>
                        {preset.label}
                      </div>
                      <div className="py-1 text-[9px] text-[#555] group-hover:text-[#a78bfa] bg-[#161616] text-center font-medium transition-colors">
                        {preset.label}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="border-t border-[#1e1e1e] pt-4 space-y-3">
                  <h3 className="text-[10px] font-semibold text-[#555] uppercase tracking-widest">Book Details</h3>
                  <div>
                    <label className="text-[10px] text-[#555] block mb-1">Book Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Your Book Title"
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white text-xs rounded px-2.5 py-2 outline-none focus:border-[#a78bfa] placeholder:text-[#333]" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#555] block mb-1">Author Name</label>
                    <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author Name"
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white text-xs rounded px-2.5 py-2 outline-none focus:border-[#a78bfa] placeholder:text-[#333]" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#555] block mb-1">Cover Finish</label>
                    <div className="flex gap-2">
                      {(["matte", "glossy"] as const).map((opt) => (
                        <button key={opt} type="button" onClick={() => setFinish(opt)}
                          className={`flex-1 py-1.5 rounded text-xs border capitalize font-medium transition-colors ${finish === opt ? "border-[#a78bfa] bg-[#a78bfa]/10 text-[#a78bfa]" : "border-[#2a2a2a] bg-[#1a1a1a] text-[#555] hover:text-white"}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>}

              {/* TEXT */}
              {activePanel === "text" && <>
                <h3 className="text-[10px] font-semibold text-[#555] uppercase tracking-widest">Typography</h3>
                <div>
                  <label className="text-[10px] text-[#555] block mb-1.5">Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Your Book Title"
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white text-xs rounded px-2.5 py-2 outline-none focus:border-[#a78bfa] placeholder:text-[#333]" />
                </div>
                <div>
                  <label className="text-[10px] text-[#555] block mb-1.5">Author</label>
                  <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author Name"
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white text-xs rounded px-2.5 py-2 outline-none focus:border-[#a78bfa] placeholder:text-[#333]" />
                </div>
                <div>
                  <label className="text-[10px] text-[#555] block mb-1.5">Font Family</label>
                  <select value={selectedFont} onChange={(e) => setSelectedFont(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white text-xs rounded px-2.5 py-2 outline-none focus:border-[#a78bfa] cursor-pointer">
                    {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#555] block mb-1.5">Size: {fontSize}px</label>
                  <input type="range" min={8} max={120} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-[#a78bfa]" />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setBold((b) => !b)}
                    className={`flex-1 py-1.5 rounded text-xs font-bold border transition-all ${bold ? "border-[#a78bfa] bg-[#a78bfa]/10 text-[#a78bfa]" : "border-[#2a2a2a] bg-[#1a1a1a] text-[#555] hover:text-white"}`}>B</button>
                  <button type="button" onClick={() => setItalic((i) => !i)}
                    className={`flex-1 py-1.5 rounded text-xs italic border transition-all ${italic ? "border-[#a78bfa] bg-[#a78bfa]/10 text-[#a78bfa]" : "border-[#2a2a2a] bg-[#1a1a1a] text-[#555] hover:text-white"}`}>I</button>
                  <div className="flex items-center gap-1.5 flex-1">
                    <label className="text-[10px] text-[#555] shrink-0">Color</label>
                    <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)}
                      className="w-8 h-7 rounded cursor-pointer border border-[#2a2a2a] bg-[#1a1a1a] flex-1" />
                  </div>
                </div>
                <div className="border-t border-[#1e1e1e] pt-3 space-y-2">
                  <button type="button" onClick={() => editorRef.current?.addText(title || "Title", "title")}
                    className="w-full rounded bg-[#a78bfa] hover:bg-[#9061f9] py-2 text-xs font-semibold text-white transition-colors">
                    + Add Title to Front
                  </button>
                  <button type="button" onClick={() => editorRef.current?.addText(author || "Author", "author")}
                    className="w-full rounded border border-[#2a2a2a] bg-[#1a1a1a] hover:bg-[#222] py-2 text-xs text-[#666] hover:text-white transition-colors">
                    + Add Author to Front
                  </button>
                  <div>
                    <label className="text-[10px] text-[#555] block mb-1.5">Back Cover Text</label>
                    <textarea value={backDesc} onChange={(e) => setBackDesc(e.target.value)} rows={4}
                      placeholder="Enter back cover description..."
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white text-xs rounded px-2.5 py-2 outline-none resize-none focus:border-[#a78bfa] placeholder:text-[#333]" />
                  </div>
                </div>
              </>}

              {/* IMAGE */}
              {activePanel === "image" && <>
                <h3 className="text-[10px] font-semibold text-[#555] uppercase tracking-widest">Upload Image</h3>
                <div>
                  <p className="text-[10px] text-[#555] mb-2">Upload target</p>
                  <div className="flex gap-2">
                    {(["front", "full"] as const).map((i) => (
                      <button key={i} type="button" onClick={() => setUploadIntent(i)}
                        className={`flex-1 py-1.5 rounded text-xs border font-medium transition-colors ${uploadIntent === i ? "border-[#a78bfa] bg-[#a78bfa]/10 text-[#a78bfa]" : "border-[#2a2a2a] bg-[#1a1a1a] text-[#555] hover:text-white"}`}>
                        {i === "front" ? "Front" : "Full wrap"}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="block w-full rounded-xl border-2 border-dashed border-[#2a2a2a] hover:border-[#a78bfa]/40 bg-[#161616] cursor-pointer p-5 text-center transition-all">
                  <svg className="w-6 h-6 mx-auto mb-2 text-[#444]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <p className="text-xs text-[#666] font-medium">{uploadIntent === "front" ? "Upload Front Cover" : "Upload Full Wrap"}</p>
                  <p className="text-[10px] text-[#444] mt-0.5">JPG or PNG</p>
                  <input type="file" accept="image/png,image/jpeg" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) editorRef.current?.uploadImage(f, uploadIntent === "full" ? "full" : "front"); e.target.value = ""; }} />
                </label>
                <label className="block w-full rounded-xl border border-dashed border-[#2a2a2a] hover:border-[#555] bg-[#161616] cursor-pointer p-3 text-center transition-all">
                  <p className="text-xs text-[#666] font-medium">Upload Back Cover Image</p>
                  <input type="file" accept="image/png,image/jpeg" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) editorRef.current?.uploadImage(f, "back"); e.target.value = ""; }} />
                </label>
                <button type="button" onClick={() => editorRef.current?.fitToSafeZone()}
                  className="w-full rounded border border-[#2a2a2a] bg-[#1a1a1a] hover:bg-[#222] text-xs text-[#666] hover:text-white py-2 transition-colors font-medium">
                  Fit Selection to Safe Zone
                </button>
              </>}

              {/* BACKGROUND */}
              {activePanel === "bg" && <>
                <h3 className="text-[10px] font-semibold text-[#555] uppercase tracking-widest">Zone Colors</h3>
                {([
                  { label: "Front Cover", value: frontBg, set: setFrontBg },
                  { label: "Back Cover",  value: backBg,  set: setBackBg  },
                  { label: "Spine",       value: spineBg, set: setSpineBg },
                ] as const).map(({ label, value, set }) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <span className="text-xs text-[#666] shrink-0 font-medium">{label}</span>
                    <div className="flex items-center gap-2 min-w-0">
                      <input type="color" value={value} onChange={(e) => set(e.target.value)}
                        className="w-8 h-7 rounded cursor-pointer border border-[#2a2a2a] bg-[#1a1a1a] shrink-0" />
                      <span className="text-[10px] text-[#444] font-mono truncate">{value}</span>
                    </div>
                  </div>
                ))}
              </>}

              {/* PREFLIGHT */}
              {activePanel === "preflight" && <>
                <h3 className="text-[10px] font-semibold text-[#555] uppercase tracking-widest">Preflight Check</h3>
                {issues.length === 0 ? (
                  <div className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-emerald-400 text-lg">✓</span>
                    <div>
                      <p className="text-xs font-semibold text-emerald-400">All checks passed</p>
                      <p className="text-[10px] text-emerald-400/60 mt-0.5">Ready for export</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {issues.map((issue, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <span className="text-orange-400 shrink-0 mt-0.5">⚠</span>
                        <p className="text-xs text-orange-300">{issue}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="border-t border-[#1e1e1e] pt-3">
                  <p className="text-[10px] text-[#444] font-semibold mb-2">KDP Requirements</p>
                  <ul className="space-y-1 text-[10px] text-[#444]">
                    <li>• 0.125&quot; bleed on all sides</li>
                    <li>• Text 0.25&quot; inside trim edges</li>
                    <li>• 300 DPI at print dimensions</li>
                    <li>• Spine text needs ≥ 28 pages (white)</li>
                  </ul>
                </div>
              </>}

            </div>
          )}
        </div>

        {/* ── CANVAS AREA ───────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 min-h-0 overflow-hidden" style={{ backgroundColor: "#0a0a0f" }}>
          <div
            className="w-full h-full transition-all duration-500"
            style={view3D ? {
              perspective: "1000px",
            } : {}}
          >
            <div
              className="w-full h-full transition-transform duration-500"
              style={view3D ? {
                transform: "rotateY(-18deg) rotateX(4deg) scale(0.82)",
                transformStyle: "preserve-3d",
              } : {}}
            >
              <CoverEditor
                ref={editorRef}
                trimWidth={selectedTrim.width}
                trimHeight={selectedTrim.height}
                spineWidth={spineWidth}
                title={title}
                author={author}
                backText={backDesc}
                frontBg={frontBg}
                backBg={backBg}
                spineBg={spineBg}
                textColor={textColor}
                selectedFont={selectedFont}
                fontSize={fontSize}
                bold={bold}
                italic={italic}
                onCanvasReady={() => setCanvasReady(true)}
                onExportReady={() => {}}
                onPreflightChange={setIssues}
                onZoomChange={setZoom}
                onColorsExtracted={({ front, back, spine }) => {
                  setFrontBg(front); setBackBg(back); setSpineBg(spine);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
