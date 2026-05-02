"use client";

import Image from "next/image";
import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { BedDouble, Loader2, Star, Building2, ShieldCheck, Info } from "lucide-react";
import { Hotel, Booking, createBooking, getHotel, verifyPayment, getEmployees, OrgEmployee, getMyOrganization } from "@/lib/api";

type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  handler: (r: RazorpayResponse) => void | Promise<void>;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
  config?: any;
  method?: { [key: string]: boolean };
};

declare global {
  interface Window {
    Razorpay?: new (o: RazorpayOptions) => { open: () => void };
  }
}

function BookingContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [additionalGuest, setAdditionalGuest] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  
  const [employees, setEmployees] = useState<OrgEmployee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [orgName, setOrgName] = useState("");

  useEffect(() => {
    if (user?.corporate_role === 'admin') {
      getEmployees().then(list => {
        setEmployees(list);
        if (typeof window !== 'undefined') {
          const savedId = sessionStorage.getItem('selectedEmployeeId');
          if (savedId) {
            const emp = list.find(e => e.user_id === savedId);
            if (emp) {
              setSelectedEmployee(savedId);
              setGuestName(emp.name || emp.email);
              setGuestEmail(emp.email);
              if ((emp as any).phone) setGuestPhone((emp as any).phone);
            }
          }
        }
      });
      if (user.organization) {
        setOrgName(user.organization.name);
      } else {
        getMyOrganization().then(org => {
          if (org) setOrgName(org.name);
        });
      }
    }
  }, [user]);

  // FIX: Robust calculation to handle potential NaN or invalid dates
  const totalNights = checkIn && checkOut
    ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 0;
  
  const subtotal = isNaN(totalNights) ? 0 : pricePerNight * totalNights * numRooms;
  const total = subtotal;

  useEffect(() => {
    if (!user && !authLoading) {
      router.push("/");
      return;
    }
    if (user) {
      setGuestName((prev) => prev || user.name || "");
      setGuestEmail((prev) => prev || user.email || "");
      setGuestPhone((prev) => prev || user.phone || "");
      
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
        s.onload = () => res(true);
        s.onerror = () => res(false);
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
        name: "YatraSqure",
        description: `Stay at ${hotel.name} — ${roomName}`,
        order_id: booking.razorpay_order_id,
        handler: async (res) => {
          try {
            await verifyPayment({ booking_id: booking.id, ...res });
            router.push(`/bookings/${booking.id}/confirmation`);
          } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Payment verification failed");
          } finally {
            setBookingLoading(false);
          }
        },
        prefill: { name: guestName, email: guestEmail, contact: guestPhone },
        theme: { color: "#005cab" },
        modal: { ondismiss: () => setBookingLoading(false) },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI ID",
                instruments: [
                  {
                    method: "upi",
                    flows: ["vpa"]
                  }
                ]
              }
            },
            sequence: ["block.upi", "block.other"],
            preferences: {
              show_default_blocks: true
            }
          } as any
        }
      }).open();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Booking failed");
      setBookingLoading(false);
    }
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    return isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  if (!mounted || loading || authLoading) return (
    <div className="min-h-screen bg-[#f8f9ff]">
      <Navbar />
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 size={36} className="animate-spin text-[#005cab]" />
      </div>
    </div>
  );

  if (!hotel) return (
    <div className="min-h-screen bg-[#f8f9ff]">
      <Navbar />
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
                disabled={bookingLoading || isNaN(totalNights) || totalNights <= 0}
                className="w-full py-5 rounded-xl bg-[#005cab] hover:bg-[#004786] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-headline font-bold text-lg shadow-xl shadow-[#005cab]/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                {bookingLoading ? (
                  <><Loader2 size={22} className="animate-spin" /> Processing…</>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[22px]">lock</span>
                    {selectedEmployee ? "Pay with Corporate Wallet" : "Complete Booking"} · ₹{total.toLocaleString()}
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
                      <span className="text-[#404754]">{isNaN(totalNights) ? 0 : totalNights} Night{totalNights > 1 ? 's' : ''}, {numGuests} Guest{numGuests > 1 ? 's' : ''}, {numRooms} Room{numRooms > 1 ? 's' : ''}</span>
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

              {/* Policies */}
              <div className="space-y-3 px-1">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600 shrink-0">check_circle</span>
                  <p className="text-xs text-[#404754]">Free cancellation before check-in date. Terms apply.</p>
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
    </div>
  );
}

// FIX: Wrap logic in Suspense to satisfy Next.js useSearchParams() requirements in static rendering
export default function HotelBookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-[#005cab]" />
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
