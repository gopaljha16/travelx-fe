"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Hotel, Booking, createBooking, getHotel, verifyPayment } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { BedDouble, Loader2, Star } from "lucide-react";

type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};
type RazorpayOptions = {
  key: string; amount: number; currency: string; name: string; description: string;
  order_id?: string; handler: (r: RazorpayResponse) => void | Promise<void>;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string }; modal: { ondismiss: () => void };
};
declare global { interface Window { Razorpay?: new (o: RazorpayOptions) => { open: () => void }; } }

export default function HotelBookPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Read data from URL params passed from detail page
  const checkIn = searchParams.get("check_in") ?? "";
  const checkOut = searchParams.get("check_out") ?? "";
  const roomName = searchParams.get("room") ?? "";
  const numRooms = Number(searchParams.get("rooms") ?? 1);
  const numGuests = Number(searchParams.get("guests") ?? 2);
  const pricePerNight = Number(searchParams.get("price") ?? 0);

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");

  // Guest form state
  const [guestName, setGuestName] = useState(user?.name ?? "");
  const [guestEmail, setGuestEmail] = useState(user?.email ?? "");
  const [guestPhone, setGuestPhone] = useState(user?.phone ?? "");
  const [additionalGuest, setAdditionalGuest] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  // Calc total nights & price
  const totalNights = checkIn && checkOut
    ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 0;
  const subtotal = pricePerNight * totalNights * numRooms;
  const taxes = Math.round(subtotal * 0);   // taxes assumed inclusive; backend handles
  const total = subtotal;

  useEffect(() => {
    if (!user && !authLoading) { router.push("/login"); return; }
    if (user) {
      setGuestName(user.name ?? "");
      setGuestEmail(user.email ?? "");
      setGuestPhone(user.phone ?? "");
      getHotel(params.id)
        .then(setHotel)
        .catch(() => setError("Hotel not found"))
        .finally(() => setLoading(false));
    }
  }, [authLoading, params.id, router, user]);

  const loadRazorpay = () =>
    window.Razorpay ? Promise.resolve(true) :
      new Promise<boolean>(res => {
        const s = document.createElement("script");
        s.src = "https://checkout.razorpay.com/v1/checkout.js";
        s.onload = () => res(true); s.onerror = () => res(false);
        document.body.appendChild(s);
      });

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !hotel) return;
    setBookingLoading(true);
    setError("");
    try {
      const ok = await loadRazorpay();
      if (!ok || !window.Razorpay) throw new Error("Razorpay SDK failed to load.");
      const booking: Booking = await createBooking({
        hotel_id: hotel.id,
        room_type_name: roomName,
        check_in: checkIn,
        check_out: checkOut,
        num_rooms: numRooms,
        num_guests: numGuests,
      });
      new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
        amount: booking.total_price * 100,
        currency: "INR",
        name: "TravelX",
        description: `Stay at ${hotel.name} — ${roomName}`,
        order_id: booking.razorpay_order_id,
        handler: async (res) => {
          try {
            await verifyPayment({ booking_id: booking.id, ...res });
            // Navigate to the dedicated confirmation page with real booking data
            router.push(`/bookings/${booking.id}/confirmation`);
          } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Payment verification failed");
          } finally { setBookingLoading(false); }
        },
        prefill: { name: guestName, email: guestEmail, contact: guestPhone },
        theme: { color: "#005cab" },
        modal: { ondismiss: () => setBookingLoading(false) },
      }).open();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Booking failed");
      setBookingLoading(false);
    }
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  if (loading || authLoading) return (
    <div className="min-h-screen bg-[#f8f9ff]"><Navbar />
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 size={36} className="animate-spin text-[#005cab]" />
      </div>
    </div>
  );

  if (!hotel) return (
    <div className="min-h-screen bg-[#f8f9ff]"><Navbar />
      <div className="max-w-7xl mx-auto px-6 py-32 text-center">
        <h1 className="text-2xl font-black text-slate-900">Hotel not found</h1>
        <button onClick={() => router.back()} className="mt-4 text-[#005cab] font-bold hover:underline">Go back</button>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f8f9ff] font-body text-[#0f1c2c]">
      <Navbar />

      <main className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* ── LEFT: Forms ──────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-10">

            {/* Page Header */}
            <section>
              <h1 className="font-headline text-4xl font-extrabold tracking-tight text-[#0f1c2c] mb-2">Secure Your Stay</h1>
              <p className="text-[#404754]">Please provide your details to complete the booking for <span className="font-semibold text-[#0f1c2c]">{hotel.name}</span>.</p>
            </section>

            <form onSubmit={handleComplete} className="space-y-8">

              {/* Guest Info Card */}
              <section className="bg-white p-8 rounded-2xl shadow-sm border border-[#c0c7d6]/20 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#005cab]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                  <h2 className="font-headline text-xl font-bold text-[#0f1c2c]">Guest Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#404754] ml-1">Full Name (Primary Guest)</label>
                    <input
                      required type="text" value={guestName} onChange={e => setGuestName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-[#eef4ff] border-none rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-[#005cab] text-[#0f1c2c] placeholder:text-[#c0c7d6]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#404754] ml-1">Email Address</label>
                    <input
                      required type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full bg-[#eef4ff] border-none rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-[#005cab] text-[#0f1c2c]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#404754] ml-1">Mobile Number</label>
                    <div className="flex gap-2">
                      <div className="bg-[#eef4ff] px-4 flex items-center rounded-xl text-[#404754] font-medium text-sm">+91</div>
                      <input
                        type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)}
                        placeholder="98765 43210"
                        className="flex-1 bg-[#eef4ff] border-none rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-[#005cab] text-[#0f1c2c]"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#404754] ml-1">Additional Guest Name</label>
                    <input
                      type="text" value={additionalGuest} onChange={e => setAdditionalGuest(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-[#eef4ff] border-none rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-[#005cab] text-[#0f1c2c]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#404754] ml-1">Special Requests</label>
                  <textarea
                    rows={3} value={specialRequests} onChange={e => setSpecialRequests(e.target.value)}
                    placeholder="Early check-in, dietary restrictions, airport shuttle..."
                    className="w-full bg-[#eef4ff] border-none rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-[#005cab] text-[#0f1c2c] resize-none"
                  />
                </div>
              </section>

              {/* Razorpay info strip */}
              <div className="bg-[#eef4ff] rounded-2xl px-6 py-4 flex items-center gap-4 border border-[#c0c7d6]/20">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                  <span className="material-symbols-outlined text-[#005cab] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0f1c2c]">Secure Payment via Razorpay</p>
                  <p className="text-xs text-[#404754]">UPI, Credit/Debit Card, Netbanking and Wallets — choose on the next step.</p>
                </div>
                <div className="ml-auto text-xs font-bold text-[#404754] bg-white px-3 py-1.5 rounded-full border border-[#c0c7d6]/30 shrink-0">256-bit SSL</div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600">{error}</div>
              )}

              {/* CTA */}
              <button
                type="submit"
                disabled={bookingLoading || totalNights <= 0}
                className="w-full py-5 rounded-xl bg-[#005cab] hover:bg-[#004786] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-headline font-bold text-lg shadow-xl shadow-[#005cab]/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                {bookingLoading ? (
                  <><Loader2 size={22} className="animate-spin" /> Processing…</>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[22px]">lock</span>
                    Complete Booking · ₹{total.toLocaleString()}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ── RIGHT: Summary Sidebar ─────────────────────────── */}
          <div className="lg:col-span-4">
            <aside className="sticky top-32 space-y-5">

              {/* Hotel Card */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#c0c7d6]/20">
                <div className="h-44 bg-[#d6e4f9] relative">
                  {hotel.images?.[0] ? (
                    <Image src={hotel.images[0]} alt={hotel.name} fill unoptimized className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-300">
                      <BedDouble size={48} />
                    </div>
                  )}
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <div className="flex items-center gap-0.5 text-[#005cab] mb-1.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={14} className={i < Math.round(hotel.rating) ? "fill-[#005cab] text-[#005cab]" : "fill-slate-200 text-slate-200"} />
                      ))}
                    </div>
                    <h3 className="font-headline text-xl font-bold text-[#0f1c2c] leading-tight">{hotel.name}</h3>
                    <p className="text-sm text-[#404754] flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      {hotel.city}, {hotel.address}
                    </p>
                  </div>

                  {/* Room badge */}
                  {roomName && (
                    <div className="bg-[#eef4ff] px-4 py-2.5 rounded-xl text-sm font-semibold text-[#005cab] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">king_bed</span>
                      {roomName}
                    </div>
                  )}

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-[#c0c7d6]/20">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#404754] font-bold mb-1">Check-in</p>
                      <p className="font-semibold text-sm text-[#0f1c2c]">{formatDate(checkIn)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-[#404754] font-bold mb-1">Check-out</p>
                      <p className="font-semibold text-sm text-[#0f1c2c]">{formatDate(checkOut)}</p>
                    </div>
                  </div>

                  {/* Price breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#404754]">{totalNights} Night{totalNights > 1 ? 's' : ''}, {numGuests} Guest{numGuests > 1 ? 's' : ''}, {numRooms} Room{numRooms > 1 ? 's' : ''}</span>
                      <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#404754]">Taxes & Fees</span>
                      <span className="font-medium text-emerald-600">Included</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-dashed border-[#c0c7d6]/30">
                      <span className="font-bold text-lg text-[#0f1c2c]">Total Price</span>
                      <span className="font-headline font-extrabold text-2xl text-[#005cab]">₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust badge */}
              <div className="bg-[#eef4ff] p-4 rounded-2xl flex items-center gap-4 border border-[#c0c7d6]/20">
                <div className="bg-white p-2.5 rounded-xl shadow-sm">
                  <span className="material-symbols-outlined text-[#00628d] text-[22px]">verified</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0f1c2c]">Price Match Guarantee</p>
                  <p className="text-xs text-[#404754]">Found it cheaper? We'll refund the difference.</p>
                </div>
              </div>

              {/* Policies */}
              <div className="space-y-3 px-1">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600 shrink-0">check_circle</span>
                  <p className="text-xs text-[#404754]">Free cancellation before check-in date in most cases. Terms apply.</p>
                </div>
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-[18px] text-[#404754] shrink-0">info</span>
                  <p className="text-xs text-[#404754]">You will be charged ₹{total.toLocaleString()} immediately upon payment confirmation.</p>
                </div>
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-[18px] text-[#005cab] shrink-0">lock</span>
                  <p className="text-xs text-[#404754]">256-bit SSL encrypted. Your payment data is never stored.</p>
                </div>
              </div>

            </aside>
          </div>
        </div>
      </main>

{/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="w-full py-12 mt-auto bg-slate-50 border-t border-slate-200/50">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-6 text-sm">
          <div className="flex flex-col gap-1 items-center md:items-start">
            <span className="text-lg font-bold text-slate-900">TravelX</span>
            <p className="text-slate-500">© 2026 TravelX Digital Concierge. All rights reserved.</p>
          </div>
          <div className="flex gap-8">
            {["Privacy Policy", "Terms of Service", "Help Center", "Partner with us"].map(l => (
              <a key={l} href="#" className="text-slate-500 hover:text-slate-900 transition-colors underline decoration-blue-500/30 underline-offset-4">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
