"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { BusBooking, getBusBooking } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { BusFront, Loader2 } from "lucide-react";

export default function BusConfirmationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [booking, setBooking] = useState<BusBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user && !authLoading) { router.push("/"); return; }
    if (user) {
      getBusBooking(params.id)
        .then(setBooking)
        .catch(() => setError("Booking not found"))
        .finally(() => setLoading(false));
    }
  }, [authLoading, params.id, router, user]);

  const fmt = (d: string, opts?: Intl.DateTimeFormatOptions) =>
    d ? new Date(d).toLocaleDateString("en-IN", opts ?? { day: "numeric", month: "short", year: "numeric" }) : "—";

  const pnr = booking ? `TX-${booking.id.slice(-6).toUpperCase()}-B` : "";

  if (loading || authLoading) return (
    <div className="min-h-screen bg-[#f8f9ff]"><Navbar />
      <div className="flex min-h-[80vh] items-center justify-center"><Loader2 size={36} className="animate-spin text-[#005cab]" /></div>
    </div>
  );

  if (error || !booking) return (
    <div className="min-h-screen bg-[#f8f9ff]"><Navbar />
      <div className="max-w-5xl mx-auto px-6 py-32 text-center">
        <h1 className="text-2xl font-black text-slate-900">Booking not found</h1>
        <p className="text-slate-500 mt-2">{error}</p>
        <Link href="/bookings" className="mt-6 inline-block bg-[#005cab] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#004786] transition-colors">My Trips</Link>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f8f9ff] text-[#0f1c2c] font-body min-h-screen flex flex-col">
      <Navbar />

      <main className="pt-32 pb-24 px-4 md:px-8 max-w-6xl mx-auto flex-grow">

        {/* ── SUCCESS HEADER ─────────────────────────────────── */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#005cab] to-[#0075d7] text-white mb-6 shadow-xl shadow-[#005cab]/20">
            <span className="material-symbols-outlined text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h1 className="text-5xl font-headline font-extrabold tracking-tight text-[#0f1c2c] mb-4">Booking Successful!</h1>
          <p className="text-[#404754] text-lg font-medium">Your journey with YatraSqure has been confirmed. Pack your bags!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── LEFT ─────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-8">

            {/* PNR Card */}
            <div className="bg-white rounded-2xl p-8 border border-[#c0c7d6]/20 flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <span className="text-xs font-label uppercase tracking-widest text-[#404754] font-semibold">Booking Reference (PNR)</span>
                <div className="text-3xl font-headline font-extrabold text-[#005cab] tracking-tight mt-1">{pnr}</div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => window.print()}
                  className="flex items-center gap-2 px-5 py-3 bg-[#eef4ff] text-[#0f1c2c] font-semibold text-sm rounded-xl hover:bg-[#dbe9ff] transition-colors active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Download Ticket
                </button>
                <button
                  onClick={() => {
                    const title = encodeURIComponent(`Bus: ${booking.from_city} → ${booking.to_city}`);
                    const start = new Date(booking.journey_date).toISOString().replace(/-|:|\.\d+/g, "").slice(0, 15) + "Z";
                    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${start}`, "_blank");
                  }}
                  className="flex items-center gap-2 px-5 py-3 bg-[#005cab] text-white font-semibold text-sm rounded-xl shadow-lg shadow-[#005cab]/20 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
                  Add to Calendar
                </button>
              </div>
            </div>

            {/* Trip Card */}
            <div className="bg-white rounded-2xl overflow-hidden border border-[#c0c7d6]/20">
              <div className="relative h-48 bg-gradient-to-br from-[#005cab] to-[#0075d7]">
                <div className="absolute inset-0 flex flex-col items-start justify-end p-8 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{booking.bus_type ?? "Bus"}</p>
                  <p className="text-3xl font-headline font-extrabold mt-1">{booking.from_city} → {booking.to_city}</p>
                </div>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Departure */}
                <div className="relative pl-8 border-l-2 border-[#005cab]">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#005cab] ring-4 ring-white" />
                  <span className="text-xs font-label uppercase tracking-widest text-[#404754] font-bold">Departure</span>
                  <div className="text-xl font-headline font-bold text-[#0f1c2c] mt-1">{booking.from_city}</div>
                  <div className="text-[#404754] text-sm font-medium mt-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#00628d]">calendar_today</span>
                    {fmt(booking.journey_date)}
                  </div>
                </div>

                {/* Arrival */}
                <div className="relative pl-8 border-l-2 border-[#d6e4f9]">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-orange-400 ring-4 ring-white" />
                  <span className="text-xs font-label uppercase tracking-widest text-[#404754] font-bold">Arrival</span>
                  <div className="text-xl font-headline font-bold text-[#0f1c2c] mt-1">{booking.to_city}</div>
                  <div className="text-[#404754] text-sm font-medium mt-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-orange-500">near_me</span>
                    Arrival city
                  </div>
                </div>

                {/* Details grid */}
                <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 mt-2 border-t border-[#c0c7d6]/15">
                  <div>
                    <span className="text-[10px] font-label uppercase tracking-tighter text-[#404754] font-bold">Operator</span>
                    <div className="text-sm font-headline font-bold mt-1">{booking.bus_name ?? "YatraSqure Bus"}</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-label uppercase tracking-tighter text-[#404754] font-bold">Class</span>
                    <div className="text-sm font-headline font-bold mt-1">{booking.bus_type ?? "Standard"}</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-label uppercase tracking-tighter text-[#404754] font-bold">Seats</span>
                    <div className="text-sm font-headline font-bold mt-1">{booking.seat_numbers.join(", ")}</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-label uppercase tracking-tighter text-[#404754] font-bold">Status</span>
                    <div className="text-sm font-headline font-bold mt-1 text-[#005cab]">{booking.status}</div>
                  </div>
                </div>
              </div>

              {/* Payment verified badge */}
              {booking.razorpay_payment_id && (
                <div className="mx-8 mb-8 bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-3 flex items-start gap-3">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <div>
                    <p className="text-sm font-bold text-emerald-800">Payment Verified</p>
                    <p className="text-xs text-emerald-700 mt-0.5 font-mono">Payment ID: {booking.razorpay_payment_id}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT ────────────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-6">

            {/* Payment Summary */}
            <div className="bg-white rounded-2xl border border-[#c0c7d6]/20 p-6 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#005cab]/5 rounded-full blur-2xl pointer-events-none" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#404754] mb-4">Payment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#404754]">{booking.seat_numbers.length} Seat{booking.seat_numbers.length > 1 ? "s" : ""} ({booking.bus_type})</span>
                  <span className="font-medium">₹{booking.total_price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#404754]">Taxes & Fees</span>
                  <span className="font-medium">Included</span>
                </div>
                <div className="pt-3 border-t border-[#c0c7d6]/20 flex justify-between items-baseline">
                  <span className="font-bold text-[#0f1c2c]">Total Paid</span>
                  <span className="text-2xl font-extrabold font-headline text-[#005cab]">₹{booking.total_price.toLocaleString()}</span>
                </div>
                {booking.razorpay_payment_id && (
                  <p className="text-[10px] text-[#404754] font-mono pt-1">Ref: {booking.razorpay_payment_id}</p>
                )}
              </div>
            </div>

            {/* Digital concierge */}
            <div className="bg-[#eef4ff] rounded-2xl p-6 border-l-4 border-[#005cab]">
              <span className="material-symbols-outlined text-[#005cab] text-[24px] mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>concierge</span>
              <h3 className="font-headline font-bold text-[#0f1c2c] mb-2">The YatraSqure Promise</h3>
              <p className="text-sm text-[#404754] leading-relaxed">Your digital concierge is active. We&apos;ll notify you of any schedule changes before departure.</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Link href="/bookings"
                className="w-full py-4 text-center rounded-xl bg-[#005cab] text-white font-bold hover:bg-[#004786] transition-colors"
              >
                My Trips
              </Link>
              <Link href="/"
                className="w-full py-4 text-center rounded-xl border border-[#c0c7d6] text-[#0f1c2c] font-medium hover:bg-slate-50 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-slate-50 w-full py-12 px-8 border-t border-slate-100 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto gap-6">
          <span className="font-bold text-slate-900 font-headline">YatraSqure</span>
          <div className="flex flex-wrap justify-center gap-8">
            {["Privacy Policy", "Terms of Service", "Fleet Info", "Contact"].map(l => (
              <a key={l} href="#" className="text-slate-400 text-xs uppercase tracking-widest hover:text-[#005cab] transition-colors">{l}</a>
            ))}
          </div>
          <p className="text-slate-400 text-xs">© 2026 YatraSqure. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
