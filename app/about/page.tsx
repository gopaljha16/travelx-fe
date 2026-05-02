import Navbar from "@/components/Navbar";
import { BusFront, Building2, ShieldCheck, Sparkles } from "lucide-react";

const HIGHLIGHTS = [
  { icon: BusFront, title: "Bus booking", text: "Verified routes with clearer route discovery and seat booking." },
  { icon: Building2, title: "Hotel booking", text: "Stay search focused on trusted inventory, amenities, and better comparison." },
  { icon: ShieldCheck, title: "Reliable backend", text: "Frontend actions are wired to the YatraSqure API stack for auth, search, and booking." },
  { icon: Sparkles, title: "Consistent UX", text: "The customer app now shares one cleaner visual language across its pages." },
];

export default function AboutPage() {
  return (
    <div className="tx-page">
      <Navbar />

      <section className="tx-shell py-10">
        <div className="rounded-[36px] bg-[linear-gradient(135deg,#10213d_0%,#17325f_100%)] p-8 text-white sm:p-10">
          <p className="tx-kicker text-orange-200">About YatraSqure</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">A cleaner travel product for buses and hotels.</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/75 sm:text-base">
            YatraSqure is focused on two real jobs: helping people find reliable bus routes and book better hotel stays. The product direction is now simpler, sharper, and more professional across the full customer journey.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {HIGHLIGHTS.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="tx-card p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#ff6b35]">
                  <Icon size={22} />
                </div>
                <h2 className="mt-4 text-xl font-black text-slate-900">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
