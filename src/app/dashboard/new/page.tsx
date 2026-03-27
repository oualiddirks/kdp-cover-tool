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

const CoverEditor = dynamic(() => import("@/components/editor/CoverEditor"), { ssr: false });


const PAPER_OPTIONS: { value: PaperType; label: string }[] = [
  { value: "white", label: "White" },
  { value: "cream", label: "Cream" },
  { value: "color", label: "Color" },
];

const FINISH_OPTIONS = ["matte", "glossy"] as const;
type FinishType = typeof FINISH_OPTIONS[number];

export default function NewCoverPage() {
  return (
    <Suspense fallback={<div className="animate-pulse text-white/40 text-sm p-6">Loading form…</div>}>
      <NewCoverForm />
    </Suspense>
  );
}

function NewCoverForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [pages, setPages] = useState<number>(100);
  const [paperType, setPaperType] = useState<PaperType>("white");
  const [trimSizeIndex, setTrimSizeIndex] = useState(0);
  const [finish, setFinish] = useState<FinishType>("matte");
  const [backDesc, setBackDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedCoverId, setSavedCoverId] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [fabricCanvas, setFabricCanvas] = useState<any>(null);
  const exportCanvasRef = useRef<(() => string | null) | null>(null);

  // Pre-fill from template search params
  useEffect(() => {
    const templateTitle = searchParams.get("title");
    const templatePages = searchParams.get("pages");
    const templateTrimSize = searchParams.get("trimSize");
    if (templateTitle) setTitle(templateTitle);
    if (templatePages) setPages(Math.max(24, parseInt(templatePages) || 100));
    if (templateTrimSize) {
      const idx = ALL_TRIM_SIZES.findIndex((t) => t.name === templateTrimSize);
      if (idx >= 0) setTrimSizeIndex(idx);
    }
  }, [searchParams]);

  const selectedTrim = ALL_TRIM_SIZES[trimSizeIndex];

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const spineWidth = calculateSpineWidth(pages, paperType);
      const fullWidth = calculateFullCoverWidth(selectedTrim.width, pages, paperType);
      const fullHeight = calculateFullCoverHeight(selectedTrim.height);

      const { data, error } = await supabase.from("covers").insert({
        user_id: user.id,
        title: title || "Untitled Cover",
        author: author || "Unknown Author",
        page_count: pages,
        paper_type: paperType,
        trim_size: selectedTrim.name,
        cover_finish: finish,
        back_cover_text: backDesc,
        spine_width: spineWidth,
        full_width: fullWidth,
        full_height: fullHeight,
        status: "draft",
      }).select().single();

      if (error) {
        addToast("Failed to save cover: " + error.message, "error");
        setLoading(false);
        return;
      }

      addToast("Cover saved successfully!", "success");
      setSavedCoverId(data.id);
      setLoading(false);
    } catch {
      addToast("Something went wrong. Please try again.", "error");
      setLoading(false);
    }
  }

  async function handleDownloadPdf() {
    if (!fabricCanvas && !exportCanvasRef.current) {
      addToast("Canvas not ready. Please wait and try again.", "error");
      return;
    }
    setPdfLoading(true);
    try {
      const canvasDataUrl = exportCanvasRef.current?.() ?? null;

      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coverId: savedCoverId ?? undefined,
          canvasDataUrl: canvasDataUrl ?? undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        addToast(err.error || "PDF generation failed", "error");
        setPdfLoading(false);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kdp-cover-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast("PDF downloaded successfully!", "success");
    } catch {
      addToast("Failed to generate PDF", "error");
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <form onSubmit={handleGenerate}>
      <div className="grid lg:grid-cols-[360px_1fr] gap-6 items-start">
        <div className="space-y-5">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 space-y-4">
            <h2 className="text-sm font-semibold">Book Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">Book Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My Coloring Book"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/60 focus:bg-white/[0.07] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5">Author Name</label>
                <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Jane Smith"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/60 focus:bg-white/[0.07] transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Page Count</label>
              <input type="number" value={pages} onChange={(e) => setPages(Math.max(24, parseInt(e.target.value) || 24))} min={24} max={828}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none focus:border-violet-500/60 focus:bg-white/[0.07] transition-all" />
              <p className="mt-1 text-[11px] text-white/30">KDP range: 24-828 pages</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 space-y-4">
            <h2 className="text-sm font-semibold">Print Specifications</h2>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Paper Type</label>
              <div className="flex gap-2">
                {PAPER_OPTIONS.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setPaperType(opt.value)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${paperType === opt.value ? "border-violet-500/60 bg-violet-500/15 text-violet-300" : "border-white/10 bg-white/5 text-white/50 hover:text-white hover:border-white/20"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Trim Size</label>
              <select value={trimSizeIndex} onChange={(e) => setTrimSizeIndex(Number(e.target.value))}
                className="w-full rounded-lg border border-white/10 bg-[#0d0d14] px-3.5 py-2.5 text-sm text-white outline-none focus:border-violet-500/60 transition-all">
                {ALL_TRIM_SIZES.map((size, i) => (
                  <option key={size.name} value={i} className="bg-[#0d0d14]">{size.name}"</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Cover Finish</label>
              <div className="flex gap-2">
                {FINISH_OPTIONS.map((opt) => (
                  <button key={opt} type="button" onClick={() => setFinish(opt)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all capitalize ${finish === opt ? "border-violet-500/60 bg-violet-500/15 text-violet-300" : "border-white/10 bg-white/5 text-white/50 hover:text-white hover:border-white/20"}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
            <h2 className="text-sm font-semibold mb-1">Back Cover</h2>
            <p className="text-xs text-white/40 mb-4">Optional description text for the back cover</p>
            <textarea value={backDesc} onChange={(e) => setBackDesc(e.target.value)} placeholder="Enter your back cover description, tagline, or author bio..." rows={4}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/60 focus:bg-white/[0.07] transition-all resize-none" />
          </div>

          <div className="space-y-3">
            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Saving Cover...
                </span>
              ) : savedCoverId ? "Cover Saved!" : "Generate Cover"}
            </button>

            {(fabricCanvas || exportCanvasRef.current) && (
              <div className="flex gap-3">
                <button type="button" onClick={handleDownloadPdf} disabled={pdfLoading}
                  className="flex-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-60 transition-colors py-3 text-sm font-semibold text-emerald-400">
                  {pdfLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Generating PDF...
                    </span>
                  ) : "Download PDF"}
                </button>
                <Link href="/dashboard/covers" className="flex-1 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors py-3 text-sm font-semibold text-white text-center">
                  View All Covers
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="lg:sticky lg:top-6 min-w-0 overflow-hidden">
          <CoverEditor
            trimWidth={selectedTrim.width}
            trimHeight={selectedTrim.height}
            spineWidth={calculateSpineWidth(pages, paperType)}
            title={title}
            author={author}
            onCanvasReady={(canvas) => setFabricCanvas(canvas)}
            onExportReady={(fn) => { exportCanvasRef.current = fn; }}
          />
        </div>
      </div>
    </form>
  );
}
