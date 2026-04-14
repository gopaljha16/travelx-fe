"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import BusCard from "@/components/BusCard";
import { Bus, searchBuses } from "@/lib/api";
import { ArrowUpDown, BusFront, Calendar, Filter, Loader2, MapPin, RefreshCcw, Search } from "lucide-react";

const BUS_TYPES = ["AC Sleeper", "Non-AC Sleeper", "AC Seater", "Non-AC Seater"];
const POPULAR_ROUTES = [
  { from: "Delhi", to: "Jaipur" },
  { from: "Mumbai", to: "Pune" },
  { from: "Bangalore", to: "Chennai" },
  { from: "Hyderabad", to: "Vijayawada" },
];

export default function BusesPage() {
  const searchParams = useSearchParams();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [fromCity, setFromCity] = useState(searchParams.get("from_city") || "");
  const [toCity, setToCity] = useState(searchParams.get("to_city") || "");
  const [journeyDate, setJourneyDate] = useState(searchParams.get("journey_date") || "");
  const [busType, setBusType] = useState(searchParams.get("bus_type") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
  const [sortBy, setSortBy] = useState("recommended");

  const fetchBuses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await searchBuses({
        from_city: fromCity || undefined,
        to_city: toCity || undefined,
        journey_date: journeyDate || undefined,
        bus_type: busType || undefined,
        min_price: minPrice ? Number(minPrice) : undefined,
        max_price: maxPrice ? Number(maxPrice) : undefined,
      });
      setBuses(response.buses);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load buses");
    } finally {
      setLoading(false);
    }
  }, [busType, fromCity, journeyDate, maxPrice, minPrice, toCity]);

  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  const sortedBuses = useMemo(() => {
    const next = [...buses];
    if (sortBy === "price_low") {
      next.sort((a, b) => a.price_per_seat - b.price_per_seat);
    } else if (sortBy === "price_high") {
      next.sort((a, b) => b.price_per_seat - a.price_per_seat);
    } else if (sortBy === "departure") {
      next.sort((a, b) => a.departure_time.localeCompare(b.departure_time));
    }
    return next;
  }, [buses, sortBy]);

  const clearFilters = () => {
    setFromCity("");
    setToCity("");
    setJourneyDate("");
    setBusType("");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="tx-page">
      <Navbar />

      <section className="bg-[linear-gradient(180deg,#10213d_0%,#17325f_60%,#f5f7fb_60%,#f5f7fb_100%)] pb-10 pt-6 text-white">
        <div className="tx-shell">
          <div className="max-w-3xl">
            <p className="tx-kicker text-orange-200">Bus booking</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Search verified routes with a cleaner booking flow.</h1>
            <p className="mt-3 max-w-2xl text-sm font-medium text-white/75 sm:text-base">
              Live route search, transparent pricing, and seat booking designed to feel like one professional travel product.
            </p>
          </div>

          <div className="tx-card mt-8 p-4 sm:p-6">
            <div className="grid gap-3 lg:grid-cols-[1fr_1fr_0.8fr_0.8fr_0.8fr_auto]">
              <input className="tx-input" value={fromCity} onChange={(e) => setFromCity(e.target.value)} placeholder="From city" />
              <input className="tx-input" value={toCity} onChange={(e) => setToCity(e.target.value)} placeholder="To city" />
              <input className="tx-input" type="date" value={journeyDate} onChange={(e) => setJourneyDate(e.target.value)} />
              <input className="tx-input" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min price" />
              <input className="tx-input" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max price" />
              <button onClick={fetchBuses} className="tx-button-primary min-h-12">
                <Search size={18} />
                Search
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {POPULAR_ROUTES.map((route) => (
                <button
                  key={`${route.from}-${route.to}`}
                  onClick={() => {
                    setFromCity(route.from);
                    setToCity(route.to);
                  }}
                  className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                >
                  {route.from} to {route.to}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="tx-shell pb-16">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="tx-card h-fit p-5">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
                <Filter size={16} className="text-[#ff6b35]" />
                Filters
              </div>
              <button onClick={clearFilters} className="text-xs font-bold text-slate-500 hover:text-slate-900">
                Clear all
              </button>
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Bus type</label>
                <select className="tx-select" value={busType} onChange={(e) => setBusType(e.target.value)}>
                  <option value="">All types</option>
                  {BUS_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-900">Why this page feels better</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  <li>Cleaner search and filter hierarchy</li>
                  <li>Consistent TravelX cards across all results</li>
                  <li>Real data from the same backend route search API</li>
                </ul>
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="tx-kicker">Search results</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                  {loading ? "Loading buses..." : `${sortedBuses.length} routes available`}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600">
                  <ArrowUpDown size={16} className="text-[#2563eb]" />
                  <select
                    className="bg-transparent outline-none"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="departure">Earliest Departure</option>
                  </select>
                </label>

                <button onClick={fetchBuses} className="tx-button-secondary">
                  <RefreshCcw size={16} />
                  Refresh
                </button>
              </div>
            </div>

            <div className="mb-5 grid gap-3 sm:grid-cols-3">
              <div className="tx-card p-4">
                <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
                  <BusFront size={16} className="text-[#ff6b35]" />
                  Smart route search
                </div>
                <p className="mt-2 text-sm text-slate-600">Connected directly to `/buses/search` with your current filters.</p>
              </div>
              <div className="tx-card p-4">
                <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Calendar size={16} className="text-[#2563eb]" />
                  Live travel date filters
                </div>
                <p className="mt-2 text-sm text-slate-600">Date, price, and bus type all feed the real backend query.</p>
              </div>
              <div className="tx-card p-4">
                <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
                  <MapPin size={16} className="text-[#16a34a]" />
                  Better result scan
                </div>
                <p className="mt-2 text-sm text-slate-600">Cleaner route cards make departure, arrival, and pricing faster to compare.</p>
              </div>
            </div>

            {loading ? (
              <div className="tx-card flex min-h-[240px] items-center justify-center">
                <Loader2 size={28} className="animate-spin text-[#ff6b35]" />
              </div>
            ) : error ? (
              <div className="tx-card p-8 text-center text-sm font-semibold text-red-600">{error}</div>
            ) : sortedBuses.length === 0 ? (
              <div className="tx-card p-8 text-center">
                <h3 className="text-xl font-black text-slate-900">No buses found</h3>
                <p className="mt-2 text-sm text-slate-600">Try changing route, date, or price filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedBuses.map((bus) => (
                  <BusCard key={bus.id} bus={bus} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
