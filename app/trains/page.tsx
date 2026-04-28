"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";

interface TrainClass {
  type: string;
  quota: string;
  price: number;
  status: string;
  statusColor: string;
  freeCancellation: boolean;
  tripGuarantee?: boolean;
  updatedAt: string;
}

interface Train {
  id: string;
  train_name: string;
  train_number: string;
  depart_days: { day: string; active: boolean }[];
  departure_time: string;
  departure_date: string;
  departure_station: string;
  arrival_time: string;
  arrival_date: string;
  arrival_station: string;
  duration: string;
  price: number;
  classes: string[];
  availability: TrainClass[];
}

const ALL_DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const defaultDays = ALL_DAYS.map(day => ({ day, active: true }));
const SOME_DAYS = ALL_DAYS.map((day, i) => ({ day, active: i % 2 !== 0 }));

const DUMMY_TRAINS: Train[] = [
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

function TrainCard({ train }: { train: Train }) {
  return (
    <div className="bg-white rounded-[14px] px-6 py-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-200 hover:shadow-lg transition-all mb-4">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-5">
        {/* Left Section - Train Name & Info */}
        <div className="flex-1 w-[280px]">
          <h3 className="font-bold text-[22px] text-slate-900 leading-none">{train.train_name}</h3>
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-slate-500 mt-2">
            <span>#{train.train_number}</span>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5">
              <span>Depart on:</span>
              <div className="flex gap-1.5">
                {train.depart_days.map((d, i) => (
                  <span key={i} className={`${d.active ? 'text-[#00a19c] font-bold' : 'text-slate-300'}`}>
                    {d.day}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section - Route & Timing */}
        <div className="flex-1 flex justify-center items-start gap-4 lg:gap-14 w-full md:w-auto">
          <div className="text-left w-[140px]">
            <p className="font-black text-[17px] text-slate-900 whitespace-nowrap leading-none mb-1">{train.departure_time}<span className="text-[13px] font-medium text-slate-500 ml-1">, {train.departure_date}</span></p>
            <p className="text-[14px] text-slate-600">{train.departure_station}</p>
          </div>

          <div className="flex flex-col items-center flex-shrink-0 px-2">
            <p className="text-[13px] text-slate-500 font-medium mb-1.5">{train.duration}</p>
            <div className="flex items-center w-20 sm:w-32 relative">
               <div className="w-full h-[1px] bg-slate-200"></div>
            </div>
            <p className="text-[13px] text-[#008cff] font-bold mt-1.5 cursor-pointer hover:underline">View Route</p>
          </div>

          <div className="text-left w-[140px]">
            <p className="font-black text-[17px] text-slate-900 whitespace-nowrap leading-none mb-1">{train.arrival_time}<span className="text-[13px] font-medium text-slate-500 ml-1">, {train.arrival_date}</span></p>
            <p className="text-[14px] text-slate-600">{train.arrival_station}</p>
          </div>
        </div>
      </div>

      {/* Classes / Availability row */}
      <div className="flex overflow-x-auto gap-4 pb-2" style={{ scrollbarWidth: 'none' }}>
        {train.availability.map((avail, idx) => (
          <div key={idx} className="min-w-[210px] w-[210px] bg-white border border-slate-200 rounded-[14px] p-3.5 flex flex-col justify-between hover:border-primary hover:bg-blue-50/20 cursor-pointer transition-all">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[15px] text-slate-900">{avail.type}</span>
                  {avail.quota && (
                    <span className="text-[10px] font-bold bg-[#fff0e3] text-[#d67215] px-1.5 py-0.5 rounded-[4px] tracking-wide">
                      {avail.quota}
                    </span>
                  )}
                </div>
                <span className="font-extrabold text-[16px] text-slate-900">₹{avail.price}</span>
              </div>
              <p className={`text-[14px] font-bold ${avail.statusColor} tracking-wide`}>{avail.status}</p>
              
              <div className="mt-2.5 text-[12px] min-h-[40px]">
                {avail.freeCancellation && (
                  <p className="text-slate-500 font-medium">Free Cancellation</p>
                )}
                {avail.tripGuarantee && (
                  <div className="flex items-start gap-1.5 text-[#6a2da8] font-medium mt-1">
                     <div className="bg-[#6a2da8] text-white rounded-sm w-[14px] h-[14px] flex items-center justify-center shrink-0 mt-0.5">
                       <span className="material-symbols-outlined text-[10px] font-bold">check</span>
                     </div>
                     <span className="leading-[1.3] text-[11px]">Confirm or 3X Refund<br/><span className="text-[#6a2da8]/70 font-normal">Previously Trip Guarantee</span></span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">{avail.updatedAt}</p>
          </div>
        ))}
        {/* Next Arrow padding block to match UI trailing icon if wrapped */}
      </div>

      {/* Bottom Dropdown matching UI */}
      <div className="mt-1 flex gap-4 text-[#008cff] text-[14px] font-bold cursor-pointer border-t border-slate-100 pt-3">
        <div className="flex items-center hover:underline">
           Nearby dates <span className="material-symbols-outlined text-[18px]">expand_more</span>
        </div>
      </div>
    </div>
  )
}

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (fromCity) params.set("from_city", fromCity);
    if (toCity) params.set("to_city", toCity);
    if (journeyDate) params.set("journey_date", journeyDate);
    router.push(`/trains?${params.toString()}`);
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
            Search Trains
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

              {/* Price */}
              <div className="mb-6 border-b border-slate-100 pb-6">
                <h4 className="font-bold text-sm text-slate-900 mb-4 flex justify-between cursor-pointer">Price <span className="material-symbols-outlined text-slate-400 text-sm">expand_less</span></h4>
                
                <div className="space-y-3 mt-4">
                  <label className="flex flex-row items-center gap-3 cursor-pointer group" onClick={() => setPriceFilter(0, 1000)}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${minPrice === 0 && maxPrice === 1000 ? 'bg-primary border-primary' : 'border-slate-300 group-hover:border-primary'}`}>
                      {minPrice === 0 && maxPrice === 1000 && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
                    </div>
                    <span className="text-sm font-medium text-slate-600 flex-1">₹ 0 - ₹ 1000</span>
                  </label>
                  <label className="flex flex-row items-center gap-3 cursor-pointer group" onClick={() => setPriceFilter(1000, 2000)}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${minPrice === 1000 && maxPrice === 2000 ? 'bg-primary border-primary' : 'border-slate-300 group-hover:border-primary'}`}>
                      {minPrice === 1000 && maxPrice === 2000 && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
                    </div>
                    <span className="text-sm font-medium text-slate-600 flex-1">₹ 1000 - ₹ 2000</span>
                  </label>
                  <label className="flex flex-row items-center gap-3 cursor-pointer group" onClick={() => setPriceFilter(2000, undefined)}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${minPrice === 2000 && maxPrice === undefined ? 'bg-primary border-primary' : 'border-slate-300 group-hover:border-primary'}`}>
                      {minPrice === 2000 && maxPrice === undefined && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
                    </div>
                    <span className="text-sm font-medium text-slate-600 flex-1">₹ 2000+</span>
                  </label>
                </div>
              </div>

              {/* Class */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-4 flex justify-between cursor-pointer">Train Classes <span className="material-symbols-outlined text-slate-400 text-sm">expand_less</span></h4>
                <div className="space-y-3">
                  {CLASSES.map(cls => (
                     <label key={cls} className="flex flex-row items-center gap-3 cursor-pointer group" onClick={() => setSelectedClass(selectedClass === cls ? undefined : cls)}>
                       <div className={`w-5 h-5 rounded-full border-[5px] flex items-center justify-center transition-colors ${selectedClass === cls ? 'border-primary' : 'border-slate-300 group-hover:border-primary'}`}></div>
                       <span className="text-sm font-medium text-slate-600 flex-1">{cls}</span>
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
                {loading ? "Checking schedule..." : `${sortedTrains.length} Trains Available`}
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
            ) : sortedTrains.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900">No trains found</h3>
                <p className="mt-2 text-sm text-slate-600">Try adjusting your filters or search destination.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedTrains.map((train) => (
                  <TrainCard key={train.id} train={train} />
                ))}
              </div>
            )}
          </div>
        </div>
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
