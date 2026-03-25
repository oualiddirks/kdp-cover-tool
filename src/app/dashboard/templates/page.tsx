"use client";

import { useRouter } from "next/navigation";

const templates = [
  { id: "mandala", name: "Sacred Mandalas", category: "Mandala", description: "Intricate circular patterns perfect for meditative coloring sessions.", pages: 120, difficulty: "Intermediate", gradient: "from-violet-500/30 to-indigo-500/20", accentColor: "text-violet-300", badge: "Most Popular", badgeColor: "bg-violet-500/20 text-violet-300 border-violet-500/30", trimSize: "8.5 x 11" },
  { id: "floral", name: "Botanical Gardens", category: "Floral", description: "Delicate flowers and leaves with varying levels of detail.", pages: 96, difficulty: "Beginner", gradient: "from-emerald-500/30 to-teal-500/20", accentColor: "text-emerald-300", badge: "Beginner Friendly", badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", trimSize: "8.5 x 11" },
  { id: "animals", name: "Wildlife Safari", category: "Animals", description: "Majestic animals from around the world with artistic line work.", pages: 80, difficulty: "Intermediate", gradient: "from-amber-500/30 to-orange-500/20", accentColor: "text-amber-300", badge: null, badgeColor: "", trimSize: "8 x 10" },
  { id: "geometric", name: "Geometric Harmony", category: "Geometric", description: "Sharp lines and repeating shapes for a modern, satisfying fill.", pages: 100, difficulty: "Advanced", gradient: "from-cyan-500/30 to-blue-500/20", accentColor: "text-cyan-300", badge: "New", badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30", trimSize: "8.5 x 8.5" },
  { id: "fantasy", name: "Fantasy Realms", category: "Fantasy", description: "Dragons, castles, and mythical creatures with rich detail.", pages: 120, difficulty: "Advanced", gradient: "from-rose-500/30 to-pink-500/20", accentColor: "text-rose-300", badge: null, badgeColor: "", trimSize: "8.5 x 11" },
  { id: "abstract", name: "Abstract Flow", category: "Abstract", description: "Free-flowing organic shapes and patterns for expressive coloring.", pages: 96, difficulty: "Beginner", gradient: "from-purple-500/30 to-fuchsia-500/20", accentColor: "text-purple-300", badge: null, badgeColor: "", trimSize: "6 x 9" },
];

const difficultyColors: Record<string, string> = {
  Beginner: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Intermediate: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Advanced: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function TemplatesPage() {
  const router = useRouter();

  function handleUseTemplate(template: typeof templates[0]) {
    const params = new URLSearchParams({
      title: `${template.name} Coloring Book`,
      pages: String(template.pages),
      trimSize: template.trimSize,
    });
    router.push(`/dashboard/new?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-white/50">Choose a starting template for your coloring book cover. All templates are fully customizable.</p>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {templates.map((t) => (
          <div key={t.id} className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden hover:border-white/15 transition-all">
            <div className={`h-40 bg-gradient-to-br ${t.gradient} relative flex items-center justify-center`}>
              {t.badge && (
                <div className={`absolute top-3 left-3 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${t.badgeColor}`}>{t.badge}</div>
              )}
              <div className="opacity-30">
                {t.category === "Mandala" && (
                  <svg viewBox="0 0 80 80" className="w-20 h-20 text-white" fill="none" stroke="currentColor" strokeWidth="0.8">
                    <circle cx="40" cy="40" r="35" /><circle cx="40" cy="40" r="25" /><circle cx="40" cy="40" r="15" /><circle cx="40" cy="40" r="5" />
                    {[0,45,90,135,180,225,270,315].map((a) => <line key={a} x1="40" y1="5" x2="40" y2="75" transform={`rotate(${a} 40 40)`} />)}
                  </svg>
                )}
                {t.category === "Floral" && (
                  <svg viewBox="0 0 80 80" className="w-20 h-20 text-white" fill="none" stroke="currentColor" strokeWidth="0.8">
                    {[0,60,120,180,240,300].map((a) => <ellipse key={a} cx="40" cy="20" rx="8" ry="16" transform={`rotate(${a} 40 40)`} />)}
                    <circle cx="40" cy="40" r="8" />
                  </svg>
                )}
                {t.category === "Geometric" && (
                  <svg viewBox="0 0 80 80" className="w-20 h-20 text-white" fill="none" stroke="currentColor" strokeWidth="0.8">
                    <rect x="10" y="10" width="60" height="60" /><rect x="20" y="20" width="40" height="40" transform="rotate(45 40 40)" /><rect x="25" y="25" width="30" height="30" />
                  </svg>
                )}
                {(t.category === "Animals" || t.category === "Fantasy" || t.category === "Abstract") && (
                  <svg viewBox="0 0 80 80" className="w-20 h-20 text-white" fill="none" stroke="currentColor" strokeWidth="0.8">
                    <path d="M10 70 Q40 10 70 70" /><path d="M20 70 Q40 20 60 70" /><path d="M30 70 Q40 30 50 70" /><circle cx="40" cy="35" r="12" />
                  </svg>
                )}
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-xs text-white/40 mb-0.5">{t.category}</p>
                  <h3 className="text-sm font-semibold">{t.name}</h3>
                </div>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${difficultyColors[t.difficulty]}`}>{t.difficulty}</span>
              </div>
              <p className="text-xs text-white/50 mb-4 leading-relaxed">{t.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/30">{t.pages} pages · {t.trimSize}"</span>
                <button onClick={() => handleUseTemplate(t)} className="rounded-lg bg-violet-600/80 hover:bg-violet-600 transition-colors px-3 py-1.5 text-xs font-semibold text-white">
                  Use Template
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
