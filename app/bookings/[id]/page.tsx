"use client";
import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getBooking, getBusBooking, Booking, BusBooking } from "@/lib/api";
import { Loader2, ArrowLeft, Printer, Share2, CheckCircle2, Calendar, Users, MapPin, Bus, Hotel, CreditCard } from "lucide-react";

function BookingDetailContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "hotel";
  const router = useRouter();

  const [hotelBooking, setHotelBooking] = useState<Booking | null>(null);
  const [busBooking, setBusBooking] = useState<BusBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBooking() {
      try {
        setLoading(true);
        if (type === "hotel") {
          const data = await getBooking(id);
          setHotelBooking(data);
        } else {
          const data = await getBusBooking(id);
          setBusBooking(data);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load booking details");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchBooking();
  }, [id, type]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-bold animate-pulse">Fetching your receipt...</p>
      </div>
    );
  }

  if (error || (!hotelBooking && !busBooking)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-[32px] shadow-xl text-center max-w-sm border border-red-50">
          <div className="text-5xl mb-4">🎫</div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-500 mb-6 font-medium">{error || "Booking not found."}</p>
          <button onClick={() => router.back()} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isHotel = type === "hotel";
  const b = isHotel ? hotelBooking! : busBooking!;
  const title = isHotel ? (b as Booking).hotel_name || "Hotel Stay" : (b as BusBooking).bus_name || "Bus Trip";
  const status = b.status;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 pt-12">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 font-bold hover:text-gray-900 mb-8 transition-colors group">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:-translate-x-1 transition-transform">
            <ArrowLeft size={18} />
          </div>
          Back to Bookings
        </button>

        <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100 flex flex-col md:flex-row">
          
          {/* Main Info Section */}
          <div className="flex-1 p-8 md:p-12">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isHotel ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
                  {isHotel ? <Hotel size={24} /> : <Bus size={24} />}
                </div>
                <div>
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">{title}</h1>
                  <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Booking ID: {id.slice(-8).toUpperCase()}</p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-2xl font-black text-sm uppercase tracking-wider ${status === "CONFIRMED" ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
                {status}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {isHotel ? (
                <>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0"><Calendar size={20} /></div>
                      <div>
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Duration</div>
                        <div className="text-gray-900 font-bold">{(b as Booking).check_in} — {(b as Booking).check_out}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0"><Users size={20} /></div>
                      <div>
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Guests & Rooms</div>
                        <div className="text-gray-900 font-bold">{(b as Booking).num_guests} Guests · {(b as Booking).num_rooms} {(b as Booking).room_type_name}</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0"><MapPin size={20} /></div>
                      <div>
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Route</div>
                        <div className="text-gray-900 font-bold">{(b as BusBooking).from_city} → {(b as BusBooking).to_city}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0"><Calendar size={20} /></div>
                      <div>
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Journey Date</div>
                        <div className="text-gray-900 font-bold">{(b as BusBooking).journey_date}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0"><Users size={20} /></div>
                      <div>
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Reserved Seats</div>
                        <div className="text-gray-900 font-bold">Seats: {(b as BusBooking).seat_numbers.join(", ")}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0"><Bus size={20} /></div>
                      <div>
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Bus Type</div>
                        <div className="text-gray-900 font-bold">{(b as BusBooking).bus_type || "Standard"}</div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 h-fit">
                <div className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-widest mb-4"><CreditCard size={14} /> Price Breakdown</div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium text-gray-500">
                    <span>Base Amount</span>
                    <span>₹{b.total_price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-gray-500">
                    <span>Tax & Fees</span>
                    <span>Included</span>
                  </div>
                  <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between items-end">
                    <span className="text-gray-900 font-black tracking-tight">Total Paid</span>
                    <span className="text-2xl font-black text-gray-900">₹{b.total_price.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-10 border-t border-dashed border-gray-200 flex flex-wrap gap-4">
              <button onClick={() => window.print()} className="flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-900/10 active:scale-95">
                <Printer size={18} /> Print 
              </button>
              {isHotel && (b as Booking).latitude && (b as Booking).longitude && (
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${(b as Booking).latitude},${(b as Booking).longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/10 active:scale-95"
                >
                  <MapPin size={18} /> Get Directions
                </a>
              )}
              <button className="flex items-center gap-2 bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-95">
                <Share2 size={18} /> Share
              </button>
            </div>
          </div>

          {/* Side Graphic / Info */}
          <div className="w-full md:w-72 bg-gray-50/50 p-8 flex flex-col justify-center text-center border-l border-gray-100">
            <div className="mb-6">
              <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto drop-shadow-xl" strokeWidth={3} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Verified Trip</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8">
              Your booking is verified and synced with our partners in real-time.
            </p>
            <div className="mt-auto space-y-4">
               <button 
                onClick={() => router.push(isHotel ? `/hotels/${(b as Booking).hotel_id}` : `/buses/${(b as BusBooking).bus_id}`)}
                className="w-full text-sm font-bold text-blue-600 hover:bg-blue-50 py-3 rounded-xl transition-all"
               >
                Visit {isHotel ? "Hotel" : "Bus"} Profile
               </button>
            </div>
          </div>

        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
            GoTravel Concierge &copy; 2026. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BookingDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-bold animate-pulse">Initializing...</p>
      </div>
    }>
      <BookingDetailContent />
    </Suspense>
  );
}
