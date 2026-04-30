"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import TrainCard, { Train, TrainClass } from "@/components/TrainCard";


const ALL_DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const defaultDays = ALL_DAYS.map(day => ({ day, active: true }));
const SOME_DAYS = ALL_DAYS.map((day, i) => ({ day, active: i % 2 !== 0 }));

export const DUMMY_TRAINS: Train[] = [
  { 
    id: "t1", 
    train_name: "Ndls Cnb Sht", 
    train_number: "12034", 
    depart_days: defaultDays,
    departure_time: "3:40 PM", 
    departure_date: "28 APR",
    departure_station: "New Delhi",
    arrival_time: "8:50 PM", 
    arrival_date: "28 APR",
    arrival_station: "Kanpur Central",
    duration: "5h 10m", 
    price: 1265, 
    classes: ["CC", "EC"],
    availability: [
      { type: "CC", quota: "TATKAL", price: 1330, status: "Available 45", statusColor: "text-[#00a19c]", freeCancellation: true, updatedAt: "Updated 1 hr ago" },
      { type: "CC", quota: "", price: 1265, status: "Available 156", statusColor: "text-[#00a19c]", freeCancellation: true, updatedAt: "Updated few mins ago" },
      { type: "EC", quota: "TATKAL", price: 2345, status: "TQWL 1", statusColor: "text-[#d67215]", freeCancellation: false, tripGuarantee: true, updatedAt: "Updated 1 hr ago" },
      { type: "EC", quota: "", price: 2200, status: "GNWL 3", statusColor: "text-[#d67215]", freeCancellation: false, tripGuarantee: true, updatedAt: "Updated 3 hrs ago" },
    ]
  },
  { 
    id: "t2", 
    train_name: "Rajdhani Express", 
    train_number: "12951",
    depart_days: SOME_DAYS, 
    departure_time: "04:30 PM", 
    departure_date: "29 APR",
    departure_station: "New Delhi",
    arrival_time: "08:30 AM", 
    arrival_date: "30 APR",
    arrival_station: "Mumbai Central",
    duration: "16h 00m", 
    price: 2500, 
    classes: ["1A", "2A", "3A"],
    availability: [
      { type: "3A", quota: "", price: 2500, status: "WL 15", statusColor: "text-[#d67215]", freeCancellation: true, updatedAt: "Updated 5 mins ago" },
      { type: "2A", quota: "", price: 3400, status: "Available 12", statusColor: "text-[#00a19c]", freeCancellation: true, updatedAt: "Updated 1 hr ago" },
      { type: "1A", quota: "", price: 4200, status: "Available 4", statusColor: "text-[#00a19c]", freeCancellation: false, updatedAt: "Updated 2 hrs ago" },
    ]
  },
  { 
    id: "t3", 
    train_name: "Vande Bharat", 
    train_number: "22436", 
    depart_days: defaultDays,
    departure_time: "06:00 AM", 
    departure_date: "28 APR",
    departure_station: "New Delhi",
    arrival_time: "02:00 PM", 
    arrival_date: "28 APR",
    arrival_station: "Varanasi Jn",
    duration: "8h 00m", 
    price: 1800, 
    classes: ["CC", "EC"],
    availability: [
       { type: "CC", quota: "", price: 1800, status: "RAC 11", statusColor: "text-[#d67215]", freeCancellation: true, updatedAt: "Updated 10 mins ago" },
       { type: "EC", quota: "", price: 2900, status: "Available 2", statusColor: "text-[#00a19c]", freeCancellation: false, tripGuarantee: true, updatedAt: "Updated 25 mins ago" },
    ]
  },
];

const CLASSES = ["1A", "2A", "3A", "SL", "CC", "EC"];


function TrainsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(false);

  // Top Search Bar State
  const [fromCity, setFromCity] = useState(searchParams.get("from_city") || "");
  const [toCity, setToCity] = useState(searchParams.get("to_city") || "");
  const [journeyDate, setJourneyDate] = useState(searchParams.get("journey_date") || "");

  // Sidebar Filter State
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [selectedClass, setSelectedClass] = useState<string | undefined>();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  
  const [sortBy, setSortBy] = useState("recommended");

  const fetchTrains = useCallback(async () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      let filtered = [...DUMMY_TRAINS];
      if (selectedClass) {
        filtered = filtered.filter(t => t.classes.includes(selectedClass));
      }
      if (minPrice !== undefined && maxPrice !== undefined) {
        filtered = filtered.filter(t => t.price >= minPrice && t.price <= maxPrice);
      } else if (minPrice !== undefined) {
        filtered = filtered.filter(t => t.price >= minPrice);
      }
      setTrains(filtered);
      setLoading(false);
    }, 600);
  }, [selectedClass, minPrice, maxPrice]);

  useEffect(() => {
    fetchTrains();
  }, [fetchTrains]);

  const sortedTrains = useMemo(() => {
    const next = [...trains];
    if (sortBy === "price_low") {
      next.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_high") {
      next.sort((a, b) => b.price - a.price);
    } else if (sortBy === "departure") {
      next.sort((a, b) => a.departure_time.localeCompare(b.departure_time));
    }
    return next;
  }, [trains, sortBy]);

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
    setSelectedClass(undefined);
  };

  const handleBook = (trainId: string, classType: string) => {
    router.push(`/trains/review?id=${trainId}&class=${classType}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (fromCity) params.set("from_city", fromCity);
    if (toCity) params.set("to_city", toCity);
    if (journeyDate) params.set("journey_date", journeyDate);
    router.push(`/trains?${params.toString()}`);
  };

  const Filters = () => (
    <div className="space-y-8">
      {/* Price */}
      <div className="border-b border-slate-100 pb-6">
        <h4 className="font-bold text-sm text-slate-900 mb-4 flex justify-between cursor-pointer">Budget <span className="material-symbols-outlined text-slate-400 text-sm">expand_less</span></h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3 mt-4">
          {[
            { label: "₹ 0 - ₹ 1000", min: 0, max: 1000 },
            { label: "₹ 1000 - ₹ 2000", min: 1000, max: 2000 },
            { label: "₹ 2000+", min: 2000, max: undefined }
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

      {/* Class */}
      <div>
        <h4 className="font-bold text-sm text-slate-900 mb-4 flex justify-between cursor-pointer">Train Classes <span className="material-symbols-outlined text-slate-400 text-sm">expand_less</span></h4>
        <div className="grid grid-cols-3 lg:grid-cols-2 gap-2">
          {CLASSES.map(cls => (
             <button 
                key={cls} 
                onClick={() => setSelectedClass(selectedClass === cls ? undefined : cls)}
                className={`py-3 rounded-xl font-black text-sm transition-all border ${selectedClass === cls ? 'bg-primary border-primary text-white shadow-lg shadow-blue-600/20' : 'bg-slate-50 border-slate-100 text-slate-600'}`}
             >
               {cls}
             </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f8f9fc] min-h-screen text-slate-800 font-body">
      <Navbar />

      <main className="pt-6 md:pt-10 pb-20 px-4 md:px-6 max-w-[1400px] mx-auto">
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
                placeholder="Station"
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
                placeholder="Station"
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

          <button type="submit" className="bg-primary hover:bg-blue-700 text-white font-bold px-10 py-4 md:py-5 rounded-xl transition-colors shrink-0 w-full lg:w-auto text-sm shadow-md">
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
               {(minPrice !== undefined || selectedClass) && <span className="bg-primary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">1</span>}
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
                {loading ? "Checking schedule..." : `${sortedTrains.length} Trains Available`}
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
                   <div key={i} className="h-48 bg-white rounded-2xl border border-slate-100 animate-pulse" />
                 ))}
              </div>
            ) : sortedTrains.length === 0 ? (
              <div className="p-16 text-center bg-white rounded-[2rem] border border-dashed border-slate-300">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-slate-300">train_off</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">No trains found</h3>
                <p className="mt-2 text-sm text-slate-500 font-medium">No results for this route on the selected date.</p>
                <button onClick={clearFilters} className="mt-6 text-primary font-bold underline">Clear filters</button>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedTrains.map((train) => (
                  <TrainCard key={train.id} train={train} onBook={handleBook} />
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
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Refine train options</p>
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

export default function TrainsPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
         <Loader2 size={32} className="animate-spin text-primary" />
       </div>
    }>
      <TrainsContent />
    </Suspense>
  );
}
