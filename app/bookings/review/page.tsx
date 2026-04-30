"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plane, Train, User, ChevronRight, ShieldCheck, Info, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";

function ReviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const type = searchParams.get("type");
  const id = searchParams.get("id");
  const classType = searchParams.get("class") || "";

  const [passengers, setPassengers] = useState([{ name: "", age: "", gender: "" }]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Base mock prices
  const basePrice = type === "flight" ? 4500 : 1200;
  const taxes = Math.floor(basePrice * 0.18);
  const total = (basePrice + taxes) * passengers.length;

  const addPassenger = () => {
    setPassengers([...passengers, { name: "", age: "", gender: "" }]);
  };

  const updatePassenger = (index: number, field: string, value: string) => {
    const newPass = [...passengers];
    newPass[index] = { ...newPass[index], [field]: value };
    setPassengers(newPass);
  };

  const removePassenger = (index: number) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index));
    }
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/bookings/payment?amount=${total}&type=${type}`);
  };

  return (
    <div className="bg-[#f8f9fc] min-h-screen font-body text-slate-800">
      <Navbar />
      
      <div className="max-w-[1200px] mx-auto px-4 py-8 mt-16 md:mt-20">
        <h1 className="text-3xl font-headline font-black mb-8">Review your booking</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Forms */}
          <div className="flex-1 space-y-6">
            
            {/* Trip Summary Card */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  {type === "flight" ? <Plane size={24} /> : <Train size={24} />}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{type === "flight" ? "Flight to Destination" : "Train Journey"}</h2>
                  <p className="text-sm text-slate-500 font-medium">Mock Data ID: {id} {classType && `• Class: ${classType}`}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-xl">10:00 AM</p>
                  <p className="text-sm text-slate-500">Origin City</p>
                </div>
                <div className="flex-1 px-8 relative">
                   <div className="h-px bg-slate-200 w-full"></div>
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs font-bold text-slate-400">
                     {type === "flight" ? "2h 30m" : "8h 15m"}
                   </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-xl">12:30 PM</p>
                  <p className="text-sm text-slate-500">Dest City</p>
                </div>
              </div>
            </div>

            <form id="booking-form" onSubmit={handleContinue} className="space-y-6">
              {/* Traveler Details */}
              <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <User className="text-primary" /> Traveler Details
                </h3>

                <div className="space-y-6">
                  {passengers.map((p, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-4">
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-sm text-slate-500">Traveler {idx + 1}</p>
                        {passengers.length > 1 && (
                          <button type="button" onClick={() => removePassenger(idx)} className="text-red-500 hover:text-red-700 text-[11px] uppercase tracking-widest font-black flex items-center gap-1 transition-colors">
                            <Trash2 size={14} /> Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Full Name</label>
                          <input required type="text" value={p.name} onChange={e => updatePassenger(idx, "name", e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary" placeholder="First & Last Name" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Age</label>
                          <input required type="number" value={p.age} onChange={e => updatePassenger(idx, "age", e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary" placeholder="Years" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Gender</label>
                          <select required value={p.gender} onChange={e => updatePassenger(idx, "gender", e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary">
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addPassenger} className="text-sm font-bold text-primary hover:underline">+ Add another traveler</button>
                </div>
              </div>

              {/* Contact Details */}
              <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold mb-6">Contact Details</h3>
                <p className="text-sm text-slate-500 mb-4">Your ticket and updates will be sent here.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email ID</label>
                     <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary" placeholder="name@example.com" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Mobile Number</label>
                     <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary" placeholder="+91" />
                   </div>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column - Fare Summary */}
          <div className="w-full lg:w-[350px]">
             <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200 sticky top-24">
                <h3 className="text-xl font-bold mb-6">Fare Summary</h3>
                
                <div className="space-y-4 text-sm mb-6 pb-6 border-b border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Base Fare ({passengers.length} traveler{passengers.length > 1 ? 's' : ''})</span>
                    <span className="font-medium">₹{basePrice * passengers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 flex items-center gap-1">Taxes & Surcharges <Info size={14}/></span>
                    <span className="font-medium">₹{taxes * passengers.length}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-8">
                  <span className="font-black text-lg">Total Amount</span>
                  <span className="font-black text-2xl text-primary">₹{total}</span>
                </div>

                <div className="bg-green-50 text-green-700 p-3 rounded-xl flex items-center gap-2 text-sm font-medium mb-6">
                  <ShieldCheck size={18} />
                  Safe & Secure Payments
                </div>

                <button form="booking-form" type="submit" className="w-full bg-primary text-white font-black py-4 rounded-xl shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-2">
                  Continue to Pay <ChevronRight size={18} />
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense>
      <ReviewContent />
    </Suspense>
  );
}
