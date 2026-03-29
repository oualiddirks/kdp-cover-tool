"use client";

import { useState, useRef } from "react";
import Link from "next/link";

type CheckResult = {
  name: string;
  status: "pass" | "fail" | "warn" | "info";
  message: string;
  fix?: string;
};

export default function PreflightPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [results, setResults] = useState<CheckResult[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResults([]);
    setDone(false);
    if (f.type.startsWith("image/")) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }

  async function runPreflight() {
    if (!file) return;
    setRunning(true);
    setDone(false);
    setResults([]);

    const checks: CheckResult[] = [];

    // 1. File size check
    const fileSizeMB = file.size / (1024 * 1024);
    checks.push({
      name: "File Size",
      status: fileSizeMB < 650 ? "pass" : "fail",
      message: `File size: ${fileSizeMB.toFixed(2)} MB (max 650 MB)`,
      fix: fileSizeMB >= 650 ? "Compress your cover image or reduce image quality. KDP maximum is 650 MB." : undefined,
    });

    // 2. File type
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
    checks.push({
      name: "File Format",
      status: isPdf ? "pass" : isImage ? "warn" : "fail",
      message: isPdf ? "PDF format — ready for KDP upload" : isImage ? "Image file detected. KDP requires PDF for print covers." : "Unsupported file format",
      fix: !isPdf && !isImage ? "Upload a PDF file for KDP print covers, or a JPEG/PNG for checking." : (!isPdf ? "Convert your image to PDF before uploading to KDP." : undefined),
    });

    if (isImage) {
      // Load image dimensions
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const width = img.naturalWidth;
          const height = img.naturalHeight;

          // 3. Dimension check
          const isPortrait = height > width;
          const aspectRatio = width / height;
          const kdpAspectRatios = [5 / 8, 5.5 / 8.5, 6 / 9, 8 / 10, 8.5 / 11];
          const closestAspect = kdpAspectRatios.find((r) => Math.abs(r - aspectRatio) < 0.05);

          checks.push({
            name: "Cover Dimensions",
            status: isPortrait ? (closestAspect ? "pass" : "warn") : "fail",
            message: `${width} × ${height} pixels (${isPortrait ? "portrait" : "landscape"})${closestAspect ? " — matches KDP aspect ratio" : ""}`,
            fix: !isPortrait ? "KDP book covers should be taller than wide (portrait orientation)." : (!closestAspect ? "Dimensions don't match standard KDP trim sizes. Check the cover calculator for correct dimensions." : undefined),
          });

          // 4. DPI estimation
          const assumedPrintWidth = 6.25; // 6x9 with bleed
          const estimatedDPI = width / assumedPrintWidth;
          checks.push({
            name: "Resolution (DPI Estimate)",
            status: estimatedDPI >= 300 ? "pass" : estimatedDPI >= 200 ? "warn" : "fail",
            message: `Estimated ~${Math.round(estimatedDPI)} DPI at 6x9 trim size`,
            fix: estimatedDPI < 300 ? `Your image may be too low resolution. At 6x9 with bleed, you need at least 1875 × 2775 pixels. Your image is ${width} × ${height}.` : undefined,
          });

          // 5. Safe zone check (simple brightness near edges)
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const edgeSampleSize = Math.floor(Math.min(width, height) * 0.05);
            const topEdge = ctx.getImageData(0, 0, width, edgeSampleSize);
            let hasContentNearEdge = false;
            const pixels = topEdge.data;
            for (let p = 0; p < pixels.length; p += 4) {
              const r = pixels[p], g = pixels[p + 1], b = pixels[p + 2];
              const brightness = (r + g + b) / 3;
              if (brightness > 20 && brightness < 240) {
                hasContentNearEdge = true;
                break;
              }
            }
            checks.push({
              name: "Edge Content Check",
              status: hasContentNearEdge ? "warn" : "pass",
              message: hasContentNearEdge ? "Content detected near edges — verify text stays within safe zone" : "Edge area appears to be background only",
              fix: hasContentNearEdge ? "Ensure no critical text or imagery is within 0.25\" of the trim edges. This is especially important for titles and author names." : undefined,
            });
          }

          // 6. Color mode (we can't check CMYK from canvas, just inform)
          checks.push({
            name: "Color Mode",
            status: "info",
            message: "Browser cannot verify CMYK vs RGB. KDP accepts both; CMYK is recommended for accurate print colors.",
          });

          resolve();
          URL.revokeObjectURL(img.src);
        };
        img.onerror = () => {
          checks.push({
            name: "Image Load",
            status: "fail",
            message: "Could not load image for analysis.",
          });
          resolve();
        };
        img.src = URL.createObjectURL(file);
      });
    } else if (isPdf) {
      checks.push({
        name: "PDF Analysis",
        status: "info",
        message: "Upload a PNG or JPG version of your cover to run full dimension and DPI analysis. PDFs can be analyzed for file size only in the browser.",
      });
    }

    // Small delay for UX
    await new Promise((r) => setTimeout(r, 600));

    setResults(checks);
    setRunning(false);
    setDone(true);
  }

  const passCount = results.filter((r) => r.status === "pass").length;
  const failCount = results.filter((r) => r.status === "fail").length;
  const warnCount = results.filter((r) => r.status === "warn").length;

  const statusIcon = {
    pass: <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">✓</span>,
    fail: <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs font-bold shrink-0">✗</span>,
    warn: <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">!</span>,
    info: <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">i</span>,
  };

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

      <main className="max-w-2xl mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <div className="text-4xl mb-4">🔍</div>
          <h1 className="text-3xl font-bold mb-2">KDP Preflight Checker</h1>
          <p className="text-white/50">Upload your cover image and we&apos;ll check it against KDP requirements. Free, no account needed.</p>
        </div>

        {/* Upload area */}
        <div
          onClick={() => inputRef.current?.click()}
          className="rounded-2xl border-2 border-dashed border-white/15 hover:border-violet-500/40 bg-white/[0.02] hover:bg-violet-500/[0.03] transition-all p-10 text-center cursor-pointer mb-5"
        >
          <input ref={inputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
          {preview ? (
            <div className="space-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg border border-white/10" />
              <p className="text-sm text-white/50">{file?.name}</p>
              <p className="text-xs text-violet-400">Click to change file</p>
            </div>
          ) : (
            <div className="space-y-3">
              <svg className="w-10 h-10 text-white/20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-sm text-white/60">Drop your cover file here, or click to browse</p>
              <p className="text-xs text-white/30">PNG, JPG, or PDF · Max 650 MB</p>
            </div>
          )}
        </div>

        {file && !running && (
          <button
            onClick={runPreflight}
            className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors py-3 text-sm font-semibold text-white mb-6"
          >
            Run Preflight Check
          </button>
        )}

        {running && (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-center mb-6">
            <svg className="animate-spin w-8 h-8 text-violet-400 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="text-sm text-white/60">Analyzing your cover…</p>
          </div>
        )}

        {done && results.length > 0 && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex gap-3">
              <div className="flex-1 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
                <p className="text-2xl font-bold text-emerald-400">{passCount}</p>
                <p className="text-xs text-white/40">Passed</p>
              </div>
              <div className="flex-1 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-center">
                <p className="text-2xl font-bold text-amber-400">{warnCount}</p>
                <p className="text-xs text-white/40">Warnings</p>
              </div>
              <div className="flex-1 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-center">
                <p className="text-2xl font-bold text-red-400">{failCount}</p>
                <p className="text-xs text-white/40">Failed</p>
              </div>
            </div>

            {/* Check results */}
            <div className="space-y-2">
              {results.map((result) => (
                <div key={result.name} className={`rounded-xl border p-4 ${
                  result.status === "pass" ? "border-emerald-500/20 bg-emerald-500/[0.04]" :
                  result.status === "fail" ? "border-red-500/20 bg-red-500/[0.04]" :
                  result.status === "warn" ? "border-amber-500/20 bg-amber-500/[0.04]" :
                  "border-blue-500/20 bg-blue-500/[0.04]"
                }`}>
                  <div className="flex items-start gap-3">
                    {statusIcon[result.status]}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{result.name}</p>
                      <p className="text-xs text-white/50 mt-0.5">{result.message}</p>
                      {result.fix && (
                        <p className="text-xs text-amber-300 mt-2 leading-relaxed">
                          <strong>Fix: </strong>{result.fix}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {failCount > 0 && (
              <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 text-center">
                <p className="text-sm text-white/70 mb-3">Fix issues automatically with our Cover Creator</p>
                <Link href="/dashboard/new" className="inline-block rounded-lg bg-violet-600 hover:bg-violet-500 transition-colors px-5 py-2 text-sm font-semibold text-white">
                  Open Cover Creator →
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
