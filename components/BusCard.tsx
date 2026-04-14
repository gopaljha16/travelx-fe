"use client";

import Link from "next/link";
import { Bus } from "@/lib/api";
import { ArrowRight, Calendar, Clock3, ShieldCheck, Users } from "lucide-react";

export default function BusCard({ bus }: { bus: Bus }) {
  const availableSeats = bus.total_seats - bus.booked_seats.length;
  const soldOut = availableSeats <= 0;

  return (
    <Link href={`/buses/${bus.id}`} className="block">
      <article className="tx-card group p-6 transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="tx-kicker">TravelX route</div>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">{bus.name}</h3>
          </div>
          <span
            className={`tx-badge ${
              soldOut ? "bg-red-50 text-red-600" : availableSeats < 8 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {soldOut ? "Sold out" : `${availableSeats} seats left`}
          </span>
        </div>

        <div className="mt-6 grid gap-5 rounded-3xl bg-slate-50 p-5 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div>
            <p className="text-sm font-semibold text-slate-500">From</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{bus.from_city}</p>
            <p className="mt-1 text-sm font-semibold text-[#ff6b35]">{bus.departure_time}</p>
          </div>
          <div className="flex flex-col items-center text-slate-300">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{bus.bus_type}</span>
            <div className="mt-2 h-px w-20 bg-slate-300" />
            <ArrowRight size={16} className="mt-2 text-[#ff6b35]" />
          </div>
          <div className="text-left md:text-right">
            <p className="text-sm font-semibold text-slate-500">To</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{bus.to_city}</p>
            <p className="mt-1 text-sm font-semibold text-[#ff6b35]">{bus.arrival_time}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-500">
          <span className="inline-flex items-center gap-2">
            <Calendar size={16} className="text-[#2563eb]" />
            {new Date(bus.journey_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock3 size={16} className="text-[#2563eb]" />
            Direct service
          </span>
          <span className="inline-flex items-center gap-2">
            <Users size={16} className="text-[#2563eb]" />
            {bus.total_seats} total seats
          </span>
          {bus.is_verified && (
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
              <ShieldCheck size={16} />
              Verified
            </span>
          )}
        </div>

        <div className="mt-6 flex items-end justify-between border-t border-slate-200 pt-5">
          <div>
            <p className="text-sm font-semibold text-slate-500">Starting from</p>
            <p className="text-3xl font-black tracking-tight text-slate-900">INR {bus.price_per_seat.toLocaleString()}</p>
          </div>
          <span className="text-sm font-bold text-[#ff6b35] transition group-hover:translate-x-1">View trip</span>
        </div>
      </article>
    </Link>
  );
}
