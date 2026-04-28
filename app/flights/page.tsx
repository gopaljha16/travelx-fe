"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Plane } from "lucide-react";
import Navbar from "@/components/Navbar";

interface Flight {
  id: string;
  airline: string;
  flight_number: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  price: number;
}

const DUMMY_FLIGHTS: Flight[] = [
  { id: "f1", airline: "IndiGo", flight_number: "6E-101", departure_time: "06:00 AM", arrival_time: "08:30 AM", duration: "2h 30m", price: 4500 },
  { id: "f2", airline: "Air India", flight_number: "AI-202", departure_time: "09:15 AM", arrival_time: "11:50 AM", duration: "2h 35m", price: 5200 },
  { id: "f3", airline: "Vistara", flight_number: "UK-303", departure_time: "01:00 PM", arrival_time: "03:15 PM", duration: "2h 15m", price: 6100 },
  { id: "f4", airline: "SpiceJet", flight_number: "SG-404", departure_time: "05:45 PM", arrival_time: "08:20 PM", duration: "2h 35m", price: 3900 },
  { id: "f5", airline: "Akasa Air", flight_number: "QP-505", departure_time: "08:30 PM", arrival_time: "10:50 PM", duration: "2h 20m", price: 4100 },
];

const AIRLINES = ["IndiGo", "Air India", "Vistara", "SpiceJet", "Akasa Air"];

function FlightCard({ flight }: { flight: Flight }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-200 hover:shadow-lg transition-all group">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
            <Plane size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900">{flight.airline}</h3>
            <p className="text-sm font-semibold text-slate-500">{flight.flight_number}</p>
          </div>
        </div>

        <div className="flex items-center justify-between w-full md:w-auto md:gap-12 pl-16 md:pl-0">
          <div className="text-center">
            <p className="font-headline font-black text-xl text-slate-900">{flight.departure_time}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Departure</p>
          </div>

          <div className="flex flex-col items-center px-4 relative">
            <p className="text-xs font-bold text-slate-500">{flight.duration}</p>
            <div className="w-24 h-px bg-slate-300 relative my-3">
              <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400 text-[16px] bg-white px-2">flight</span>
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Non-stop</p>
          </div>

          <div className="text-center">
            <p className="font-headline font-black text-xl text-slate-900">{flight.arrival_time}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Arrival</p>
          </div>
        </div>

        <div className="flex items-center justify-between w-full md:w-auto md:flex-col md:items-end gap-2 border-t border-slate-100 md:border-t-0 pt-4 md:pt-0">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Price</p>
            <p className="font-headline font-black text-2xl text-slate-900 text-right">₹{flight.price}</p>
          </div>
          <button className="bg-primary hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl transition-colors shadow-md text-sm">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

function FlightsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);

  // Top Search Bar State
  const [fromCity, setFromCity] = useState(searchParams.get("from_city") || "");
  const [toCity, setToCity] = useState(searchParams.get("to_city") || "");
  const [journeyDate, setJourneyDate] = useState(searchParams.get("journey_date") || "");

  // Sidebar Filter State
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [selectedAirline, setSelectedAirline] = useState<string | undefined>();
  
  const [sortBy, setSortBy] = useState("recommended");

  const fetchFlights = useCallback(async () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      let filtered = [...DUMMY_FLIGHTS];
      if (selectedAirline) {
        filtered = filtered.filter(f => f.airline === selectedAirline);
      }
      if (minPrice !== undefined && maxPrice !== undefined) {
        filtered = filtered.filter(f => f.price >= minPrice && f.price <= maxPrice);
      } else if (minPrice !== undefined) {
        filtered = filtered.filter(f => f.price >= minPrice);
      }
      setFlights(filtered);
      setLoading(false);
    }, 600);
  }, [selectedAirline, minPrice, maxPrice]);

  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  const sortedFlights = useMemo(() => {
    const next = [...flights];
    if (sortBy === "price_low") {
      next.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_high") {
      next.sort((a, b) => b.price - a.price);
    } else if (sortBy === "departure") {
      next.sort((a, b) => a.departure_time.localeCompare(b.departure_time));
    }
    return next;
  }, [flights, sortBy]);

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
    setSelectedAirline(undefined);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (fromCity) params.set("from_city", fromCity);
    if (toCity) params.set("to_city", toCity);
    if (journeyDate) params.set("journey_date", journeyDate);
    router.push(`/flights?${params.toString()}`);
  };

  return (
    <div className="bg-[#f8f9fc] min-h-screen text-slate-800 font-body">
      <Navbar />

      <main className="pt-[50px] pb-20 px-6 max-w-[1400px] mx-auto">
        {/* Search Bar Row */}
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row items-center gap-4 bg-white p-2 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-200 mb-8 w-full">
          
          <div className="flex-1 bg-slate-50 border border-slate-200 hover:border-primary rounded-xl flex items-center px-4 py-3 group cursor-text transition-colors w-full focus-within:border-primary focus-within:ring-1 focus-within:ring-primary shadow-inner">
            <span className="material-symbols-outlined text-primary mr-3 font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>flight_takeoff</span>
            <div className="flex flex-col w-full relative">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Leaving From</label>
              <input 
                type="text" 
                value={fromCity} 
                onChange={(e) => setFromCity(e.target.value)} 
                placeholder="City or Airport"
                className="bg-transparent border-none outline-none text-sm font-bold placeholder-slate-400 p-0 w-full text-slate-900"
              />
            </div>
          </div>

          <div className="flex-1 bg-slate-50 border border-slate-200 hover:border-primary rounded-xl flex items-center px-4 py-3 group cursor-text transition-colors w-full focus-within:border-primary focus-within:ring-1 focus-within:ring-primary shadow-inner">
            <span className="material-symbols-outlined text-primary mr-3 font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>flight_land</span>
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
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Departure Date</label>
              <input 
                type="date" 
                value={journeyDate}
                onChange={(e) => setJourneyDate(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-bold text-slate-900 cursor-pointer p-0 w-full"
              />
            </div>
          </div>

          <button type="submit" className="bg-primary hover:bg-blue-700 text-white font-bold px-10 py-5 rounded-xl transition-colors shrink-0 w-full lg:w-auto text-sm shadow-md">
            Search Flights
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
                  <label className="flex flex-row items-center gap-3 cursor-pointer group" onClick={() => setPriceFilter(0, 4500)}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${minPrice === 0 && maxPrice === 4500 ? 'bg-primary border-primary' : 'border-slate-300 group-hover:border-primary'}`}>
                      {minPrice === 0 && maxPrice === 4500 && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
                    </div>
                    <span className="text-sm font-medium text-slate-600 flex-1">₹ 0 - ₹ 4500</span>
                  </label>
                  <label className="flex flex-row items-center gap-3 cursor-pointer group" onClick={() => setPriceFilter(4500, 6000)}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${minPrice === 4500 && maxPrice === 6000 ? 'bg-primary border-primary' : 'border-slate-300 group-hover:border-primary'}`}>
                      {minPrice === 4500 && maxPrice === 6000 && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
                    </div>
                    <span className="text-sm font-medium text-slate-600 flex-1">₹ 4500 - ₹ 6000</span>
                  </label>
                  <label className="flex flex-row items-center gap-3 cursor-pointer group" onClick={() => setPriceFilter(6000, undefined)}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${minPrice === 6000 && maxPrice === undefined ? 'bg-primary border-primary' : 'border-slate-300 group-hover:border-primary'}`}>
                      {minPrice === 6000 && maxPrice === undefined && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
                    </div>
                    <span className="text-sm font-medium text-slate-600 flex-1">₹ 6000+</span>
                  </label>
                </div>
              </div>

              {/* Airlines */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-4 flex justify-between cursor-pointer">Airlines <span className="material-symbols-outlined text-slate-400 text-sm">expand_less</span></h4>
                <div className="space-y-3">
                  {AIRLINES.map(airline => (
                     <label key={airline} className="flex flex-row items-center gap-3 cursor-pointer group" onClick={() => setSelectedAirline(selectedAirline === airline ? undefined : airline)}>
                       <div className={`w-5 h-5 rounded-full border-[5px] flex items-center justify-center transition-colors ${selectedAirline === airline ? 'border-primary' : 'border-slate-300 group-hover:border-primary'}`}></div>
                       <span className="text-sm font-medium text-slate-600 flex-1">{airline}</span>
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
                {loading ? "Finding available flights..." : `${sortedFlights.length} Flights Available`}
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
            ) : sortedFlights.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900">No flights found</h3>
                <p className="mt-2 text-sm text-slate-600">Try adjusting your filters or search destination.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedFlights.map((flight) => (
                  <FlightCard key={flight.id} flight={flight} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

    </div>
  );
}

export default function FlightsPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
         <Loader2 size={32} className="animate-spin text-primary" />
       </div>
    }>
      <FlightsContent />
    </Suspense>
  );
}
