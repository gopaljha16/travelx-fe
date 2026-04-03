"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getMyBookings, cancelBooking, getMyBusBookings, cancelBusBooking, submitReview, Booking, BusBooking } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Hotel, Bus as BusIcon, X, Star, Loader2, ArrowRight, MapPin, Calendar } from "lucide-react";

const statusColors: Record<string, string> = {
  CONFIRMED: "bg-green-500/10 text-green-500 border-green-500/20",
  CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
  COMPLETED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

export default function BookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"hotels" | "buses">("hotels");
  const [hotelBookings, setHotelBookings] = useState<Booking[]>([]);
  const [busBookings, setBusBookings] = useState<BusBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState<{ bookingId: string; hotelId: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (user) {
      Promise.all([getMyBookings(), getMyBusBookings()])
        .then(([h, b]) => { setHotelBookings(h); setBusBookings(b.bookings); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  const handleCancelHotel = async (id: string) => {
    setCancellingId(id);
    try {
      const updated = await cancelBooking(id);
      setHotelBookings((prev) => prev.map((b) => b.id === id ? updated : b));
    } catch { } finally { setCancellingId(null); }
  };

  const handleCancelBus = async (id: string) => {
    setCancellingId(id);
    try {
      const updated = await cancelBusBooking(id);
      setBusBookings((prev) => prev.map((b) => b.id === id ? updated : b));
    } catch { } finally { setCancellingId(null); }
  };

  const handleReview = async () => {
    if (!reviewModal) return;
    setReviewLoading(true);
    try {
      await submitReview({ booking_id: reviewModal.bookingId, hotel_id: reviewModal.hotelId, rating: reviewRating, review_text: reviewText });
      setReviewSuccess("Review submitted!");
      setTimeout(() => { setReviewModal(null); setReviewSuccess(""); setReviewText(""); setReviewRating(5); }, 1500);
    } catch { } finally { setReviewLoading(false); }
  };

  const isUpcoming = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(dateStr);
    return bookingDate >= today;
  };

  const upcomingHotels = hotelBookings.filter((b) => isUpcoming(b.check_in) && b.status !== "CANCELLED");
  const pastHotels = hotelBookings.filter((b) => !isUpcoming(b.check_in) || b.status === "CANCELLED");

  const upcomingBuses = busBookings.filter((b) => isUpcoming(b.journey_date) && b.status !== "CANCELLED");
  const pastBuses = busBookings.filter((b) => !isUpcoming(b.journey_date) || b.status === "CANCELLED");

  const BookingSection = ({ title, bookings, type }: { title: string, bookings: any[], type: 'hotel' | 'bus' }) => (
    <div className="mb-24 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 mb-12">
        <h2 className="text-4xl md:text-5xl font-black text-[var(--foreground)] tracking-tighter uppercase leading-[0.8]">{title}.</h2>
        <span className="text-[10px] font-black text-[#ec6a2a] uppercase tracking-[0.3em]">{bookings.length} {bookings.length === 1 ? 'Legacy' : 'Legacies'}</span>
      </div>
      
      <div className="space-y-20">
        {bookings.map((b) => (
          <div key={b.id} className="bg-[var(--card)] rounded-[56px] border-2 border-[var(--card-border)] p-8 md:p-10 flex flex-col md:flex-row gap-10 hover:border-[#ec6a2a]/20 transition-all duration-500 group relative overflow-hidden">
            <div className="w-full md:w-56 h-56 md:h-56 bg-[var(--muted)] rounded-[40px] overflow-hidden flex-shrink-0 relative">
              {type === 'hotel' ? (
                b.hotel_image ? <img src={b.hotel_image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <div className="w-full h-full flex items-center justify-center text-[var(--foreground)] opacity-10 text-5xl font-black">🏨</div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl grayscale opacity-20 group-hover:grayscale-0 group-hover:opacity-100 transition-all">🚌</div>
              )}
              <div className={`absolute top-4 left-4 px-4 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-widest border-2 shadow-xl ${statusColors[b.status]}`}>
                {b.status}
              </div>
            </div>
            
            <div className="flex-1 flex flex-col">
              <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                <div>
                  <h3 className="text-3xl font-black text-[var(--foreground)] tracking-tighter uppercase line-clamp-1 mb-2">
                    {type === 'hotel' ? (b.hotel_name || "Hotel Stay") : `${b.from_city} to ${b.to_city}`}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-3 text-[#ec6a2a] font-black text-[10px] bg-[#ec6a2a]/10 px-4 py-1.5 rounded-full uppercase tracking-widest border border-[#ec6a2a]/20">
                      {type === 'hotel' ? b.room_type_name : (b.bus_type || "Standard Class")}
                    </div>
                    {type === 'bus' && (
                      <div className="flex items-center gap-3 text-[var(--foreground)] opacity-40 font-black text-[10px] bg-[var(--muted)] px-4 py-1.5 rounded-full uppercase tracking-widest border border-[var(--card-border)]">
                        Seat: {b.seat_numbers.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <div className="text-4xl font-black text-[var(--foreground)] tracking-tighter">₹{b.total_price.toLocaleString()}</div>
                  <div className="text-[10px] text-[var(--foreground)] opacity-20 font-black uppercase tracking-[0.2em] mt-1">Settlement Price</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mt-10">
                <div className="bg-[var(--muted)] p-5 rounded-[28px] border-2 border-[var(--card-border)]/50">
                  <div className="text-[9px] text-[#ec6a2a] font-black uppercase tracking-widest mb-2">{type === 'hotel' ? 'Arrival' : 'Departure'}</div>
                  <div className="text-sm font-black text-[var(--foreground)] uppercase">{type === 'hotel' ? b.check_in : b.journey_date}</div>
                </div>
                <div className="bg-[var(--muted)] p-5 rounded-[28px] border-2 border-[var(--card-border)]/50">
                  <div className="text-[9px] text-[#ec6a2a] font-black uppercase tracking-widest mb-2">{type === 'hotel' ? 'Departure' : 'Terminal Path'}</div>
                  <div className="text-sm font-black text-[var(--foreground)] uppercase">{type === 'hotel' ? b.check_out : `${b.from_city} &rarr; ${b.to_city}`}</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-6 mt-auto pt-10 border-t border-[var(--card-border)]/50">
                <div className="flex gap-4">
                  {b.status === "CONFIRMED" && (
                    <button onClick={() => type === 'hotel' ? handleCancelHotel(b.id) : handleCancelBus(b.id)} disabled={cancellingId === b.id}
                      className="flex items-center gap-3 text-[10px] font-black text-red-500 bg-red-500/10 hover:bg-red-500/20 px-6 py-3 rounded-2xl transition-all disabled:opacity-50 uppercase tracking-widest border-2 border-red-500/20">
                      {cancellingId === b.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />} Revoke Booking
                    </button>
                  )}
                  {type === 'hotel' && b.latitude && b.longitude && (
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${b.latitude},${b.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-[10px] font-black text-[#ec6a2a] bg-[#ec6a2a]/10 hover:bg-[#ec6a2a]/20 px-6 py-3 rounded-2xl transition-all uppercase tracking-widest border-2 border-[#ec6a2a]/20"
                    >
                      <MapPin size={14} /> Coordinates
                    </a>
                  )}
                  {b.status === "COMPLETED" && type === 'hotel' && (
                    <button onClick={() => setReviewModal({ bookingId: b.id, hotelId: b.hotel_id })}
                      className="flex items-center gap-3 text-[10px] font-black text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 px-6 py-3 rounded-2xl transition-all uppercase tracking-widest border-2 border-amber-500/20">
                      <Star size={14} /> Submit Feedback
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => router.push(`/bookings/${b.id}?type=${type}`)}
                  className="text-[10px] font-black text-[var(--foreground)] opacity-40 hover:opacity-100 flex items-center gap-3 transition-opacity uppercase tracking-widest group"
                >
                  View Editorial Receipt <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (authLoading || loading) return (
    <div className="min-h-screen bg-[var(--background)] transition-colors"><Navbar />
      <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={40} className="animate-spin text-[#ec6a2a]" /></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)] pb-40 transition-colors duration-500">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-24">
        <header className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="animate-fade-in">
            <p className="text-[10px] font-black text-[#ec6a2a] uppercase tracking-[0.5em] mb-6">User Concierge</p>
            <h1 className="text-6xl md:text-8xl font-black text-[var(--foreground)] tracking-tighter uppercase leading-[0.8]">The Archives.</h1>
          </div>
          <div className="flex gap-4 p-2 bg-[var(--card)] border-2 border-[var(--card-border)] rounded-[40px] shadow-2xl shadow-[#ec6a2a]/5 animate-slide-up">
            <button onClick={() => setTab("hotels")} className={`flex items-center gap-4 px-10 py-5 rounded-[32px] text-[10px] font-black uppercase tracking-widest transition-all ${tab === "hotels" ? "bg-[#ec6a2a] text-white shadow-xl shadow-[#ec6a2a]/20" : "text-[var(--foreground)] opacity-40 hover:opacity-100"}`}>
              <Hotel size={18} /> Stays
            </button>
            <button onClick={() => setTab("buses")} className={`flex items-center gap-4 px-10 py-5 rounded-[32px] text-[10px] font-black uppercase tracking-widest transition-all ${tab === "buses" ? "bg-[#ec6a2a] text-white shadow-xl shadow-[#ec6a2a]/20" : "text-[var(--foreground)] opacity-40 hover:opacity-100"}`}>
              <BusIcon size={18} /> Express
            </button>
          </div>
        </header>

        {tab === "hotels" && (
          <div className="animate-fade-in">
            {upcomingHotels.length > 0 && <BookingSection title="Active Stays" bookings={upcomingHotels} type="hotel" />}
            {pastHotels.length > 0 && <BookingSection title="History" bookings={pastHotels} type="hotel" />}
            {upcomingHotels.length === 0 && pastHotels.length === 0 && (
              <div className="text-center py-40 bg-[var(--card)] rounded-[64px] border-2 border-dashed border-[var(--card-border)] flex flex-col items-center">
                <div className="w-24 h-24 rounded-[32px] bg-[var(--muted)] flex items-center justify-center text-[var(--foreground)] opacity-10 text-5xl mb-10">🏨</div>
                <h3 className="text-4xl font-black text-[var(--foreground)] tracking-tighter uppercase leading-[0.8] mb-6">Archive Empty.</h3>
                <p className="text-[var(--foreground)] opacity-40 font-bold max-w-xs mx-auto mb-12">Looking for a place to stay? Our collection is curated for you.</p>
                <button onClick={() => router.push("/hotels")} className="bg-[#ec6a2a] text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-[#ec6a2a]/20 hover:scale-[1.05] active:scale-95 transition-all">Explore Collection</button>
              </div>
            )}
          </div>
        )}

        {tab === "buses" && (
          <div className="animate-fade-in">
            {upcomingBuses.length > 0 && <BookingSection title="On-Path" bookings={upcomingBuses} type="bus" />}
            {pastBuses.length > 0 && <BookingSection title="Terminal Records" bookings={pastBuses} type="bus" />}
            {upcomingBuses.length === 0 && pastBuses.length === 0 && (
              <div className="text-center py-40 bg-[var(--card)] rounded-[64px] border-2 border-dashed border-[var(--card-border)] flex flex-col items-center">
                <div className="w-24 h-24 rounded-[32px] bg-[var(--muted)] flex items-center justify-center text-[var(--foreground)] opacity-10 text-5xl mb-10">🚌</div>
                <h3 className="text-4xl font-black text-[var(--foreground)] tracking-tighter uppercase leading-[0.8] mb-6">No Records.</h3>
                <p className="text-[var(--foreground)] opacity-40 font-bold max-w-xs mx-auto mb-12">Ready for your next express journey? Discover routes across the network.</p>
                <button onClick={() => router.push("/buses")} className="bg-[#ec6a2a] text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-[#ec6a2a]/20 hover:scale-[1.05] active:scale-95 transition-all">Select Route</button>
              </div>
            )}
          </div>
        )}
      </div>

      {reviewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-3xl flex items-center justify-center p-6 z-50 transition-all duration-500">
          <div className="bg-[var(--card)] rounded-[80px] p-12 md:p-20 w-full max-w-3xl shadow-2xl border-2 border-[var(--card-border)] animate-slide-up relative overflow-hidden">
            <h3 className="text-5xl md:text-7xl font-black text-[var(--foreground)] tracking-tighter uppercase leading-[0.8] mb-10">Feedback.</h3>
            <p className="text-[var(--foreground)] opacity-50 font-bold text-lg mb-16 leading-relaxed">Your story helps other travelers discover elite stays and helps us refine the TravelX experience.</p>
            
            {reviewSuccess ? (
              <div className="text-center py-20 text-[#ec6a2a] font-black text-4xl tracking-tighter uppercase">{reviewSuccess}</div>
            ) : (
              <>
                <div className="flex justify-center gap-4 mb-20">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className={`text-5xl transition-all hover:scale-125 active:scale-95 ${star <= reviewRating ? "text-[#ec6a2a]" : "text-[var(--foreground)] opacity-10"}`}
                    >
                      <Star size={56} fill={star <= reviewRating ? "currentColor" : "none"} strokeWidth={star <= reviewRating ? 0 : 2} />
                    </button>
                  ))}
                </div>
                
                <textarea
                  placeholder="Draft your editorial review..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full p-10 bg-[var(--muted)] border-2 border-transparent focus:border-[#ec6a2a]/20 focus:bg-[var(--card)] rounded-[48px] mb-16 outline-none transition-all resize-none h-60 font-medium text-[var(--foreground)] placeholder:text-[var(--foreground)] placeholder:opacity-20 text-lg"
                />
                
                <div className="flex flex-col md:flex-row gap-8">
                  <button
                    onClick={() => setReviewModal(null)}
                    className="flex-1 text-[var(--foreground)] opacity-40 font-black py-6 hover:opacity-100 transition-opacity uppercase tracking-[0.3em] text-xs"
                  >
                    Hold Review
                  </button>
                  <button
                    onClick={handleReview}
                    disabled={reviewLoading}
                    className="flex-[2] bg-[#ec6a2a] text-white py-6 rounded-[32px] font-black shadow-2xl shadow-[#ec6a2a]/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 uppercase tracking-[0.3em] text-xs flex items-center justify-center"
                  >
                    {reviewLoading ? <Loader2 className="animate-spin" /> : "Transmit Feedback"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
