"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      });

      console.log("[signup] data:", data);
      console.log("[signup] error:", authError);

      if (authError) {
        console.error("[signup] status:", authError.status, "code:", authError.code);
        // Show the exact Supabase error — no generic wrapping
        setError(authError.message);
        setLoading(false);
        return;
      }

      // If the DB trigger to create a profile row failed, create it client-side
      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({ id: data.user.id, full_name: name }, { onConflict: "id" });
        if (profileError) {
          console.warn("[signup] profile upsert:", profileError.message);
          // Non-fatal — user was still created in auth.users
        }
      }

      setSuccess(true);
      setLoading(false);
      setTimeout(() => { router.push("/dashboard"); router.refresh(); }, 1500);
    } catch (err) {
      console.error("[signup] unexpected exception:", err);
      setError(err instanceof Error ? err.message : "Unexpected error. Check browser console for details.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5] flex flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="2" width="6" height="14" rx="1" fill="white" opacity="0.9" />
            <rect x="10" y="2" width="6" height="14" rx="1" fill="white" opacity="0.5" />
          </svg>
        </div>
        <span className="text-lg font-semibold tracking-tight">KDP<span className="text-violet-400">Cover</span>Tool</span>
      </Link>
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8">
          <h1 className="text-xl font-bold mb-1">Create your account</h1>
          <p className="text-sm text-white/50 mb-6">Start generating covers for free</p>
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-400">{error}</div>
          )}
          {success && (
            <div className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-400">
              Account created! Redirecting to dashboard…
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Jane Smith"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/60 focus:bg-white/[0.07] transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/60 focus:bg-white/[0.07] transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" minLength={8}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/60 focus:bg-white/[0.07] transition-all" />
              <p className="mt-1 text-[11px] text-white/30">Minimum 8 characters</p>
            </div>
            <button type="submit" disabled={loading || success}
              className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors py-2.5 text-sm font-semibold text-white mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating account…
                </span>
              ) : "Create Account"}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-white/40 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
