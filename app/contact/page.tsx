import Navbar from "@/components/Navbar";
import { Headphones, Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="tx-page">
      <Navbar />

      <section className="tx-shell py-10">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[36px] bg-[linear-gradient(135deg,#ff6b35_0%,#ff884d_100%)] p-8 text-white sm:p-10">
            <p className="tx-kicker text-orange-100">Contact YatraSqure</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Need help with a booking?</h1>
            <p className="mt-4 text-sm leading-7 text-white/80 sm:text-base">
              Reach the YatraSqure support team for buses, hotels, payments, and booking issues.
            </p>

            <div className="mt-8 space-y-4">
              <div className="rounded-3xl bg-white/12 p-4 backdrop-blur">
                <div className="inline-flex items-center gap-2 text-sm font-bold">
                  <Mail size={16} />
                  Email
                </div>
                <p className="mt-2 text-sm text-white/80">support@yatrasqure.com</p>
              </div>
              <div className="rounded-3xl bg-white/12 p-4 backdrop-blur">
                <div className="inline-flex items-center gap-2 text-sm font-bold">
                  <Phone size={16} />
                  Phone
                </div>
                <p className="mt-2 text-sm text-white/80">+91 22 2344 5667</p>
              </div>
              <div className="rounded-3xl bg-white/12 p-4 backdrop-blur">
                <div className="inline-flex items-center gap-2 text-sm font-bold">
                  <MapPin size={16} />
                  Office
                </div>
                <p className="mt-2 text-sm text-white/80">24B Heritage Plaza, BKC, Mumbai 400051</p>
              </div>
            </div>
          </div>

          <div className="tx-card p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              <Headphones size={16} />
              Support request
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900">Tell us what you need.</h2>
            <form className="mt-6 space-y-4">
              <input className="tx-input" type="text" placeholder="Your name" />
              <input className="tx-input" type="email" placeholder="Your email" />
              <textarea className="min-h-[180px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-[#ff6b35] focus:ring-4 focus:ring-orange-100" placeholder="How can YatraSqure help?" />
              <button type="submit" className="tx-button-primary">
                Send message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
