import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About – KDP Cover Tool",
  description: "Built for indie authors by indie authors. Learn about KDP Cover Tool's mission to help self-publishers create professional book covers.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="py-20 px-6 text-center border-b border-white/[0.05]">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
            Our Story
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-5">
            Built for Indie Authors,{" "}
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              By Indie Authors
            </span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
            We built KDP Cover Tool because we were tired of getting covers rejected. After the fifth rejection for a wrong spine width, we decided to automate the whole process.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-white/60 leading-relaxed mb-4">
                Self-publishing should be about your story, not about fighting with PDF specs and bleed settings. Professional book cover design was once only accessible to authors with big budgets and designer contacts.
              </p>
              <p className="text-white/60 leading-relaxed mb-4">
                KDP Cover Tool changes that. We give every indie author — whether you&apos;re publishing your first coloring book or your fiftieth thriller — the same professional tools that major publishers use, for free or at a fraction of the cost.
              </p>
              <p className="text-white/60 leading-relaxed">
                No more spine width spreadsheets. No more KDP rejection emails. No more expensive designers just to get the dimensions right.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Covers Created", value: "50,000+" },
                { label: "KDP Pass Rate", value: "98%" },
                { label: "Active Authors", value: "12,000+" },
                { label: "Free Tools", value: "10" },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-center">
                  <p className="text-3xl font-bold text-violet-400 mb-1">{value}</p>
                  <p className="text-sm text-white/50">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white/[0.01] border-y border-white/[0.05]">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Enter Book Details",
                desc: "Tell us your page count, trim size, and paper type. We use KDP's official formulas to calculate exact dimensions.",
              },
              {
                step: "2",
                title: "Design Your Cover",
                desc: "Use our built-in editor, upload your design, or choose from our template gallery. All with real-time dimension guides.",
              },
              {
                step: "3",
                title: "Export & Publish",
                desc: "Download a print-ready PDF that meets every KDP requirement. Upload directly to KDP and publish with confidence.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-lg font-bold text-white mx-auto mb-4">
                  {step}
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold mb-4">A Small Team with Big Goals</h2>
          <p className="text-white/50 mb-12 leading-relaxed">
            We&apos;re a small team of developers, designers, and indie authors. We use KDP Cover Tool ourselves for our own publishing projects, which means every feature we build is one we actually need.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { initials: "AK", name: "Alex Kim", role: "Co-founder & Developer" },
              { initials: "SR", name: "Sarah Rodriguez", role: "Co-founder & Designer" },
              { initials: "MP", name: "Marcus Pierce", role: "KDP Publishing Expert" },
            ].map(({ initials, name, role }) => (
              <div key={name} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-lg font-bold text-white mx-auto mb-3">
                  {initials}
                </div>
                <p className="font-semibold text-sm">{name}</p>
                <p className="text-xs text-white/40 mt-1">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-white/[0.05] text-center">
        <div className="mx-auto max-w-lg">
          <h2 className="text-2xl font-bold mb-3">Ready to Publish with Confidence?</h2>
          <p className="text-white/50 mb-6">Join 12,000+ indie authors who create KDP-compliant covers with our free tools.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/signup" className="rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors px-6 py-3 text-sm font-semibold text-white">
              Get Started Free
            </Link>
            <Link href="/tools" className="rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all px-6 py-3 text-sm font-semibold text-white">
              Explore Tools
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
