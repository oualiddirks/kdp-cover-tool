"use client";

import { useState } from "react";
import Link from "next/link";

const templates = [
  // Coloring Books
  { id: "mandala", name: "Mandala Dreams", genre: "Coloring", trimSize: "8.5 x 11", pages: 120, colors: ["#6B48FF", "#FF6B9D"], description: "Intricate mandala patterns for meditative coloring sessions." },
  { id: "floral", name: "Garden Bloom", genre: "Coloring", trimSize: "8.5 x 11", pages: 96, colors: ["#FF9A9E", "#FAD0C4"], description: "Beautiful floral illustrations with varying detail levels." },
  { id: "animals", name: "Wild Kingdom", genre: "Coloring", trimSize: "8.5 x 11", pages: 80, colors: ["#A8EDEA", "#FED6E3"], description: "Majestic animals from around the world with artistic line work." },
  { id: "geometric", name: "Sacred Geometry", genre: "Coloring", trimSize: "8.5 x 11", pages: 100, colors: ["#4FACFE", "#00F2FE"], description: "Sharp geometric patterns for a modern, satisfying fill." },
  { id: "butterflies", name: "Flutter & Flow", genre: "Coloring", trimSize: "8.5 x 11", pages: 90, colors: ["#F093FB", "#F5576C"], description: "Butterflies and nature scenes with flowing details." },
  { id: "ocean", name: "Deep Blue", genre: "Coloring", trimSize: "8.5 x 11", pages: 96, colors: ["#0093E9", "#80D0C7"], description: "Ocean life and seascapes for underwater adventures." },
  // Fiction
  { id: "thriller", name: "Dark Shadows", genre: "Fiction", trimSize: "6 x 9", pages: 300, colors: ["#1a1a2e", "#e94560"], description: "Bold high-contrast thriller aesthetic with dramatic tension." },
  { id: "romance", name: "Tender Hearts", genre: "Fiction", trimSize: "6 x 9", pages: 280, colors: ["#f953c6", "#b91d73"], description: "Warm romantic tones with soft gradients and flowing type." },
  { id: "fantasy", name: "Epic Realms", genre: "Fiction", trimSize: "6 x 9", pages: 400, colors: ["#4e0080", "#c0a000"], description: "Fantasy adventure with deep purples and gold accents." },
  { id: "mystery", name: "Hidden Truth", genre: "Fiction", trimSize: "5.5 x 8.5", pages: 260, colors: ["#2c3e50", "#3498db"], description: "Classic mystery noir with moody blues and dark tones." },
  // Non-Fiction
  { id: "business", name: "Executive Edge", genre: "Non-Fiction", trimSize: "6 x 9", pages: 200, colors: ["#1a1a1a", "#c0392b"], description: "Professional business aesthetic with bold authority." },
  { id: "self-help", name: "Inner Light", genre: "Non-Fiction", trimSize: "6 x 9", pages: 180, colors: ["#f7971e", "#ffd200"], description: "Uplifting self-help style with warm energising tones." },
  // Children's
  { id: "childrens-adventure", name: "Big Adventure", genre: "Children", trimSize: "8 x 10", pages: 48, colors: ["#60a5fa", "#34d399"], description: "Bright and cheerful children's book cover with bold colors." },
  { id: "childrens-animals", name: "Animal Friends", genre: "Children", trimSize: "8 x 10", pages: 40, colors: ["#fbbf24", "#f97316"], description: "Friendly animal characters in warm, inviting colors." },
  // Journals
  { id: "dot-journal", name: "Dot Grid Journal", genre: "Journal", trimSize: "6 x 9", pages: 200, colors: ["#2d3436", "#636e72"], description: "Minimalist dot grid journal with clean professional cover." },
  { id: "gratitude", name: "Gratitude Journal", genre: "Journal", trimSize: "5 x 8", pages: 120, colors: ["#fd79a8", "#a29bfe"], description: "Soft pastel gratitude journal with inspirational feel." },
];

const SIZE_FILTERS = ["All", "5 x 8", "5.5 x 8.5", "6 x 9", "8 x 10", "8.5 x 11"];
const TYPE_FILTERS = ["All", "Fiction", "Non-Fiction", "Coloring", "Journal", "Children"];

const GENRE_BADGE: Record<string, string> = {
  "Coloring": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Fiction": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Non-Fiction": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Children": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Journal": "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

export default function TemplatesPage() {
  const [sizeFilter, setSizeFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const filtered = templates.filter((t) => {
    const matchSize = sizeFilter === "All" || t.trimSize.includes(sizeFilter);
    const matchType = typeFilter === "All" || t.genre === typeFilter;
    return matchSize && matchType;
  });

  function handleUseTemplate(t: typeof templates[0]) {
    const params = new URLSearchParams({ title: t.name, pages: String(t.pages), trimSize: t.trimSize });
    window.location.href = `/dashboard/new?${params.toString()}`;
  }

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

      <main className="max-w-6xl mx-auto px-6 py-14">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Cover Templates</h1>
          <p className="text-white/50">Choose a starting template and open it in the Cover Creator. No account required to browse.</p>
        </div>

        {/* Filters */}
        <div className="space-y-3 mb-8">
          <div>
            <p className="text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">By Trim Size</p>
            <div className="flex flex-wrap gap-2">
              {SIZE_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSizeFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                    sizeFilter === s
                      ? "border-violet-500/60 bg-violet-500/15 text-violet-300"
                      : "border-white/10 bg-white/5 text-white/50 hover:text-white"
                  }`}
                >
                  {s === "All" ? "All Sizes" : `${s}"`}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">By Type</p>
            <div className="flex flex-wrap gap-2">
              {TYPE_FILTERS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                    typeFilter === t
                      ? "border-violet-500/60 bg-violet-500/15 text-violet-300"
                      : "border-white/10 bg-white/5 text-white/50 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-white/40 mb-5">{filtered.length} template{filtered.length !== 1 ? "s" : ""}</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden hover:border-white/15 transition-all"
            >
              {/* Preview */}
              <div
                className="h-36 relative flex items-center justify-center overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})` }}
              >
                <div className="flex gap-0.5 shadow-2xl">
                  <div className="w-4 h-16 rounded-l-sm" style={{ background: t.colors[1], opacity: 0.7 }} />
                  <div
                    className="w-14 h-16 rounded-r-sm flex items-center justify-center"
                    style={{ background: t.colors[0] }}
                  >
                    <span className="text-white/70 text-[7px] font-bold uppercase tracking-wider text-center leading-tight px-1">
                      {t.name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold truncate">{t.name}</h3>
                    <p className="text-xs text-white/40 mt-0.5">{t.trimSize}&quot; · {t.pages} pg</p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${GENRE_BADGE[t.genre] ?? "bg-white/10 text-white/40 border-white/10"}`}>
                    {t.genre}
                  </span>
                </div>

                <p className="text-xs text-white/50 mb-3 leading-relaxed">{t.description}</p>

                <div className="flex items-center gap-1.5 mb-3">
                  {t.colors.map((c) => (
                    <div key={c} className="w-4 h-4 rounded-full border border-white/10 shrink-0" style={{ backgroundColor: c }} title={c} />
                  ))}
                </div>

                <button
                  onClick={() => handleUseTemplate(t)}
                  className="w-full rounded-lg bg-violet-600/80 hover:bg-violet-600 transition-colors py-2 text-xs font-semibold text-white"
                >
                  Open in Cover Creator
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
