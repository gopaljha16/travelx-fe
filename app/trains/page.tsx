"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, TrainFront } from "lucide-react";
import Navbar from "@/components/Navbar";

interface Train {
  id: string;
  train_name: string;
  train_number: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  price: number;
  classes: string[];
}

const DUMMY_TRAINS: Train[] = [
  { id: "t1", train_name: "Rajdhani Express", train_number: "12951", departure_time: "04:30 PM", arrival_time: "08:30 AM", duration: "16h 00m", price: 2500, classes: ["1A", "2A", "3A"] },
  { id: "t2", train_name: "Shatabdi Express", train_number: "12009", departure_time: "06:00 AM", arrival_time: "12:15 PM", duration: "6h 15m", price: 1200, classes: ["CC", "EC"] },
  { id: "t3", train_name: "Vande Bharat", train_number: "22436", departure_time: "03:00 PM", arrival_time: "11:00 PM", duration: "8h 00m", price: 1800, classes: ["CC", "EC"] },
  { id: "t4", train_name: "Garib Rath Express", train_number: "12215", departure_time: "08:15 AM", arrival_time: "01:45 PM", duration: "5h 30m", price: 650, classes: ["3A"] },
  { id: "t5", train_name: "Duronto Express", train_number: "12259", departure_time: "11:00 PM", arrival_time: "04:00 PM", duration: "17h 00m", price: 2100, classes: ["1A", "2A", "3A", "SL"] },
];

const CLASSES = ["1A", "2A", "3A", "SL", "CC", "EC"];

function TrainCard({ train }: { train: Train }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-200 hover:shadow-lg transition-all group">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
            <TrainFront size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900">{train.train_name}</h3>
            <p className="text-sm font-semibold text-slate-500">#{train.train_number}</p>
          </div>
        </div>

        <div className="flex items-center justify-between w-full md:w-auto md:gap-12 pl-16 md:pl-0">
          <div className="text-center">
            <p className="font-headline font-black text-xl text-slate-900">{train.departure_time}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Departure</p>
          </div>

          <div className="flex flex-col items-center px-4 relative">
            <p className="text-xs font-bold text-slate-500">{train.duration}</p>
            <div className="w-24 h-px bg-slate-300 relative my-3">
              <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400 text-[16px] bg-white px-2">train</span>
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">
              Available: {train.classes.join(', ')}
            </p>
          </div>

          <div className="text-center">
            <p className="font-headline font-black text-xl text-slate-900">{train.arrival_time}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Arrival</p>
          </div>
        </div>

        <div className="flex items-center justify-between w-full md:w-auto md:flex-col md:items-end gap-2 border-t border-slate-100 md:border-t-0 pt-4 md:pt-0">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Starts From</p>
            <p className="font-headline font-black text-2xl text-slate-900 text-right">₹{train.price}</p>
          </div>
          <button className="bg-primary hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl transition-colors shadow-md text-sm">
            Book Ticket
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TrainsPage() {
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
