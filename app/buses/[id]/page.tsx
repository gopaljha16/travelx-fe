"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getBus, bookBus, verifyBusPayment, Bus } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { MapPin, Clock, Users, Loader2, Check, ArrowRight } from "lucide-react";

export default function BusDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [bus, setBus] = useState<Bus | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  useEffect(() => {
    if (!user && !authLoading) { router.push("/login"); return; }
    if (!user) return;
    getBus(id).then(setBus).catch(() => setError("Route not found")).finally(() => setPageLoading(false));
  }, [id, user, authLoading, router]);

  const toggleSeat = (seat: number) => {
    if (bus?.booked_seats.includes(seat)) return;
    setSelectedSeats((prev) => prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]);
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBook = async () => {
    if (!user) { router.push("/login"); return; }
    if (!selectedSeats.length) return;
    setBookingError(""); setBookingSuccess(""); setBookingLoading(true);
    
    try {
      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded) {
        setBookingError("Razorpay SDK failed to load. Please check your connection.");
        setBookingLoading(false);
        return;
      }

      const booking = await bookBus(id, selectedSeats);
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_your_key_id",
        amount: booking.total_price * 100,
        currency: "INR",
        name: "GoTravel",
        description: `Bus Booking: ${bus?.name} (${selectedSeats.join(", ")})`,
        order_id: booking.razorpay_order_id,
        handler: async function (response: any) {
          try {
            setBookingLoading(true);
            await verifyBusPayment({
              booking_id: booking.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });
            setBookingSuccess(`Route Confirmed & Payment Verified.`);
            setShowBookingModal(true);
            setSelectedSeats([]);
            const updated = await getBus(id);
            setBus(updated);
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
      setBookingError(err.message || "Transmission failed");
      setBookingLoading(false);
    }
  };

  if (pageLoading) return (
    <div className="min-h-screen bg-[var(--background)] transition-colors"><Navbar />
      <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={40} className="animate-spin text-[#ec6a2a]" /></div>
    </div>
  );

  if (error || !bus) return (
    <div className="min-h-screen bg-[var(--background)] transition-colors"><Navbar />
      <div className="text-center py-40 text-[var(--foreground)] opacity-40 font-black uppercase tracking-widest">{error || "Route not found"}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)] pb-40 transition-colors duration-500">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 pt-24">
        {/* Editorial Header Card */}
        <div className="bg-[var(--card)] rounded-[64px] border-2 border-[var(--card-border)] p-12 md:p-16 mb-16 relative overflow-hidden shadow-2xl shadow-[#ec6a2a]/5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#ec6a2a]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1 w-full text-left">
               <p className="text-[10px] font-black text-[#ec6a2a] uppercase tracking-[0.5em] mb-6">Route Detail</p>
               <h1 className="text-6xl md:text-8xl font-black text-[var(--foreground)] tracking-tighter uppercase leading-[0.8] mb-8">{bus.name}.</h1>
               <div className="flex items-center gap-4 text-[#ec6a2a] font-black text-[10px] bg-[#ec6a2a]/10 px-6 py-2 rounded-full uppercase tracking-widest w-fit border-2 border-[#ec6a2a]/20">
                 {bus.bus_type}
               </div>
            </div>

            <div className="flex-1 w-full flex items-center justify-between gap-12">
              <div className="text-center min-w-[100px]">
                <div className="text-5xl font-black text-[var(--foreground)] tracking-tighter uppercase leading-none">{bus.departure_time}</div>
                <div className="flex items-center justify-center gap-2 text-[#ec6a2a] font-black text-[10px] uppercase tracking-widest mt-4">
                  <MapPin size={14} /> {bus.from_city}
                </div>
              </div>
              
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--card-border)] to-transparent relative">
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--card)] px-6">
                      <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">🚌</span>
                   </div>
                </div>
                <div className="text-[10px] font-black text-[var(--foreground)] opacity-20 uppercase tracking-widest mt-6 flex items-center gap-3">
                  <Clock size={14} /> {new Date(bus.journey_date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                </div>
              </div>

              <div className="text-center min-w-[100px]">
                <div className="text-5xl font-black text-[var(--foreground)] tracking-tighter uppercase leading-none">{bus.arrival_time}</div>
                <div className="flex items-center justify-center gap-2 text-[#ec6a2a] font-black text-[10px] uppercase tracking-widest mt-4">
                  <MapPin size={14} /> {bus.to_city}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Seat Map Design */}
          <div className="lg:col-span-2 bg-[var(--card)] rounded-[80px] border-2 border-[var(--card-border)] p-12 md:p-20 shadow-2xl shadow-[#ec6a2a]/5">
            <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-8 mb-20">
              <div>
                <h2 className="text-4xl font-black text-[var(--foreground)] tracking-tighter uppercase leading-[0.8] mb-4">Select Your Position.</h2>
                <p className="text-[var(--foreground)] opacity-40 font-bold text-sm">Every seat on TravelX is verified for ergonomic comfort.</p>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border-2 border-[var(--card-border)]" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--foreground)] opacity-40">Open</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#ec6a2a] shadow-lg shadow-[#ec6a2a]/30" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--foreground)] opacity-40">Reserved</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[var(--muted)] border-2 border-[var(--card-border)] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-[var(--foreground)] opacity-10 rounded-full" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--foreground)] opacity-40">Unavailable</span>
                </div>
              </div>
            </div>

            {/* Realistic Cabin Architecture */}
            <div className="relative max-w-sm mx-auto bg-[var(--muted)] rounded-[64px] p-12 border-2 border-[var(--card-border)]">
              <div className="flex items-center justify-between mb-16 pb-12 border-b-2 border-dashed border-[var(--card-border)]">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 bg-[var(--background)] rounded-full border-2 border-[var(--card-border)] flex items-center justify-center text-[var(--foreground)] opacity-20 hover:opacity-100 transition-opacity">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v10"/><path d="m12 12 7 7"/><path d="m12 12-7 7"/></svg>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--foreground)] opacity-20">Navigation Controller</span>
                </div>
                <div className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--foreground)] opacity-20 -rotate-90">Cabin Terminal</div>
                <div className="w-16 h-16 bg-[#ec6a2a]/10 rounded-3xl flex items-center justify-center text-[#ec6a2a] border-2 border-[#ec6a2a]/20">
                  <Clock size={28} />
                </div>
              </div>

              {/* Grid with improved visual feedback */}
              <div className="flex flex-col gap-6">
                {(() => {
                  const isSleeper = bus.bus_type.toLowerCase().includes("sleeper");
                  const layout = isSleeper ? [1, 2, 0, 3] : [1, 2, 0, 3, 4];
                  const seatsPerRow = isSleeper ? 3 : 4;
                  const totalRows = Math.ceil(bus.total_seats / seatsPerRow);
                  
                  return Array.from({ length: totalRows }).map((_, rowIndex) => (
                    <div key={rowIndex} className="flex justify-between gap-4">
                      {layout.map((col, colIndex) => {
                        if (col === 0) return <div key={`aisle-${rowIndex}`} className="w-12 shrink-0 flex items-center justify-center"><div className="w-0.5 h-full bg-[var(--card-border)]/30 border-dashed border-r" /></div>;
                        
                        const seatIndex = rowIndex * seatsPerRow + (colIndex > 2 ? colIndex - 1 : colIndex);
                        const seatNumber = seatIndex + 1;
                        if (seatNumber > bus.total_seats) return <div key={`empty-${colIndex}`} className="flex-1 invisible" />;

                        const isBooked = bus.booked_seats.includes(seatNumber);
                        const isSelected = selectedSeats.includes(seatNumber);
                        
                        return (
                          <button
                            key={seatNumber}
                            onClick={() => toggleSeat(seatNumber)}
                            disabled={isBooked}
                            className={`flex-1 rounded-2xl transition-all duration-500 relative group overflow-hidden border-2 ${
                              isSleeper ? "h-24" : "h-16"
                            } ${
                              isBooked ? "bg-[var(--card-border)]/20 border-[var(--card-border)] text-[var(--foreground)] opacity-5 cursor-not-allowed" :
                              isSelected ? "bg-[#ec6a2a] border-transparent text-white shadow-2xl shadow-[#ec6a2a]/40 -translate-y-2" :
                              "bg-[var(--card)] border-[var(--card-border)] text-[var(--foreground)] hover:border-[#ec6a2a] hover:bg-[#ec6a2a]/5 shadow-sm active:scale-90"
                            }`}
                          >
                            <span className="text-xs font-black relative z-10">{seatNumber}</span>
                            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-6 h-1.5 rounded-b-lg ${isSelected ? "bg-white/40" : "bg-[var(--card-border)]"}`} />
                          </button>
                        );
                      })}
                    </div>
                  ));
                })()}
              </div>

              <div className="mt-16 flex justify-center">
                <div className="text-[9px] font-black uppercase tracking-[0.5em] text-[var(--foreground)] opacity-10 py-3 border-y-2 border-[var(--card-border)] flex gap-4 w-full justify-center">
                  <span>Entry Exit Protocol</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Logic redesign */}
          <div className="bg-[var(--card)] rounded-[56px] border-2 border-[var(--card-border)] p-10 md:p-12 h-fit sticky top-24 shadow-2xl shadow-[#ec6a2a]/5 animate-slide-up">
            <h2 className="text-3xl font-black text-[var(--foreground)] uppercase tracking-tighter mb-10">Consolidated Summary.</h2>

            {bookingSuccess && <div className="bg-green-500/10 border-2 border-green-500/20 text-green-500 rounded-[28px] px-8 py-5 text-xs font-black uppercase tracking-widest mb-10 animate-fade-in">{bookingSuccess}</div>}
            {bookingError && <div className="bg-red-500/10 border-2 border-red-500/20 text-red-500 rounded-[28px] px-8 py-5 text-xs font-black uppercase tracking-widest mb-10 animate-fade-in">{bookingError}</div>}

            <div className="space-y-6 mb-12">
              <div className="flex justify-between items-baseline gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] opacity-30">Unit Rate</span>
                <span className="text-xl font-black text-[var(--foreground)] tracking-tighter">₹{bus.price_per_seat.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-baseline gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] opacity-30">Positions</span>
                <span className="text-xl font-black text-[#ec6a2a] tracking-tighter">{selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}</span>
              </div>
              <div className="pt-8 border-t-2 border-[var(--card-border)]/50 flex justify-between items-baseline gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] opacity-30">Settlement</span>
                <span className="text-5xl font-black text-[var(--foreground)] tracking-tighter">₹{(bus.price_per_seat * selectedSeats.length).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleBook}
              disabled={bookingLoading || selectedSeats.length === 0}
              className="w-full bg-[#ec6a2a] text-white py-6 rounded-[32px] font-black uppercase tracking-[0.3em] text-[10px] hover:scale-[1.05] active:scale-95 transition-all shadow-2xl shadow-[#ec6a2a]/30 disabled:opacity-30 disabled:hover:scale-100 flex items-center justify-center gap-3"
            >
              {bookingLoading ? <Loader2 size={18} className="animate-spin" /> : `Commit ${selectedSeats.length} Reserve${selectedSeats.length !== 1 ? "s" : ""}`}
            </button>
            {!user && <p className="text-[10px] font-black text-center text-[var(--foreground)] opacity-20 mt-6 uppercase tracking-widest">Authentication Required</p>}
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
            
            <h3 className="text-5xl font-black text-[var(--foreground)] tracking-tighter uppercase mb-6 leading-[0.8]">Position <br /> Secured.</h3>
            <p className="text-[var(--foreground)] opacity-50 font-bold mb-16 leading-relaxed max-w-sm mx-auto">
              Your route from <span className="text-[var(--foreground)] opacity-100">{bus.from_city}</span> to <span className="text-[var(--foreground)] opacity-100">{bus.to_city}</span> has been committed to the network.
            </p>

            <div className="flex flex-col gap-6">
              <button
                onClick={() => router.push("/bookings")}
                className="w-full bg-[#ec6a2a] text-white py-6 rounded-[32px] font-black uppercase tracking-[0.3em] text-[10px] hover:scale-[1.05] active:scale-95 transition-all shadow-2xl shadow-[#ec6a2a]/30 flex items-center justify-center gap-3"
              >
                Go to Archives <ArrowRight size={18} />
              </button>
              <button
                onClick={() => setShowBookingModal(false)}
                className="w-full text-[var(--foreground)] opacity-30 font-black py-4 rounded-full uppercase tracking-widest text-[10px] hover:opacity-100 transition-opacity"
              >
                Close Portal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
