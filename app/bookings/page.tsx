"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Booking, BusBooking, cancelBooking, cancelBusBooking, getMyBookings, getMyBusBookings, submitReview } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { BusFront, Calendar, Hotel, Loader2, MapPin, Star, TicketX, ChevronRight, Clock, Info, CheckCircle2, XCircle, Luggage } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-slate-100 text-slate-600 border-slate-200",
  COMPLETED: "bg-blue-50 text-blue-700 border-blue-200",
  PAYMENT_PENDING: "bg-orange-50 text-orange-700 border-orange-200 shadow-sm",
  FAILED: "bg-red-50 text-red-600 border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  PAYMENT_PENDING: "Unpaid / Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  PAYMENT_PENDING: <Clock size={14} className="animate-pulse" />,
  CONFIRMED: <CheckCircle2 size={14} />,
  CANCELLED: <XCircle size={14} />,
  COMPLETED: <CheckCircle2 size={14} />,
  FAILED: <XCircle size={14} />,
};

export default function BookingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [tab, setTab] = useState<"hotels" | "buses">("hotels");
  const [hotelBookings, setHotelBookings] = useState<Booking[]>([]);
  const [busBookings, setBusBookings] = useState<BusBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [reviewModal, setReviewModal] = useState<{ bookingId: string; hotelId: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
      return;
    }

    if (user) {
      Promise.all([getMyBookings(), getMyBusBookings()])
        .then(([hotels, buses]) => {
          setHotelBookings(hotels);
          setBusBookings(buses.bookings);
        })
        .catch((error: unknown) => {
          setFeedback(error instanceof Error ? error.message : "Failed to load bookings");
        })
        .finally(() => setLoading(false));
    }
  }, [authLoading, router, user]);

  const hotelSections = useMemo(() => splitBookings(hotelBookings, (item) => item.check_in), [hotelBookings]);
  const busSections = useMemo(() => splitBookings(busBookings, (item) => item.journey_date), [busBookings]);

  const cancelHotelBooking = async (bookingId: string) => {
    setActionLoadingId(bookingId);
    try {
      const updated = await cancelBooking(bookingId);
      setHotelBookings((current) => current.map((booking) => (booking.id === bookingId ? updated : booking)));
      setFeedback("Hotel booking cancelled successfully.");
    } catch (error: unknown) {
      setFeedback(error instanceof Error ? error.message : "Failed to cancel hotel booking");
    } finally {
      setActionLoadingId(null);
    }
  };

  const cancelBusReservation = async (bookingId: string) => {
    setActionLoadingId(bookingId);
    try {
      const updated = await cancelBusBooking(bookingId);
      setBusBookings((current) => current.map((booking) => (booking.id === bookingId ? updated : booking)));
      setFeedback("Bus booking cancelled successfully.");
    } catch (error: unknown) {
      setFeedback(error instanceof Error ? error.message : "Failed to cancel bus booking");
    } finally {
      setActionLoadingId(null);
    }
  };

  const submitHotelReview = async () => {
    if (!reviewModal) return;
    setActionLoadingId(reviewModal.bookingId);
    try {
      await submitReview({
        booking_id: reviewModal.bookingId,
        hotel_id: reviewModal.hotelId,
        rating: reviewRating,
        review_text: reviewText || undefined,
      });
      setFeedback("Review submitted successfully.");
      setReviewModal(null);
      setReviewText("");
      setReviewRating(5);
    } catch (error: unknown) {
      setFeedback(error instanceof Error ? error.message : "Failed to submit review");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="tx-page min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <Loader2 size={40} className="animate-spin text-primary" />
          <p className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Syncing your trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tx-page min-h-screen bg-background font-body">
      <Navbar />

      <main className="pt-20 pb-20">
        {/* -- HERO HEADER -- */}
        <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0f1c2c_0%,#1a3a5f_100%)] px-6 py-16 sm:py-24">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-tertiary/10 blur-3xl"></div>
          
          <div className="tx-shell relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 text-left">
              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary-fixed">
                  <Luggage size={14} /> My Grand Voyages
                </span>
                <h1 className="mt-6 font-headline text-4xl font-black tracking-tight text-white sm:text-6xl">
                  Your journey, <span className="text-primary-fixed-dim italic">curated.</span>
                </h1>
                <p className="mt-6 max-w-xl text-lg font-medium leading-relaxed text-white/70">
                  Manage your hotel stays, bus trips, and travel memories in a single, high-fidelity workspace.
                </p>
              </div>

              {/* -- MODERN TAB SWITCHER -- */}
              <div className="inline-flex gap-1 rounded-2xl bg-white/10 p-1.5 backdrop-blur-md">
                <button
                  onClick={() => setTab("hotels")}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all ${
                    tab === "hotels"
                      ? "bg-white text-on-surface font-bold shadow-lg"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Hotel size={18} />
                  <span className="text-sm">Hotels</span>
                </button>
                <button
                  onClick={() => setTab("buses")}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all ${
                    tab === "buses"
                      ? "bg-white text-on-surface font-bold shadow-lg"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <BusFront size={18} />
                  <span className="text-sm">Buses</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="tx-shell -mt-10 px-6">
          {feedback && (
            <div className="mb-10 flex items-center justify-between rounded-[2rem] border border-primary-container bg-primary-container/30 px-6 py-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Info size={18} className="text-primary-fixed-variant" />
                <p className="text-sm font-bold text-on-primary-fixed-variant">{feedback}</p>
              </div>
              <button onClick={() => setFeedback("")} className="text-xs font-black uppercase tracking-widest opacity-60 hover:opacity-100">Dismiss</button>
            </div>
          )}

          <div className="space-y-16">
            {tab === "hotels" ? (
              <>
                <BookingGroup
                  title="Upcoming Hotel Stays"
                  emptyMessage="No upcoming hotel stays. Time for a new vibe?"
                  items={hotelSections.upcoming}
                  renderItem={(booking) => (
                    <HotelBookingCard
                      booking={booking}
                      actionLoadingId={actionLoadingId}
                      onCancel={cancelHotelBooking}
                      onReview={() => setReviewModal({ bookingId: booking.id, hotelId: booking.hotel_id })}
                      onOpen={() => router.push(`/bookings/${booking.id}?type=hotel`)}
                    />
                  )}
                />
                <BookingGroup
                  title="Past Hotel Memories"
                  emptyMessage="No past trips found."
                  items={hotelSections.past}
                  renderItem={(booking) => (
                    <HotelBookingCard
                      booking={booking}
                      actionLoadingId={actionLoadingId}
                      onCancel={cancelHotelBooking}
                      onReview={() => setReviewModal({ bookingId: booking.id, hotelId: booking.hotel_id })}
                      onOpen={() => router.push(`/bookings/${booking.id}?type=hotel`)}
                    />
                  )}
                />
              </>
            ) : (
              <>
                <BookingGroup
                  title="Upcoming Bus Trips"
                  emptyMessage="No bus bookings in your horizon."
                  items={busSections.upcoming}
                  renderItem={(booking) => (
                    <BusBookingCard
                      booking={booking}
                      actionLoadingId={actionLoadingId}
                      onCancel={cancelBusReservation}
                      onOpen={() => router.push(`/bookings/${booking.id}?type=bus`)}
                    />
                  )}
                />
                <BookingGroup
                  title="Completed Journeys"
                  emptyMessage="Your journey history is waiting to be filled."
                  items={busSections.past}
                  renderItem={(booking) => (
                    <BusBookingCard
                      booking={booking}
                      actionLoadingId={actionLoadingId}
                      onCancel={cancelBusReservation}
                      onOpen={() => router.push(`/bookings/${booking.id}?type=bus`)}
                    />
                  )}
                />
              </>
            )}
          </div>
        </section>
      </main>

      {/* -- REVIEW MODAL -- */}
      {reviewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-surface/40 p-4 backdrop-blur-md">
          <div className="w-full max-w-md scale-in rounded-[3rem] bg-surface p-8 shadow-2xl border border-outline-variant/10">
            <h2 className="font-headline text-3xl font-black text-on-surface">Leave a Review</h2>
            <p className="mt-2 text-on-surface-variant">How was your stay at YatraSqure?</p>
            
            <div className="mt-8 flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setReviewRating(value)}
                  className={`group flex flex-col items-center gap-2 rounded-2xl p-4 transition-all ${
                    value <= reviewRating ? "bg-primary/10 text-primary shadow-sm" : "bg-surface-container-low text-on-surface-variant"
                  }`}
                >
                  <Star size={24} fill={value <= reviewRating ? "currentColor" : "none"} strokeWidth={value <= reviewRating ? 0 : 2} />
                  <span className="text-[10px] font-black uppercase">{value}</span>
                </button>
              ))}
            </div>

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="mt-8 min-h-[140px] w-full rounded-[2rem] border-none bg-surface-container-low p-6 font-medium text-on-surface outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40"
              placeholder="Tell us about the hospitality, decor, and vibe..."
            />

            <div className="mt-8 grid grid-cols-2 gap-4">
              <button 
                onClick={submitHotelReview} 
                disabled={actionLoadingId !== null}
                className="voyage-button flex items-center justify-center rounded-2xl py-4 font-bold text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-sm"
              >
                {actionLoadingId !== null ? <Loader2 className="animate-spin text-white" /> : "Post Review"}
              </button>
              <button 
                onClick={() => setReviewModal(null)} 
                className="rounded-2xl bg-surface-container-highest py-4 font-bold text-on-surface hover:bg-surface-dim transition-all text-sm"
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

function BookingGroup<T>({ title, items, emptyMessage, renderItem }: { title: string; items: T[]; emptyMessage: string; renderItem: (item: T) => React.ReactNode }) {
  return (
    <section className="text-left">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="font-headline text-2xl font-black tracking-tight text-on-surface">{title}</h2>
        <div className="h-px flex-1 bg-outline-variant/10"></div>
        <span className="text-xs font-black uppercase tracking-[0.2em] opacity-40">{items.length} trips</span>
      </div>
      
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[3rem] border border-dashed border-outline-variant bg-surface-container-lowest p-16 text-center shadow-inner">
           <div className="w-16 h-16 rounded-[1.5rem] bg-surface-container flex items-center justify-center mb-6">
             <Luggage size={32} className="text-on-surface-variant/40" />
           </div>
           <p className="text-lg font-bold text-on-surface">{emptyMessage}</p>
           <button className="mt-6 text-primary font-black uppercase tracking-widest text-xs hover:underline">Browse curated destinations</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{items.map(renderItem)}</div>
      )}
    </section>
  );
}

function HotelBookingCard({
  booking,
  actionLoadingId,
  onCancel,
  onReview,
  onOpen,
}: {
  booking: Booking;
  actionLoadingId: string | null;
  onCancel: (bookingId: string) => void;
  onReview: () => void;
  onOpen: () => void;
}) {
  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] bg-white border border-outline-variant/5 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
               <Hotel size={18} className="text-primary" />
             </div>
             <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-primary">Hotel Booking</p>
               <p className="text-xs font-semibold text-on-surface-variant flex items-center gap-1">
                 <Calendar size={12} /> {booking.check_in}
               </p>
             </div>
          </div>
          
          <div className="flex flex-col items-end gap-1.5">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${STATUS_STYLES[booking.status] || "bg-slate-50 text-slate-500 border-slate-200"}`}>
              {STATUS_ICONS[booking.status]}
              {STATUS_LABELS[booking.status] || booking.status}
            </span>
            {booking.status === "PAYMENT_PENDING" && (
              <p className="animate-pulse text-[10px] font-black uppercase tracking-tighter text-orange-600">Action Required</p>
            )}
          </div>
        </div>

        <h3 className="font-headline text-2xl font-black text-on-surface">{booking.hotel_name || "YatraSqure stay"}</h3>
        <p className="mt-3 text-sm font-medium text-on-surface-variant leading-relaxed line-clamp-2">
          {booking.room_type_name} • {booking.num_rooms} room(s) for {booking.num_guests} guests. Full itinerary details available in the concierge view.
        </p>
      </div>

      <div className="bg-surface-container-lowest/50 backdrop-blur-sm p-6 flex items-center justify-between border-t border-outline-variant/10">
        <div>
           <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">Total Vibe Cost</p>
           <p className="text-2xl font-black text-on-surface">₹{booking.total_price.toLocaleString()}</p>
        </div>
        
        <div className="flex items-center gap-2">
           {booking.status === "CONFIRMED" && (
             <button onClick={() => onCancel(booking.id)} disabled={actionLoadingId === booking.id} className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center hover:bg-orange-100 transition-colors shadow-sm border border-orange-100">
               {actionLoadingId === booking.id ? <Loader2 size={16} className="animate-spin" /> : <TicketX size={18} />}
             </button>
           )}
           {booking.status === "COMPLETED" && (
             <button onClick={onReview} className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors shadow-sm border border-primary/10">
               <Star size={18} />
             </button>
           )}
           <button onClick={onOpen} className="voyage-button h-11 px-5 rounded-xl text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 group/btn">
             Details
             <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
      </div>
    </article>
  );
}

function BusBookingCard({
  booking,
  actionLoadingId,
  onCancel,
  onOpen,
}: {
  booking: BusBooking;
  actionLoadingId: string | null;
  onCancel: (bookingId: string) => void;
  onOpen: () => void;
}) {
  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] bg-white border border-outline-variant/5 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-1">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
               <BusFront size={18} />
             </div>
             <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-tertiary">Bus Journey</p>
               <p className="text-xs font-semibold text-on-surface-variant flex items-center gap-1">
                 <Calendar size={12} /> {booking.journey_date}
               </p>
             </div>
          </div>
          
          <div className="flex flex-col items-end gap-1.5">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${STATUS_STYLES[booking.status] || "bg-slate-50 text-slate-500 border-slate-200"}`}>
              {STATUS_ICONS[booking.status]}
              {STATUS_LABELS[booking.status] || booking.status}
            </span>
            {booking.status === "PAYMENT_PENDING" && (
              <p className="animate-pulse text-[10px] font-black uppercase tracking-tighter text-orange-600">Action Required</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <h3 className="font-headline text-2xl font-black text-on-surface">{booking.from_city}</h3>
          <ChevronRight className="text-on-surface-variant/40" />
          <h3 className="font-headline text-2xl font-black text-on-surface">{booking.to_city}</h3>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2 text-on-surface-variant">
           <span className="text-xs px-2 py-0.5 bg-surface-container rounded-md font-bold uppercase tracking-tighter">Seats: {booking.seat_numbers.join(", ")}</span>
           <span className="text-xs px-2 py-0.5 bg-surface-container rounded-md font-bold uppercase tracking-tighter">{booking.bus_type || "Voyage Class"}</span>
        </div>
      </div>

      <div className="bg-tertiary-container/30 backdrop-blur-sm p-6 flex items-center justify-between border-t border-outline-variant/10">
        <div>
           <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">Fare</p>
           <p className="text-2xl font-black text-on-surface">₹{booking.total_price.toLocaleString()}</p>
        </div>
        
        <div className="flex items-center gap-2">
           {booking.status === "CONFIRMED" && (
             <button onClick={() => onCancel(booking.id)} disabled={actionLoadingId === booking.id} className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center hover:bg-orange-100 transition-colors shadow-sm border border-orange-100">
               {actionLoadingId === booking.id ? <Loader2 size={16} className="animate-spin" /> : <TicketX size={18} />}
             </button>
           )}
           <button onClick={onOpen} className="voyage-button h-11 px-5 rounded-xl text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 group/btn">
             View Ticket
             <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
      </div>
    </article>
  );
}

function splitBookings<T>(bookings: T[], getDate: (booking: T) => string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = bookings.filter((booking) => {
    const date = new Date(getDate(booking));
    date.setHours(0, 0, 0, 0);
    return date >= today;
  });

  const past = bookings.filter((booking) => {
    const date = new Date(getDate(booking));
    date.setHours(0, 0, 0, 0);
    return date < today;
  });

  return { upcoming, past };
}
