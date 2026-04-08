"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getMyBookings, cancelBooking, getMyBusBookings, cancelBusBooking, submitReview, Booking, BusBooking } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Hotel, Bus as BusIcon, X, Star, Loader2, ArrowRight, MapPin, Calendar, Check } from "lucide-react";

const statusStyles: Record<string, string> = {
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-100 text-gray-800",
  COMPLETED: "bg-blue-100 text-blue-800",
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
  const [cancelSuccess, setCancelSuccess] = useState("");

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
      setCancelSuccess("Booking cancelled. A confirmation email has been sent.");
      setTimeout(() => setCancelSuccess(""), 5000);
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
      setReviewSuccess("Review submitted successfully!");
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
    <div className="mb-12">
      <h2 className="text-[22px] font-semibold text-gray-900 mb-6">{title}</h2>
      
      <div className="space-y-6">
        {bookings.map((b) => (
          <div key={b.id} className="bg-white border border-gray-200 rounded-[12px] overflow-hidden flex flex-col sm:flex-row group transition-shadow hover:shadow-md">
            
            <div className="w-full sm:w-64 h-48 sm:h-auto bg-gray-100 flex-shrink-0 relative overflow-hidden">
               {type === 'hotel' ? (
                b.hotel_image ? <img src={b.hotel_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Hotel size={40} /></div>
               ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300"><BusIcon size={40} /></div>
               )}
            </div>
            
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4 mb-1">
                  <h3 className="text-xl font-semibold text-gray-900 line-clamp-1">
                    {type === 'hotel' ? (b.hotel_name || "Hotel Stay") : `${b.from_city} to ${b.to_city}`}
                  </h3>
                  <span className={`px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase rounded-full whitespace-nowrap ${statusStyles[b.status] || "bg-gray-100 text-gray-800"}`}>
                    {b.status}
                  </span>
                </div>
                
                <p className="text-[15px] text-gray-500 mb-2">
                  {type === 'hotel' ? b.room_type_name : (b.bus_type || "Standard Class")}
                  {type === 'bus' && ` · Seat ${b.seat_numbers.join(", ")}`}
                </p>
                <div className="text-[14px] text-gray-600 font-medium">
                  {type === 'hotel' ? `${b.check_in} — ${b.check_out}` : `Departs: ${b.journey_date}`}
                </div>
                <div className="mt-2 text-lg font-semibold text-gray-900">
                  ₹{b.total_price.toLocaleString()}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-gray-100">
                  {b.status === "CONFIRMED" && (
                    <button onClick={() => type === 'hotel' ? handleCancelHotel(b.id) : handleCancelBus(b.id)} disabled={cancellingId === b.id}
                      className="px-4 py-2 border border-black rounded-lg text-[14px] font-semibold text-black hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:border-gray-300 disabled:text-gray-400 flex items-center gap-2">
                      {cancellingId === b.id && <Loader2 size={14} className="animate-spin" />} Cancel reservation
                    </button>
                  )}
                  {type === 'hotel' && b.latitude && b.longitude && (
                    <a href={`https://www.google.com/maps/search/?api=1&query=${b.latitude},${b.longitude}`} target="_blank" rel="noopener noreferrer"
                      className="px-4 py-2 border border-gray-300 rounded-lg text-[14px] font-semibold text-gray-900 hover:border-black hover:bg-gray-50 transition-colors flex items-center gap-2">
                      Get directions
                    </a>
                  )}
                  {b.status === "COMPLETED" && type === 'hotel' && (
                    <button onClick={() => setReviewModal({ bookingId: b.id, hotelId: b.hotel_id })}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-[14px] font-semibold text-gray-900 hover:border-black hover:bg-gray-50 transition-colors flex items-center gap-2">
                      Write review
                    </button>
                  )}
                  <button onClick={() => router.push(`/bookings/${b.id}?type=${type}`)}
                      className="ml-auto px-4 py-2 text-[14px] font-semibold text-[#FF6B35] hover:bg-pink-50 rounded-lg transition-colors flex items-center gap-1">
                      Show details
                  </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (authLoading || loading) return (
    <div className="min-h-screen bg-white"><Navbar />
      <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={40} className="animate-spin text-gray-900" /></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-24">
      <Navbar />

      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <header className="mb-10">
          <h1 className="text-[32px] font-semibold text-gray-900 mb-6">Trips</h1>
          
          {cancelSuccess && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-[14px] font-medium flex items-center gap-2 max-w-xl">
              <Check size={16} /> {cancelSuccess}
            </div>
          )}

          <div className="flex border-b border-gray-200">
            <button 
              onClick={() => setTab("hotels")} 
              className={`pb-4 px-2 mr-6 text-[15px] font-medium transition-colors border-b-2 ${tab === "hotels" ? "border-black text-gray-900" : "border-transparent text-gray-500 hover:text-gray-800"}`}
            >
              Stays
            </button>
            <button 
              onClick={() => setTab("buses")} 
              className={`pb-4 px-2 text-[15px] font-medium transition-colors border-b-2 ${tab === "buses" ? "border-black text-gray-900" : "border-transparent text-gray-500 hover:text-gray-800"}`}
            >
              Buses
            </button>
          </div>
        </header>

        <main>
          {tab === "hotels" && (
            <div>
              {upcomingHotels.length > 0 && <BookingSection title="Upcoming" bookings={upcomingHotels} type="hotel" />}
              {pastHotels.length > 0 && <BookingSection title="Where you've been" bookings={pastHotels} type="hotel" />}
              
              {upcomingHotels.length === 0 && pastHotels.length === 0 && (
                <div className="pt-20 pb-24 border-t border-gray-200">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">No trips booked... yet!</h3>
                  <p className="text-[15px] text-gray-600 mb-8 max-w-md">Time to dust off your bags and start planning your next adventure.</p>
                  <button onClick={() => router.push("/hotels")} className="px-6 py-3 border border-black rounded-lg text-[15px] font-semibold text-black hover:bg-gray-50 transition-colors">Start searching</button>
                </div>
              )}
            </div>
          )}

          {tab === "buses" && (
            <div>
              {upcomingBuses.length > 0 && <BookingSection title="Upcoming Journeys" bookings={upcomingBuses} type="bus" />}
              {pastBuses.length > 0 && <BookingSection title="Past Routes" bookings={pastBuses} type="bus" />}
              
              {upcomingBuses.length === 0 && pastBuses.length === 0 && (
                <div className="pt-20 pb-24 border-t border-gray-200">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">No bus trips planned.</h3>
                  <p className="text-[15px] text-gray-600 mb-8 max-w-md">Discover seamless intercity journeys across our network.</p>
                  <button onClick={() => router.push("/buses")} className="px-6 py-3 border border-black rounded-lg text-[15px] font-semibold text-black hover:bg-gray-50 transition-colors">Find a route</button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-xl relative animate-fade-in">
            <h3 className="text-[26px] font-semibold text-gray-900 mb-2">How was your stay?</h3>
            <p className="text-gray-500 mb-8 text-[15px]">Sharing your experience helps other travelers make better choices.</p>
            
            {reviewSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} />
                </div>
                <div className="text-[18px] font-semibold text-gray-900">{reviewSuccess}</div>
              </div>
            ) : (
              <>
                <div className="flex justify-center gap-3 mb-8">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className={`text-3xl transition-transform hover:scale-110 ${star <= reviewRating ? "text-[#FF6B35]" : "text-gray-200"}`}
                    >
                      <Star size={36} fill={star <= reviewRating ? "currentColor" : "none"} strokeWidth={star <= reviewRating ? 0 : 2} />
                    </button>
                  ))}
                </div>
                
                <textarea
                  placeholder="Share a few details about your stay..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full p-4 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black rounded-xl mb-6 outline-none transition-all resize-none h-32 font-medium text-gray-900 placeholder:text-gray-400 placeholder:font-normal text-[15px]"
                />
                
                <div className="flex gap-4">
                  <button
                    onClick={() => setReviewModal(null)}
                    className="w-full py-3.5 text-[15px] font-semibold text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReview}
                    disabled={reviewLoading}
                    className="w-full bg-[#FF6B35] hover:bg-[#e55a25] text-white py-3.5 rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center text-[15px]"
                  >
                    {reviewLoading ? <Loader2 size={20} className="animate-spin" /> : "Submit"}
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
