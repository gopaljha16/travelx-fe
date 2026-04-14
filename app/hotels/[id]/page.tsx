"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Booking, Hotel, Review, createBooking, getHotel, getHotelReviews, verifyPayment } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowRight,
  BedDouble,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  PawPrint,
  ShieldCheck,
  Star,
} from "lucide-react";

type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  handler: (response: RazorpayResponse) => void | Promise<void>;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

export default function HotelDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!user && !authLoading) {
      router.push("/login");
      return;
    }

    if (user) {
      Promise.all([
        getHotel(params.id),
        getHotelReviews(params.id).catch(() => ({ reviews: [], total: 0, page: 1, limit: 10, average_rating: 0 })),
      ])
        .then(([hotelData, reviewData]) => {
          setHotel(hotelData);
          setReviews(reviewData.reviews);
          if (hotelData.room_types[0]) {
            setSelectedRoom(hotelData.room_types[0].name);
          }
        })
        .catch((err: unknown) => setError(err instanceof Error ? err.message : "Hotel not found"))
        .finally(() => setLoading(false));
    }
  }, [authLoading, params.id, router, user]);

  const selectedRoomData = useMemo(
    () => hotel?.room_types.find((room) => room.name === selectedRoom) || hotel?.room_types[0],
    [hotel, selectedRoom]
  );

  const totalNights = useMemo(() => {
    if (!checkIn || !checkOut) {
      return 0;
    }
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [checkIn, checkOut]);

  const totalPrice = (selectedRoomData?.price_per_night || 0) * totalNights * rooms;

  const loadRazorpay = async () => {
    if (window.Razorpay) {
      return true;
    }

    return new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBooking = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !hotel || !selectedRoomData) {
      router.push("/login");
      return;
    }

    setBookingLoading(true);
    setFeedback("");

    try {
      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded || !window.Razorpay) {
        throw new Error("Razorpay SDK failed to load. Please check your connection.");
      }

      const booking: Booking = await createBooking({
        hotel_id: hotel.id,
        room_type_name: selectedRoomData.name,
        check_in: checkIn,
        check_out: checkOut,
        num_rooms: rooms,
        num_guests: guests,
      });

      const paymentObject = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_your_key_id",
        amount: booking.total_price * 100,
        currency: "INR",
        name: "TravelX",
        description: `Hotel booking for ${hotel.name}`,
        order_id: booking.razorpay_order_id,
        handler: async (response: RazorpayResponse) => {
          try {
            await verifyPayment({
              booking_id: booking.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            setShowSuccess(true);
          } catch (err: unknown) {
            setFeedback(err instanceof Error ? err.message : "Payment verification failed");
          } finally {
            setBookingLoading(false);
          }
        },
        prefill: {
          name: user.name || "",
          email: user.email || "",
          contact: user.phone || "",
        },
        theme: { color: "#ff6b35" },
        modal: {
          ondismiss: () => setBookingLoading(false),
        },
      });

      paymentObject.open();
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : "Failed to start booking");
      setBookingLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="tx-page">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 size={30} className="animate-spin text-[#ff6b35]" />
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="tx-page">
        <Navbar />
        <div className="tx-shell py-12">
          <div className="tx-card p-8 text-center">
            <h1 className="text-2xl font-black text-slate-900">Hotel not found</h1>
            <p className="mt-3 text-sm font-semibold text-slate-500">{error || "This property is unavailable."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tx-page">
      <Navbar />

      <section className="tx-shell py-10">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[36px] bg-[linear-gradient(135deg,#ff6b35_0%,#ff884d_100%)] p-8 text-white">
              <p className="tx-kicker text-orange-100">Hotel details</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight">{hotel.name}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold text-white/85">
                <span className="inline-flex items-center gap-2">
                  <Star size={16} className="fill-white text-white" />
                  {hotel.rating > 0 ? hotel.rating.toFixed(1) : "New"}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin size={16} />
                  {hotel.city}, {hotel.address}
                </span>
                {hotel.is_verified && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1">
                    <ShieldCheck size={16} />
                    Verified
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {(hotel.images.length ? hotel.images.slice(0, 3) : [null, null, null]).map((image, index) => (
                <div key={index} className="relative overflow-hidden rounded-[28px] bg-slate-100">
                  {image ? (
                    <Image src={image} alt={`${hotel.name} ${index + 1}`} width={640} height={448} unoptimized className="h-56 w-full object-cover" />
                  ) : (
                    <div className="flex h-56 items-center justify-center text-slate-300">
                      <BedDouble size={40} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="tx-card p-6">
              <p className="tx-kicker">Overview</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">Why guests book this property</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {hotel.description || "TravelX surfaces cleaner hotel detail pages so guests can scan amenities, room options, and booking information much faster."}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {hotel.amenities.map((amenity) => (
                  <span key={amenity} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    {amenity}
                  </span>
                ))}
                {hotel.is_pet_allowed && (
                  <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">
                    <PawPrint size={14} className="mr-1 inline" />
                    Pet friendly
                  </span>
                )}
              </div>
            </div>

            <div className="tx-card p-6">
              <p className="tx-kicker">Room options</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">Choose your stay</h2>
              <div className="mt-5 space-y-3">
                {hotel.room_types.map((room) => (
                  <button
                    key={room.name}
                    onClick={() => setSelectedRoom(room.name)}
                    className={`w-full rounded-3xl border p-4 text-left ${
                      selectedRoomData?.name === room.name ? "border-[#ff6b35] bg-orange-50" : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-black text-slate-900">{room.name}</h3>
                        <p className="mt-1 text-sm font-semibold text-slate-500">{room.capacity} guest(s) max • {room.total_rooms} room(s) available</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-slate-900">INR {room.price_per_night.toLocaleString()}</p>
                        <p className="text-sm font-semibold text-slate-500">per night</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="tx-card p-6">
              <p className="tx-kicker">Guest reviews</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">{reviews.length} reviews</h2>
              {reviews.length === 0 ? (
                <p className="mt-4 text-sm font-semibold text-slate-500">No reviews yet for this property.</p>
              ) : (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {reviews.slice(0, 4).map((review) => (
                    <article key={review.id} className="rounded-3xl bg-slate-50 p-5">
                      <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
                        <Star size={16} className="fill-[#ff6b35] text-[#ff6b35]" />
                        {review.rating}/5
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{review.review_text || "Guest left a rating without additional notes."}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="tx-card p-6">
              <p className="tx-kicker">Book now</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">
                INR {(selectedRoomData?.price_per_night || hotel.price_per_night).toLocaleString()}
                <span className="ml-2 text-base font-semibold text-slate-500">per night</span>
              </h2>

              <form onSubmit={handleBooking} className="mt-5 space-y-4">
                <input
                  type="date"
                  className="tx-input"
                  value={checkIn}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                />
                <input
                  type="date"
                  className="tx-input"
                  value={checkOut}
                  min={checkIn || new Date().toISOString().split("T")[0]}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                />
                <select className="tx-select" value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}>
                  {hotel.room_types.map((room) => (
                    <option key={room.name} value={room.name}>
                      {room.name}
                    </option>
                  ))}
                </select>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input type="number" min={1} value={rooms} onChange={(e) => setRooms(Number(e.target.value))} className="tx-input" placeholder="Rooms" />
                  <input type="number" min={1} value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="tx-input" placeholder="Guests" />
                </div>

                <div className="rounded-3xl bg-slate-50 p-5">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <CreditCard size={16} className="text-[#ff6b35]" />
                    Booking summary
                  </div>
                  <div className="mt-4 space-y-3 text-sm font-semibold text-slate-600">
                    <div className="flex justify-between">
                      <span>Nights</span>
                      <span>{totalNights}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rooms</span>
                      <span>{rooms}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-black text-slate-900">
                      <span>Total</span>
                      <span>INR {totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {feedback && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{feedback}</div>}

                <button type="submit" disabled={bookingLoading || totalNights <= 0} className="tx-button-primary w-full">
                  {bookingLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                  Reserve stay
                </button>
              </form>
            </div>

            <div className="tx-card p-6">
              <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
                <ShieldCheck size={16} className="text-[#16a34a]" />
                Real-time booking path
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                This page reads the real hotel detail and review APIs, then books through `/bookings/` and verifies payment through `/bookings/verify-payment`.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="tx-card w-full max-w-md p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <CheckCircle2 size={30} />
            </div>
            <h2 className="mt-5 text-2xl font-black text-slate-900">Stay confirmed</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Your hotel booking is confirmed and synced with TravelX.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => router.push("/bookings")} className="tx-button-primary">
                Go to my trips
              </button>
              <button onClick={() => setShowSuccess(false)} className="tx-button-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
