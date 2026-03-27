"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

type Cover = {
  id: string;
  title: string;
  author: string;
  trim_size: string;
  page_count: number;
  paper_type: string;
  cover_finish: string;
  status: string;
  spine_width: number | null;
  created_at: string;
};

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-6 py-4 animate-pulse">
      <div className="w-10 h-14 rounded bg-white/10 shrink-0" />
      <div className="flex-1">
        <div className="h-4 w-40 bg-white/10 rounded mb-2" />
        <div className="h-3 w-24 bg-white/10 rounded" />
      </div>
      <div className="hidden md:block h-4 w-20 bg-white/10 rounded" />
      <div className="hidden md:block h-4 w-16 bg-white/10 rounded" />
      <div className="hidden md:block h-4 w-12 bg-white/10 rounded" />
    </div>
  );
}

export default function CoversPage() {
  const [covers, setCovers] = useState<Cover[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchCovers();
  }, []);

  async function fetchCovers() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("covers")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setCovers(data ?? []);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this cover? This cannot be undone.")) return;
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("covers").delete().eq("id", id);
    if (error) {
      addToast("Failed to delete cover", "error");
    } else {
      setCovers((prev) => prev.filter((c) => c.id !== id));
      addToast("Cover deleted", "success");
    }
    setDeletingId(null);
  }

  async function handleDownloadPdf(cover: Cover) {
    setDownloadingId(cover.id);
    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverId: cover.id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        addToast(err.error || "PDF generation failed", "error");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${cover.title.replace(/\s+/g, "-")}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast("PDF downloaded!", "success");
      // Update local status
      setCovers((prev) =>
        prev.map((c) => (c.id === cover.id ? { ...c, status: "complete" } : c))
      );
    } catch {
      addToast("Failed to generate PDF", "error");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/50">
          {loading ? "Loading…" : `${covers.length} cover${covers.length !== 1 ? "s" : ""} created`}
        </p>
        <Link
          href="/dashboard/new"
          className="flex items-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 text-sm font-medium text-white"
        >
          <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 4.5v11m5.5-5.5h-11" />
          </svg>
          New Cover
        </Link>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
        {/* Header row */}
        {!loading && covers.length > 0 && (
          <div className="hidden md:grid grid-cols-[1fr_140px_120px_100px_110px_120px] gap-4 px-6 py-3 border-b border-white/5 text-xs font-medium text-white/40">
            <span>Cover</span>
            <span>Trim Size</span>
            <span>Spine Width</span>
            <span>Finish</span>
            <span>Created</span>
            <span className="text-right">Actions</span>
          </div>
        )}

        {loading ? (
          <div className="divide-y divide-white/5">
            {[1, 2, 3].map((i) => <SkeletonRow key={i} />)}
          </div>
        ) : covers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white/20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <p className="text-sm font-medium text-white/40 mb-1">No covers yet</p>
            <p className="text-xs text-white/25 mb-4">Create your first cover to get started</p>
            <Link
              href="/dashboard/new"
              className="rounded-lg border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 transition-colors px-4 py-2 text-xs font-semibold text-violet-400"
            >
              Create your first cover
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {covers.map((cover) => (
              <div
                key={cover.id}
                className="grid md:grid-cols-[1fr_140px_120px_100px_110px_120px] gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors"
              >
                {/* Cover info */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-14 rounded border border-white/10 bg-gradient-to-b from-violet-500/20 to-indigo-500/10 shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-violet-400/60" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{cover.title}</p>
                    <p className="text-xs text-white/40">{cover.author} · {cover.page_count} pages · {cover.paper_type}</p>
                    <span className={`inline-flex mt-1 items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                      cover.status === "complete"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}>
                      {cover.status}
                    </span>
                  </div>
                </div>

                <div className="hidden md:block">
                  <span className="text-sm text-white/70">{cover.trim_size}&quot;</span>
                </div>
                <div className="hidden md:block">
                  <span className="text-sm font-mono text-violet-300">
                    {cover.spine_width ? `${Number(cover.spine_width).toFixed(4)}"` : "—"}
                  </span>
                </div>
                <div className="hidden md:block">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${
                    cover.cover_finish === "matte"
                      ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
                      : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                  }`}>
                    {cover.cover_finish}
                  </span>
                </div>
                <div className="hidden md:block">
                  <span className="text-xs text-white/40">
                    {new Date(cover.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2">
                  {/* Download PDF */}
                  <button
                    onClick={() => handleDownloadPdf(cover)}
                    disabled={downloadingId === cover.id}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-emerald-400 transition-colors disabled:opacity-50"
                    title="Download PDF"
                  >
                    {downloadingId === cover.id ? (
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                    )}
                  </button>

                  {/* Edit in editor */}
                  <Link
                    href={`/dashboard/new?coverId=${cover.id}&title=${encodeURIComponent(cover.title)}`}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-violet-400 transition-colors"
                    title="Edit cover"
                  >
                    <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                    </svg>
                  </Link>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(cover.id)}
                    disabled={deletingId === cover.id}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-red-400 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    {deletingId === cover.id ? (
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
