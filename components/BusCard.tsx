"use client";

import Image from "next/image";
import Link from "next/link";
import { Bus } from "@/lib/api";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function BusCard({ bus }: { bus: Bus }) {
  const availableSeats = bus.total_seats - bus.booked_seats.length;
  const soldOut = availableSeats <= 0;

  return (
    <div className="flex flex-col md:flex-row bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all p-3 gap-5">
      {/* Visual / Image Section */}
      <div className="relative w-full md:w-[280px] shrink-0 h-[180px] rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
        {bus.images && bus.images[0] ? (
          <Image
            src={bus.images[0]}
            alt={bus.name}
            fill
            unoptimized
            className="object-cover transition duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col gap-3 items-center justify-center text-slate-300">
             <span className="material-symbols-outlined text-[48px]">directions_bus</span>
             <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{bus.bus_type}</span>
          </div>
        )}
      </div>

      {/* Middle Content */}
      <div className="flex flex-col flex-grow py-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-widest">
            {bus.bus_type}
          </span>
          {bus.is_verified && (
             <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck size={12} /> Verified
             </span>
          )}
        </div>
        
        <h3 className="text-2xl font-headline font-bold text-slate-900 leading-tight mt-2 mb-4">
          {bus.name}
        </h3>
        
        {/* Route visualization */}
        <div className="flex items-center mt-2 group relative">
            <div className="w-[100px]">
              <p className="text-2xl font-black text-slate-900 font-headline">{bus.departure_time}</p>
              <p className="text-sm font-medium text-slate-500 truncate">{bus.from_city}</p>
            </div>
            
            <div className="flex flex-col items-center flex-1 px-4 text-slate-300 relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">
                {new Date(bus.journey_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
              <div className="w-full relative flex items-center">
                 <div className="w-2 h-2 rounded-full border-2 border-slate-300 bg-white z-10 transition-colors group-hover:border-primary"></div>
                 <div className="flex-1 h-[2px] bg-slate-200 transition-colors group-hover:bg-blue-100"></div>
                 <ArrowRight size={14} className="text-slate-400 mx-2 transition-colors group-hover:text-primary" />
                 <div className="flex-1 h-[2px] bg-slate-200 transition-colors group-hover:bg-blue-100"></div>
                 <div className="w-2 h-2 rounded-full border-2 border-slate-300 bg-white z-10 transition-colors group-hover:border-primary"></div>
              </div>
            </div>
            
            <div className="w-[100px] text-right">
              <p className="text-2xl font-black text-slate-900 font-headline">{bus.arrival_time}</p>
              <p className="text-sm font-medium text-slate-500 truncate">{bus.to_city}</p>
            </div>
        </div>

        {/* Amenities Row */}
        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          {bus.amenities?.slice(0, 4).map((amenity) => (
            <span key={amenity} className="border border-slate-200 text-slate-600 bg-slate-50 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide flex items-center gap-1">
              {amenity}
            </span>
          ))}
        </div>
      </div>

      {/* Right Pricing Section */}
      <div className="w-full md:w-[220px] shrink-0 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col items-end py-2 md:pl-4 justify-between">
        <div className="flex items-start gap-3 w-full justify-between md:justify-end">
          <div className="text-right">
            <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-md border ${soldOut ? 'bg-red-50 text-red-600 border-red-100' : availableSeats < 8 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
               {soldOut ? "Sold Out" : `${availableSeats} Seats Left`}
            </span>
          </div>
        </div>

        <div className="text-right flex flex-col items-end w-full mt-auto pt-4 md:pt-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Per Seat Starting</p>
          <p className="text-3xl font-black text-slate-900 font-headline leading-none mb-4">₹ {bus.price_per_seat.toLocaleString()}</p>

          <Link href={`/buses/${bus.id}`} className="w-full pointer-events-auto">
            <button disabled={soldOut} className="w-full bg-primary hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white transition-colors py-3 rounded-xl font-bold text-sm shadow-md">
              Select Seats
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
