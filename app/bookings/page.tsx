"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Booking, BusBooking, cancelBooking, cancelBusBooking, getMyBookings, getMyBusBookings, submitReview } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { BusFront, Calendar, Hotel, Loader2, MapPin, Star, TicketX } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-slate-100 text-slate-600",
  COMPLETED: "bg-blue-50 text-blue-700",
  PAYMENT_PENDING: "bg-amber-50 text-amber-700",
  FAILED: "bg-red-50 text-red-600",
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
    if (!reviewModal) {
      return;
    }

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
      <div className="tx-page">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 size={30} className="animate-spin text-[#ff6b35]" />
        </div>
      </div>
    );
  }

  return (
    <div className="tx-page">
      <Navbar />

      <section className="tx-shell py-10">
        <div className="rounded-[36px] bg-[linear-gradient(135deg,#10213d_0%,#17325f_100%)] p-8 text-white sm:p-10">
          <p className="tx-kicker text-orange-200">My trips</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">All your TravelX bookings in one place.</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/75 sm:text-base">
            A single dashboard for hotel stays, bus journeys, cancellation actions, and booking detail views.
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={() => setTab("hotels")} className={tab === "hotels" ? "tx-button-primary" : "tx-button-secondary"}>
            <Hotel size={18} />
            Hotels
          </button>
          <button onClick={() => setTab("buses")} className={tab === "buses" ? "tx-button-primary" : "tx-button-secondary"}>
            <BusFront size={18} />
            Buses
          </button>
        </div>

        {feedback && <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">{feedback}</div>}

        <div className="mt-6 space-y-8">
          {tab === "hotels" ? (
            <>
              <BookingGroup
                title="Upcoming hotel stays"
                emptyMessage="No upcoming hotel bookings yet."
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
                title="Past hotel stays"
                emptyMessage="No completed or cancelled hotel bookings yet."
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
                title="Upcoming bus trips"
                emptyMessage="No upcoming bus bookings yet."
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
                title="Past bus trips"
                emptyMessage="No completed or cancelled bus bookings yet."
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

      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="tx-card w-full max-w-md p-6">
            <h2 className="text-2xl font-black text-slate-900">Write a review</h2>
            <p className="mt-2 text-sm text-slate-600">Share quick feedback for your completed stay.</p>
            <div className="mt-5 flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setReviewRating(value)}
                  className={`rounded-full p-2 ${value <= reviewRating ? "bg-orange-50 text-[#ff6b35]" : "bg-slate-100 text-slate-400"}`}
                >
                  <Star size={18} fill="currentColor" />
                </button>
              ))}
            </div>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="mt-4 min-h-[130px] w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#ff6b35] focus:ring-4 focus:ring-orange-100"
              placeholder="What stood out about the property?"
            />
            <div className="mt-5 flex gap-3">
              <button onClick={submitHotelReview} className="tx-button-primary">
                Submit review
              </button>
              <button onClick={() => setReviewModal(null)} className="tx-button-secondary">
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
    <section>
      <h2 className="text-2xl font-black tracking-tight text-slate-900">{title}</h2>
      {items.length === 0 ? (
        <div className="tx-card mt-4 p-6 text-sm font-semibold text-slate-500">{emptyMessage}</div>
      ) : (
        <div className="mt-4 space-y-4">{items.map(renderItem)}</div>
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
    <article className="tx-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="tx-kicker">Hotel booking</div>
          <h3 className="mt-2 text-2xl font-black text-slate-900">{booking.hotel_name || "TravelX stay"}</h3>
          <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
            <Calendar size={16} className="text-[#ff6b35]" />
            {booking.check_in} to {booking.check_out}
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            {booking.room_type_name} • {booking.num_rooms} room(s) • {booking.num_guests} guest(s)
          </p>
        </div>
        <span className={`tx-badge ${STATUS_STYLES[booking.status] || "bg-slate-100 text-slate-600"}`}>{booking.status}</span>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-5">
        <div className="text-2xl font-black tracking-tight text-slate-900">INR {booking.total_price.toLocaleString()}</div>
        <div className="flex flex-wrap gap-3">
          {booking.status === "CONFIRMED" && (
            <button onClick={() => onCancel(booking.id)} className="tx-button-secondary" disabled={actionLoadingId === booking.id}>
              {actionLoadingId === booking.id ? <Loader2 size={16} className="animate-spin" /> : <TicketX size={16} />}
              Cancel
            </button>
          )}
          {booking.status === "COMPLETED" && (
            <button onClick={onReview} className="tx-button-secondary">
              <Star size={16} />
              Review
            </button>
          )}
          {booking.latitude && booking.longitude && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${booking.latitude},${booking.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="tx-button-secondary"
            >
              <MapPin size={16} />
              Directions
            </a>
          )}
          <button onClick={onOpen} className="tx-button-primary">
            View details
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
    <article className="tx-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="tx-kicker">Bus booking</div>
          <h3 className="mt-2 text-2xl font-black text-slate-900">
            {booking.from_city} to {booking.to_city}
          </h3>
          <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
            <Calendar size={16} className="text-[#ff6b35]" />
            {booking.journey_date}
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            {booking.bus_type || "Standard"} • Seats {booking.seat_numbers.join(", ")}
          </p>
        </div>
        <span className={`tx-badge ${STATUS_STYLES[booking.status] || "bg-slate-100 text-slate-600"}`}>{booking.status}</span>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-5">
        <div className="text-2xl font-black tracking-tight text-slate-900">INR {booking.total_price.toLocaleString()}</div>
        <div className="flex flex-wrap gap-3">
          {booking.status === "CONFIRMED" && (
            <button onClick={() => onCancel(booking.id)} className="tx-button-secondary" disabled={actionLoadingId === booking.id}>
              {actionLoadingId === booking.id ? <Loader2 size={16} className="animate-spin" /> : <TicketX size={16} />}
              Cancel
            </button>
          )}
          <button onClick={onOpen} className="tx-button-primary">
            View details
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
