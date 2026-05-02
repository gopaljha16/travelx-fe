"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { Bus, getBus } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function BusDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, openLogin } = useAuth();

  const [bus, setBus] = useState<Bus | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  useEffect(() => {
    getBus(params.id)
      .then(setBus)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Bus not found"))
      .finally(() => setPageLoading(false));
  }, [params.id]);

  // Build seat rows: 2+2 for seater, 2 sides for sleeper
  const isSleeper = useMemo(() => bus?.bus_type?.toLowerCase().includes("sleeper") ?? false, [bus]);
  const seatsPerRow = isSleeper ? 3 : 4;

  const seatRows = useMemo(() => {
    if (!bus) return [];
    return Array.from({ length: Math.ceil(bus.total_seats / seatsPerRow) }, (_, row) =>
      Array.from({ length: seatsPerRow }, (_, col) => row * seatsPerRow + col + 1).filter(s => s <= bus.total_seats)
    );
  }, [bus, seatsPerRow]);

  const totalPrice = (bus?.price_per_seat ?? 0) * selectedSeats.length;
  const availableSeats = bus ? bus.total_seats - bus.booked_seats.length : 0;

  const toggleSeat = (n: number) => {
    if (!bus || bus.booked_seats.includes(n)) return;
    setSelectedSeats(cur => cur.includes(n) ? cur.filter(s => s !== n) : [...cur, n]);
  };

  const goToBooking = () => {
    if (!user) {
      openLogin();
      return;
    }
    if (!bus || selectedSeats.length === 0) return;
    const p = new URLSearchParams({ seats: selectedSeats.join(","), price: String(bus.price_per_seat) });
    router.push(`/buses/${bus.id}/book?${p.toString()}`);
  };

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", weekday: "short" }) : "—";
  const duration = () => {
    if (!bus) return "—";
    const [dh, dm] = bus.departure_time.split(":").map(Number);
    const [ah, am] = bus.arrival_time.split(":").map(Number);
    let mins = (ah * 60 + am) - (dh * 60 + dm);
    if (mins < 0) mins += 1440;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  if (pageLoading) return (
    <div className="min-h-screen bg-[#f8f9ff]"><Navbar />
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 size={36} className="animate-spin text-[#005cab]" />
      </div>
    </div>
  );

  if (error || !bus) return (
    <div className="min-h-screen bg-[#f8f9ff]"><Navbar />
      <div className="max-w-5xl mx-auto px-6 py-32 text-center">
        <h1 className="text-2xl font-black text-slate-900">Bus not found</h1>
        <p className="text-slate-500 mt-2">{error}</p>
        <button onClick={() => router.back()} className="mt-6 bg-[#005cab] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#004786]">Go back</button>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f8f9ff] text-[#0f1c2c] font-body min-h-screen">
      <Navbar />

      <main className="pt-28 pb-12 px-4 md:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── LEFT: Seat Map ─────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-6">

          {/* Hero Info Card */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#c0c7d6]/20">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#005cab] mb-2">{bus.bus_type}</p>
                <h1 className="font-headline text-3xl font-extrabold text-[#0f1c2c]">{bus.name}</h1>
                <div className="flex items-center gap-4 mt-3 text-[#404754]">
                  <span className="flex items-center gap-1.5 text-sm font-semibold">
                    <span className="material-symbols-outlined text-[#005cab] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                    {bus.from_city}
                  </span>
                  <span className="material-symbols-outlined text-[#c0c7d6] text-[18px]">arrow_forward</span>
                  <span className="flex items-center gap-1.5 text-sm font-semibold">
                    <span className="material-symbols-outlined text-orange-500 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                    {bus.to_city}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="bg-[#eef4ff] px-3 py-1.5 rounded-full text-xs font-bold text-[#005cab] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    {bus.departure_time} → {bus.arrival_time} ({duration()})
                  </div>
                  <div className="bg-[#eef4ff] px-3 py-1.5 rounded-full text-xs font-bold text-[#005cab] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    {fmtDate(bus.journey_date)}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="text-right shrink-0">
                <p className="text-xs text-[#404754] font-medium">Starting from</p>
                <p className="text-3xl font-headline font-black text-[#005cab]">₹{bus.price_per_seat.toLocaleString()}</p>
                <p className="text-xs text-[#404754]">per seat</p>
              </div>
            </header>

            {/* Amenity chips */}
            {bus.amenities?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-[#c0c7d6]/20">
                {bus.amenities.map(a => (
                  <span key={a} className="flex items-center gap-1 px-2.5 py-1 bg-[#eef4ff] rounded-lg text-xs font-semibold text-[#404754]">
                    <span className="material-symbols-outlined text-[14px] text-[#005cab]">
                      {a.toLowerCase().includes("wifi") ? "wifi" : a.toLowerCase().includes("ac") ? "ac_unit" : a.toLowerCase().includes("charg") ? "power" : "check_circle"}
                    </span>
                    {a}
                  </span>
                ))}
              </div>
            )}

            {/* Seat Legend */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline text-xl font-bold text-[#0f1c2c]">Select Your Seats</h2>
              <div className="flex gap-5">
                {[
                  { color: "bg-white border border-[#c0c7d6]", label: "Available" },
                  { color: "bg-[#005cab]", label: "Selected" },
                  { color: "bg-[#d6e4f9]", label: "Booked" },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${color}`} />
                    <span className="text-xs font-medium text-[#404754]">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Seat Grid */}
            <div className="bg-[#eef4ff] rounded-2xl p-6">
              {/* Bus front indicator */}
              <div className="flex items-center gap-3 mb-6 text-[#404754]">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="material-symbols-outlined text-[16px]">directions_bus</span>
                  Front of Bus
                </div>
                <div className="flex-1 h-px bg-[#c0c7d6]/40" />
              </div>

              <div className="max-w-md mx-auto space-y-2.5">
                {seatRows.map((row, ri) => (
                  <div key={ri} className={`grid gap-2.5 ${seatsPerRow === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
                    {row.map(seatNum => {
                      const booked = bus.booked_seats.includes(seatNum);
                      const selected = selectedSeats.includes(seatNum);
                      return (
                        <button
                          key={seatNum}
                          onClick={() => toggleSeat(seatNum)}
                          disabled={booked}
                          className={`h-12 flex items-center justify-center rounded-xl text-xs font-black transition-all ${
                            booked
                              ? "bg-[#d6e4f9] text-[#707785] border border-[#c0c7d6] opacity-60 cursor-not-allowed"
                              : selected
                                ? "bg-[#005cab] text-white shadow-lg shadow-[#005cab]/25 scale-105"
                                : "bg-white border-[1.5px] border-[#c0c7d6] text-[#404754] hover:border-[#005cab] hover:text-[#005cab]"
                          }`}
                        >
                          {seatNum}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <p className="text-center text-xs text-[#404754] mt-6 font-medium">
                {availableSeats} seat{availableSeats !== 1 ? "s" : ""} available · {bus.total_seats} total
              </p>
            </div>
          </div>

          {/* Bus Comfort Gallery */}
          {bus.images && bus.images.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-[20px]">chair</span>
                <h2 className="font-headline text-xl font-bold text-[#0f1c2c]">Inside Your Bus</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative h-64 rounded-2xl overflow-hidden border border-[#c0c7d6]/20 shadow-sm group">
                  <Image src={bus.images[0]} alt="Bus Interior" fill unoptimized className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <p className="absolute bottom-4 left-4 text-white text-xs font-bold uppercase tracking-widest">Premium Cabin</p>
                </div>
                {bus.images[1] && (
                  <div className="relative h-64 rounded-2xl overflow-hidden border border-[#c0c7d6]/20 shadow-sm group">
                    <Image src={bus.images[1]} alt="Bus Comfort" fill unoptimized className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <p className="absolute bottom-4 left-4 text-white text-xs font-bold uppercase tracking-widest">Luxury Comfort</p>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-medium italic">* Images are for representation and represent the service class quality.</p>
            </div>
          )}
        </div>

        {/* ── RIGHT: Summary ─────────────────────────────────── */}
        <aside className="lg:col-span-4">
          <div className="sticky top-28 space-y-5">

            {/* Booking Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#c0c7d6]/20 overflow-hidden">
              {/* Blue gradient header */}
              <div className="bg-gradient-to-br from-[#005cab] to-[#0075d7] p-6 text-white">
                <h2 className="font-headline text-xl font-bold">Booking Summary</h2>
                <div className="flex justify-between items-center mt-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest opacity-80">Journey Date</p>
                    <p className="font-bold text-sm mt-0.5">{fmtDate(bus.journey_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest opacity-80">Duration</p>
                    <p className="font-bold text-sm mt-0.5">{duration()}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Selected Seats */}
                <div>
                  <p className="text-xs font-bold text-[#404754] uppercase tracking-wider mb-3">
                    Selected Seats ({selectedSeats.length})
                  </p>
                  {selectedSeats.length === 0 ? (
                    <p className="text-sm text-[#404754] italic bg-[#eef4ff] rounded-xl px-4 py-3">No seats selected yet</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.map(s => (
                        <div key={s} className="flex items-center gap-2 bg-[#eef4ff] px-3 py-2 rounded-xl">
                          <div className="w-7 h-7 rounded-lg bg-[#005cab] flex items-center justify-center text-white text-xs font-bold shadow-sm">{s}</div>
                          <span className="text-sm font-semibold text-[#0f1c2c]">Seat {s}</span>
                          <span className="font-bold text-xs text-[#005cab]">₹{bus.price_per_seat.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="pt-4 border-t border-[#c0c7d6]/20 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#404754]">Base Fare ({selectedSeats.length} seat{selectedSeats.length !== 1 ? "s" : ""})</span>
                    <span className="font-medium">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#404754]">Taxes & Fees</span>
                    <span className="font-medium text-emerald-600">Included</span>
                  </div>
                  <div className="flex justify-between items-end pt-2 border-t border-dashed border-[#c0c7d6]/30">
                    <span className="font-bold text-lg text-[#0f1c2c]">Total Amount</span>
                    <span className="font-headline font-extrabold text-2xl text-[#005cab]">₹{totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={goToBooking}
                  disabled={selectedSeats.length === 0}
                  className="w-full py-4 rounded-xl bg-gradient-to-br from-[#005cab] to-[#0075d7] text-white font-headline font-bold text-base shadow-lg shadow-[#005cab]/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 transition-all flex items-center justify-center gap-2"
                >
                  {selectedSeats.length === 0 ? "Select seats to continue" : <>Proceed to Booking <span className="material-symbols-outlined text-[18px]">arrow_forward</span></>}
                </button>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="bg-[#eef4ff] rounded-2xl p-4 flex items-center gap-4 border border-[#c0c7d6]/20">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                <span className="material-symbols-outlined text-emerald-600 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
              <div>
                <p className="text-xs font-bold text-[#0f1c2c]">YatraSqure Secure Booking</p>
                <p className="text-[10px] text-[#404754]">Instant confirmation & 24/7 support.</p>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-8 border-t border-slate-100 bg-slate-50 mt-4">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto gap-6 text-sm">
          <div>
            <span className="font-bold text-slate-900 font-headline">YatraSqure</span>
            <p className="text-slate-400 text-[10px] uppercase tracking-widest mt-1">© 2026 YatraSqure. All rights reserved.</p>
          </div>
          <div className="flex gap-8">
            {["Privacy Policy", "Terms of Service", "Fleet Info", "Contact"].map(l => (
              <a key={l} href="#" className="text-slate-400 hover:text-[#005cab] transition-colors text-xs uppercase tracking-widest">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
