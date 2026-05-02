"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Train, User, ChevronRight, ShieldCheck, Info, Trash2, CheckCircle2, AlertTriangle, MapPin, Building2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { DUMMY_TRAINS } from "@/app/trains/page";
import { Train as TrainType } from "@/components/TrainCard";
import { useAuth } from "@/context/AuthContext";
import { getEmployees, OrgEmployee, getMyOrganization } from "@/lib/api";

function TrainReviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const id = searchParams.get("id");
  const classType = searchParams.get("class") || "SL";

  const [train, setTrain] = useState<TrainType | null>(null);

  useEffect(() => {
    if (id) {
      const found = DUMMY_TRAINS.find(t => t.id === id);
      if (found) {
        setTrain(found);
        setBoardingStation(found.departure_station);
      }
    }
  }, [id]);

  const [irctcId, setIrctcId] = useState("");
  const [passengers, setPassengers] = useState([{ name: "", age: "", gender: "", berth: "" }]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [optAutoUpgradation, setOptAutoUpgradation] = useState(false);
  const [addInsurance, setAddInsurance] = useState(true);
  
  const [boardingStation, setBoardingStation] = useState("");
  const [validationError, setValidationError] = useState("");

  const [employees, setEmployees] = useState<OrgEmployee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [orgName, setOrgName] = useState("");

  useEffect(() => {
    if (user?.corporate_role === 'admin') {
      getEmployees().then(setEmployees);
      if (user.organization) {
        setOrgName(user.organization.name);
      } else {
        getMyOrganization().then(org => {
          if (org) setOrgName(org.name);
        });
      }
    }
  }, [user]);

  // Base mock prices for train
  const basePrice = train?.availability.find(a => a.type === classType)?.price || 450;
  const irctcConvenienceFee = 17.7;
  const agentFee = 20;
  const insurancePrice = addInsurance ? 0.45 * passengers.length : 0;
  const total = (basePrice * passengers.length) + irctcConvenienceFee + agentFee + insurancePrice;

  const addPassenger = () => {
    setPassengers([...passengers, { name: "", age: "", gender: "", berth: "" }]);
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
    setValidationError("");

    if (!irctcId) {
      setValidationError("Please enter a valid IRCTC User ID.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    for (const p of passengers) {
      if (!p.name || !p.age || !p.gender) {
        setValidationError("Please complete all passenger details.");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    if (!email || !phone) {
      setValidationError("Please provide valid contact details.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    router.push(`/bookings/payment?amount=${Math.round(total)}&type=train`);
  };

  if (!mounted || !train) return <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center font-bold text-slate-500">Loading train details...</div>;

  return (
    <div className="bg-[#f8f9fc] min-h-screen font-body text-slate-800">
      <Navbar />
      
      <div className="max-w-[1200px] mx-auto px-4 py-8 mt-16 md:mt-20">
        <h1 className="text-3xl font-headline font-black mb-8">Complete your Train Booking</h1>

        {validationError && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl font-bold border border-red-200 flex items-center gap-2">
            <Info size={20} /> {validationError}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Forms */}
          <div className="flex-1 space-y-6">
            
            {/* Trip Summary Card */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 bg-blue-50 text-primary rounded-xl flex items-center justify-center">
                  <Train size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{train.train_name} ({train.train_number})</h2>
                  <p className="text-sm text-slate-500 font-medium">{train.departure_station} → {train.arrival_station} • Class: <span className="font-bold text-slate-700">{classType}</span></p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                <div>
                  <p className="font-black text-xl">{train.departure_time}</p>
                  <p className="text-sm text-slate-500">{train.departure_date}</p>
                  <p className="text-xs font-bold text-slate-400 mt-1 truncate max-w-[100px]">{train.departure_station}</p>
                </div>
                <div className="flex-1 px-8 relative">
                   <div className="h-px bg-slate-200 w-full"></div>
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs font-bold text-slate-400">
                     {train.duration}
                   </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-xl">{train.arrival_time}</p>
                  <p className="text-sm text-slate-500">{train.arrival_date}</p>
                  <p className="text-xs font-bold text-slate-400 mt-1 truncate max-w-[100px]">{train.arrival_station}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <MapPin className="text-slate-400" size={18} />
                   <div>
                     <p className="text-xs font-bold text-slate-500 uppercase">Boarding Station</p>
                     <p className="text-sm font-bold text-slate-900">{boardingStation}</p>
                   </div>
                 </div>
                 <button onClick={() => alert("Boarding station change not supported in mock data.")} className="text-xs font-bold text-primary hover:underline">Change</button>
              </div>
            </div>

            <form id="booking-form" onSubmit={handleContinue} className="space-y-6">
              
              {/* MyBiz Admin Booking Section */}
              {user?.corporate_role === 'admin' && (
                <div className="bg-blue-50 rounded-[2rem] p-6 md:p-8 shadow-sm border border-blue-200">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-blue-900">
                      <Building2 className="text-blue-600" /> Booking on behalf of an Employee?
                    </h3>
                    <p className="text-sm text-blue-700 mt-1">Select an employee from <strong>{orgName || 'your organization'}</strong> to automatically pre-fill details.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-blue-800 mb-2">Select Employee</label>
                    <select 
                      value={selectedEmployee} 
                      onChange={(e) => {
                        setSelectedEmployee(e.target.value);
                        if (e.target.value) {
                           const emp = employees.find(emp => emp.user_id === e.target.value);
                           if (emp) {
                             const gender = (emp as any).gender || "Male";
                             setPassengers(cur => cur.map((p, i) => i === 0 ? { ...p, name: emp.name || emp.email, gender, age: "28" } : p));
                             setEmail(emp.email);
                             if ((emp as any).phone) setPhone((emp as any).phone);
                           }
                        }
                      }}
                      className="w-full bg-white border border-blue-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500 font-bold text-slate-800"
                    >
                      <option value="">-- I am booking for myself / New Passenger --</option>
                      {employees.map(emp => (
                        <option key={emp.user_id} value={emp.user_id}>{emp.name || emp.email} ({emp.employee_id || emp.user_id.slice(-6)})</option>
                      ))}
                    </select>
                  </div>

                  {selectedEmployee && (
                    <div className="mt-4 p-4 bg-white/60 rounded-2xl border border-white flex items-start gap-3 animate-in zoom-in-95">
                       <ShieldCheck size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                       <div>
                         <p className="text-xs font-black uppercase text-blue-900">Corporate Policy Active</p>
                         <p className="text-[11px] text-blue-700 mt-0.5">This booking will be settled via the company wallet with full GST benefits.</p>
                       </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* IRCTC User ID Verification */}
              <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">account_circle</span> IRCTC Account Details
                </h3>
                <p className="text-sm text-slate-500 mb-6">You need an IRCTC account to book trains.</p>
                
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">IRCTC User ID</label>
                  <input required type="text" value={irctcId} onChange={e => setIrctcId(e.target.value.toUpperCase())} className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold uppercase outline-none focus:border-primary" placeholder="Enter IRCTC ID" />
                </div>
              </div>

              {/* Traveler Details */}
              <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <User className="text-primary" /> Traveler Details
                </h3>

                <div className="space-y-6">
                  {passengers.map((p, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-4">
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-sm text-slate-500">Passenger {idx + 1}</p>
                        {passengers.length > 1 && (
                          <button type="button" onClick={() => removePassenger(idx)} className="text-red-500 hover:text-red-700 text-[11px] uppercase tracking-widest font-black flex items-center gap-1 transition-colors">
                            <Trash2 size={14} /> Remove
                          </button>
                        )}
                        {selectedEmployee && idx === 0 && (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-100">
                            <ShieldCheck size={12} /> Corporate Employee
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Full Name</label>
                          <input required type="text" value={p.name} onChange={e => updatePassenger(idx, "name", e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary" placeholder="As per Govt ID" />
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
                            <option value="Transgender">Transgender</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                           <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Berth Preference (Optional)</label>
                           <select value={p.berth} onChange={e => updatePassenger(idx, "berth", e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary">
                             <option value="">No Preference</option>
                             <option value="Lower">Lower</option>
                             <option value="Middle">Middle</option>
                             <option value="Upper">Upper</option>
                             <option value="Side Lower">Side Lower</option>
                             <option value="Side Upper">Side Upper</option>
                           </select>
                        </div>
                      </div>
                      
                      {/* Senior Citizen Notification */}
                      {parseInt(p.age) >= 60 && (
                         <div className="bg-blue-50/50 text-blue-700 text-xs font-medium p-2 rounded flex items-center gap-2">
                           <Info size={14} /> Senior Citizen concession is currently not allowed by IRCTC.
                         </div>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addPassenger} className="text-sm font-bold text-primary hover:underline">+ Add another passenger</button>
                </div>
                
                <label className="flex items-start gap-3 mt-8 cursor-pointer group">
                  <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${optAutoUpgradation ? 'bg-primary border-primary' : 'border-slate-300 group-hover:border-primary'}`}>
                    {optAutoUpgradation && <CheckCircle2 size={14} className="text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={optAutoUpgradation} onChange={() => setOptAutoUpgradation(!optAutoUpgradation)} />
                  <div>
                    <p className="font-bold text-sm text-slate-900">Consider for Auto Upgradation</p>
                    <p className="text-xs text-slate-500 mt-0.5">Opt-in to get automatically upgraded to a higher class if seats are available, at no extra cost.</p>
                  </div>
                </label>
              </div>

              {/* Insurance */}
              <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-blue-200 bg-blue-50/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl">Recommended</div>
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <ShieldCheck className="text-primary" /> Travel Insurance
                </h3>
                <p className="text-sm text-slate-600 mb-4">Secure your trip with comprehensive coverage for just ₹0.45 per passenger.</p>
                
                <div className="space-y-3">
                   <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${addInsurance ? 'border-primary bg-white shadow-sm' : 'border-slate-200 bg-white'}`}>
                      <input type="radio" checked={addInsurance} onChange={() => setAddInsurance(true)} className="w-5 h-5 accent-primary" />
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 text-sm">Yes, secure my trip.</p>
                        <p className="text-xs text-slate-500">I agree to the terms and conditions.</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">₹{(0.45 * passengers.length).toFixed(2)}</p>
                      </div>
                   </label>
                   
                   <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${!addInsurance ? 'border-primary bg-white shadow-sm' : 'border-slate-200 bg-white'}`}>
                      <input type="radio" checked={!addInsurance} onChange={() => setAddInsurance(false)} className="w-5 h-5 accent-primary" />
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 text-sm">No, I will take the risk.</p>
                        <p className="text-xs text-slate-500">I do not wish to purchase insurance.</p>
                      </div>
                   </label>
                </div>
              </div>

              {/* Contact Details */}
              <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold mb-6">Contact Details</h3>
                <p className="text-sm text-slate-500 mb-4">Your ticket and PNR status updates will be sent here.</p>
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
                    <span className="text-slate-500">Ticket Fare ({passengers.length} traveler{passengers.length > 1 ? 's' : ''})</span>
                    <span className="font-medium">₹{basePrice * passengers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 flex items-center gap-1">IRCTC Convenience Fee</span>
                    <span className="font-medium">₹{irctcConvenienceFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 flex items-center gap-1">Agent Service Charge</span>
                    <span className="font-medium">₹{agentFee}</span>
                  </div>
                  {addInsurance && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 flex items-center gap-1">Travel Insurance</span>
                      <span className="font-medium">₹{(0.45 * passengers.length).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mb-8">
                  <span className="font-black text-lg">Total Amount</span>
                  <span className="font-black text-2xl text-primary">₹{Math.round(total)}</span>
                </div>

                {/* Warning Alert */}
                <div className="bg-amber-50 text-amber-800 p-4 rounded-xl flex items-start gap-3 text-sm font-medium mb-6 border border-amber-200">
                  <AlertTriangle className="shrink-0 mt-0.5 text-amber-600" size={18} />
                  <div>
                    <span className="font-bold block mb-1">Remember Your IRCTC Password!</span>
                    You will be redirected to IRCTC to enter your password after payment.
                  </div>
                </div>

                <button form="booking-form" type="submit" className="w-full bg-primary text-white font-black py-4 rounded-xl shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-2 uppercase tracking-wider">
                  {selectedEmployee ? "Pay with Corporate Wallet" : "Continue to Pay"} <ChevronRight size={18} />
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TrainReviewPage() {
  return (
    <Suspense>
      <TrainReviewContent />
    </Suspense>
  );
}
