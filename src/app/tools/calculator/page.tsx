"use client";

import { useState } from "react";
import Link from "next/link";
import {
  calculateSpineWidth,
  calculateFullCoverWidth,
  calculateFullCoverHeight,
  ALL_TRIM_SIZES,
  type PaperType,
} from "@/lib/kdp-calculator";

export default function CalculatorPage() {
  const [pages, setPages] = useState(120);
  const [paperType, setPaperType] = useState<PaperType>("white");
  const [trimSizeIndex, setTrimSizeIndex] = useState(0);

  const trim = ALL_TRIM_SIZES[trimSizeIndex];
  const spineWidth = calculateSpineWidth(pages, paperType);
  const fullWidth = calculateFullCoverWidth(trim.width, pages, paperType);
  const fullHeight = calculateFullCoverHeight(trim.height);

  const openInCreator = () => {
    const p = new URLSearchParams({ pages: String(pages), trimSize: trim.name });
    window.location.href = `/dashboard/new?${p.toString()}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5]">
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link href="/tools" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
          ← Back to Tools
        </Link>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="6" height="14" rx="1" fill="white" opacity="0.9" /><rect x="10" y="2" width="6" height="14" rx="1" fill="white" opacity="0.5" /></svg>
          </div>
          <span className="text-sm font-semibold">KDP<span className="text-violet-400">Cover</span>Tool</span>
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <div className="text-4xl mb-4">📐</div>
          <h1 className="text-3xl font-bold mb-2">KDP Cover Size Calculator</h1>
          <p className="text-white/50">Get the exact spine width and full cover dimensions for any KDP book.</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-white/60 mb-2">Trim Size</label>
            <select value={trimSizeIndex} onChange={e => setTrimSizeIndex(Number(e.target.value))}
              className="w-full rounded-lg border border-white/10 bg-[#0d0d14] px-3.5 py-2.5 text-sm text-white outline-none focus:border-violet-500/60">
              {ALL_TRIM_SIZES.map((s, i) => <option key={s.name} value={i}>{s.name}&quot;</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-2">Paper Type</label>
            <div className="flex gap-2">
              {(["white","cream","color"] as PaperType[]).map(p => (
                <button key={p} onClick={() => setPaperType(p)}
                  className={`flex-1 py-2 rounded-lg text-sm capitalize font-medium border transition-all ${paperType === p ? "border-violet-500/60 bg-violet-500/15 text-violet-300" : "border-white/10 bg-white/5 text-white/50"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/60 mb-2">Page Count: <span className="text-white">{pages}</span></label>
            <input type="range" min={24} max={828} value={pages} onChange={e => setPages(Number(e.target.value))}
              className="w-full accent-violet-500" />
            <div className="flex justify-between text-[10px] text-white/30 mt-1"><span>24</span><span>828</span></div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { label: "Spine Width", value: `${spineWidth.toFixed(4)}"`, highlight: true },
              { label: "Full Width", value: `${fullWidth.toFixed(4)}"`, highlight: false },
              { label: "Full Height", value: `${fullHeight.toFixed(4)}"`, highlight: false },
            ].map(({ label, value, highlight }) => (
              <div key={label} className={`rounded-xl border p-4 text-center ${highlight ? "border-violet-500/30 bg-violet-500/10" : "border-white/[0.08] bg-white/[0.02]"}`}>
                <p className="text-[10px] text-white/40 mb-1">{label}</p>
                <p className={`text-lg font-bold ${highlight ? "text-violet-300" : ""}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-xs text-white/50 leading-relaxed">
            <strong className="text-white/70">Formula:</strong> Spine = {pages} pages × {paperType === "white" ? "0.002252" : paperType === "cream" ? "0.0025" : "0.002347"} ({paperType} paper) = {spineWidth.toFixed(4)}&quot;
            <br />Full Width = {trim.width}&quot; × 2 + {spineWidth.toFixed(4)}&quot; spine + 0.25&quot; bleed = {fullWidth.toFixed(4)}&quot;
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={openInCreator}
              className="flex-1 rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors py-3 text-sm font-semibold text-white">
              Open in Cover Creator →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
