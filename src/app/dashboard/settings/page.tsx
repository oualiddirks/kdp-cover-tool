"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

type Profile = {
  full_name: string | null;
  plan: string;
  covers_this_month: number;
  created_at: string;
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserEmail(user.email ?? "");
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile(data);
        setName(data.full_name ?? "");
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ full_name: name }).eq("id", user.id);
    if (error) {
      addToast("Failed to save profile", "error");
    } else {
      addToast("Profile updated successfully!", "success");
      setProfile((prev) => prev ? { ...prev, full_name: name } : prev);
    }
    setSaving(false);
  }

  async function handleUpgrade(plan: string) {
    setCheckoutLoading(plan);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        addToast(data.error || "Failed to create checkout", "error");
        setCheckoutLoading(null);
      }
    } catch {
      addToast("Failed to start checkout", "error");
      setCheckoutLoading(null);
    }
  }

  const planBadgeColor = profile?.plan === "pro"
    ? "bg-violet-500/20 text-violet-300 border-violet-500/30"
    : profile?.plan === "business"
    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
    : "bg-white/10 text-white/60 border-white/10";

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <h2 className="text-sm font-semibold mb-1">Profile</h2>
        <p className="text-xs text-white/40 mb-6">Your name and email address</p>
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-10 bg-white/10 rounded-lg" />
            <div className="h-10 bg-white/10 rounded-lg" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none focus:border-violet-500/60 focus:bg-white/[0.07] transition-all" />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Email Address</label>
              <input type="email" value={userEmail} disabled
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white/50 outline-none cursor-not-allowed" />
              <p className="mt-1 text-[11px] text-white/30">Email cannot be changed here</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Member Since</label>
              <p className="text-sm text-white/60">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"}</p>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button type="submit" disabled={saving} className="rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors px-4 py-2 text-sm font-medium text-white">
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Saving...
                  </span>
                ) : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Plan info */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <h2 className="text-sm font-semibold mb-1">Current Plan</h2>
        <p className="text-xs text-white/40 mb-6">Your subscription and usage</p>
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-20 bg-white/10 rounded-xl" />
            <div className="h-10 bg-white/10 rounded-lg" />
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5 mb-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-violet-300 capitalize">{profile?.plan ?? "Free"} Plan</p>
                  <p className="text-xs text-white/40">{profile?.plan === "free" ? "3 covers / month" : profile?.plan === "pro" ? "Unlimited covers" : "Everything + bulk features"}</p>
                </div>
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${planBadgeColor}`}>Active</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-white/5">
              <div>
                <p className="text-sm font-medium text-white/80">Exports used this month</p>
              </div>
              <span className="text-sm font-bold">{profile?.covers_this_month ?? 0} / {profile?.plan === "free" ? "3" : "∞"}</span>
            </div>

            {profile?.plan === "free" && (
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button onClick={() => handleUpgrade("pro")} disabled={checkoutLoading !== null}
                  className="rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 transition-colors py-2.5 text-sm font-semibold text-white">
                  {checkoutLoading === "pro" ? "Loading..." : "Upgrade to Pro — €14.99/mo"}
                </button>
                <button onClick={() => handleUpgrade("business")} disabled={checkoutLoading !== null}
                  className="rounded-xl border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 disabled:opacity-60 transition-colors py-2.5 text-sm font-semibold text-violet-300">
                  {checkoutLoading === "business" ? "Loading..." : "Business — €29.99/mo"}
                </button>
              </div>
            )}
            {profile?.plan !== "free" && (
              <p className="mt-4 text-xs text-white/40">To manage your subscription, contact support@kdpcovertool.com</p>
            )}
          </>
        )}
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border border-red-500/10 bg-red-500/[0.03] p-6">
        <h2 className="text-sm font-semibold mb-1 text-red-400">Danger Zone</h2>
        <p className="text-xs text-white/40 mb-5">Irreversible actions for your account</p>
        <button type="button" className="rounded-lg border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 transition-colors px-4 py-2 text-sm font-medium text-red-400">
          Delete Account
        </button>
      </div>
    </div>
  );
}
