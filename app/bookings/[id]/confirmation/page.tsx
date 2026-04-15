"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Booking, getBooking } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function BookingConfirmationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user && !authLoading) { router.push("/login"); return; }
    if (user) {
      getBooking(params.id)
        .then(setBooking)
        .catch(() => setError("Booking not found"))
        .finally(() => setLoading(false));
    }
  }, [authLoading, params.id, router, user]);

  const fmt = (d: string, opts?: Intl.DateTimeFormatOptions) =>
    d ? new Date(d).toLocaleDateString("en-IN", opts ?? { day: "numeric", month: "short", year: "numeric" }) : "—";

  const totalNights = booking
    ? Math.max(0, Math.ceil((new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / 86400000))
    : 0;

  // Shorten booking ID to a PNR-style display
  const pnr = booking ? `TX-${booking.id.slice(-6).toUpperCase()}-H` : "";

  const mapsUrl = booking?.latitude && booking?.longitude
    ? `https://www.google.com/maps?q=${booking.latitude},${booking.longitude}`
    : `https://www.google.com/maps/search/${encodeURIComponent(booking?.hotel_name ?? "hotel")}`;

  if (loading || authLoading) return (
    <div className="min-h-screen bg-[#f8f9ff]"><Navbar />
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 size={36} className="animate-spin text-[#005cab]" />
      </div>
    </div>
  );

  if (error || !booking) return (
    <div className="min-h-screen bg-[#f8f9ff]"><Navbar />
      <div className="max-w-5xl mx-auto px-6 py-32 text-center">
        <h1 className="text-2xl font-black text-slate-900">Booking not found</h1>
        <p className="mt-2 text-slate-500">{error}</p>
        <Link href="/bookings" className="mt-6 inline-block bg-[#005cab] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#004786] transition-colors">My Trips</Link>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f8f9ff] text-[#0f1c2c] font-body min-h-screen flex flex-col">
      <Navbar />

      <main className="pt-32 pb-20 px-4 md:px-8 max-w-5xl mx-auto w-full flex-grow">

        {/* ── SUCCESS HEADER ─────────────────────────────────── */}
        <section className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 mb-6 border border-emerald-100">
            <span className="material-symbols-outlined text-[40px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}>check_circle</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight text-[#0f1c2c] mb-4">Booking Confirmed!</h1>
          <p className="text-[#404754] text-lg max-w-xl mx-auto">
            Your stay is confirmed! We&apos;ve sent the receipt and check-in details to <strong>{user?.email}</strong>.
          </p>
        </section>

        {/* ── BENTO GRID ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Primary Details Card */}
          <div className="md:col-span-8 bg-white rounded-2xl p-8 border border-[#c0c7d6]/20 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#005cab] mb-2 block">Booking Confirmation</span>
                <h2 className="text-2xl font-bold font-headline text-[#0f1c2c]">{booking.hotel_name ?? "Your Hotel"}</h2>
                <div className="flex items-center gap-2 mt-2 text-[#404754]">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  <span className="text-sm">{booking.room_type_name} &bull; {booking.num_rooms} Room{booking.num_rooms > 1 ? "s" : ""} &bull; {booking.num_guests} Guest{booking.num_guests > 1 ? "s" : ""}</span>
                </div>
              </div>
              <div className="bg-[#eef4ff] px-5 py-3 rounded-xl border border-[#c0c7d6]/20 text-right shrink-0">
                <span className="block text-[10px] font-bold uppercase text-[#404754] mb-1 tracking-widest">Booking ID (PNR)</span>
                <span className="text-xl font-mono font-bold text-[#005cab]">{pnr}</span>
              </div>
            </div>

            {/* Stay Timeline */}
            <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2">
              <div className="flex-1 min-w-[140px] bg-[#eef4ff] p-4 rounded-xl">
                <span className="block text-xs font-medium text-[#404754] mb-1">Check-in</span>
                <span className="text-lg font-bold text-[#0f1c2c]">{fmt(booking.check_in)}</span>
                <span className="block text-xs text-[#404754] mt-0.5">From 2:00 PM</span>
              </div>
              <span className="material-symbols-outlined text-[#c0c7d6] text-[20px] shrink-0">arrow_forward</span>
              <div className="flex-1 min-w-[140px] bg-[#eef4ff] p-4 rounded-xl">
                <span className="block text-xs font-medium text-[#404754] mb-1">Check-out</span>
                <span className="text-lg font-bold text-[#0f1c2c]">{fmt(booking.check_out)}</span>
                <span className="block text-xs text-[#404754] mt-0.5">By 11:00 AM</span>
              </div>
              <div className="flex-1 min-w-[140px] border border-[#005cab]/20 bg-[#005cab]/5 p-4 rounded-xl">
                <span className="block text-xs font-medium text-[#005cab] mb-1">Duration</span>
                <span className="text-lg font-bold text-[#005cab]">{totalNights} Night{totalNights > 1 ? "s" : ""}</span>
                <span className="block text-xs text-[#005cab]/70 mt-0.5">{booking.room_type_name}</span>
              </div>
            </div>

            {/* Razorpay Payment Info */}
            {booking.razorpay_payment_id && (
              <div className="mb-8 bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                <div>
                  <p className="text-sm font-bold text-emerald-800">Payment Verified</p>
                  <p className="text-xs text-emerald-700 mt-0.5">Payment ID: <span className="font-mono font-medium">{booking.razorpay_payment_id}</span></p>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg font-headline text-[#0f1c2c]">Essential Instructions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex gap-4 p-4 rounded-xl bg-[#f8f9ff] border border-[#c0c7d6]/15">
                  <span className="material-symbols-outlined text-[#005cab] shrink-0">phone_iphone</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#0f1c2c]">Digital Confirmation</h4>
                    <p className="text-xs text-[#404754] leading-relaxed mt-0.5">Your booking receipt has been sent to your email address.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-xl bg-[#f8f9ff] border border-[#c0c7d6]/15">
                  <span className="material-symbols-outlined text-[#005cab] shrink-0">badge</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#0f1c2c]">ID Required</h4>
                    <p className="text-xs text-[#404754] leading-relaxed mt-0.5">A valid government-issued photo ID is required at check-in.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side — Map + Payment Summary */}
          <div className="md:col-span-4 space-y-5">

            {/* Map Card */}
            <div className="bg-white rounded-2xl overflow-hidden border border-[#c0c7d6]/20 shadow-sm">
              <div className="h-40 bg-slate-200 relative">
                {booking.hotel_image ? (
                  <Image src={booking.hotel_image} alt={booking.hotel_name ?? "Hotel"} fill unoptimized className="object-cover" />
                ) : (
                  <div className="h-full w-full bg-[#d6e4f9] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#005cab] text-[48px]">hotel</span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-end justify-end p-3">
                  <div className="w-10 h-10 bg-[#005cab] text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <a
                  href={mapsUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 w-full bg-[#eef4ff] text-[#0f1c2c] font-semibold rounded-xl hover:bg-[#dbe9ff] transition-colors text-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">map</span>
                  Open in Google Maps
                </a>
              </div>
            </div>

            {/* Payment Summary Card */}
            <div className="bg-[#005cab] text-white rounded-2xl p-6 shadow-xl shadow-[#005cab]/20 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-4">Payment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="opacity-75">{totalNights} Night{totalNights > 1 ? "s" : ""} &times; {booking.num_rooms} Room{booking.num_rooms > 1 ? "s" : ""}</span>
                  <span className="font-medium">₹{booking.total_price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-75">Taxes &amp; Fees</span>
                  <span className="font-medium">Included</span>
                </div>
                <div className="pt-3 border-t border-white/20 flex justify-between items-baseline">
                  <span className="font-bold">Total Paid</span>
                  <span className="text-2xl font-extrabold font-headline">₹{booking.total_price.toLocaleString()}</span>
                </div>
                {booking.razorpay_payment_id && (
                  <p className="text-[10px] opacity-60 pt-1 font-mono">Ref: {booking.razorpay_payment_id}</p>
                )}
              </div>
              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={() => window.print()}
                  className="w-full py-3 bg-white text-[#005cab] font-bold rounded-xl hover:bg-slate-50 transition-colors active:scale-95 flex items-center justify-center gap-2 text-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Download / Print Invoice
                </button>
                <button
                  onClick={() => {
                    const date = new Date(booking.check_in);
                    const title = encodeURIComponent(`Hotel Stay: ${booking.hotel_name}`);
                    const start = date.toISOString().replace(/-|:|\.\d+/g, "").slice(0, 15) + "Z";
                    const end = new Date(booking.check_out).toISOString().replace(/-|:|\.\d+/g, "").slice(0, 15) + "Z";
                    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}`, "_blank");
                  }}
                  className="w-full py-3 bg-white/20 text-white font-bold rounded-xl border border-white/20 hover:bg-white/30 transition-colors active:scale-95 flex items-center justify-center gap-2 text-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                  Add to Calendar
                </button>
              </div>
            </div>
          </div>

          {/* Support Bar */}
          <div className="md:col-span-12">
            <div className="bg-[#eef4ff] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-[#c0c7d6]/15">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#005cab] shadow-sm shrink-0">
                  <span className="material-symbols-outlined">support_agent</span>
                </div>
                <div>
                  <h4 className="font-bold text-[#0f1c2c]">Need help with your booking?</h4>
                  <p className="text-sm text-[#404754]">Our concierge is available 24/7 to assist with changes or special requests.</p>
                </div>
              </div>
              <div className="flex gap-3 shrink-0">
                <Link href="/bookings" className="px-6 py-2.5 text-[#005cab] font-bold hover:underline decoration-[#005cab]/30 underline-offset-4 transition-all text-sm">
                  My Trips
                </Link>
                <Link href="/" className="px-6 py-2.5 bg-[#0f1c2c] text-white font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95 text-sm">
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="w-full py-12 mt-auto bg-slate-50 border-t border-[#c0c7d6]/10">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="text-lg font-bold text-slate-900 font-headline tracking-tight">TravelX</span>
            <p className="text-sm text-slate-500">© 2026 TravelX Digital Concierge. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {["Privacy Policy", "Terms of Service", "Help Center", "Partner with us"].map(l => (
              <a key={l} href="#" className="text-slate-500 hover:text-slate-900 transition-colors text-sm underline decoration-blue-500/30 underline-offset-4">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
