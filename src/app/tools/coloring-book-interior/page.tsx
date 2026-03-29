"use client";

import { useState } from "react";
import Link from "next/link";

const STYLES = ["Mandala", "Animals", "Nature", "Patterns", "Fantasy", "Flowers"];
const COMPLEXITIES = [
  { value: "simple", label: "Simple (Kids)", desc: "Large areas, simple shapes, easy to color" },
  { value: "medium", label: "Medium", desc: "Moderate detail, good for all ages" },
  { value: "detailed", label: "Detailed (Adults)", desc: "Intricate patterns, fine linework" },
];

type Concept = {
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
};

const FALLBACK_CONCEPTS: Record<string, Concept[]> = {
  Mandala: [
    {
      title: "Lotus Mandala",
      description: "A centered lotus flower mandala with eight petals radiating outward. Each petal contains delicate geometric patterns including tiny triangles and concentric circles. The outer ring features alternating teardrop shapes and small diamonds.",
      difficulty: "Medium",
      tags: ["Geometric", "Floral", "Meditative"],
    },
    {
      title: "Sunburst Mandala",
      description: "A radiant sunburst design with 12 main rays extending from a central star. Between the rays, intricate swirling patterns connect to an outer ring of scalloped borders. Features multiple concentric rings of varying pattern density.",
      difficulty: "Detailed",
      tags: ["Geometric", "Angular", "Cosmic"],
    },
    {
      title: "Simple Circle Mandala",
      description: "A child-friendly mandala with bold circular sections. Six large petal shapes surround a central circle, with simple dot patterns and wavy lines filling each section. Suitable for beginners.",
      difficulty: "Simple",
      tags: ["Beginner", "Bold", "Fun"],
    },
    {
      title: "Celtic Knot Mandala",
      description: "A circular Celtic knotwork design where interlocking bands weave through a mandala structure. Four large knot sections alternate with detailed interlaced patterns, creating a hypnotic interwoven effect.",
      difficulty: "Detailed",
      tags: ["Celtic", "Intricate", "Traditional"],
    },
  ],
  Animals: [
    {
      title: "Enchanted Forest Owl",
      description: "A majestic great horned owl perched on a branch, with its large feathers filled with intricate patterns of swirls, flowers, and geometric shapes. The background features detailed forest foliage and a full moon.",
      difficulty: "Detailed",
      tags: ["Bird", "Forest", "Patterns"],
    },
    {
      title: "Happy Garden Butterfly",
      description: "A large butterfly with symmetrical wings divided into sections filled with simple flowers, dots, and wavy lines. Bold outlines make it easy for children to color. Surrounded by simple daisies.",
      difficulty: "Simple",
      tags: ["Insect", "Nature", "Kids"],
    },
    {
      title: "Majestic Lion",
      description: "A lion's face with a grand mane made up of flowing swirls and tribal patterns. The main features are clearly defined while the mane provides a rich canvas for detailed coloring with various geometric infills.",
      difficulty: "Medium",
      tags: ["Big Cat", "Tribal", "Portrait"],
    },
    {
      title: "Koi Fish Dance",
      description: "Two koi fish swimming in a circular yin-yang arrangement, surrounded by lotus flowers and water ripples. Each fish has scales rendered as small interlocking circles, with detailed fin patterns.",
      difficulty: "Detailed",
      tags: ["Fish", "Japanese", "Water"],
    },
  ],
};

function getFallbackConcepts(style: string): Concept[] {
  return FALLBACK_CONCEPTS[style] || FALLBACK_CONCEPTS["Mandala"];
}

export default function ColoringBookInteriorPage() {
  const [style, setStyle] = useState("Mandala");
  const [complexity, setComplexity] = useState("medium");
  const [theme, setTheme] = useState("");
  const [loading, setLoading] = useState(false);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setConcepts([]);
    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "coloring-concepts",
          style,
          complexity,
          theme,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      if (data.concepts && data.concepts.length > 0) {
        setConcepts(data.concepts);
      } else {
        setConcepts(getFallbackConcepts(style));
      }
    } catch {
      setConcepts(getFallbackConcepts(style));
    }
    setLoading(false);
  }

  const difficultyColor: Record<string, string> = {
    Simple: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Detailed: "bg-violet-500/10 text-violet-400 border-violet-500/20",
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

      <main className="max-w-3xl mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <div className="text-4xl mb-4">🎨</div>
          <h1 className="text-3xl font-bold mb-2">AI Coloring Book Concept Generator</h1>
          <p className="text-white/50">Generate 4 unique coloring book page concepts tailored to your style. No account required.</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 space-y-5 mb-6">
          <div>
            <label className="text-xs font-medium text-white/60 block mb-2">Art Style</label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                    style === s
                      ? "border-violet-500/60 bg-violet-500/15 text-violet-300"
                      : "border-white/10 bg-white/5 text-white/50 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-white/60 block mb-2">Complexity / Target Audience</label>
            <div className="grid sm:grid-cols-3 gap-2">
              {COMPLEXITIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setComplexity(c.value)}
                  className={`p-3 rounded-xl border transition-all text-left ${
                    complexity === c.value
                      ? "border-violet-500/60 bg-violet-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <p className={`text-xs font-semibold mb-0.5 ${complexity === c.value ? "text-violet-300" : "text-white/70"}`}>{c.label}</p>
                  <p className="text-[10px] text-white/40">{c.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-white/60 block mb-2">Custom Theme (optional)</label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g. Enchanted forest, Ocean life, Space adventure..."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/60 transition-all"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 transition-colors py-3 text-sm font-semibold text-white"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Generating Concepts…
              </span>
            ) : "Generate Page Concepts 🎨"}
          </button>
        </div>

        {concepts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-white/60">Your Coloring Page Concepts</h2>
            {concepts.map((c, i) => (
              <div key={i} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{c.title}</p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${difficultyColor[c.difficulty] ?? "bg-white/10 text-white/40 border-white/10"}`}>
                    {c.difficulty}
                  </span>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">{c.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {c.tags?.map((tag) => (
                    <span key={tag} className="rounded-full bg-white/[0.05] border border-white/10 px-2 py-0.5 text-[10px] text-white/40">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {/* Upsell CTA */}
            <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6 text-center mt-6">
              <h3 className="text-base font-semibold mb-2">Ready to Create Your Full Coloring Book?</h3>
              <p className="text-sm text-white/50 mb-4">
                Use our Coloring Book Maker to design a professional cover for your book.
              </p>
              <Link
                href="/tools/coloring-book"
                className="inline-block rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors px-6 py-2.5 text-sm font-semibold text-white"
              >
                Create Cover →
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
