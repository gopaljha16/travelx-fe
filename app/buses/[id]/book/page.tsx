"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Bus, BusBooking, bookBus, getBus, verifyBusPayment } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { BusFront, Loader2 } from "lucide-react";

type RazorpayResponse = { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string; };
type RazorpayOptions = {
  key: string; amount: number; currency: string; name: string; description: string;
  order_id?: string; handler: (r: RazorpayResponse) => void | Promise<void>;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string }; modal: { ondismiss: () => void };
};
declare global { interface Window { Razorpay?: new (o: RazorpayOptions) => { open: () => void }; } }

export default function BusBookPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const seatNumbers = (searchParams.get("seats") ?? "").split(",").map(Number).filter(Boolean);
  const pricePerSeat = Number(searchParams.get("price") ?? 0);

  const [bus, setBus] = useState<Bus | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");

  // Passenger details state — one per seat
  const [passengers, setPassengers] = useState<{ name: string; age: string; gender: string }[]>([]);
  const [contactEmail, setContactEmail] = useState(user?.email ?? "");
  const [contactPhone, setContactPhone] = useState(user?.phone ?? "");

  const totalPrice = pricePerSeat * seatNumbers.length;

  useEffect(() => {
    if (!user && !authLoading) { router.push("/login"); return; }
    if (user) {
      setContactEmail(user.email ?? "");
      setContactPhone(user.phone ?? "");
      // init one passenger slot per seat; first one pre-filled from user
      setPassengers(seatNumbers.map((_, i) => ({
        name: i === 0 ? (user.name ?? "") : "",
        age: "",
        gender: "Male",
      })));
      getBus(params.id)
        .then(setBus)
        .catch(() => setError("Bus not found"))
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, params.id, router, user]);

  const updatePassenger = (idx: number, field: string, val: string) => {
    setPassengers(cur => cur.map((p, i) => i === idx ? { ...p, [field]: val } : p));
  };

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
    if (!user || !bus || seatNumbers.length === 0) return;
    setBookingLoading(true); setError("");
    try {
      const ok = await loadRazorpay();
      if (!ok || !window.Razorpay) throw new Error("Razorpay SDK failed to load.");
      const bk: BusBooking = await bookBus(bus.id, seatNumbers);
      new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
        amount: bk.total_price * 100,
        currency: "INR",
        name: "TravelX",
        description: `Bus: ${bus.from_city} → ${bus.to_city} | Seats: ${seatNumbers.join(", ")}`,
        order_id: bk.razorpay_order_id,
        handler: async (res) => {
          try {
            await verifyBusPayment({ booking_id: bk.id, ...res });
            router.push(`/bookings/bus/${bk.id}/confirmation`);
          } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Payment verification failed");
          } finally { setBookingLoading(false); }
        },
        prefill: { name: user.name ?? "", email: contactEmail, contact: contactPhone },
        theme: { color: "#005cab" },
        modal: { ondismiss: () => setBookingLoading(false) },
      }).open();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Booking failed");
      setBookingLoading(false);
    }
  };

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  if (loading || authLoading) return (
    <div className="min-h-screen bg-[#f8f9ff]"><Navbar />
      <div className="flex min-h-[80vh] items-center justify-center"><Loader2 size={36} className="animate-spin text-[#005cab]" /></div>
    </div>
  );

  if (!bus) return (
    <div className="min-h-screen bg-[#f8f9ff]"><Navbar />
      <div className="max-w-5xl mx-auto px-6 py-32 text-center">
        <h1 className="text-2xl font-black text-slate-900">Bus not found</h1>
        <button onClick={() => router.back()} className="mt-4 text-[#005cab] font-bold hover:underline">Go back</button>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f8f9ff] font-body text-[#0f1c2c]">
      <Navbar />
      <main className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Back */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[#005cab] font-medium text-sm mb-8 hover:underline">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Modify Selection
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* ── LEFT ─────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-8">
            <div>
              <h1 className="font-headline text-4xl font-extrabold text-[#0f1c2c] tracking-tight">Review &amp; Secure Checkout</h1>
              <p className="text-[#404754] mt-2">Confirm passenger details and secure your journey.</p>
            </div>

            <form onSubmit={handleComplete} className="space-y-8">

              {/* Passenger Details */}
              <section className="space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#005cab]/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#005cab] text-[20px]">group</span>
                  </div>
                  <h2 className="text-xl font-headline font-bold text-[#0f1c2c]">Passenger Details</h2>
                </div>

                {seatNumbers.map((seat, idx) => (
                  <div key={seat} className="bg-white rounded-2xl p-6 shadow-sm border border-[#c0c7d6]/20">
                    <div className="flex justify-between items-center mb-6">
                      <span className="bg-[#eef4ff] px-3 py-1 rounded-full text-xs font-bold text-[#005cab] uppercase tracking-widest">Seat {seat}</span>
                      <span className="text-[#404754] text-sm font-medium">{idx === 0 ? "Primary Passenger" : `Passenger ${idx + 1}`}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#404754] uppercase tracking-wider ml-1">Full Name</label>
                        <input
                          required type="text" value={passengers[idx]?.name ?? ""} onChange={e => updatePassenger(idx, "name", e.target.value)}
                          placeholder="e.g. Arjun Sharma"
                          className="w-full bg-[#eef4ff] border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005cab] text-sm px-4 py-3 text-[#0f1c2c] placeholder:text-[#c0c7d6]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#404754] uppercase tracking-wider ml-1">Age</label>
                        <input
                          type="number" min={1} max={120} value={passengers[idx]?.age ?? ""} onChange={e => updatePassenger(idx, "age", e.target.value)}
                          placeholder="28"
                          className="w-full bg-[#eef4ff] border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005cab] text-sm px-4 py-3 text-[#0f1c2c]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#404754] uppercase tracking-wider ml-1">Gender</label>
                        <select
                          value={passengers[idx]?.gender ?? "Male"} onChange={e => updatePassenger(idx, "gender", e.target.value)}
                          className="w-full bg-[#eef4ff] border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005cab] text-sm px-4 py-3 text-[#0f1c2c]"
                        >
                          <option>Male</option><option>Female</option><option>Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </section>

              {/* Contact Info */}
              <section className="space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#005cab]/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#005cab] text-[20px]">contact_mail</span>
                  </div>
                  <h2 className="text-xl font-headline font-bold text-[#0f1c2c]">Contact Information</h2>
                </div>
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#c0c7d6]/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#404754] uppercase tracking-wider ml-1">Email Address</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#c0c7d6] text-[18px]">mail</span>
                        <input required type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full bg-[#eef4ff] border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005cab] pl-10 pr-4 py-3 text-sm text-[#0f1c2c]"
                        />
                      </div>
                      <p className="text-[10px] text-[#404754] italic mt-1">Ticket will be sent to this email</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#404754] uppercase tracking-wider ml-1">Mobile Number</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-xl bg-[#dbe9ff] text-[#404754] text-sm font-medium border-r border-[#c0c7d6]/30">+91</span>
                        <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)}
                          placeholder="9876543210"
                          className="flex-1 bg-[#eef4ff] border-none rounded-r-xl focus:outline-none focus:ring-2 focus:ring-[#005cab] px-4 py-3 text-sm text-[#0f1c2c]"
                        />
                      </div>
                      <p className="text-[10px] text-[#404754] italic mt-1">Real-time SMS updates for your trip</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Payment info strip */}
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

              <button type="submit" disabled={bookingLoading || seatNumbers.length === 0}
                className="w-full py-5 rounded-xl bg-gradient-to-br from-[#005cab] to-[#0075d7] text-white font-headline font-bold text-lg shadow-xl shadow-[#005cab]/20 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
              >
                {bookingLoading
                  ? <><Loader2 size={22} className="animate-spin" /> Processing…</>
                  : <><span className="material-symbols-outlined text-[22px]">lock</span> Pay Securely · ₹{totalPrice.toLocaleString()}</>
                }
              </button>
              <p className="text-[10px] text-center text-[#404754] px-4">By clicking Pay Securely, you agree to our <a href="#" className="underline">Terms of Voyage</a> &amp; <a href="#" className="underline">Cancellation Policy</a>.</p>
            </form>
          </div>

          {/* ── RIGHT: Summary Sidebar ───────────────────────── */}
          <aside className="lg:col-span-4 sticky top-28">
            <div className="bg-white rounded-2xl shadow-sm border border-[#c0c7d6]/20 overflow-hidden">
              {/* Bus image header */}
              <div className="h-36 relative">
                {bus.images?.[0] ? (
                  <Image src={bus.images[0]} alt={bus.name} fill unoptimized className="object-cover" />
                ) : (
                  <div className="h-full bg-gradient-to-br from-[#005cab] to-[#0075d7] flex items-center justify-center">
                    <BusFront size={48} className="text-white/60" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-5 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-75">{bus.bus_type}</p>
                  <h3 className="font-headline font-bold text-base">{bus.from_city} → {bus.to_city}</h3>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Itinerary */}
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-1 mt-1">
                    <div className="w-2 h-2 rounded-full bg-[#005cab] ring-4 ring-[#005cab]/10" />
                    <div className="w-0.5 h-8 bg-gradient-to-b from-[#005cab] to-orange-500/30" />
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-bold text-[#0f1c2c]">{bus.from_city}</p>
                        <p className="text-xs font-headline font-bold text-[#005cab]">{bus.departure_time}</p>
                      </div>
                      <p className="text-[10px] text-[#404754]">{fmtDate(bus.journey_date)}</p>
                    </div>
                    <div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-bold text-[#0f1c2c]">{bus.to_city}</p>
                        <p className="text-xs font-headline font-bold text-orange-500">{bus.arrival_time}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amenity chips */}
                {bus.amenities?.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-[#c0c7d6]/15">
                    {bus.amenities.slice(0, 5).map(a => (
                      <div key={a} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#eef4ff] text-[10px] font-bold text-[#404754]">
                        <span className="material-symbols-outlined text-[12px]">
                          {a.toLowerCase().includes("wifi") ? "wifi" : a.toLowerCase().includes("ac") ? "ac_unit" : "power"}
                        </span>
                        {a.toUpperCase()}
                      </div>
                    ))}
                  </div>
                )}

                {/* Seats selected */}
                <div className="pt-4 border-t border-[#c0c7d6]/15 space-y-2">
                  <p className="text-xs font-bold text-[#404754] uppercase tracking-wider">Selected Seats</p>
                  <div className="flex flex-wrap gap-1.5">
                    {seatNumbers.map(s => (
                      <span key={s} className="w-7 h-7 bg-[#005cab] text-white rounded-lg flex items-center justify-center text-xs font-bold">{s}</span>
                    ))}
                  </div>
                </div>

                {/* Fare Breakdown */}
                <div className="space-y-3 pt-4 border-t border-[#c0c7d6]/15">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#404754]">Base Fare ({seatNumbers.length} Seat{seatNumbers.length > 1 ? "s" : ""})</span>
                    <span className="font-medium">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#404754]">Service Fee & Taxes</span>
                    <span className="font-medium text-emerald-600">Included</span>
                  </div>
                  <div className="flex justify-between items-end pt-2 border-t border-[#c0c7d6]/15">
                    <div>
                      <p className="text-[10px] font-bold text-[#404754] uppercase tracking-widest">Total Amount</p>
                      <p className="text-2xl font-headline font-black text-[#005cab]">₹{totalPrice.toLocaleString()}</p>
                    </div>
                    <div className="text-right text-[10px] text-[#404754] leading-tight">Incl. GST<br/>Taxes inclusive</div>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="flex justify-center gap-6 pt-2 opacity-50">
                  {[{ icon: "verified", label: "PCI DSS" }, { icon: "lock", label: "SSL" }, { icon: "support_agent", label: "24/7" }].map(b => (
                    <div key={b.label} className="flex flex-col items-center">
                      <span className="material-symbols-outlined text-[28px]">{b.icon}</span>
                      <span className="text-[8px] font-bold uppercase mt-0.5">{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="bg-slate-50 w-full py-12 px-8 border-t border-slate-100 mt-8">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto gap-6">
          <span className="font-bold text-slate-900 font-headline">TravelX</span>
          <div className="flex gap-8">
            {["Privacy Policy", "Terms of Service", "Fleet Info", "Contact"].map(l => (
              <a key={l} href="#" className="text-slate-400 text-xs uppercase tracking-widest hover:text-[#005cab] transition-colors">{l}</a>
            ))}
          </div>
          <p className="text-slate-400 text-xs">© 2026 TravelX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
