"use client";

import { useState, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { calculateSpineWidth, calculateFullCoverWidth, calculateFullCoverHeight } from "@/lib/kdp-calculator";
import { useToast } from "@/components/ui/toast";

const CoverEditor = dynamic(() => import("@/components/editor/CoverEditor"), { ssr: false });

// Coloring books: always 8.5x11, always white paper
const TRIM_WIDTH = 8.5;
const TRIM_HEIGHT = 11;
const PAPER_TYPE = "white" as const;

function ColoringBookForm() {
  const { addToast } = useToast();
  const [title, setTitle] = useState("My Coloring Book");
  const [author, setAuthor] = useState("");
  const [pages, setPages] = useState(120);
  const [pdfLoading, setPdfLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [fabricCanvas, setFabricCanvas] = useState<any>(null);
  const exportCanvasRef = useRef<(() => string | null) | null>(null);

  const spineWidth = calculateSpineWidth(pages, PAPER_TYPE);
  const fullWidth = calculateFullCoverWidth(TRIM_WIDTH, pages, PAPER_TYPE);
  const fullHeight = calculateFullCoverHeight(TRIM_HEIGHT);

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
        body: JSON.stringify({ canvasDataUrl: canvasDataUrl ?? undefined }),
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
      a.download = `coloring-book-cover-${Date.now()}.pdf`;
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
    <div className="grid lg:grid-cols-[320px_1fr] gap-6 items-start">
      {/* Controls */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 space-y-4">
          <h2 className="text-sm font-semibold">Book Details</h2>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Book Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Coloring Book"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/60 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Author Name</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Your Name"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/60 transition-all"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 space-y-4">
          <h2 className="text-sm font-semibold">Print Specs</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-center">
              <p className="text-[10px] text-white/40 mb-1">Trim Size</p>
              <p className="text-sm font-bold text-violet-300">8.5 × 11"</p>
            </div>
            <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-center">
              <p className="text-[10px] text-white/40 mb-1">Paper</p>
              <p className="text-sm font-bold text-violet-300">White</p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">
              Page Count: <span className="text-white">{pages}</span>
            </label>
            <input
              type="range"
              min={24}
              max={828}
              value={pages}
              onChange={(e) => setPages(Number(e.target.value))}
              className="w-full accent-violet-500"
            />
            <div className="flex justify-between text-[10px] text-white/30 mt-1">
              <span>24</span><span>828</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 space-y-3">
          <h2 className="text-sm font-semibold">Calculated Dimensions</h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-white/50">Spine Width</span>
              <span className="font-mono text-violet-300">{spineWidth.toFixed(4)}&quot;</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Full Cover Width</span>
              <span className="font-mono text-white/70">{fullWidth.toFixed(4)}&quot;</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Full Cover Height</span>
              <span className="font-mono text-white/70">{fullHeight.toFixed(4)}&quot;</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleDownloadPdf}
          disabled={pdfLoading || (!fabricCanvas && !exportCanvasRef.current)}
          className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-colors py-3 text-sm font-semibold text-white"
        >
          {pdfLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Generating PDF…
            </span>
          ) : "Download PDF"}
        </button>

        <p className="text-xs text-white/30 text-center">
          No account required · 300 DPI export
        </p>
      </div>

      {/* Preview */}
      <div className="lg:sticky lg:top-6 min-w-0 overflow-hidden">
        <CoverEditor
          trimWidth={TRIM_WIDTH}
          trimHeight={TRIM_HEIGHT}
          spineWidth={spineWidth}
          title={title}
          author={author}
          onCanvasReady={(canvas) => setFabricCanvas(canvas)}
          onExportReady={(fn) => { exportCanvasRef.current = fn; }}
        />
      </div>
    </div>
  );
}

export default function ColoringBookPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5]">
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link href="/tools" className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Tools
        </Link>
        <span className="text-sm font-semibold">KDP<span className="text-violet-400">Cover</span>Tool</span>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Coloring Book Cover Maker</h1>
          <p className="text-white/50 text-sm">
            Create a KDP-compliant coloring book cover (8.5×11 only). Enter your details and customize the design below.
          </p>
        </div>

        <Suspense fallback={<div className="animate-pulse text-white/40 text-sm p-6">Loading editor…</div>}>
          <ColoringBookForm />
        </Suspense>
      </main>
    </div>
  );
}
