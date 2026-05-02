"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Booking, BusBooking, getBooking, getBusBooking } from "@/lib/api";
import { ArrowLeft, BusFront, Calendar, CreditCard, Hotel, Loader2, MapPin, Printer, Share2, Users } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-slate-100 text-slate-600",
  COMPLETED: "bg-blue-50 text-blue-700",
  PAYMENT_PENDING: "bg-amber-50 text-amber-700",
  FAILED: "bg-red-50 text-red-600",
};

function BookingDetailContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type") === "bus" ? "bus" : "hotel";

  const [hotelBooking, setHotelBooking] = useState<Booking | null>(null);
  const [busBooking, setBusBooking] = useState<BusBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBooking() {
      try {
        setLoading(true);
        if (type === "hotel") {
          setHotelBooking(await getBooking(params.id));
        } else {
          setBusBooking(await getBusBooking(params.id));
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load booking details");
      } finally {
        setLoading(false);
      }
    }

    void loadBooking();
  }, [params.id, type]);

  const booking = type === "hotel" ? hotelBooking : busBooking;

  const headerTitle = useMemo(() => {
    if (!booking) {
      return "";
    }

    if (type === "hotel") {
      const hotel = booking as Booking;
      return hotel.hotel_name || "YatraSqure stay";
    }

    const bus = booking as BusBooking;
    return `${bus.from_city} to ${bus.to_city}`;
  }, [booking, type]);

  if (loading) {
    return (
      <div className="tx-page">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 size={30} className="animate-spin text-[#ff6b35]" />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="tx-page">
        <Navbar />
        <div className="tx-shell py-12">
          <div className="tx-card p-8 text-center">
            <h1 className="text-2xl font-black text-slate-900">Booking not found</h1>
            <p className="mt-3 text-sm font-semibold text-slate-500">{error || "We could not load this booking."}</p>
            <button onClick={() => router.push("/bookings")} className="tx-button-primary mt-5">
              Back to bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tx-page">
      <Navbar />

      <section className="tx-shell py-10">
        <button onClick={() => router.push("/bookings")} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900">
          <ArrowLeft size={16} />
          Back to bookings
        </button>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="tx-card p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="tx-kicker">{type === "hotel" ? "Hotel booking" : "Bus booking"}</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">{headerTitle}</h1>
                <p className="mt-2 text-sm font-semibold text-slate-500">Booking ID: {params.id}</p>
              </div>
              <span className={`tx-badge ${STATUS_STYLES[booking.status] || "bg-slate-100 text-slate-600"}`}>{booking.status}</span>
            </div>

            {type === "hotel" ? (
              <HotelDetails booking={booking as Booking} />
            ) : (
              <BusDetails booking={booking as BusBooking} />
            )}

            <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-200 pt-6">
              <button onClick={() => window.print()} className="tx-button-primary">
                <Printer size={16} />
                Print
              </button>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(window.location.href);
                }}
                className="tx-button-secondary"
              >
                <Share2 size={16} />
                Copy link
              </button>
              {type === "hotel" && (booking as Booking).latitude && (booking as Booking).longitude && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${(booking as Booking).latitude},${(booking as Booking).longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tx-button-secondary"
                >
                  <MapPin size={16} />
                  Directions
                </a>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="tx-card p-6">
              <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
                <CreditCard size={16} className="text-[#ff6b35]" />
                Payment summary
              </div>
              <div className="mt-5 space-y-3 text-sm font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span>Base amount</span>
                  <span>INR {booking.total_price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes and fees</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-black text-slate-900">
                  <span>Total paid</span>
                  <span>INR {booking.total_price.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="tx-card p-6">
              <p className="tx-kicker">YatraSqure sync</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">Real booking record</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                This view is pulled from the same booking endpoints used by your dashboard, so status and payment details stay aligned with the backend.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function HotelDetails({ booking }: { booking: Booking }) {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      <DetailCard icon={<Calendar size={18} className="text-[#ff6b35]" />} title="Dates" value={`${booking.check_in} to ${booking.check_out}`} />
      <DetailCard icon={<Users size={18} className="text-[#2563eb]" />} title="Guests and rooms" value={`${booking.num_guests} guest(s), ${booking.num_rooms} room(s)`} />
      <DetailCard icon={<Hotel size={18} className="text-[#16a34a]" />} title="Room type" value={booking.room_type_name} />
      <DetailCard icon={<CreditCard size={18} className="text-[#ff6b35]" />} title="Payment state" value={booking.status} />
    </div>
  );
}

function BusDetails({ booking }: { booking: BusBooking }) {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      <DetailCard icon={<BusFront size={18} className="text-[#ff6b35]" />} title="Route" value={`${booking.from_city} to ${booking.to_city}`} />
      <DetailCard icon={<Calendar size={18} className="text-[#2563eb]" />} title="Journey date" value={booking.journey_date} />
      <DetailCard icon={<Users size={18} className="text-[#16a34a]" />} title="Seat numbers" value={booking.seat_numbers.join(", ")} />
      <DetailCard icon={<CreditCard size={18} className="text-[#ff6b35]" />} title="Bus type" value={booking.bus_type || "Standard"} />
    </div>
  );
}

function DetailCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-5">
      <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
        {icon}
        {title}
      </div>
      <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{value}</p>
    </div>
  );
}

export default function BookingDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="tx-page">
          <Navbar />
          <div className="flex min-h-[60vh] items-center justify-center">
            <Loader2 size={30} className="animate-spin text-[#ff6b35]" />
          </div>
        </div>
      }
    >
      <BookingDetailContent />
    </Suspense>
  );
}
