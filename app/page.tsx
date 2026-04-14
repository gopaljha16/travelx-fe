"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import {
  ArrowRight,
  BedDouble,
  Bus,
  Calendar,
  Clock3,
  Hotel,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
} from "lucide-react";

type BookingTab = "buses" | "hotels";

const BUS_ROUTES = [
  { from: "Delhi", to: "Jaipur", meta: "240+ buses daily", price: "From INR 499" },
  { from: "Mumbai", to: "Pune", meta: "Luxury sleeper coaches", price: "From INR 399" },
  { from: "Bangalore", to: "Chennai", meta: "AC and non-AC options", price: "From INR 549" },
];

const HOTEL_DESTINATIONS = [
  { city: "Goa", meta: "Beach stays and resorts", price: "Avg. INR 2,899/night" },
  { city: "Jaipur", meta: "Heritage hotels", price: "Avg. INR 2,199/night" },
  { city: "Manali", meta: "Mountain-view escapes", price: "Avg. INR 2,499/night" },
];

const QUICK_FEATURES = [
  { icon: Ticket, title: "Instant confirmation", text: "Real-time inventory for buses and verified hotel listings." },
  { icon: ShieldCheck, title: "Trusted booking flow", text: "Simple checkout with transparent pricing and cleaner search." },
  { icon: Clock3, title: "Fast trip planning", text: "Search routes, compare stays, and finish booking in minutes." },
];

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hotelCity, setHotelCity] = useState("");
  const [hotelQuery, setHotelQuery] = useState("");
  const [busFrom, setBusFrom] = useState("");
  const [busTo, setBusTo] = useState("");
  const [busDate, setBusDate] = useState(() => new Date().toISOString().split("T")[0]);
  const tab: BookingTab = searchParams.get("tab") === "hotels" ? "hotels" : "buses";

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date()),
    []
  );

  const handleHotelSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (hotelCity) params.set("city", hotelCity);
    if (hotelQuery) params.set("q", hotelQuery);
    router.push(`/hotels?${params.toString()}`);
  };

  const handleBusSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (busFrom) params.set("from_city", busFrom);
    if (busTo) params.set("to_city", busTo);
    if (busDate) params.set("journey_date", busDate);
    router.push(`/buses?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <Navbar />

      <main className="pb-16">
        <section className="relative overflow-hidden bg-[linear-gradient(180deg,#ff6b35_0%,#ff7b3d_58%,#f5f7fb_58%,#f5f7fb_100%)]">
          <div className="mx-auto max-w-[1240px] px-4 pb-14 pt-6 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center text-white">
              <div className="mb-5 flex flex-wrap items-center justify-center gap-3 rounded-full bg-white/16 px-4 py-2 text-sm font-semibold backdrop-blur">
                <Sparkles size={16} />
                <span>Bus and hotel booking, right on the first screen</span>
              </div>
              <h1 className="max-w-4xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Search buses and hotels without a separate homepage.
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-medium text-white/85 sm:text-base">
                A cleaner booking-first layout inspired by modern travel apps, focused only on what you need.
              </p>
            </div>

            <div className="mx-auto mt-8 max-w-5xl rounded-[28px] bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.16)] sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
                  {tab === "buses" ? <Bus size={18} className="text-[#ff6b35]" /> : <Hotel size={18} className="text-[#2563eb]" />}
                  {tab === "buses" ? "Bus booking" : "Hotel booking"}
                </div>
                <div className="hidden text-sm font-semibold text-slate-500 md:block">
                  Today: <span className="text-slate-900">{todayLabel}</span>
                </div>
              </div>

              {tab === "buses" ? (
                <form onSubmit={handleBusSearch} className="pt-5">
                  <div className="grid gap-3 lg:grid-cols-[1.1fr_1.1fr_0.8fr_auto]">
                    <label className="rounded-2xl border border-slate-200 px-5 py-4 transition focus-within:border-[#ff6b35] focus-within:shadow-[0_0_0_4px_rgba(255,107,53,0.12)]">
                      <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                        <MapPin size={14} />
                        From
                      </span>
                      <input
                        type="text"
                        value={busFrom}
                        onChange={(e) => setBusFrom(e.target.value)}
                        placeholder="Delhi"
                        className="w-full border-none bg-transparent text-lg font-bold text-slate-900 outline-none placeholder:text-slate-300"
                      />
                    </label>

                    <label className="rounded-2xl border border-slate-200 px-5 py-4 transition focus-within:border-[#ff6b35] focus-within:shadow-[0_0_0_4px_rgba(255,107,53,0.12)]">
                      <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                        <MapPin size={14} />
                        To
                      </span>
                      <input
                        type="text"
                        value={busTo}
                        onChange={(e) => setBusTo(e.target.value)}
                        placeholder="Jaipur"
                        className="w-full border-none bg-transparent text-lg font-bold text-slate-900 outline-none placeholder:text-slate-300"
                      />
                    </label>

                    <label className="rounded-2xl border border-slate-200 px-5 py-4 transition focus-within:border-[#ff6b35] focus-within:shadow-[0_0_0_4px_rgba(255,107,53,0.12)]">
                      <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                        <Calendar size={14} />
                        Date
                      </span>
                      <input
                        type="date"
                        value={busDate}
                        onChange={(e) => setBusDate(e.target.value)}
                        className="w-full border-none bg-transparent text-lg font-bold text-slate-900 outline-none"
                      />
                    </label>

                    <button
                      type="submit"
                      className="flex h-full min-h-[92px] items-center justify-center gap-2 rounded-2xl bg-[#ff6b35] px-8 text-lg font-black text-white transition hover:bg-[#f35d25]"
                    >
                      Search
                      <ArrowRight size={18} />
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {["AC Sleeper", "Seater", "Live Tracking", "Flexible Boarding"].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-[#d65a26]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </form>
              ) : (
                <form onSubmit={handleHotelSearch} className="pt-5">
                  <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
                    <label className="rounded-2xl border border-slate-200 px-5 py-4 transition focus-within:border-[#ff6b35] focus-within:shadow-[0_0_0_4px_rgba(255,107,53,0.12)]">
                      <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                        <MapPin size={14} />
                        City
                      </span>
                      <input
                        type="text"
                        value={hotelCity}
                        onChange={(e) => setHotelCity(e.target.value)}
                        placeholder="Goa"
                        className="w-full border-none bg-transparent text-lg font-bold text-slate-900 outline-none placeholder:text-slate-300"
                      />
                    </label>

                    <label className="rounded-2xl border border-slate-200 px-5 py-4 transition focus-within:border-[#ff6b35] focus-within:shadow-[0_0_0_4px_rgba(255,107,53,0.12)]">
                      <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                        <BedDouble size={14} />
                        Hotel or Area
                      </span>
                      <input
                        type="text"
                        value={hotelQuery}
                        onChange={(e) => setHotelQuery(e.target.value)}
                        placeholder="Resort, pool, beach road"
                        className="w-full border-none bg-transparent text-lg font-bold text-slate-900 outline-none placeholder:text-slate-300"
                      />
                    </label>

                    <button
                      type="submit"
                      className="flex h-full min-h-[92px] items-center justify-center gap-2 rounded-2xl bg-[#ff6b35] px-8 text-lg font-black text-white transition hover:bg-[#f35d25]"
                    >
                      Search
                      <Search size={18} />
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {["Free breakfast", "Pool", "Pay at hotel", "Couple friendly"].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-8 max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {QUICK_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#ff6b35]">
                    <Icon size={22} />
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900">{feature.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{feature.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto mt-10 grid max-w-[1240px] gap-6 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#ff6b35]">Popular bus routes</p>
                <h3 className="mt-2 text-2xl font-black text-slate-900">Quick route picks</h3>
              </div>
              <button
                onClick={() => router.push("/buses")}
                className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:inline-flex"
              >
                View all buses
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {BUS_ROUTES.map((route) => (
                <button
                  key={`${route.from}-${route.to}`}
                  onClick={() =>
                    router.push(`/buses?from_city=${encodeURIComponent(route.from)}&to_city=${encodeURIComponent(route.to)}`)
                  }
                  className="rounded-3xl bg-[linear-gradient(145deg,#10213d_0%,#17325f_100%)] p-5 text-left text-white transition hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-white/60">
                    <span>Bus</span>
                    <Bus size={16} />
                  </div>
                  <div className="mt-8 text-2xl font-black leading-tight">
                    {route.from}
                    <br />
                    to {route.to}
                  </div>
                  <p className="mt-3 text-sm text-white/70">{route.meta}</p>
                  <p className="mt-6 text-sm font-bold text-[#ffd2bf]">{route.price}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">Top hotel cities</p>
            <h3 className="mt-2 text-2xl font-black text-slate-900">Stay inspiration</h3>
            <div className="mt-6 space-y-4">
              {HOTEL_DESTINATIONS.map((hotel) => (
                <button
                  key={hotel.city}
                  onClick={() => router.push(`/hotels?city=${encodeURIComponent(hotel.city)}`)}
                  className="flex w-full items-start justify-between rounded-2xl border border-slate-200 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/40"
                >
                  <div>
                    <div className="text-lg font-extrabold text-slate-900">{hotel.city}</div>
                    <div className="mt-1 text-sm text-slate-500">{hotel.meta}</div>
                  </div>
                  <div className="ml-4 text-right text-sm font-bold text-blue-700">{hotel.price}</div>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
