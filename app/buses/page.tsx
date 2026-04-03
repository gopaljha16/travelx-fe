"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import BusCard from "@/components/BusCard";
import { searchBuses, Bus } from "@/lib/api";
import { Search, SlidersHorizontal, X, Loader2, Bus as BusIcon } from "lucide-react";

const BUS_TYPES = ["AC Sleeper", "Non-AC Sleeper", "AC Seater", "Non-AC Seater"];

export default function BusesPage() {
  const searchParams = useSearchParams();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [fromCity, setFromCity] = useState(searchParams.get("from_city") || "");
  const [toCity, setToCity] = useState(searchParams.get("to_city") || "");
  const [journeyDate, setJourneyDate] = useState(searchParams.get("journey_date") || "");
  const [busType, setBusType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  const fetchBuses = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await searchBuses({
        from_city: fromCity || undefined,
        to_city: toCity || undefined,
        journey_date: journeyDate || undefined,
        bus_type: busType || undefined,
        min_price: minPrice ? Number(minPrice) : undefined,
        max_price: maxPrice ? Number(maxPrice) : undefined,
      });
      setBuses(res.buses);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load buses");
    } finally {
      setLoading(false);
    }
  }, [fromCity, toCity, journeyDate, busType, minPrice, maxPrice]);

  useEffect(() => { fetchBuses(); }, [fetchBuses]);

  const clearFilters = () => { setBusType(""); setMinPrice(""); setMaxPrice(""); };

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-500">
      <Navbar />

      {/* Editorial Search Experience */}
      <div className="bg-[var(--card)] border-b border-[var(--card-border)] sticky top-20 z-30 transition-all shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative group">
               <input type="text" placeholder="From City" value={fromCity} onChange={(e) => setFromCity(e.target.value)}
                className="w-full px-6 py-5 bg-[var(--background)] border-2 border-transparent focus:border-[#ec6a2a]/20 rounded-3xl text-sm font-black uppercase tracking-widest focus:outline-none transition-all placeholder:text-[var(--foreground)] placeholder:opacity-20 text-[var(--foreground)]" />
            </div>
            <div className="relative group">
               <input type="text" placeholder="To City" value={toCity} onChange={(e) => setToCity(e.target.value)}
                className="w-full px-6 py-5 bg-[var(--background)] border-2 border-transparent focus:border-[#ec6a2a]/20 rounded-3xl text-sm font-black uppercase tracking-widest focus:outline-none transition-all placeholder:text-[var(--foreground)] placeholder:opacity-20 text-[var(--foreground)]" />
            </div>
            <div className="relative group">
               <input type="date" value={journeyDate} onChange={(e) => setJourneyDate(e.target.value)}
                className="w-full px-6 py-5 bg-[var(--background)] border-2 border-transparent focus:border-[#ec6a2a]/20 rounded-3xl text-sm font-black uppercase tracking-widest focus:outline-none transition-all text-[var(--foreground)]" />
            </div>
          </div>
          <button onClick={fetchBuses} className="bg-[#ec6a2a] text-white px-10 py-5 rounded-3xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#ec6a2a]/20 flex items-center justify-center gap-3">
            <Search size={16} /> Find Routes
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col lg:flex-row gap-12">
        {/* Editorial Sidebar */}
        {showFilters && (
          <aside className="w-full lg:w-80 flex-shrink-0 animate-fade-in">
            <div className="sticky top-64">
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase">Refine.</h3>
                <button onClick={clearFilters} className="text-[10px] font-black text-[#ec6a2a] uppercase tracking-widest hover:opacity-70 flex items-center gap-2 transition-all">
                  <X size={14} /> Reset all
                </button>
              </div>

              {/* Price Filter */}
              <div className="mb-12">
                <p className="text-[10px] font-black text-[var(--foreground)] opacity-30 uppercase tracking-widest mb-6">Price Range</p>
                <div className="flex gap-4">
                  <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-[var(--card)] border-2 border-[var(--card-border)] focus:border-[#ec6a2a] rounded-xl px-4 py-3 text-sm font-bold text-[var(--foreground)] focus:outline-none transition-all" />
                  <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-[var(--card)] border-2 border-[var(--card-border)] focus:border-[#ec6a2a] rounded-xl px-4 py-3 text-sm font-bold text-[var(--foreground)] focus:outline-none transition-all" />
                </div>
              </div>

              {/* Bus Type Filter */}
              <div>
                <p className="text-[10px] font-black text-[var(--foreground)] opacity-30 uppercase tracking-widest mb-6">Bus Style</p>
                <div className="space-y-4">
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <input type="radio" name="busType" checked={busType === ""} onChange={() => setBusType("")} className="peer sr-only" />
                    <div className="w-5 h-5 border-2 border-[var(--card-border)] rounded-full peer-checked:border-[#ec6a2a] peer-checked:bg-[#ec6a2a] flex items-center justify-center transition-all">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                    <span className="text-sm font-bold text-[var(--foreground)] opacity-50 group-hover:opacity-100 transition-opacity uppercase tracking-tight">Any Style</span>
                  </label>
                  {BUS_TYPES.map((t) => (
                    <label key={t} className="flex items-center gap-4 cursor-pointer group">
                      <input type="radio" name="busType" checked={busType === t} onChange={() => setBusType(t)} className="peer sr-only" />
                      <div className="w-5 h-5 border-2 border-[var(--card-border)] rounded-full peer-checked:border-[#ec6a2a] peer-checked:bg-[#ec6a2a] flex items-center justify-center transition-all">
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      </div>
                      <span className="text-sm font-bold text-[var(--foreground)] opacity-50 group-hover:opacity-100 transition-opacity uppercase tracking-tight">{t}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <button
                onClick={() => setShowFilters(false)}
                className="mt-12 w-full py-4 border-2 border-[var(--card-border)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] opacity-20 hover:opacity-100 transition-all"
              >
                Hide Filters
              </button>
            </div>
          </aside>
        )}

        {/* Results Area */}
        <div className="flex-1">
          <div className="flex flex-col mb-16">
             <span className="text-[#ec6a2a] font-bold text-xs uppercase tracking-widest mb-4">Express Routes</span>
             <h2 className="text-5xl md:text-7xl font-black text-[var(--foreground)] tracking-tighter uppercase leading-[0.8]">
              {loading ? "Searching..." : fromCity && toCity ? `${fromCity} to ${toCity}.` : "The Network."}
            </h2>
          </div>

          <div className="space-y-20">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-[var(--card)] rounded-[48px] border-2 border-[var(--card-border)] h-32 animate-pulse" />
              ))
            ) : buses.length === 0 ? (
              <div className="text-center py-32 bg-[var(--card)] rounded-[56px] border-2 border-dashed border-[var(--card-border)]">
                <BusIcon size={64} className="text-[var(--foreground)] opacity-10 mx-auto mb-8" />
                <h3 className="text-2xl font-black text-[var(--foreground)] mb-4 uppercase">No routes.</h3>
                <p className="text-[var(--foreground)] opacity-40 max-w-xs mx-auto font-medium text-sm">We're expanding rapidly. Try checking different dates or major transit hubs.</p>
                <button onClick={clearFilters} className="mt-8 text-[#ec6a2a] font-black uppercase text-xs tracking-widest hover:underline">Clear filters</button>
              </div>
            ) : (
              buses.map((bus) => <BusCard key={bus.id} bus={bus} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
