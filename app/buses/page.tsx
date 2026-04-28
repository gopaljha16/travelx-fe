"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BusCard from "@/components/BusCard";
import { Bus, searchBuses } from "@/lib/api";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";

const BUS_TYPES = ["AC Sleeper", "Non-AC Sleeper", "AC Seater", "Non-AC Seater"];

function BusesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Top Search Bar State
  const [fromCity, setFromCity] = useState(searchParams.get("from_city") || "");
  const [toCity, setToCity] = useState(searchParams.get("to_city") || "");
  const [journeyDate, setJourneyDate] = useState(searchParams.get("journey_date") || "");

  // Sidebar Filter State
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [selectedBusType, setSelectedBusType] = useState<string | undefined>();
  
  const [sortBy, setSortBy] = useState("recommended");

  const fetchBuses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await searchBuses({
        from_city: fromCity || undefined,
        to_city: toCity || undefined,
        journey_date: journeyDate || undefined,
        bus_type: selectedBusType || undefined,
        min_price: minPrice,
        max_price: maxPrice,
      });
      setBuses(response.buses);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load buses");
    } finally {
      setLoading(false);
    }
  }, [fromCity, toCity, journeyDate, selectedBusType, minPrice, maxPrice]);

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

  const setPriceFilter = (min: number, max: number | undefined) => {
    if (minPrice === min && maxPrice === max) {
      setMinPrice(undefined);
      setMaxPrice(undefined);
    } else {
      setMinPrice(min);
      setMaxPrice(max);
    }
  };

  const clearFilters = () => {
    setFromCity("");
    setToCity("");
    setJourneyDate("");
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSelectedBusType(undefined);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (fromCity) params.set("from_city", fromCity);
    if (toCity) params.set("to_city", toCity);
    if (journeyDate) params.set("journey_date", journeyDate);
    router.push(`/buses?${params.toString()}`);
  };

  return (
    <div className="bg-[#f8f9fc] min-h-screen text-slate-800 font-body">
      <Navbar />

      <main className="pt-[50px] pb-20 px-6 max-w-[1400px] mx-auto">
        {/* Search Bar Row */}
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row items-center gap-4 bg-white p-2 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-200 mb-8 w-full">
          
          <div className="flex-1 bg-slate-50 border border-slate-200 hover:border-primary rounded-xl flex items-center px-4 py-3 group cursor-text transition-colors w-full focus-within:border-primary focus-within:ring-1 focus-within:ring-primary shadow-inner">
            <span className="material-symbols-outlined text-primary mr-3 font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>trip_origin</span>
            <div className="flex flex-col w-full relative">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Leaving From</label>
              <input 
                type="text" 
                value={fromCity} 
                onChange={(e) => setFromCity(e.target.value)} 
                placeholder="City or Station"
                className="bg-transparent border-none outline-none text-sm font-bold placeholder-slate-400 p-0 w-full text-slate-900"
              />
            </div>
          </div>

          <div className="flex-1 bg-slate-50 border border-slate-200 hover:border-primary rounded-xl flex items-center px-4 py-3 group cursor-text transition-colors w-full focus-within:border-primary focus-within:ring-1 focus-within:ring-primary shadow-inner">
            <span className="material-symbols-outlined text-primary mr-3 font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
            <div className="flex flex-col w-full relative">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Going To</label>
              <input 
                type="text" 
                value={toCity} 
                onChange={(e) => setToCity(e.target.value)} 
                placeholder="Everywhere"
                className="bg-transparent border-none outline-none text-sm font-bold placeholder-slate-400 p-0 w-full text-slate-900"
              />
            </div>
          </div>

          <div className="flex-1 bg-slate-50 border border-slate-200 hover:border-primary rounded-xl flex items-center px-4 py-2 group transition-colors w-full shadow-inner relative">
            <span className="material-symbols-outlined text-primary mr-3 font-bold">calendar_month</span>
            <div className="flex flex-col w-full">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Date of Journey</label>
              <input 
                type="date" 
                value={journeyDate}
                onChange={(e) => setJourneyDate(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-bold text-slate-900 cursor-pointer p-0 w-full"
              />
            </div>
          </div>

          <button type="submit" className="bg-primary hover:bg-blue-700 text-white font-bold px-10 py-5 rounded-xl transition-colors shrink-0 w-full lg:w-auto text-sm shadow-md">
            Search Buses
          </button>
        </form>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-[320px] shrink-0">

            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline font-bold text-slate-900 uppercase tracking-widest text-sm">Filters</h3>
                <button onClick={clearFilters} className="text-xs font-bold text-primary hover:underline">RESET ALL</button>
              </div>

              {/* Price Per Seat */}
              <div className="mb-6 border-b border-slate-100 pb-6">
                <h4 className="font-bold text-sm text-slate-900 mb-4 flex justify-between cursor-pointer">Price Per Seat <span className="material-symbols-outlined text-slate-400 text-sm">expand_less</span></h4>
                
                <div className="space-y-3 mt-4">
                  <label className="flex flex-row items-center gap-3 cursor-pointer group" onClick={() => setPriceFilter(0, 1000)}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${minPrice === 0 && maxPrice === 1000 ? 'bg-primary border-primary' : 'border-slate-300 group-hover:border-primary'}`}>
                      {minPrice === 0 && maxPrice === 1000 && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
                    </div>
                    <span className="text-sm font-medium text-slate-600 flex-1">₹ 0 - ₹ 1000</span>
                  </label>
                  <label className="flex flex-row items-center gap-3 cursor-pointer group" onClick={() => setPriceFilter(1000, 2500)}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${minPrice === 1000 && maxPrice === 2500 ? 'bg-primary border-primary' : 'border-slate-300 group-hover:border-primary'}`}>
                      {minPrice === 1000 && maxPrice === 2500 && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
                    </div>
                    <span className="text-sm font-medium text-slate-600 flex-1">₹ 1000 - ₹ 2500</span>
                  </label>
                  <label className="flex flex-row items-center gap-3 cursor-pointer group" onClick={() => setPriceFilter(2500, undefined)}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${minPrice === 2500 && maxPrice === undefined ? 'bg-primary border-primary' : 'border-slate-300 group-hover:border-primary'}`}>
                      {minPrice === 2500 && maxPrice === undefined && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
                    </div>
                    <span className="text-sm font-medium text-slate-600 flex-1">₹ 2500+</span>
                  </label>
                </div>
              </div>

              {/* Bus Type */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-4 flex justify-between cursor-pointer">Bus Type <span className="material-symbols-outlined text-slate-400 text-sm">expand_less</span></h4>
                <div className="space-y-3">
                  {BUS_TYPES.map(type => (
                     <label key={type} className="flex flex-row items-center gap-3 cursor-pointer group" onClick={() => setSelectedBusType(selectedBusType === type ? undefined : type)}>
                       <div className={`w-5 h-5 rounded-full border-[5px] flex items-center justify-center transition-colors ${selectedBusType === type ? 'border-primary' : 'border-slate-300 group-hover:border-primary'}`}></div>
                       <span className="text-sm font-medium text-slate-600 flex-1">{type}</span>
                     </label>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between mb-6">
               <h1 className="text-[22px] font-headline font-bold text-slate-900">
                {loading ? "Finding available seats..." : `${sortedBuses.length} Routes Available`}
              </h1>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500 font-medium">Sort by:</span>
                <div className="relative flex items-center">
                  <select className="bg-transparent font-bold text-primary outline-none cursor-pointer border-none p-0 pr-6 text-sm tracking-wide appearance-none" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="recommended">Recommended</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="departure">Earliest Departure</option>
                  </select>
                  <span className="material-symbols-outlined text-slate-400 text-[18px] absolute right-0 pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-200">
                <Loader2 size={32} className="animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="p-8 text-center text-sm font-bold text-red-600 bg-red-50 rounded-2xl border border-red-100">{error}</div>
            ) : sortedBuses.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900">No buses found</h3>
                <p className="mt-2 text-sm text-slate-600">Try adjusting your filters or search destination.</p>
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
      </main>

    </div>
  );
}

export default function BusesPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
         <Loader2 size={32} className="animate-spin text-primary" />
       </div>
    }>
      <BusesContent />
    </Suspense>
  );
}
