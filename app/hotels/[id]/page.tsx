"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getHotel, getHotelReviews, createBooking, Hotel, Review } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { MapPin, Wifi, Car, Waves, PawPrint, Users, BedDouble, Loader2, Star, Check, ArrowRight } from "lucide-react";

const amenityIcons: Record<string, React.ReactNode> = {
  Wifi: <Wifi size={14} />,
  Pool: <Waves size={14} />,
  Parking: <Car size={14} />,
};

export default function HotelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [numRooms, setNumRooms] = useState(1);
  const [numGuests, setNumGuests] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (!user && !authLoading) { router.push("/login"); return; }
    if (!user) return;
    const load = async () => {
      try {
        const [h, r] = await Promise.all([
          getHotel(id),
          getHotelReviews(id).catch(() => ({ reviews: [], total: 0, page: 1, limit: 10, average_rating: 0 })),
        ]);
        setHotel(h);
        setReviews(r.reviews);
        setAvgRating(r.average_rating);
        if (h.room_types.length) setSelectedRoom(h.room_types[0].name);
      } catch {
        setError("Collection not found");
      } finally {
        setPageLoading(false);
      }
    };
    load();
  }, [id, user, authLoading, router]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push("/login"); return; }
    setBookingError(""); setBookingSuccess(""); setBookingLoading(true);
    try {
      await createBooking({ hotel_id: id, room_type_name: selectedRoom, check_in: checkIn, check_out: checkOut, num_rooms: numRooms, num_guests: numGuests });
      setBookingSuccess("Stay Reserved.");
      setShowBookingModal(true);
    } catch (err: unknown) {
      setBookingError(err instanceof Error ? err.message : "Reservation failed");
    } finally {
      setBookingLoading(false);
    }
  };

  const selectedRoomData = hotel?.room_types.find((r) => r.name === selectedRoom);
  const nights = checkIn && checkOut ? Math.max(0, (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000) : 0;
  const totalPrice = selectedRoomData ? selectedRoomData.price_per_night * nights * numRooms : 0;

  if (pageLoading) return (
    <div className="min-h-screen bg-[var(--background)] transition-colors"><Navbar />
      <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={40} className="animate-spin text-[#ec6a2a]" /></div>
    </div>
  );

  if (error || !hotel) return (
    <div className="min-h-screen bg-[var(--background)] transition-colors"><Navbar />
      <div className="text-center py-40 text-[var(--foreground)] opacity-40 font-black uppercase tracking-widest">{error || "Collection not found"}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)] pb-40 transition-colors duration-500">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 pt-24">
        {/* Editorial Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-24 h-[600px] animate-fade-in">
          <div className="md:col-span-8 bg-[var(--muted)] rounded-[64px] border-4 border-[var(--card-border)] overflow-hidden relative group">
            {hotel.images[activeImg] ? (
              <img src={hotel.images[activeImg]} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
            ) : <div className="w-full h-full flex items-center justify-center text-[var(--foreground)] opacity-10 text-8xl font-black">🏨</div>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>
          <div className="md:col-span-4 flex flex-col gap-8">
            {hotel.images.slice(1, 3).map((img, i) => (
              <div key={i} className="flex-1 bg-[var(--muted)] rounded-[48px] border-4 border-[var(--card-border)] overflow-hidden cursor-pointer group" onClick={() => setActiveImg(i + 1)}>
                <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100" />
              </div>
            ))}
            {hotel.images.length < 2 && <div className="flex-1 bg-[var(--card)] rounded-[48px] border-2 border-[var(--card-border)] flex items-center justify-center text-[var(--foreground)] opacity-5 text-6xl font-black">🏨</div>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
          {/* Main Details Overhaul */}
          <div className="lg:col-span-2 space-y-24">
            <div className="animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div>
                  <p className="text-[10px] font-black text-[#ec6a2a] uppercase tracking-[0.5em] mb-6">Concierge Select</p>
                  <h1 className="text-6xl md:text-8xl font-black text-[var(--foreground)] tracking-tighter uppercase leading-[0.8]">{hotel.name}.</h1>
                  <div className="flex items-center gap-4 mt-8">
                    <div className="flex items-center gap-3 text-[var(--foreground)] opacity-40 text-[10px] font-black uppercase tracking-[0.2em] bg-[var(--muted)] px-6 py-2 rounded-full border border-[var(--card-border)]">
                      <MapPin size={16} className="text-[#ec6a2a]" /> {hotel.address}, {hotel.city}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-start md:items-end gap-4">
                  <div className="bg-[#ec6a2a] text-white font-black px-6 py-3 rounded-[32px] text-2xl shadow-2xl shadow-[#ec6a2a]/20">
                    {hotel.rating > 0 ? hotel.rating.toFixed(1) : "New"}
                  </div>
                  <div className="flex items-center gap-1.5 text-[#ec6a2a]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={18} fill={s <= Math.round(hotel.rating) ? "currentColor" : "none"} strokeWidth={2.5} />
                    ))}
                  </div>
                </div>
              </div>
              {hotel.description && <p className="text-[var(--foreground)] opacity-60 text-xl font-medium leading-relaxed max-w-3xl">{hotel.description}</p>}
            </div>

            {/* Premium Amenities Overhaul */}
            <div>
              <h2 className="text-[10px] font-black text-[#ec6a2a] uppercase tracking-[0.5em] mb-12">The Experience.</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {hotel.amenities.map((a) => (
                  <div key={a} className="flex flex-col items-start gap-4 p-8 bg-[var(--card)] rounded-[40px] border-2 border-[var(--card-border)] group hover:border-[#ec6a2a]/20 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--muted)] flex items-center justify-center text-[#ec6a2a] group-hover:scale-110 transition-transform">
                       {amenityIcons[a] || <Check size={18} />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] opacity-40">{a}</span>
                  </div>
                ))}
                {hotel.is_pet_allowed && (
                   <div className="flex flex-col items-start gap-4 p-8 bg-[#ec6a2a]/5 rounded-[40px] border-2 border-[#ec6a2a]/10 group hover:bg-[#ec6a2a]/10 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-[#ec6a2a] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                       <PawPrint size={18} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#ec6a2a]">Pet Friendly</span>
                  </div>
                )}
              </div>
            </div>

            {/* Room Architecture redesign */}
            <div>
              <h2 className="text-[10px] font-black text-[#ec6a2a] uppercase tracking-[0.5em] mb-12">Availability.</h2>
              <div className="space-y-6">
                {hotel.room_types.map((room) => (
                  <div key={room.name} className={`group bg-[var(--card)] rounded-[48px] border-4 p-8 md:p-10 cursor-pointer transition-all duration-500 overflow-hidden relative ${selectedRoom === room.name ? "border-[#ec6a2a] shadow-2xl shadow-[#ec6a2a]/10" : "border-[var(--card-border)] hover:border-[var(--card-border)] hover:bg-[var(--muted)]"}`}
                    onClick={() => setSelectedRoom(room.name)}>
                    {selectedRoom === room.name && <div className="absolute top-0 right-0 w-32 h-32 bg-[#ec6a2a]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />}
                    
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                      <div>
                        <div className="text-3xl font-black text-[var(--foreground)] uppercase tracking-tighter mb-4 flex items-center gap-4">
                          <BedDouble size={24} className="text-[#ec6a2a]" /> {room.name}
                        </div>
                        <div className="flex items-center gap-6 text-[var(--foreground)] opacity-30 text-[10px] font-black uppercase tracking-widest">
                          <span className="flex items-center gap-2"><Users size={14} /> Max {room.capacity}</span>
                          <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-[#ec6a2a] rounded-full" /> {room.total_rooms} Active</span>
                        </div>
                      </div>
                      <div className="text-left md:text-right">
                        <div className="text-4xl font-black text-[var(--foreground)] tracking-tighter">₹{room.price_per_night.toLocaleString()}</div>
                        <div className="text-[9px] text-[var(--foreground)] opacity-20 font-black uppercase tracking-widest mt-1">Settlement / Night</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Editorial Reviews Overhaul */}
            <div>
              <h2 className="text-[10px] font-black text-[#ec6a2a] uppercase tracking-[0.5em] mb-12">The Archives.</h2>
              {reviews.length === 0 ? (
                <div className="bg-[var(--card)] rounded-[48px] border-2 border-dashed border-[var(--card-border)] p-20 text-center">
                   <p className="text-[var(--foreground)] opacity-20 font-black uppercase tracking-widest text-xs">No feedback records yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {reviews.map((r) => (
                    <div key={r.id} className="bg-[var(--card)] border-2 border-[var(--card-border)] rounded-[48px] p-10 hover:border-[#ec6a2a]/20 transition-all group">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-1 text-[#ec6a2a]">
                           {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill={s <= r.rating ? "currentColor" : "none"} strokeWidth={s <= r.rating ? 0 : 2} />)}
                        </div>
                        <span className="text-[9px] text-[var(--foreground)] opacity-20 font-black uppercase tracking-widest">{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                      {r.review_text && <p className="text-[var(--foreground)] opacity-60 font-medium italic leading-relaxed">"{r.review_text}"</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Checkout Concierge Form redesign */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--card)] rounded-[56px] border-2 border-[var(--card-border)] p-10 md:p-12 sticky top-24 shadow-2xl shadow-[#ec6a2a]/5 animate-slide-up">
              <div className="text-[9px] font-black text-[#ec6a2a] uppercase tracking-[0.5em] mb-8">Reservation Desk</div>
              <div className="text-5xl font-black text-[var(--foreground)] tracking-tighter mb-10 leading-none">
                ₹{selectedRoomData ? selectedRoomData.price_per_night.toLocaleString() : hotel.price_per_night.toLocaleString()}
                <span className="text-lg font-black text-[var(--foreground)] opacity-20 uppercase tracking-widest"> / Night</span>
              </div>

              {bookingSuccess && (
                <div className="bg-green-500/10 border-2 border-green-500/20 text-green-500 rounded-[28px] px-8 py-5 text-xs font-black uppercase tracking-widest mb-10 animate-fade-in">{bookingSuccess}</div>
              )}
              {bookingError && (
                <div className="bg-red-500/10 border-2 border-red-500/20 text-red-500 rounded-[28px] px-8 py-5 text-xs font-black uppercase tracking-widest mb-10 animate-fade-in">{bookingError}</div>
              )}

              <form onSubmit={handleBook} className="space-y-8">
                <div>
                  <label className="text-[9px] font-black text-[var(--foreground)] opacity-30 uppercase tracking-widest block mb-4">Configuration</label>
                  <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}
                    className="w-full bg-[var(--muted)] border-2 border-transparent focus:bg-[var(--card)] focus:border-[#ec6a2a]/20 rounded-[28px] px-8 py-5 text-sm font-black uppercase tracking-widest text-[var(--foreground)] outline-none transition-all appearance-none cursor-pointer">
                    {hotel.room_types.map((r) => <option key={r.name} value={r.name}>{r.name.toUpperCase()}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="text-[9px] font-black text-[var(--foreground)] opacity-30 uppercase tracking-widest block mb-4">Check-in Protocol</label>
                    <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required min={new Date().toISOString().split("T")[0]}
                      className="w-full bg-[var(--muted)] border-2 border-transparent focus:bg-[var(--card)] focus:border-[#ec6a2a]/20 rounded-[28px] px-8 py-5 text-xs font-black uppercase tracking-widest text-[var(--foreground)] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-[var(--foreground)] opacity-30 uppercase tracking-widest block mb-4">Departure Protocol</label>
                    <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required min={checkIn || new Date().toISOString().split("T")[0]}
                      className="w-full bg-[var(--muted)] border-2 border-transparent focus:bg-[var(--card)] focus:border-[#ec6a2a]/20 rounded-[28px] px-8 py-5 text-xs font-black uppercase tracking-widest text-[var(--foreground)] outline-none transition-all" />
                  </div>
                </div>

                {nights > 0 && (
                  <div className="bg-[var(--muted)] rounded-[32px] p-8 border-2 border-dashed border-[var(--card-border)] animate-fade-in">
                    <div className="flex justify-between items-baseline mb-4">
                      <span className="text-[9px] font-black text-[var(--foreground)] opacity-30 uppercase tracking-widest">Rate Calc</span>
                      <span className="text-xl font-black text-[var(--foreground)] tracking-tighter">₹{selectedRoomData?.price_per_night.toLocaleString()} × {nights}</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-4 border-t-2 border-[var(--card-border)]/50">
                      <span className="text-[9px] font-black text-[var(--foreground)] opacity-30 uppercase tracking-widest">Settlement</span>
                      <span className="text-4xl font-black text-[#ec6a2a] tracking-tighter">₹{totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <button type="submit" disabled={bookingLoading || !checkIn || !checkOut}
                  className="w-full bg-[#ec6a2a] text-white py-6 rounded-[32px] font-black uppercase tracking-[0.3em] text-[10px] hover:scale-[1.05] active:scale-95 transition-all shadow-2xl shadow-[#ec6a2a]/30 disabled:opacity-30 disabled:hover:scale-100 flex items-center justify-center gap-3">
                  {bookingLoading ? <Loader2 size={18} className="animate-spin" /> : "Initiate Stay"}
                </button>
                {!user && <p className="text-[10px] font-black text-center text-[var(--foreground)] opacity-20 uppercase tracking-[0.2em] mt-4">Concierge Sign-in Required</p>}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal redesign */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-[var(--background)]/80 backdrop-blur-3xl flex items-center justify-center z-50 p-6 animate-fade-in">
          <div className="bg-[var(--card)] rounded-[80px] p-16 md:p-24 w-full max-w-2xl shadow-2xl border-2 border-[var(--card-border)] animate-slide-up text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-[#ec6a2a]" />
            <div className="w-24 h-24 bg-[#ec6a2a] rounded-full flex items-center justify-center mx-auto mb-12 shadow-2xl shadow-[#ec6a2a]/30">
                <Check size={40} strokeWidth={4} className="text-white" />
            </div>
            
            <h3 className="text-5xl font-black text-[var(--foreground)] tracking-tighter uppercase mb-6 leading-[0.8]">Reservation <br /> Locked.</h3>
            <p className="text-[var(--foreground)] opacity-50 font-bold mb-16 leading-relaxed max-w-sm mx-auto">
              Your editorial stay at <span className="text-[var(--foreground)] opacity-100">{hotel.name}</span> has been confirmed. You can access your itinerary in the archives.
            </p>

            <div className="flex flex-col gap-6">
              <button
                onClick={() => router.push("/bookings")}
                className="w-full bg-[#ec6a2a] text-white py-6 rounded-[32px] font-black uppercase tracking-[0.3em] text-[10px] hover:scale-[1.05] active:scale-95 transition-all shadow-2xl shadow-[#ec6a2a]/30 flex items-center justify-center gap-3"
              >
                View Itinerary <ArrowRight size={18} />
              </button>
              <button
                onClick={() => setShowBookingModal(false)}
                className="w-full text-[var(--foreground)] opacity-30 font-black py-4 rounded-full uppercase tracking-widest text-[10px] hover:opacity-100 transition-opacity"
              >
                Close Desk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
