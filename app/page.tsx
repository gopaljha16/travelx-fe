"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Search, Hotel, Bus, Star, Shield, Clock, MapPin, Calendar, Users, ArrowRight } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [tab, setTab] = useState<"hotels" | "buses">("buses");
  const [hotelCity, setHotelCity] = useState("");
  const [busFrom, setBusFrom] = useState("");
  const [busTo, setBusTo] = useState("");
  const [busDate, setBusDate] = useState("");

  const handleHotelSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/hotels?city=${encodeURIComponent(hotelCity)}`);
  };

  const handleBusSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (busFrom) params.set("from_city", busFrom);
    if (busTo) params.set("to_city", busTo);
    if (busDate) params.set("journey_date", busDate);
    router.push(`/buses?${params}`);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] selection:bg-[#ec6a2a] selection:text-white transition-colors duration-500">
      <Navbar />

      {/* Hero Section */}
      <section className="relative max-w-[1400px] mx-auto px-6 pt-20 pb-32 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <div className="flex-1 text-left animate-fade-in">
          <h1 className="text-6xl md:text-8xl font-black text-[var(--foreground)] leading-[0.95] mb-8 tracking-tighter uppercase">
            Book Buses <br /> & <span className="text-[#ec6a2a]">Hotels</span> <br /> Effortlessly.
          </h1>
          <p className="text-[var(--foreground)] opacity-50 text-lg md:text-xl font-medium max-w-lg mb-12 leading-relaxed">
            Experience the digital concierge for your next journey. Curated routes, verified stays, and seamless logistics in one editorial platform.
          </p>

          {/* Luxury Search Widget */}
          <div className="bg-[var(--card)]/40 backdrop-blur-3xl rounded-[48px] p-2 border-2 border-[var(--card-border)] shadow-2xl shadow-[#ec6a2a]/5 w-full max-w-xl animate-slide-up">
            <div className="bg-[var(--muted)] rounded-[40px] p-6 md:p-8">
              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => setTab("buses")}
                  className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${tab === "buses" ? "bg-[#ec6a2a] text-white shadow-xl shadow-[#ec6a2a]/20" : "text-[var(--foreground)] opacity-40 hover:opacity-100"}`}
                >
                  Bus
                </button>
                <button
                  onClick={() => setTab("hotels")}
                  className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${tab === "hotels" ? "bg-[#ec6a2a] text-white shadow-xl shadow-[#ec6a2a]/20" : "text-[var(--foreground)] opacity-40 hover:opacity-100"}`}
                >
                  Hotel
                </button>
              </div>

              {tab === "hotels" ? (
                <form onSubmit={handleHotelSearch} className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 bg-[var(--background)]/50 rounded-[28px] px-8 py-5 border-2 border-transparent focus-within:border-[#ec6a2a]/20 focus-within:bg-[var(--card)] transition-all group">
                    <Search size={20} className="text-[#ec6a2a]" />
                    <input
                      type="text"
                      placeholder="DESTINATION CITY"
                      value={hotelCity}
                      onChange={(e) => setHotelCity(e.target.value)}
                      className="bg-transparent border-none outline-none text-[var(--foreground)] font-black uppercase tracking-widest placeholder:text-[var(--foreground)] placeholder:opacity-20 w-full text-xs"
                    />
                  </div>
                  <button type="submit" className="bg-[#ec6a2a] text-white h-20 rounded-[28px] font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-[#ec6a2a]/20 group">
                    Explore Stays <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleBusSearch} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-4 bg-[var(--background)]/50 rounded-[28px] px-8 py-5 border-2 border-transparent focus-within:border-[#ec6a2a]/20 focus-within:bg-[var(--card)] transition-all group">
                      <MapPin size={20} className="text-[#ec6a2a]" />
                      <input
                        type="text"
                        placeholder="ORIGIN"
                        value={busFrom}
                        onChange={(e) => setBusFrom(e.target.value)}
                        className="bg-transparent border-none outline-none text-[var(--foreground)] font-black uppercase tracking-widest placeholder:text-[var(--foreground)] placeholder:opacity-20 w-full text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-4 bg-[var(--background)]/50 rounded-[28px] px-8 py-5 border-2 border-transparent focus-within:border-[#ec6a2a]/20 focus-within:bg-[var(--card)] transition-all group">
                      <MapPin size={20} className="text-[#ec6a2a]" />
                      <input
                        type="text"
                        placeholder="DESTINATION"
                        value={busTo}
                        onChange={(e) => setBusTo(e.target.value)}
                        className="bg-transparent border-none outline-none text-[var(--foreground)] font-black uppercase tracking-widest placeholder:text-[var(--foreground)] placeholder:opacity-20 w-full text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-[var(--background)]/50 rounded-[28px] px-8 py-5 border-2 border-transparent focus-within:border-[#ec6a2a]/20 focus-within:bg-[var(--card)] transition-all group">
                    <Calendar size={20} className="text-[#ec6a2a]" />
                    <input
                      type="date"
                      value={busDate}
                      onChange={(e) => setBusDate(e.target.value)}
                      className="bg-transparent border-none outline-none text-[var(--foreground)] font-black uppercase tracking-widest w-full text-xs"
                    />
                  </div>
                  <button type="submit" className="bg-[#ec6a2a] text-white h-20 rounded-[28px] font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-[#ec6a2a]/20 group">
                    Search Routes <Search size={18} className="group-hover:scale-110 transition-transform" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 relative animate-fade-in group w-full">
          <div className="relative rounded-[64px] overflow-hidden shadow-2xl border-4 border-[var(--card-border)] group-hover:border-[#ec6a2a]/20 transition-all duration-1000 aspect-[4/5] md:aspect-auto">
            <img src="/hero_bus.png" alt="Luxury Travel" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)]/40 to-transparent" />
          </div>
          {/* Floating Verification Badge */}
          <div className="absolute -bottom-6 -left-6 bg-[var(--card)] rounded-3xl p-6 shadow-2xl border-2 border-[var(--card-border)] flex items-center gap-5 animate-slide-up z-20">
            <div className="w-14 h-14 rounded-2xl bg-[#ec6a2a]/10 flex items-center justify-center text-[#ec6a2a]">
               <Shield size={28} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ec6a2a] mb-1">TravelX Secured</p>
              <p className="text-[11px] text-[var(--foreground)] opacity-40 font-bold leading-tight">Verified Partners <br /> Instant Ticket Control</p>
            </div>
          </div>
        </div>
      </section>

      {/* Elevated Standards Section */}
      <section className="max-w-7xl mx-auto px-6 py-40 border-t border-[var(--card-border)]">
        <div className="mb-24">
          <p className="text-[10px] font-black text-[#ec6a2a] uppercase tracking-[0.5em] mb-6">The Standard</p>
          <h2 className="text-5xl md:text-7xl font-black text-[var(--foreground)] tracking-tighter uppercase leading-[0.8]">Why TravelX.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: <Clock />, title: "Instant Access", desc: "Book your entire journey in under 60 seconds with our high-performance engine." },
            { icon: <Hotel />, title: "Verified Stays", desc: "Hand-picked editorial properties vetted for luxury amenities and service." },
            { icon: <Shield />, title: "Bank-grade Security", desc: "Multi-layered encryption ensures your transactions are completely ghosted." },
            { icon: <Users />, title: "Live Inventory", desc: "Direct real-time synchronization means what you see is what you get." },
          ].map((f) => (
            <div key={f.title} className="bg-[var(--card)] rounded-[48px] p-10 border-2 border-[var(--card-border)] flex flex-col items-start hover:border-[#ec6a2a]/30 hover:shadow-2xl hover:shadow-[#ec6a2a]/5 transition-all duration-500 group">
              <div className="w-16 h-16 rounded-2xl bg-[var(--muted)] flex items-center justify-center text-[#ec6a2a] mb-12 group-hover:scale-110 transition-transform duration-500">{f.icon}</div>
              <h3 className="text-xl font-black text-[var(--foreground)] mb-4 uppercase tracking-tight">{f.title}</h3>
              <p className="text-[var(--foreground)] opacity-40 text-sm font-bold leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Routes Section */}
      <section className="max-w-[1400px] mx-auto px-6 py-40 bg-[var(--card)] rounded-[80px] border-2 border-[var(--card-border)] my-20 overflow-hidden relative">
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-24 gap-8">
          <div>
            <p className="text-[10px] font-black text-[#ec6a2a] uppercase tracking-[0.5em] mb-6">Global Network</p>
            <h2 className="text-5xl md:text-7xl font-black text-[var(--foreground)] tracking-tighter uppercase leading-[0.8]">Trending Paths.</h2>
          </div>
          <button className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-[#ec6a2a] group">
            Explore All <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { img: "/route_jaipur.png", from: "Delhi", to: "Jaipur", price: "₹850" },
            { img: "/route_mumbai.png", from: "Mumbai", to: "Pune", price: "₹650" },
            { img: "/route_goa.png", from: "Bangalore", to: "Goa", price: "₹1,200" },
          ].map((r) => (
            <div key={r.to} className="group relative rounded-[56px] overflow-hidden border-2 border-[var(--card-border)] aspect-[4/5]">
              <img src={r.img} alt={r.to} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/20 to-transparent" />
              <div className="absolute bottom-12 left-12 right-12">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--foreground)] mb-4 opacity-40">{r.from} Destination</p>
                <h4 className="text-4xl font-black text-[var(--foreground)] mb-10 tracking-tighter uppercase leading-[0.8]">{r.from} <br /> &rarr; {r.to}</h4>
                <div className="flex items-center justify-between border-t border-[var(--foreground)]/10 pt-8">
                   <div className="text-[var(--foreground)] opacity-20 text-[9px] font-black uppercase tracking-widest">Entry Price</div>
                   <div className="text-3xl font-black text-[#ec6a2a] tracking-tighter">{r.price}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-[1400px] mx-auto px-6 py-40">
         <div className="relative bg-[#ec6a2a] rounded-[80px] p-16 md:p-32 overflow-hidden group">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-[120px] group-hover:scale-125 transition-transform duration-1000" />
            <div className="relative max-w-3xl">
               <h2 className="text-5xl md:text-8xl font-black text-white mb-12 tracking-tighter leading-[0.8] uppercase">
                 Start Your <br /> Next Story.
               </h2>
               <p className="text-white/80 font-bold text-xl mb-16 max-w-xl leading-relaxed">Join 50,000+ happy travelers who trust TravelX for editorial-grade journeys across the continent.</p>
               <button className="bg-white text-[#ec6a2a] px-16 py-6 rounded-full font-black uppercase tracking-[0.25em] text-xs hover:scale-105 active:scale-95 transition-all shadow-2xl">Download Concierge</button>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--muted)] pt-40 pb-16 rounded-t-[80px] border-t border-[var(--card-border)]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-20 mb-32">
          <div className="col-span-1 md:col-span-1">
             <h3 className="text-3xl font-black text-[var(--foreground)] mb-10 tracking-tighter uppercase">TravelX.</h3>
             <p className="text-[var(--foreground)] opacity-40 font-bold text-sm leading-relaxed mb-12">The digital concierge for high-end, editorial travel across luxury motifs, motels, and express routes.</p>
             <div className="flex gap-6">
                {['FB', 'TW', 'IG'].map(s => (
                  <div key={s} className="w-12 h-12 rounded-full border-2 border-[var(--card-border)] flex items-center justify-center text-[var(--foreground)] opacity-40 hover:opacity-100 hover:border-[#ec6a2a] hover:text-[#ec6a2a] transition-all cursor-pointer font-black text-[10px] tracking-widest">{s}</div>
                ))}
             </div>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#ec6a2a] mb-12">Structure</h4>
            <ul className="space-y-6">
              {['About', 'Partners', 'The Blog', 'Careers'].map(l => <li key={l} className="text-[var(--foreground)] opacity-50 font-black text-xs cursor-pointer hover:text-[#ec6a2a] transition-all uppercase tracking-widest">{l}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#ec6a2a] mb-12">Protocols</h4>
            <ul className="space-y-6">
              {['Privacy', 'Safety', 'Governance', 'Cookies'].map(l => <li key={l} className="text-[var(--foreground)] opacity-50 font-black text-xs cursor-pointer hover:text-[#ec6a2a] transition-all uppercase tracking-widest">{l}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#ec6a2a] mb-12">Concierge</h4>
            <ul className="space-y-6">
              {['Help Center', 'Safety Desk', 'Partner Flow'].map(l => <li key={l} className="text-[var(--foreground)] opacity-50 font-black text-xs cursor-pointer hover:text-[#ec6a2a] transition-all uppercase tracking-widest">{l}</li>)}
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t border-[var(--card-border)] pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--foreground)] opacity-20">
           <p>© 2026 TRAVELX. THE EDITORIAL CONCIERGE. ALL RIGHTS RESERVED.</p>
           <div className="flex gap-12">
              <span className="hover:opacity-100 cursor-pointer transition-opacity">Global / ENG</span>
              <span className="hover:opacity-100 cursor-pointer transition-opacity">Currency / INR</span>
           </div>
        </div>
      </footer>
    </div>
  );
}
