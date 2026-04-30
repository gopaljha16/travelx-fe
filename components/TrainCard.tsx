export interface TrainClass {
  type: string;
  quota: string;
  price: number;
  status: string;
  statusColor: string;
  freeCancellation: boolean;
  tripGuarantee?: boolean;
  updatedAt: string;
}

export interface Train {
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

export default function TrainCard({ train, onBook }: { train: Train; onBook: (id: string, classType: string) => void }) {
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

        {/* Right Section - Route & Timing */}
        <div className="flex-1 flex justify-between md:justify-center items-start gap-4 lg:gap-14 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
          <div className="text-left w-auto md:w-[140px]">
            <p className="font-black text-lg md:text-[17px] text-slate-900 whitespace-nowrap leading-none mb-1">{train.departure_time}<span className="text-[12px] md:text-[13px] font-medium text-slate-500 ml-1">, {train.departure_date}</span></p>
            <p className="text-sm md:text-[14px] text-slate-600 truncate max-w-[120px] md:max-w-none">{train.departure_station}</p>
          </div>

          <div className="flex flex-col items-center flex-shrink-0 px-2 group">
            <p className="text-[11px] md:text-[13px] text-slate-400 md:text-slate-500 font-bold mb-1.5">{train.duration}</p>
            <div className="flex items-center w-12 sm:w-24 md:w-32 relative">
               <div className="w-full h-[1px] bg-slate-200"></div>
               <div className="absolute right-0 w-1.5 h-1.5 rounded-full bg-slate-300"></div>
            </div>
            <p className="text-[11px] md:text-[13px] text-[#008cff] font-bold mt-1.5 cursor-pointer hover:underline">Route</p>
          </div>

          <div className="text-right md:text-left w-auto md:w-[140px]">
            <p className="font-black text-lg md:text-[17px] text-slate-900 whitespace-nowrap leading-none mb-1">{train.arrival_time}<span className="text-[12px] md:text-[13px] font-medium text-slate-500 ml-1">, {train.arrival_date}</span></p>
            <p className="text-sm md:text-[14px] text-slate-600 truncate max-w-[120px] md:max-w-none">{train.arrival_station}</p>
          </div>
        </div>
      </div>

      {/* Classes / Availability row */}
      <div className="flex overflow-x-auto gap-4 pb-2" style={{ scrollbarWidth: 'none' }}>
        {train.availability.map((avail, idx) => (
          <div key={idx} onClick={() => onBook(train.id, avail.type)} className="min-w-[210px] w-[210px] bg-white border border-slate-200 rounded-[14px] p-3.5 flex flex-col justify-between hover:border-primary hover:bg-blue-50/20 cursor-pointer transition-all">
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
