"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Bus, bookBus, getBus, verifyBusPayment } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, BusFront, Calendar, CheckCircle2, Clock3, Loader2, MapPin, ShieldCheck, Users } from "lucide-react";

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
  handler: (response: RazorpayResponse) => void | Promise<void>;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

export default function BusDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [bus, setBus] = useState<Bus | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!user && !authLoading) {
      router.push("/login");
      return;
    }

    if (user) {
      getBus(params.id)
        .then(setBus)
        .catch((err: unknown) => setError(err instanceof Error ? err.message : "Bus not found"))
        .finally(() => setPageLoading(false));
    }
  }, [authLoading, params.id, router, user]);

  const seatLayout = useMemo(() => {
    if (!bus) {
      return [];
    }
    const seatsPerRow = bus.bus_type.toLowerCase().includes("sleeper") ? 3 : 4;
    return Array.from({ length: Math.ceil(bus.total_seats / seatsPerRow) }, (_, rowIndex) =>
      Array.from({ length: seatsPerRow }, (_, index) => rowIndex * seatsPerRow + index + 1).filter((seat) => seat <= bus.total_seats)
    );
  }, [bus]);

  const totalPrice = (bus?.price_per_seat || 0) * selectedSeats.length;
  const availableSeats = bus ? bus.total_seats - bus.booked_seats.length : 0;

  const toggleSeat = (seatNumber: number) => {
    if (!bus || bus.booked_seats.includes(seatNumber)) {
      return;
    }

    setSelectedSeats((current) =>
      current.includes(seatNumber) ? current.filter((seat) => seat !== seatNumber) : [...current, seatNumber]
    );
  };

  const loadRazorpay = async () => {
    if (window.Razorpay) {
      return true;
    }

    return new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBooking = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!bus || selectedSeats.length === 0) {
      return;
    }

    setBookingLoading(true);
    setFeedback("");

    try {
      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded || !window.Razorpay) {
        throw new Error("Razorpay SDK failed to load. Please check your connection.");
      }

      const booking = await bookBus(bus.id, selectedSeats);
      const paymentObject = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_your_key_id",
        amount: booking.total_price * 100,
        currency: "INR",
        name: "TravelX",
        description: `Bus booking for ${bus.name}`,
        order_id: booking.razorpay_order_id,
        handler: async (response: RazorpayResponse) => {
          try {
            await verifyBusPayment({
              booking_id: booking.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            setShowSuccess(true);
            setSelectedSeats([]);
            setBus(await getBus(bus.id));
          } catch (err: unknown) {
            setFeedback(err instanceof Error ? err.message : "Payment verification failed");
          } finally {
            setBookingLoading(false);
          }
        },
        prefill: {
          name: user.name || "",
          email: user.email || "",
          contact: user.phone || "",
        },
        theme: { color: "#ff6b35" },
        modal: {
          ondismiss: () => setBookingLoading(false),
        },
      });

      paymentObject.open();
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : "Failed to start booking");
      setBookingLoading(false);
    }
  };

  if (pageLoading || authLoading) {
    return (
      <div className="tx-page">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 size={30} className="animate-spin text-[#ff6b35]" />
        </div>
      </div>
    );
  }

  if (error || !bus) {
    return (
      <div className="tx-page">
        <Navbar />
        <div className="tx-shell py-12">
          <div className="tx-card p-8 text-center">
            <h1 className="text-2xl font-black text-slate-900">Bus not found</h1>
            <p className="mt-3 text-sm font-semibold text-slate-500">{error || "This route is unavailable."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tx-page">
      <Navbar />

      <section className="tx-shell py-10">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-[36px] bg-[linear-gradient(135deg,#10213d_0%,#17325f_100%)] p-8 text-white">
              <p className="tx-kicker text-orange-200">Bus details</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight">{bus.name}</h1>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <InfoPill icon={<MapPin size={16} />} label="From" value={bus.from_city} />
                <InfoPill icon={<MapPin size={16} />} label="To" value={bus.to_city} />
                <InfoPill icon={<Clock3 size={16} />} label="Timing" value={`${bus.departure_time} - ${bus.arrival_time}`} />
              </div>
            </div>

            <div className="tx-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="tx-kicker">Seat selection</p>
                  <h2 className="mt-2 text-2xl font-black text-slate-900">Choose your seats</h2>
                </div>
                <div className="flex flex-wrap gap-3 text-xs font-bold text-slate-500">
                  <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-white ring-1 ring-slate-300" /> Available</span>
                  <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#ff6b35]" /> Selected</span>
                  <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-slate-300" /> Booked</span>
                </div>
              </div>

              <div className="mt-6 rounded-[32px] bg-slate-50 p-5 sm:p-6">
                <div className="mx-auto max-w-md space-y-3">
                  {seatLayout.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-4 gap-3">
                      {row.map((seatNumber) => {
                        const isBooked = bus.booked_seats.includes(seatNumber);
                        const isSelected = selectedSeats.includes(seatNumber);
                        return (
                          <button
                            key={seatNumber}
                            onClick={() => toggleSeat(seatNumber)}
                            disabled={isBooked}
                            className={`flex h-14 items-center justify-center rounded-2xl text-sm font-black transition ${
                              isBooked
                                ? "cursor-not-allowed bg-slate-300 text-slate-500"
                                : isSelected
                                  ? "bg-[#ff6b35] text-white shadow-[0_10px_25px_rgba(255,107,53,0.22)]"
                                  : "bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-[#ff6b35]"
                            }`}
                          >
                            {seatNumber}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="tx-card p-6">
              <p className="tx-kicker">Trip summary</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">
                {bus.from_city} to {bus.to_city}
              </h2>

              <div className="mt-5 space-y-4 text-sm font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-[#2563eb]" />
                  {new Date(bus.journey_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-[#2563eb]" />
                  {availableSeats} seat(s) available
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#16a34a]" />
                  {bus.bus_type}
                </div>
              </div>

              <div className="mt-6 rounded-3xl bg-slate-50 p-5">
                <div className="flex justify-between text-sm font-semibold text-slate-500">
                  <span>Seat price</span>
                  <span>INR {bus.price_per_seat.toLocaleString()}</span>
                </div>
                <div className="mt-3 flex justify-between text-sm font-semibold text-slate-500">
                  <span>Selected seats</span>
                  <span>{selectedSeats.length ? selectedSeats.join(", ") : "None"}</span>
                </div>
                <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-xl font-black text-slate-900">
                  <span>Total</span>
                  <span>INR {totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {feedback && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{feedback}</div>}

              <button onClick={handleBooking} disabled={bookingLoading || selectedSeats.length === 0} className="tx-button-primary mt-5 w-full">
                {bookingLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                Book selected seats
              </button>
            </div>

            <div className="tx-card p-6">
              <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
                <BusFront size={16} className="text-[#ff6b35]" />
                API-backed route
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Route details come from `/buses/{`{id}`}` and booking actions go through the real TravelX bus booking and payment verification endpoints.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="tx-card w-full max-w-md p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <CheckCircle2 size={30} />
            </div>
            <h2 className="mt-5 text-2xl font-black text-slate-900">Booking confirmed</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Your seats are booked and synced with the TravelX backend.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => router.push("/bookings")} className="tx-button-primary">
                Go to my trips
              </button>
              <button onClick={() => setShowSuccess(false)} className="tx-button-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white/10 p-4 backdrop-blur">
      <div className="inline-flex items-center gap-2 text-sm font-bold text-white/80">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-lg font-black text-white">{value}</p>
    </div>
  );
}
