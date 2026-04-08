"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getHotel, getHotelReviews, createBooking, verifyPayment, Hotel, Review, Booking } from "@/lib/api";
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

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push("/login"); return; }
    setBookingError(""); setBookingSuccess(""); setBookingLoading(true);
    
    try {
      const res = await loadRazorpay();
      if (!res) {
        setBookingError("Razorpay SDK failed to load. Are you online?");
        setBookingLoading(false);
        return;
      }

      const booking = await createBooking({ 
        hotel_id: id, 
        room_type_name: selectedRoom, 
        check_in: checkIn, 
        check_out: checkOut, 
        num_rooms: numRooms, 
        num_guests: numGuests 
      });

      if (!hotel) return;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_your_key_id",
        amount: booking.total_price * 100,
        currency: "INR",
        name: "GoTravel",
        description: `Booking at ${hotel.name}`,
        order_id: booking.razorpay_order_id,
        handler: async function (response: any) {
          try {
            setBookingLoading(true);
            await verifyPayment({
              booking_id: booking.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            setBookingSuccess("Stay Reserved & Payment Verified.");
            setShowBookingModal(true);
          } catch (err: any) {
            setBookingError(err.message || "Payment verification failed");
          } finally {
            setBookingLoading(false);
          }
        },
        prefill: {
          name: user.name || "",
          email: user.email || "",
          contact: user.phone || "",
        },
        theme: {
          color: "#ec6a2a",
        },
        modal: {
            ondismiss: function() {
                setBookingLoading(false);
            }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err: any) {
      setBookingError(err.message || "Reservation failed");
      setBookingLoading(false);
    }
  };

  const selectedRoomData = hotel?.room_types.find((r) => r.name === selectedRoom);
  const nights = checkIn && checkOut ? Math.max(0, (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000) : 0;
  const totalPrice = selectedRoomData ? selectedRoomData.price_per_night * nights * numRooms : 0;

  if (pageLoading) return (
    <div className="min-h-screen bg-white"><Navbar />
      <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={40} className="animate-spin text-gray-900" /></div>
    </div>
  );

  if (error || !hotel) return (
    <div className="min-h-screen bg-white"><Navbar />
      <div className="text-center py-40 text-gray-500 font-medium">{error || "Hotel not found"}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-20">
      <Navbar />
      
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-[32px] font-semibold text-gray-900 mb-2">{hotel.name}</h1>
          <div className="flex items-center gap-2 text-[15px] text-gray-800 font-medium font-sans">
            <span className="flex items-center gap-1">
              <Star size={16} className="text-black fill-black" />
              {hotel.rating > 0 ? hotel.rating.toFixed(2) : "New"}
            </span>
            <span className="text-gray-400">·</span>
            <span className="underline cursor-pointer">{reviews.length} reviews</span>
            <span className="text-gray-400">·</span>
            <span className="underline cursor-pointer flex items-center gap-1">
              {hotel.city}, {hotel.address.split(',').pop()?.trim() || hotel.address}
            </span>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 rounded-[16px] overflow-hidden mb-12 h-[300px] sm:h-[400px] lg:h-[460px] group">
          <div className="h-full relative cursor-pointer md:col-span-2 md:row-span-2 group-hover:opacity-80 hover:!opacity-100 transition-opacity duration-300" onClick={() => setActiveImg(0)}>
            {hotel.images[0] ? (
              <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover" />
            ) : <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400"><BedDouble size={48} /></div>}
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="hidden md:block h-full relative overflow-hidden bg-gray-200 cursor-pointer group-hover:opacity-80 hover:!opacity-100 transition-opacity duration-300" onClick={() => setActiveImg(i)}>
              {hotel.images[i] ? (
                <img src={hotel.images[i]} alt="" className="w-full h-full object-cover" />
              ) : null}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-20 relative">
          {/* Main Content */}
          <div className="space-y-8">
            
            {/* Hosted By/Overview */}
            <section className="flex items-center justify-between py-6 border-b border-gray-200">
              <div>
                <h2 className="text-[22px] font-semibold text-gray-900 mb-1">Room in a professional hotel hosted by {hotel.city && `${hotel.city} Stays`}</h2>
                <div className="text-[15px] text-gray-600 font-normal">
                  {hotel.room_types[0] ? `${hotel.room_types[0].capacity} guests` : "Multiple guests"} · {hotel.room_types.length} bedrooms · {hotel.room_types.length} beds
                </div>
              </div>
              <div className="w-14 h-14 bg-gray-200 rounded-full border border-gray-300 overflow-hidden flex items-center justify-center text-xl text-gray-500 flex-shrink-0">
                🏢
              </div>
            </section>

            {/* Description */}
            <section className="py-2">
              {hotel.description ? (
                <p className="text-[#222222] leading-[1.6] text-base whitespace-pre-wrap">{hotel.description}</p>
              ) : (
                <p className="text-gray-500 italic">No description available for this property.</p>
              )}
            </section>

            <div className="border-b border-gray-200" />

            {/* Amenities */}
            <section className="py-2">
              <h2 className="text-[22px] font-semibold text-gray-900 mb-6">What this place offers</h2>
              <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                {hotel.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-4 text-[#222222]">
                    <div className="w-6 h-6 flex items-center justify-center">
                       {amenityIcons[a] || <Check size={24} strokeWidth={1.5} />}
                    </div>
                    <span className="text-base font-normal">{a}</span>
                  </div>
                ))}
                {hotel.is_pet_allowed && (
                   <div className="flex items-center gap-4 text-[#222222]">
                    <div className="w-6 h-6 flex items-center justify-center">
                       <PawPrint size={24} strokeWidth={1.5} />
                    </div>
                    <span className="text-base font-normal">Pets allowed</span>
                  </div>
                )}
              </div>
            </section>

            <div className="border-b border-gray-200" />

            {/* Rooms */}
            <section className="py-2">
              <h2 className="text-[22px] font-semibold text-gray-900 mb-6">Available Options</h2>
              <div className="space-y-4">
                {hotel.room_types.map((room) => (
                  <div key={room.name} className={`rounded-[12px] border p-5 cursor-pointer transition-all ${selectedRoom === room.name ? "border-black bg-gray-50 ring-1 ring-black" : "border-gray-300 hover:border-gray-500 bg-white"}`}
                    onClick={() => setSelectedRoom(room.name)}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-1">
                          {room.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 font-normal">
                          <span className="flex items-center gap-1.5"><Users size={16} /> {room.capacity} guests max</span>
                          <span className="flex items-center gap-1.5 text-green-700">
                            ✓ {room.total_rooms} remaining
                          </span>
                        </div>
                      </div>
                      <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0">
                        <div className="text-lg font-semibold text-gray-900">₹{room.price_per_night.toLocaleString()}</div>
                        <div className="text-[13px] text-gray-500 font-normal underline">night</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="border-b border-gray-200" />

            {/* Reviews */}
            <section className="py-2">
              <h2 className="text-[22px] font-semibold text-gray-900 flex items-center gap-2 mb-6">
                 <Star size={20} className="fill-black" />
                 {hotel.rating > 0 ? hotel.rating.toFixed(2) : "New"} · {reviews.length} reviews
              </h2>
              {reviews.length === 0 ? (
                <div className="text-gray-500 font-medium">No reviews yet. Be the first to review!</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {reviews.map((r) => (
                    <div key={r.id} className="flex flex-col">
                      <div className="flex items-center gap-4 mb-3">
                         <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-semibold font-sans">
                            {r.user_id ? "G" : "U"}
                         </div>
                         <div>
                            <h4 className="text-base font-semibold text-[#222222]">Guest</h4>
                            <p className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</p>
                         </div>
                      </div>
                      {r.review_text && <p className="text-[#222222] text-base leading-relaxed">"{r.review_text}"</p>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Booking Widget */}
          <div className="relative">
            <div className="bg-white rounded-xl border border-[#dddddd] shadow-[0_6px_16px_rgba(0,0,0,0.12)] p-6 sticky top-28 w-full max-w-[370px] mx-auto lg:ml-auto">
              <div className="text-[22px] font-semibold text-gray-900 mb-6 flex items-baseline gap-1">
                ₹{selectedRoomData ? selectedRoomData.price_per_night.toLocaleString() : hotel.price_per_night.toLocaleString()}
                <span className="text-base font-normal text-gray-500"> night</span>
              </div>

              {bookingSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm font-medium mb-6 flex items-center gap-2">
                  <Check size={16} /> {bookingSuccess}
                </div>
              )}
              {bookingError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm font-medium mb-6">
                  {bookingError}
                </div>
              )}

              <form onSubmit={handleBook} className="space-y-4">
                <div className="border border-[#b0b0b0] rounded-lg overflow-hidden flex flex-col relative focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                  <div className="grid grid-cols-2 text-left relative">
                    <div className="p-3 border-r border-b border-[#b0b0b0] relative">
                      <label className="block text-[10px] font-bold text-gray-900 uppercase tracking-wide">Check-in</label>
                      <input 
                        type="date" 
                        value={checkIn} 
                        onChange={(e) => setCheckIn(e.target.value)} 
                        required 
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full mt-1 border-none bg-transparent p-0 text-sm focus:ring-0 text-[#222222] font-normal outline-none" 
                      />
                    </div>
                    <div className="p-3 border-b border-[#b0b0b0]">
                      <label className="block text-[10px] font-bold text-gray-900 uppercase tracking-wide">Checkout</label>
                      <input 
                        type="date" 
                        value={checkOut} 
                        onChange={(e) => setCheckOut(e.target.value)} 
                        required 
                        min={checkIn || new Date().toISOString().split("T")[0]}
                        className="w-full mt-1 border-none bg-transparent p-0 text-sm focus:ring-0 text-[#222222] font-normal outline-none" 
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-white">
                     <label className="block text-[10px] font-bold text-gray-900 uppercase tracking-wide">Room Type</label>
                     <select 
                       value={selectedRoom} 
                       onChange={(e) => setSelectedRoom(e.target.value)}
                       className="w-full mt-1 border-none bg-transparent p-0 text-sm focus:ring-0 text-[#222222] font-normal outline-none cursor-pointer"
                     >
                        {hotel.room_types.map((r) => <option key={r.name} value={r.name}>{r.name} (Max {r.capacity})</option>)}
                     </select>
                  </div>
                </div>

                <button type="submit" disabled={bookingLoading || !checkIn || !checkOut}
                  className="w-full bg-[#FF6B35] hover:bg-[#e55a25] text-white py-[14px] rounded-lg font-semibold text-base transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-2">
                  {bookingLoading ? <Loader2 size={20} className="animate-spin" /> : "Reserve"}
                </button>
                <div className="text-center font-normal mt-3 text-[#222222] text-sm">
                  {!user ? "Login required to book" : "You won't be charged yet"}
                </div>

                {nights > 0 && (
                  <div className="pt-4 pb-2 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[#222222] underline text-base">₹{selectedRoomData?.price_per_night.toLocaleString()} × {nights} nights</span>
                      <span className="text-[#222222] text-base">₹{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-4">
                      <span className="font-semibold text-[#222222] text-base">Total before taxes</span>
                      <span className="font-semibold text-[#222222] text-base">₹{totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
             
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={32} className="text-green-600" />
            </div>
            
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">Booking Confirmed!</h3>
            <p className="text-gray-600 text-center mb-8">
              Your stay at <span className="font-semibold text-gray-900">{hotel.name}</span> has been confirmed. A receipt has been sent to your email.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push("/bookings")}
                className="w-full bg-[#FF6B35] text-white py-3.5 rounded-lg font-semibold hover:bg-[#e55a25] transition-colors"
              >
                View My Bookings
              </button>
              <button
                onClick={() => setShowBookingModal(false)}
                className="w-full bg-gray-100 text-[#222222] py-3.5 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
