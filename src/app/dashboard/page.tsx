"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Cover = {
  id: string;
  title: string;
  author: string;
  trim_size: string;
  page_count: number;
  paper_type: string;
  cover_finish: string;
  status: string;
  created_at: string;
};

type Profile = {
  full_name: string | null;
  plan: string;
  covers_this_month: number;
};

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3 w-20 bg-white/10 rounded" />
        <div className="h-5 w-5 bg-white/10 rounded" />
      </div>
      <div className="h-7 w-16 bg-white/10 rounded mb-2" />
      <div className="h-3 w-24 bg-white/10 rounded" />
    </div>
  );
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [covers, setCovers] = useState<Cover[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, coversRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("covers").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (coversRes.data) setCovers(coversRes.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const planLimit = profile?.plan === "free" ? 3 : null;
  const usedThisMonth = profile?.covers_this_month ?? 0;

  const stats = [
    { label: "Covers Created", value: loading ? "—" : String(covers.length > 0 ? covers.length : "0"), icon: "📄" },
    { label: "Exports This Month", value: loading ? "—" : `${usedThisMonth} / ${planLimit ?? "∞"}`, delta: profile?.plan === "free" ? "Free plan" : "Pro plan", icon: "⬇️" },
    { label: "Templates Used", value: "0", icon: "🎨" },
    { label: "Time Saved", value: "~2 hrs", delta: "Est.", icon: "⏱️" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-white/40">{s.label}</span>
                  <span className="text-lg">{s.icon}</span>
                </div>
                <p className="text-2xl font-bold mb-1">{s.value}</p>
                {s.delta && <p className="text-xs text-white/30">{s.delta}</p>}
              </div>
            ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Covers */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-semibold">Recent Covers</h2>
                <p className="text-xs text-white/40">Your last created covers</p>
              </div>
              <Link href="/dashboard/covers" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">View all</Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-10 h-14 rounded bg-white/10 shrink-0" />
                    <div className="flex-1">
                      <div className="h-4 w-40 bg-white/10 rounded mb-2" />
                      <div className="h-3 w-24 bg-white/10 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : covers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center mb-4">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-white/20" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-white/40 mb-1">No covers yet</p>
                <p className="text-xs text-white/25 mb-4">Your covers will appear here once you create them</p>
                <Link href="/dashboard/new" className="rounded-lg border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 transition-colors px-4 py-2 text-xs font-semibold text-violet-400">
                  Create your first cover
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {covers.map((cover) => (
                  <div key={cover.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                    <div className="w-10 h-14 rounded border border-white/10 bg-gradient-to-b from-violet-500/20 to-indigo-500/10 shrink-0 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-violet-400/60" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{cover.title}</p>
                      <p className="text-xs text-white/40">{cover.author} · {cover.page_count} pages · {cover.trim_size}"</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${cover.status === "complete" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                      {cover.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Start */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
            <h2 className="text-sm font-semibold mb-1">Quick Start</h2>
            <p className="text-xs text-white/40 mb-6">Create your first KDP cover in 3 steps</p>
            <div className="space-y-4">
              {[
                { step: "1", title: "Enter book details", desc: "Page count, trim size, paper type" },
                { step: "2", title: "Choose a template", desc: "Pick from 6+ coloring book designs" },
                { step: "3", title: "Export your cover", desc: "Download a print-ready PDF instantly" },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="mt-0.5 w-6 h-6 rounded-full border border-white/20 text-white/40 flex items-center justify-center shrink-0 text-xs font-bold">{item.step}</div>
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-white/40">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/dashboard/new" className="mt-6 block w-full rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors py-2.5 text-sm font-semibold text-white text-center">
              Create My First Cover
            </Link>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
            <h2 className="text-sm font-semibold mb-1">Resources</h2>
            <p className="text-xs text-white/40 mb-5">Helpful guides for KDP publishers</p>
            <div className="space-y-3">
              {[
                { title: "KDP Spine Width Calculator", desc: "Understand how page count affects your spine", href: "/dashboard/new", icon: "📐" },
                { title: "Cover Requirements Guide", desc: "Full breakdown of KDP PDF spec", href: "#", icon: "📋" },
                { title: "Template Gallery", desc: "Browse all coloring book designs", href: "/dashboard/templates", icon: "🎨" },
              ].map((r) => (
                <Link key={r.title} href={r.href} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                  <span className="text-xl">{r.icon}</span>
                  <div>
                    <p className="text-sm font-medium group-hover:text-violet-300 transition-colors">{r.title}</p>
                    <p className="text-xs text-white/40">{r.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
