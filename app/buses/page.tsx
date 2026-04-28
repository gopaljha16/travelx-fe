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
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  
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

  const Filters = () => (
    <div className="space-y-8">
      {/* Price Per Seat */}
      <div className="border-b border-slate-100 pb-6">
        <h4 className="font-bold text-sm text-slate-900 mb-4 flex justify-between cursor-pointer">Budget <span className="material-symbols-outlined text-slate-400 text-sm">expand_less</span></h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3 mt-4">
          {[
            { label: "₹ 0 - ₹ 1000", min: 0, max: 1000 },
            { label: "₹ 1000 - ₹ 2500", min: 1000, max: 2500 },
            { label: "₹ 2500+", min: 2500, max: undefined }
          ].map((range) => (
            <label key={range.label} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${minPrice === range.min && maxPrice === range.max ? 'bg-blue-50 border-blue-200 text-primary' : 'bg-slate-50 border-slate-100 text-slate-600'}`} onClick={() => setPriceFilter(range.min, range.max)}>
              <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${minPrice === range.min && maxPrice === range.max ? 'bg-primary border-primary' : 'border-slate-300'}`}>
                {minPrice === range.min && maxPrice === range.max && <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>}
              </div>
              <span className="text-sm font-bold">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Bus Type */}
      <div>
        <h4 className="font-bold text-sm text-slate-900 mb-4 flex justify-between cursor-pointer">Bus Type <span className="material-symbols-outlined text-slate-400 text-sm">expand_less</span></h4>
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 mt-4">
          {BUS_TYPES.map(type => (
             <label key={type} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${selectedBusType === type ? 'bg-blue-50 border-blue-200 text-primary' : 'bg-slate-50 border-slate-100 text-slate-600'}`} onClick={() => setSelectedBusType(selectedBusType === type ? undefined : type)}>
               <div className={`w-5 h-5 rounded-full border-[5px] flex items-center justify-center shrink-0 ${selectedBusType === type ? 'border-primary' : 'border-slate-300'}`}></div>
               <span className="text-sm font-bold">{type}</span>
             </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f8f9fc] min-h-screen text-slate-800 font-body">
      <Navbar />

      <main className="pt-6 md:pt-[50px] pb-20 px-4 md:px-6 max-w-[1400px] mx-auto">
        {/* Search Bar Row */}
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row items-center gap-3 md:gap-4 bg-white p-2 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-200 mb-6 md:mb-8 w-full">
          
          <div className="flex-1 bg-slate-50 border border-slate-200 hover:border-primary rounded-xl flex items-center px-4 py-3 group cursor-text transition-colors w-full focus-within:border-primary focus-within:ring-1 focus-within:ring-primary shadow-inner">
            <span className="material-symbols-outlined text-primary mr-3 font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>trip_origin</span>
            <div className="flex flex-col w-full relative">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">From</label>
              <input 
                type="text" 
                value={fromCity} 
                onChange={(e) => setFromCity(e.target.value)} 
                placeholder="City"
                className="bg-transparent border-none outline-none text-sm font-bold placeholder-slate-400 p-0 w-full text-slate-900"
              />
            </div>
          </div>

          <div className="flex-1 bg-slate-50 border border-slate-200 hover:border-primary rounded-xl flex items-center px-4 py-3 group cursor-text transition-colors w-full focus-within:border-primary focus-within:ring-1 focus-within:ring-primary shadow-inner">
            <span className="material-symbols-outlined text-primary mr-3 font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
            <div className="flex flex-col w-full relative">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">To</label>
              <input 
                type="text" 
                value={toCity} 
                onChange={(e) => setToCity(e.target.value)} 
                placeholder="City"
                className="bg-transparent border-none outline-none text-sm font-bold placeholder-slate-400 p-0 w-full text-slate-900"
              />
            </div>
          </div>

          <div className="flex-1 bg-slate-50 border border-slate-200 hover:border-primary rounded-xl flex items-center px-4 py-2 group transition-colors w-full shadow-inner relative">
            <span className="material-symbols-outlined text-primary mr-3 font-bold">calendar_month</span>
            <div className="flex flex-col w-full">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Date</label>
              <input 
                type="date" 
                value={journeyDate}
                onChange={(e) => setJourneyDate(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-bold text-slate-900 cursor-pointer p-0 w-full"
              />
            </div>
          </div>

          <button type="submit" className="bg-primary hover:bg-blue-700 text-white font-black px-10 py-4 md:py-5 rounded-xl transition-all shrink-0 w-full lg:w-auto text-sm shadow-md active:scale-95">
            Update
          </button>
        </form>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex gap-3 mb-6">
             <button 
              onClick={() => setIsFilterModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 py-3.5 rounded-2xl font-bold text-slate-700 shadow-sm active:scale-95 transition-all text-sm"
             >
               <span className="material-symbols-outlined text-primary">filter_list</span>
               Filters
               {(minPrice !== undefined || selectedBusType) && <span className="bg-primary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">1</span>}
             </button>
             <div className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 py-3.5 rounded-2xl font-bold text-slate-700 shadow-sm transition-all text-sm">
               <span className="material-symbols-outlined text-primary">swap_vert</span>
               Sort
             </div>
          </div>

          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-[320px] shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-200 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline font-bold text-slate-900 uppercase tracking-widest text-sm">Filters</h3>
                <button onClick={clearFilters} className="text-xs font-bold text-primary hover:underline">RESET ALL</button>
              </div>
              <Filters />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
               <h1 className="text-lg md:text-[22px] font-headline font-bold text-slate-900">
                {loading ? "Finding available seats..." : `${sortedBuses.length} Routes Available`}
              </h1>
              
              <div className="flex items-center gap-3 text-sm ml-auto md:ml-0 bg-white md:bg-transparent p-2 md:p-0 rounded-xl md:rounded-none border md:border-none border-slate-100">
                <span className="text-slate-500 font-medium hidden md:inline">Sort by:</span>
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
              <div className="space-y-4">
                 {[1,2,3].map(i => (
                   <div key={i} className="h-40 bg-white rounded-2xl border border-slate-100 animate-pulse" />
                 ))}
              </div>
            ) : error ? (
              <div className="p-12 text-center bg-white rounded-[2rem] border border-red-100">
                 <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl text-red-500">error</span>
                 </div>
                 <h3 className="text-lg font-bold text-red-900">{error}</h3>
                 <button onClick={() => fetchBuses()} className="mt-4 text-primary font-bold underline">Try again</button>
              </div>
            ) : sortedBuses.length === 0 ? (
              <div className="p-16 text-center bg-white rounded-[2rem] border border-dashed border-slate-300">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-slate-300">directions_bus</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">No buses found</h3>
                <p className="mt-2 text-sm text-slate-500 font-medium">Try adjusting your filters or destination.</p>
                <button onClick={clearFilters} className="mt-6 text-primary font-bold underline">Clear filters</button>
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

        {/* Mobile Filter Modal */}
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-[1001] lg:hidden animate-in fade-in transition-all">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsFilterModalOpen(false)} />
            <div className="absolute bottom-0 left-0 w-full bg-white rounded-t-[2.5rem] shadow-2xl p-6 pb-12 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8 sticky top-0 bg-white pb-4 z-10">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Filters</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Refine bus options</p>
                </div>
                <button onClick={() => setIsFilterModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:scale-90 transition-all">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <Filters />
              <div className="h-10" />
              <button 
                onClick={() => setIsFilterModalOpen(false)}
                className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-600/20 active:scale-95 transition-all text-sm uppercase tracking-widest"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
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
