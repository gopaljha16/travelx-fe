import { Plane } from "lucide-react";

export interface Flight {
  id: string;
  airline: string;
  flight_number: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  price: number;
}

export default function FlightCard({ flight, onBook }: { flight: Flight; onBook: (id: string) => void }) {
  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-200 hover:shadow-lg transition-all group">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
        <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
            <Plane size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base md:text-lg text-slate-900 leading-tight">{flight.airline}</h3>
            <p className="text-[12px] md:text-sm font-semibold text-slate-400 md:text-slate-500">{flight.flight_number}</p>
          </div>
        </div>

        <div className="flex items-center justify-between w-full md:w-auto md:gap-12 py-4 md:py-0 border-y md:border-y-0 border-slate-50">
          <div className="text-left md:text-center shrink-0">
            <p className="font-headline font-black text-lg md:text-xl text-slate-900">{flight.departure_time}</p>
            <p className="text-[10px] md:text-xs font-bold text-slate-400 md:text-slate-500 uppercase tracking-widest mt-1">Departure</p>
          </div>

          <div className="flex flex-col items-center px-4 relative flex-1 md:flex-none">
            <p className="text-[10px] md:text-xs font-bold text-slate-400 md:text-slate-500">{flight.duration}</p>
            <div className="w-full md:w-24 h-px bg-slate-200 md:bg-slate-300 relative my-2 md:my-3">
              <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400 text-[14px] md:text-[16px] bg-white px-2">flight</span>
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-tighter md:tracking-widest">Non-stop</p>
          </div>

          <div className="text-right md:text-center shrink-0">
            <p className="font-headline font-black text-lg md:text-xl text-slate-900">{flight.arrival_time}</p>
            <p className="text-[10px] md:text-xs font-bold text-slate-400 md:text-slate-500 uppercase tracking-widest mt-1">Arrival</p>
          </div>
        </div>

        <div className="flex items-center justify-between w-full md:w-auto md:flex-col md:items-end gap-2 md:pt-0">
          <div className="md:text-right">
            <p className="text-[10px] md:text-xs font-bold text-slate-400 md:text-slate-500 uppercase tracking-widest leading-none mb-1">Price</p>
            <p className="font-headline font-black text-xl md:text-2xl text-slate-900 leading-none">₹{flight.price}</p>
          </div>
          <button onClick={() => onBook(flight.id)} className="bg-primary hover:bg-blue-700 text-white font-black px-6 py-2.5 rounded-xl transition-all shadow-md text-[13px] active:scale-95">
            Book
          </button>
        </div>
      </div>
    </div>
  );
}
