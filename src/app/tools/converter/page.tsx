"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { calculateSpineWidth, calculateFullCoverWidth, calculateFullCoverHeight, ALL_TRIM_SIZES, type PaperType } from "@/lib/kdp-calculator";
import { extractDominantColor, getDarkerShade } from "@/lib/color-extractor";

export default function ConverterPage() {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [pages, setPages] = useState(120);
  const [paperType, setPaperType] = useState<PaperType>("white");
  const [trimSizeIndex, setTrimSizeIndex] = useState(0);
  const [backColor, setBackColor] = useState("#6d28d9");
  const [spineColor, setSpineColor] = useState("#4c1d95");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  const trim = ALL_TRIM_SIZES[trimSizeIndex];
  const PX = 72;
  const spineWidth = calculateSpineWidth(pages, paperType);
  const fullWidth = calculateFullCoverWidth(trim.width, pages, paperType);
  const fullHeight = calculateFullCoverHeight(trim.height);
  const cW = Math.round(fullWidth * PX);
  const cH = Math.round(fullHeight * PX);
  const bleedPx = Math.round(0.125 * PX);
  const backW = Math.round(trim.width * PX);
  const spineW = Math.max(2, Math.round(spineWidth * PX));
  const trimH = Math.round(trim.height * PX);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (!dataUrl) return;
      setFrontImage(dataUrl);
      extractDominantColor(dataUrl).then((color) => {
        setBackColor(color);
        setSpineColor(getDarkerShade(color));
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = cW;
    canvas.height = cH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#e5e5e5";
    ctx.fillRect(0, 0, cW, cH);

    // Back cover
    ctx.fillStyle = backColor;
    ctx.fillRect(bleedPx, bleedPx, backW, trimH);

    // Spine
    ctx.fillStyle = spineColor;
    ctx.fillRect(bleedPx + backW, bleedPx, spineW, trimH);

    // Front cover (image or placeholder)
    const frontX = bleedPx + backW + spineW;

    if (frontImage) {
      const img = new Image();
      img.onload = () => {
        const sx = backW / img.width;
        const sy = trimH / img.height;
        const s = Math.max(sx, sy);
        const dw = img.width * s;
        const dh = img.height * s;
        const dx = frontX + (backW - dw) / 2;
        const dy = bleedPx + (trimH - dh) / 2;
        ctx.drawImage(img, dx, dy, dw, dh);
        setReady(true);
      };
      // data: URLs don't need crossOrigin — avoids tainted canvas issues
      img.src = frontImage;
    } else {
      ctx.fillStyle = "#4c1d95";
      ctx.fillRect(frontX, bleedPx, backW, trimH);
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("FRONT COVER", frontX + backW / 2, bleedPx + trimH / 2);
      setReady(true);
    }

    // Bleed overlay
    ctx.fillStyle = "rgba(255,80,80,0.1)";
    ctx.fillRect(0, 0, cW, bleedPx);
    ctx.fillRect(0, cH - bleedPx, cW, bleedPx);
    ctx.fillRect(0, 0, bleedPx, cH);
    ctx.fillRect(cW - bleedPx, 0, bleedPx, cH);

    // Labels
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.fillText("BACK", bleedPx + backW / 2, bleedPx + 12);
    ctx.fillText("FRONT", frontX + backW / 2, bleedPx + 12);

    // Spine label
    ctx.save();
    ctx.translate(bleedPx + backW + spineW / 2, bleedPx + trimH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("SPINE", 0, 4);
    ctx.restore();
  }, [frontImage, backColor, spineColor, cW, cH, bleedPx, backW, spineW, trimH]);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "full-wrap-cover.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5]">
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link href="/tools" className="text-sm text-white/60 hover:text-white transition-colors">← Back to Tools</Link>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="6" height="14" rx="1" fill="white" opacity="0.9"/><rect x="10" y="2" width="6" height="14" rx="1" fill="white" opacity="0.5"/></svg>
          </div>
          <span className="text-sm font-semibold">KDP<span className="text-violet-400">Cover</span>Tool</span>
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <div className="text-4xl mb-4">🔄</div>
          <h1 className="text-3xl font-bold mb-2">Ebook to Paperback Converter</h1>
          <p className="text-white/50">Upload your front cover to generate a full-wrap paperback cover instantly.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 space-y-4">
              <label className="block w-full rounded-xl border-2 border-dashed border-white/20 hover:border-violet-500/40 bg-white/[0.02] cursor-pointer p-6 text-center transition-all">
                <svg className="w-7 h-7 mx-auto mb-2 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p className="text-sm text-white/50">{frontImage ? "Change front cover" : "Upload front cover"}</p>
                <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleFile} />
              </label>
              <div>
                <label className="text-xs text-white/50 block mb-2">Trim Size</label>
                <select value={trimSizeIndex} onChange={e => setTrimSizeIndex(Number(e.target.value))}
                  className="w-full rounded-lg border border-white/10 bg-[#0d0d14] px-3 py-2 text-sm text-white outline-none">
                  {ALL_TRIM_SIZES.map((s, i) => <option key={s.name} value={i}>{s.name}&quot;</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1">Page Count: {pages}</label>
                <input type="range" min={24} max={828} value={pages} onChange={e => setPages(Number(e.target.value))} className="w-full accent-violet-500" />
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-2">Paper Type</label>
                <div className="flex gap-2">
                  {(["white","cream","color"] as PaperType[]).map(p => (
                    <button key={p} onClick={() => setPaperType(p)}
                      className={`flex-1 py-1.5 rounded-lg text-xs capitalize border transition-all ${paperType === p ? "border-violet-500/60 bg-violet-500/15 text-violet-300" : "border-white/10 bg-white/5 text-white/40"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-xs text-white/50">Back</label>
                  <input type="color" value={backColor} onChange={e => setBackColor(e.target.value)} className="w-8 h-7 rounded cursor-pointer border border-white/10 bg-transparent" />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-xs text-white/50">Spine</label>
                  <input type="color" value={spineColor} onChange={e => setSpineColor(e.target.value)} className="w-8 h-7 rounded cursor-pointer border border-white/10 bg-transparent" />
                </div>
              </div>
              <button onClick={handleDownload} disabled={!ready}
                className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-colors py-3 text-sm font-semibold text-white">
                Download Full Wrap PNG
              </button>
            </div>
            <div className="text-xs text-white/30 text-center">
              Spine: {spineWidth.toFixed(4)}&quot; · Full: {fullWidth.toFixed(4)}&quot; × {fullHeight.toFixed(4)}&quot;
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#080810] p-4 overflow-auto">
            <p className="text-xs text-white/40 mb-3 text-center">Preview</p>
            <div className="flex justify-center">
              <canvas ref={canvasRef} className="max-w-full rounded" style={{ imageRendering: "auto" }} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
