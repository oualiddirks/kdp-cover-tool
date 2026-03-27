"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const templates = [
  // ── Coloring Books ────────────────────────────────────────────────────────
  { id: "mandala",     name: "Mandala Dreams",   genre: "Coloring Book", trimSize: "8.5 x 11", pages: 120, colors: ["#6B48FF", "#FF6B9D"], description: "Intricate mandala patterns for meditative coloring sessions." },
  { id: "floral",      name: "Garden Bloom",     genre: "Coloring Book", trimSize: "8.5 x 11", pages: 96,  colors: ["#FF9A9E", "#FAD0C4"], description: "Beautiful floral illustrations with varying detail levels." },
  { id: "animals",     name: "Wild Kingdom",     genre: "Coloring Book", trimSize: "8.5 x 11", pages: 80,  colors: ["#A8EDEA", "#FED6E3"], description: "Majestic animals from around the world with artistic line work." },
  { id: "geometric",   name: "Sacred Geometry",  genre: "Coloring Book", trimSize: "8.5 x 11", pages: 100, colors: ["#4FACFE", "#00F2FE"], description: "Sharp geometric patterns for a modern, satisfying fill." },
  { id: "butterflies", name: "Flutter & Flow",   genre: "Coloring Book", trimSize: "8.5 x 11", pages: 90,  colors: ["#F093FB", "#F5576C"], description: "Butterflies and nature scenes with flowing details." },
  { id: "ocean",       name: "Deep Blue",        genre: "Coloring Book", trimSize: "8.5 x 11", pages: 96,  colors: ["#0093E9", "#80D0C7"], description: "Ocean life and seascapes for underwater adventures." },
  // ── Fiction ───────────────────────────────────────────────────────────────
  { id: "thriller",    name: "Dark Shadows",     genre: "Fiction",       trimSize: "6 x 9",    pages: 300, colors: ["#1a1a2e", "#e94560"], description: "Bold high-contrast thriller aesthetic with dramatic tension." },
  { id: "romance",     name: "Tender Hearts",    genre: "Fiction",       trimSize: "6 x 9",    pages: 280, colors: ["#f953c6", "#b91d73"], description: "Warm romantic tones with soft gradients and flowing type." },
  { id: "fantasy",     name: "Epic Realms",      genre: "Fiction",       trimSize: "6 x 9",    pages: 400, colors: ["#4e0080", "#c0a000"], description: "Fantasy adventure with deep purples and gold accents." },
  { id: "mystery",     name: "Hidden Truth",     genre: "Fiction",       trimSize: "5.5 x 8.5",pages: 260, colors: ["#2c3e50", "#3498db"], description: "Classic mystery noir with moody blues and dark tones." },
  // ── Non-Fiction ───────────────────────────────────────────────────────────
  { id: "business",   name: "Executive Edge",   genre: "Non-Fiction",   trimSize: "6 x 9",    pages: 200, colors: ["#1a1a1a", "#c0392b"], description: "Professional business aesthetic with bold authority." },
  { id: "self-help",  name: "Inner Light",      genre: "Non-Fiction",   trimSize: "6 x 9",    pages: 180, colors: ["#f7971e", "#ffd200"], description: "Uplifting self-help style with warm energising tones." },
];

const GENRE_BADGE: Record<string, string> = {
  "Coloring Book": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Fiction":       "bg-violet-500/10  text-violet-400  border-violet-500/20",
  "Non-Fiction":   "bg-blue-500/10    text-blue-400    border-blue-500/20",
};

const GENRE_FILTERS = ["All", "Coloring Book", "Fiction", "Non-Fiction"];

export default function TemplatesPage() {
  const router = useRouter();
  const [activeGenre, setActiveGenre] = useState("All");

  const filtered = activeGenre === "All"
    ? templates
    : templates.filter((t) => t.genre === activeGenre);

  function handleUseTemplate(t: typeof templates[0]) {
    const params = new URLSearchParams({
      title: t.name,
      pages: String(t.pages),
      trimSize: t.trimSize,
    });
    router.push(`/dashboard/new?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      {/* Header + filter */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-white/50">
          {filtered.length} template{filtered.length !== 1 ? "s" : ""} — choose a starting point and customise it.
        </p>
        <div className="flex gap-2 flex-wrap">
          {GENRE_FILTERS.map((g) => (
            <button
              key={g}
              onClick={() => setActiveGenre(g)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                activeGenre === g
                  ? "border-violet-500/60 bg-violet-500/15 text-violet-300"
                  : "border-white/10 bg-white/5 text-white/50 hover:text-white"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden hover:border-white/15 transition-all"
          >
            {/* Visual preview */}
            <div
              className="h-36 relative flex items-center justify-center overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})` }}
            >
              {/* Mini book mockup */}
              <div className="flex gap-0.5 shadow-2xl">
                <div className="w-4 h-16 rounded-l-sm" style={{ background: t.colors[1], opacity: 0.7 }} />
                <div
                  className="w-14 h-16 rounded-r-sm flex items-center justify-center"
                  style={{ background: t.colors[0] }}
                >
                  <span className="text-white/70 text-[8px] font-bold uppercase tracking-wider text-center leading-tight px-1">
                    {t.name}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-sm font-semibold">{t.name}</h3>
                  <p className="text-xs text-white/40 mt-0.5">{t.trimSize}&quot; · {t.pages} pages</p>
                </div>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${GENRE_BADGE[t.genre]}`}>
                  {t.genre}
                </span>
              </div>

              <p className="text-xs text-white/50 mb-3 leading-relaxed">{t.description}</p>

              {/* Color swatches */}
              <div className="flex items-center gap-1.5 mb-4">
                {t.colors.map((c) => (
                  <div key={c} className="w-5 h-5 rounded-full border border-white/10 shrink-0" style={{ backgroundColor: c }} title={c} />
                ))}
                <span className="text-[10px] text-white/25 ml-1 font-mono truncate">{t.colors.join(" · ")}</span>
              </div>

              <button
                onClick={() => handleUseTemplate(t)}
                className="w-full rounded-lg bg-violet-600/80 hover:bg-violet-600 transition-colors py-2 text-xs font-semibold text-white"
              >
                Use This Template
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
