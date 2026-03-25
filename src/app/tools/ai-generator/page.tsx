"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const GENRES = ["Thriller","Romance","Fantasy","Sci-Fi","Children's","Non-Fiction","Coloring Book","Business"];
const STYLES = ["Illustrated","Photo-realistic","Minimalist","Watercolor","Hand-drawn"];

interface CoverConcept {
  title: string;
  description: string;
  palette: string[];
  typography: string;
  preset: string;
}

export default function AiGeneratorPage() {
  const router = useRouter();
  const [genre, setGenre] = useState("Fantasy");
  const [style, setStyle] = useState("Illustrated");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [concepts, setConcepts] = useState<CoverConcept[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setConcepts([]);
    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genre, style, prompt }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to generate"); setLoading(false); return; }
      setConcepts(data.concepts || []);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  function useConcept(concept: CoverConcept) {
    const presetMap: Record<string,string> = {
      "thriller":"thriller","romance":"romance","fantasy":"fantasy",
      "childrens":"childrens","nonfiction":"nonfiction","coloring":"coloring",
    };
    const preset = presetMap[concept.preset] || concept.preset;
    router.push(`/dashboard/new?preset=${preset}&title=${encodeURIComponent(concept.title)}`);
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

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <div className="text-4xl mb-4">✨</div>
          <h1 className="text-3xl font-bold mb-2">AI Cover Idea Generator</h1>
          <p className="text-white/50">Describe your book and get AI-generated cover concepts with color palettes.</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 space-y-5 mb-6">
          <div>
            <label className="text-xs font-medium text-white/60 block mb-2">Genre</label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(g => (
                <button key={g} onClick={() => setGenre(g)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-all ${genre === g ? "border-violet-500/60 bg-violet-500/15 text-violet-300" : "border-white/10 bg-white/5 text-white/50 hover:text-white"}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-white/60 block mb-2">Visual Style</label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map(s => (
                <button key={s} onClick={() => setStyle(s)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-all ${style === s ? "border-violet-500/60 bg-violet-500/15 text-violet-300" : "border-white/10 bg-white/5 text-white/50 hover:text-white"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-white/60 block mb-2">Book Description (optional)</label>
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={3}
              placeholder="e.g. A detective story set in 1920s Paris with a femme fatale..."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/60 resize-none" />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button onClick={handleGenerate} disabled={loading}
            className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 transition-colors py-3 text-sm font-semibold text-white">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                Generating Ideas…
              </span>
            ) : "Generate Cover Ideas ✨"}
          </button>
        </div>

        {concepts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-white/60">Generated Concepts</h2>
            {concepts.map((concept, i) => (
              <div key={i} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{concept.title}</p>
                    <p className="text-xs text-white/40 mt-0.5">Typography: {concept.typography}</p>
                  </div>
                  <button onClick={() => useConcept(concept)}
                    className="shrink-0 rounded-lg bg-violet-600/80 hover:bg-violet-600 transition-colors px-3 py-1.5 text-xs font-semibold text-white">
                    Use This
                  </button>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">{concept.description}</p>
                <div className="flex gap-2 flex-wrap">
                  {concept.palette.map((color, j) => (
                    <div key={j} title={color} className="w-8 h-8 rounded-lg border border-white/10" style={{ backgroundColor: color }} />
                  ))}
                  <div className="flex items-center gap-1 ml-2 flex-wrap">
                    {concept.palette.map((c, j) => <span key={j} className="text-[10px] text-white/30 font-mono">{c}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
