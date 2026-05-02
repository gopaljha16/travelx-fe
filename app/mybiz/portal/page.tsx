"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Building2,
  Wallet,
  Plane,
  Building,
  Train,
  Car,
  Search,
  BriefcaseBusiness,
  ShieldCheck,
  ChevronRight,
  MapPin,
  Calendar,
  Users
} from "lucide-react";

export default function MyBizPortalPage() {
  const [activeTab, setActiveTab] = useState("flights");
  const [from, setFrom] = useState("New Delhi (DEL)");
  const [to, setTo] = useState("Mumbai (BOM)");
  const [date, setDate] = useState("2026-10-15");
  const [travelers, setTravelers] = useState("1, Economy");

  const companyDetails = {
    name: "Acme Corp Ltd.",
    balance: "2,50,000",
    policy: "Economy Only, Hotels up to ₹8,000/night",
  };

  return (
    <div className="bg-background min-h-screen text-on-surface font-body">
      <Navbar />

      <main className="pb-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#005cab] via-[#008cff] to-[#005cab] px-6 pt-32 pb-24 sm:pt-40 sm:pb-32">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white border border-white/20 backdrop-blur-md">
                <BriefcaseBusiness size={14} />
                Corporate Booking Portal
              </span>
              <h1 className="mt-5 font-headline text-4xl sm:text-5xl font-black tracking-tight text-white">
                Book Travel for <span className="text-blue-200 italic">{companyDetails.name}</span>
              </h1>
              <div className="mt-4 flex flex-wrap gap-4 text-white/90 font-medium">
                <div className="flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-xl backdrop-blur-md">
                  <Wallet size={16} className="text-yellow-400" />
                  <span>Wallet Balance: <strong className="text-white">₹{companyDetails.balance}</strong></span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-xl backdrop-blur-md">
                  <ShieldCheck size={16} className="text-emerald-300" />
                  <span>Policy: <strong className="text-white">{companyDetails.policy}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search Widget */}
        <section className="max-w-5xl mx-auto px-6 -mt-16 relative z-20">
          <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/10 shadow-xl overflow-hidden">
            {/* Tabs */}
            <div className="flex overflow-x-auto bg-surface-container-low border-b border-outline-variant/10 scrollbar-hide">
              {[
                { id: "flights", icon: Plane, label: "Flights" },
                { id: "hotels", icon: Building, label: "Hotels" },
                { id: "trains", icon: Train, label: "Trains" },
                { id: "cabs", icon: Car, label: "Cabs" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-5 text-sm font-bold transition-all border-b-2 ${
                    activeTab === tab.id
                      ? "border-primary text-primary bg-primary/5"
                      : "border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest"
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* MyBiz Banner */}
            <div className="bg-emerald-50/50 border-b border-emerald-100 px-6 py-3 flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-600 text-lg">verified</span>
              <p className="text-sm font-medium text-emerald-800">
                <strong>MyBiz Fares Active:</strong> Enjoy free meals, free seat selection, and zero cancellation fees.
              </p>
            </div>

            {/* Search Form (Flights Example) */}
            <div className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-1 border border-outline-variant/30 rounded-2xl p-4 hover:border-primary/50 transition-colors cursor-pointer group">
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1 group-hover:text-primary transition-colors">From</p>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-primary" />
                    <input type="text" value={from} onChange={(e) => setFrom(e.target.value)} className="font-bold text-on-surface text-lg w-full bg-transparent outline-none" />
                  </div>
                </div>

                <div className="col-span-1 border border-outline-variant/30 rounded-2xl p-4 hover:border-primary/50 transition-colors cursor-pointer group">
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1 group-hover:text-primary transition-colors">To</p>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-tertiary" />
                    <input type="text" value={to} onChange={(e) => setTo(e.target.value)} className="font-bold text-on-surface text-lg w-full bg-transparent outline-none" />
                  </div>
                </div>

                <div className="col-span-1 border border-outline-variant/30 rounded-2xl p-4 hover:border-primary/50 transition-colors cursor-pointer group relative">
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1 group-hover:text-primary transition-colors">Departure</p>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-primary" />
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="font-bold text-on-surface text-lg w-full bg-transparent outline-none cursor-pointer" />
                  </div>
                </div>

                <div className="col-span-1 border border-outline-variant/30 rounded-2xl p-4 hover:border-primary/50 transition-colors cursor-pointer group">
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1 group-hover:text-primary transition-colors">Travelers & Class</p>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-primary" />
                    <select value={travelers} onChange={(e) => setTravelers(e.target.value)} className="font-bold text-on-surface text-lg w-full bg-transparent outline-none cursor-pointer appearance-none bg-none">
                      <option value="1, Economy">1, Economy</option>
                      <option value="2, Economy">2, Economy</option>
                      <option value="1, Business">1, Business</option>
                      <option value="2, Business">2, Business</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <Link
                  href={
                    activeTab === 'flights' ? '/flights' :
                    activeTab === 'hotels' ? '/hotels' :
                    activeTab === 'trains' ? '/trains' :
                    activeTab === 'cabs' ? '/cabs' : '/flights'
                  }
                  className="voyage-button px-10 py-4 rounded-full text-white font-bold text-lg inline-flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <Search size={20} />
                  Search Corporate Fares
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Bookings & Recommended Routes */}
        <section className="max-w-5xl mx-auto px-6 mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="font-headline text-2xl font-black text-on-surface mb-6">Recent Corporate Routes</h2>
            <div className="space-y-4">
              {[
                { from: "Bengaluru (BLR)", to: "New Delhi (DEL)", price: "₹6,200" },
                { from: "Mumbai (BOM)", to: "Bengaluru (BLR)", price: "₹4,500" },
              ].map((route, i) => (
                <Link key={i} href="/flights" className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-5 flex items-center justify-between hover:border-primary/30 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Plane size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-on-surface text-sm">{route.from} → {route.to}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">MyBiz Fares starting from</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-headline font-black text-primary text-lg">{route.price}</p>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">GST Invoice</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-headline text-2xl font-black text-on-surface mb-6">MyBiz Benefits</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: <Wallet size={20} className="text-orange-500" />, title: "Corporate Wallet", desc: "Pay directly from company balance." },
                { icon: <ShieldCheck size={20} className="text-emerald-500" />, title: "Policy Compliance", desc: "Auto-check against travel limits." },
                { icon: <BriefcaseBusiness size={20} className="text-primary" />, title: "GST Input Credit", desc: "Automated B2B invoices." },
                { icon: <Building2 size={20} className="text-tertiary" />, title: "Premium Upgrades", desc: "Free meals & extra baggage." },
              ].map((benefit, i) => (
                 <div key={i} className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/5">
                   <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center mb-3">
                     {benefit.icon}
                   </div>
                   <p className="font-bold text-on-surface text-sm">{benefit.title}</p>
                   <p className="text-xs text-on-surface-variant mt-1">{benefit.desc}</p>
                 </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
