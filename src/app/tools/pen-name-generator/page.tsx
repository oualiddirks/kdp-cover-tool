"use client";

import { useState } from "react";
import Link from "next/link";

const GENRES = ["Romance", "Thriller", "Fantasy", "Sci-Fi", "Mystery", "Horror", "Non-Fiction", "Children's", "Historical Fiction", "Self-Help"];
const STYLES = [
  { value: "mysterious", label: "Mysterious" },
  { value: "friendly", label: "Friendly & Approachable" },
  { value: "authoritative", label: "Authoritative" },
  { value: "elegant", label: "Elegant & Literary" },
  { value: "bold", label: "Bold & Edgy" },
];

type PenName = {
  name: string;
  genreFit: string;
  whyItWorks: string;
};

const FALLBACK_NAMES: Record<string, PenName[]> = {
  "Romance": [
    { name: "Isabella Hartwell", genreFit: "Romance, Historical Romance", whyItWorks: "Soft, feminine sound with aristocratic undertones perfect for romance readers." },
    { name: "Vivian Cross", genreFit: "Romance, Contemporary", whyItWorks: "The contrast between 'Vivian' (vivacious) and 'Cross' (tension) suggests passionate drama." },
    { name: "Celeste Monroe", genreFit: "Romance, Paranormal", whyItWorks: "Celestial first name with a powerful last name — romantic and slightly mysterious." },
    { name: "Autumn Sinclair", genreFit: "Romance, Women's Fiction", whyItWorks: "Seasonal first name feels warm and memorable; Sinclair adds sophistication." },
    { name: "Roselyn Drake", genreFit: "Romance, Fantasy Romance", whyItWorks: "Rose imagery is classic romance; Drake adds strength and intrigue." },
    { name: "Sophia Langford", genreFit: "Romance, Contemporary", whyItWorks: "Timeless, elegant combination that works across romance subgenres." },
    { name: "Adriana Vale", genreFit: "Romantic Suspense", whyItWorks: "Italian influence gives exoticism; Vale suggests hidden depths." },
    { name: "Lily St. James", genreFit: "Historical Romance", whyItWorks: "Classic floral name with aristocratic surname — immediately signals period romance." },
    { name: "Mara Ashford", genreFit: "Dark Romance", whyItWorks: "Mara means bitter/strength; Ashford is understated — great for darker romance." },
    { name: "Elena Chase", genreFit: "Romance Thriller", whyItWorks: "Elegant first name with action-oriented surname suggests romantic suspense." },
  ],
  "Thriller": [
    { name: "J.D. Carver", genreFit: "Thriller, Crime", whyItWorks: "Initials add mystery; Carver suggests precision and a cutting edge." },
    { name: "Reed Holloway", genreFit: "Thriller, Psychological", whyItWorks: "Short, punchy, and hollow — suggests psychological depth and emptiness." },
    { name: "Marcus Stone", genreFit: "Thriller, Action", whyItWorks: "Strong, masculine, hard-sounding name signals action and toughness." },
    { name: "K.T. Brennan", genreFit: "Thriller, Crime", whyItWorks: "Gender-neutral initials increase readership; Irish surname feels authentic for crime." },
    { name: "Dax Mercer", genreFit: "Thriller, Tech", whyItWorks: "Unusual first name is memorable; Mercer is a classic literary surname." },
    { name: "Cole Fletcher", genreFit: "Thriller, Action", whyItWorks: "Both names are strong monosyllabic/disyllabic — easy to remember on a shelf." },
    { name: "Victor Stark", genreFit: "Thriller, Political", whyItWorks: "Victory + stark contrast — suggests a protagonist who wins against bleak odds." },
    { name: "Quinn Davenport", genreFit: "Thriller, Corporate", whyItWorks: "Gender-flexible, sophisticated — works well for corporate or political thrillers." },
    { name: "Alex Kane", genreFit: "Thriller, Spy", whyItWorks: "Classic action hero name structure — short, punchy, memorable." },
    { name: "S.R. Wolfe", genreFit: "Thriller, Crime", whyItWorks: "Initials hide identity while 'Wolfe' signals a sharp, predatory protagonist." },
  ],
};

function generateFallbackNames(genres: string[], style: string): PenName[] {
  const primaryGenre = genres[0] || "Thriller";
  const base = FALLBACK_NAMES[primaryGenre] || FALLBACK_NAMES["Thriller"];
  return base.slice(0, 10);
}

export default function PenNameGeneratorPage() {
  const [realName, setRealName] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>(["Romance"]);
  const [style, setStyle] = useState("friendly");
  const [loading, setLoading] = useState(false);
  const [names, setNames] = useState<PenName[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  function toggleGenre(genre: string) {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre].slice(0, 3)
    );
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setNames([]);
    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "pen-names",
          genres: selectedGenres.join(", "),
          style,
          realName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate");
      }
      if (data.names && data.names.length > 0) {
        setNames(data.names);
      } else {
        setNames(generateFallbackNames(selectedGenres, style));
      }
    } catch {
      setNames(generateFallbackNames(selectedGenres, style));
    }
    setLoading(false);
  }

  function copyName(name: string) {
    navigator.clipboard.writeText(name).catch(() => {});
    setCopied(name);
    setTimeout(() => setCopied(null), 2000);
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

      <main className="max-w-3xl mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <div className="text-4xl mb-4">✍️</div>
          <h1 className="text-3xl font-bold mb-2">Pen Name Generator</h1>
          <p className="text-white/50">Generate 10 unique pen name suggestions tailored to your genre and style. No account required.</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 space-y-5 mb-6">
          <div>
            <label className="text-xs font-medium text-white/60 block mb-2">
              Real Name (optional — used to suggest similar sounds)
            </label>
            <input
              type="text"
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
              placeholder="e.g., Jane Smith"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/60 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-white/60 block mb-2">
              Genre (select up to 3)
            </label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => (
                <button
                  key={g}
                  onClick={() => toggleGenre(g)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                    selectedGenres.includes(g)
                      ? "border-violet-500/60 bg-violet-500/15 text-violet-300"
                      : "border-white/10 bg-white/5 text-white/50 hover:text-white"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-white/60 block mb-2">Author Style</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStyle(s.value)}
                  className={`py-2.5 px-3 rounded-lg text-xs border transition-all text-left ${
                    style === s.value
                      ? "border-violet-500/60 bg-violet-500/15 text-violet-300"
                      : "border-white/10 bg-white/5 text-white/50 hover:text-white"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={loading || selectedGenres.length === 0}
            className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 transition-colors py-3 text-sm font-semibold text-white"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Generating Names…
              </span>
            ) : "Generate 10 Pen Names ✍️"}
          </button>
        </div>

        {names.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-white/60 mb-4">Your Pen Name Suggestions</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {names.map((item, i) => (
                <div key={i} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-base font-semibold">{item.name}</p>
                    <button
                      onClick={() => copyName(item.name)}
                      className="shrink-0 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors px-2.5 py-1.5 text-xs text-white/60 hover:text-white"
                    >
                      {copied === item.name ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-xs text-violet-400">{item.genreFit}</p>
                  <p className="text-xs text-white/50 leading-relaxed">{item.whyItWorks}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
