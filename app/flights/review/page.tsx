"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plane, User, ChevronRight, ShieldCheck, Info, Trash2, Luggage, Building2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { DUMMY_FLIGHTS } from "@/app/flights/page";
import { Flight } from "@/components/FlightCard";
import { useAuth } from "@/context/AuthContext";
import { getEmployees, OrgEmployee, getMyOrganization } from "@/lib/api";

function FlightReviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const id = searchParams.get("id");
  
  const [flight, setFlight] = useState<Flight | null>(null);

  useEffect(() => {
    if (id) {
      const found = DUMMY_FLIGHTS.find(f => f.id === id);
      if (found) setFlight(found);
    }
  }, [id]);

  const [passengers, setPassengers] = useState([{ firstName: "", lastName: "", gender: "", meal: "", seat: "", wheelchair: false }]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addInsurance, setAddInsurance] = useState(true);
  
  const [hasGST, setHasGST] = useState(false);
  const [gstName, setGstName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [gstEmail, setGstEmail] = useState("");

  const [showCancellation, setShowCancellation] = useState(false);
  const [validationError, setValidationError] = useState("");

  const [employees, setEmployees] = useState<OrgEmployee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [orgName, setOrgName] = useState("");

  useEffect(() => {
    if (user?.corporate_role === 'admin') {
      getEmployees().then(list => {
        setEmployees(list);
        if (typeof window !== 'undefined') {
          const savedId = sessionStorage.getItem('selectedEmployeeId');
          if (savedId) {
            const emp = list.find(e => e.user_id === savedId);
            if (emp) {
              setSelectedEmployee(savedId);
              const names = (emp.name || "").split(" ");
              const firstName = names[0] || "";
              const lastName = names.slice(1).join(" ") || "";
              setPassengers(cur => cur.map((p, i) => i === 0 ? { ...p, firstName, lastName, gender: (emp as any).gender || "" } : p));
              setEmail(emp.email);
              if ((emp as any).phone) setPhone((emp as any).phone);
            }
          }
        }
      });
      if (user.organization) {
        setOrgName(user.organization.name);
      } else {
        getMyOrganization().then(org => {
          if (org) setOrgName(org.name);
        });
      }
    }
  }, [user]);

  // Base prices
  const basePrice = flight ? flight.price : 0;
  const taxes = Math.round(basePrice * 0.18);
  const insurancePrice = addInsurance ? 249 * passengers.length : 0;
  const total = ((basePrice + taxes) * passengers.length) + insurancePrice;

  const addPassenger = () => {
    setPassengers([...passengers, { firstName: "", lastName: "", gender: "", meal: "", seat: "", wheelchair: false }]);
  };

  const updatePassenger = (index: number, field: string, value: string | boolean) => {
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

    for (const p of passengers) {
      if (!p.firstName || !p.lastName || !p.gender) {
        setValidationError("Please fill out all passenger names and genders.");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    if (!email || !phone) {
      setValidationError("Please provide valid contact details.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (hasGST && (!gstName || !gstNumber || !gstEmail)) {
      setValidationError("Please complete all GST details.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    router.push(`/bookings/payment?amount=${total}&type=flight`);
  };

  if (!flight) return <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center font-bold text-slate-500">Loading flight details...</div>;

  return (
    <div className="bg-[#f8f9fc] min-h-screen font-body text-slate-800">
      <Navbar />
      
      <div className="max-w-[1200px] mx-auto px-4 py-8 mt-16 md:mt-20">
        <h1 className="text-3xl font-headline font-black mb-8">Review your Flight Booking</h1>

        {validationError && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl font-bold border border-red-200 flex items-center gap-2">
            <Info size={20} /> {validationError}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Forms */}
          <div className="flex-1 space-y-6">
            
            {/* Trip Summary Card */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200 relative">
              <button onClick={() => setShowCancellation(!showCancellation)} className="absolute top-6 right-6 text-xs font-bold text-blue-600 hover:underline">
                Cancellation Rules
              </button>
              
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Plane size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{flight.airline} ({flight.flight_number})</h2>
                  <p className="text-sm text-slate-500 font-medium">Economy • Non-stop</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                <div>
                  <p className="font-black text-xl">{flight.departure_time}</p>
                  <p className="text-sm text-slate-500">28 APR</p>
                  <p className="text-xs font-bold text-slate-400 mt-1">Origin</p>
                </div>
                <div className="flex-1 px-8 relative">
                   <div className="h-px bg-slate-200 w-full"></div>
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs font-bold text-slate-400">
                     {flight.duration}
                   </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-xl">{flight.arrival_time}</p>
                  <p className="text-sm text-slate-500">28 APR</p>
                  <p className="text-xs font-bold text-slate-400 mt-1">Destination</p>
                </div>
              </div>
              
              <div className="flex gap-6">
                 <div className="flex items-center gap-2 text-sm text-slate-600">
                   <Luggage size={16} className="text-slate-400" />
                   <span className="font-medium">15 Kgs (1 piece) Check-in</span>
                 </div>
                 <div className="flex items-center gap-2 text-sm text-slate-600">
                   <Luggage size={16} className="text-slate-400" />
                   <span className="font-medium">7 Kgs Cabin Baggage</span>
                 </div>
              </div>

              {showCancellation && (
                <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm space-y-2 animate-in fade-in slide-in-from-top-2">
                   <p className="font-bold text-slate-800">Cancellation Rules:</p>
                   <p className="text-slate-600 flex justify-between"><span>0-2 hours before departure:</span> <span className="font-bold">Non-refundable</span></p>
                   <p className="text-slate-600 flex justify-between"><span>2-24 hours before departure:</span> <span className="font-bold">₹3,500 fee</span></p>
                   <p className="text-slate-600 flex justify-between"><span>&gt; 24 hours before departure:</span> <span className="font-bold">₹3,000 fee</span></p>
                </div>
              )}
            </div>

            <form id="booking-form" onSubmit={handleContinue} className="space-y-6">
              


              {/* Traveler Details */}
              <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200">
                <div className="mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                    <User className="text-blue-600" /> Traveler Details
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Names should exactly match your government-issued ID.</p>
                </div>

                <div className="space-y-6">
                  {passengers.map((p, i) => (
                    <div key={i} className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold">Passenger {i + 1}</h3>
                          {selectedEmployee && i === 0 && (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-100 animate-in zoom-in">
                              <ShieldCheck size={12} /> Corporate Employee
                            </span>
                          )}
                        </div>
                        {passengers.length > 1 && (
                          <button type="button" onClick={() => removePassenger(i)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>

                      {selectedEmployee && i === 0 && (
                        <div className="mb-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex items-start gap-3 animate-in fade-in slide-in-from-left-2">
                           <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                           <div>
                             <p className="text-sm font-bold text-blue-900">Corporate Travel Policy Active</p>
                             <p className="text-xs text-blue-700 mt-1">This booking for <strong>{employees.find(e => e.user_id === selectedEmployee)?.name}</strong> will be billed to the company wallet with full GST benefits.</p>
                           </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">First & Middle Name</label>
                          <input required type="text" value={p.firstName} onChange={e => updatePassenger(i, "firstName", e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500" placeholder="e.g. John" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Last Name</label>
                          <input required type="text" value={p.lastName} onChange={e => updatePassenger(i, "lastName", e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-500" placeholder="e.g. Doe" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Gender</label>
                          <select required value={p.gender} onChange={e => updatePassenger(i, "gender", e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500">
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>
                        <div className="md:col-span-3 pt-3 border-t border-slate-100 mt-2">
                           <p className="text-xs font-bold text-slate-500 uppercase mb-3">Add-ons & Preferences (Optional)</p>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div>
                               <select value={p.meal} onChange={e => updatePassenger(i, "meal", e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 text-slate-600">
                                 <option value="">No Meal Selected</option>
                                 <option value="Veg">Vegetarian Meal</option>
                                 <option value="NonVeg">Non-Vegetarian Meal</option>
                               </select>
                             </div>
                             <div>
                               <select value={p.seat} onChange={e => updatePassenger(i, "seat", e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 text-slate-600">
                                 <option value="">No Seat Preference</option>
                                 <option value="Window">Window Seat</option>
                                 <option value="Aisle">Aisle Seat</option>
                                 <option value="Middle">Middle Seat</option>
                               </select>
                             </div>
                             <div className="sm:col-span-2">
                               <label className="flex items-center gap-2 cursor-pointer">
                                 <input type="checkbox" checked={p.wheelchair} onChange={e => updatePassenger(i, "wheelchair", e.target.checked)} className="w-4 h-4 accent-blue-600" />
                                 <span className="text-sm font-medium text-slate-600">Request Wheelchair Assistance</span>
                               </label>
                             </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addPassenger} className="text-sm font-bold text-blue-600 hover:underline">+ Add another traveler</button>
                </div>
              </div>

              {/* Insurance */}
              <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-blue-200 bg-blue-50/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl">Recommended</div>
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <ShieldCheck className="text-blue-600" /> Travel Insurance
                </h3>
                <p className="text-sm text-slate-600 mb-4">Secure your trip with comprehensive coverage for just ₹249 per passenger.</p>
                
                <div className="space-y-3">
                   <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${addInsurance ? 'border-blue-400 bg-white shadow-sm' : 'border-slate-200 bg-white'}`}>
                      <input type="radio" checked={addInsurance} onChange={() => setAddInsurance(true)} className="w-5 h-5 accent-blue-600" />
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 text-sm">Yes, secure my trip.</p>
                        <p className="text-xs text-slate-500">I agree to the terms and conditions.</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">₹{249 * passengers.length}</p>
                      </div>
                   </label>
                   
                   <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${!addInsurance ? 'border-blue-400 bg-white shadow-sm' : 'border-slate-200 bg-white'}`}>
                      <input type="radio" checked={!addInsurance} onChange={() => setAddInsurance(false)} className="w-5 h-5 accent-blue-600" />
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
                <p className="text-sm text-slate-500 mb-4">Your e-ticket will be sent to these details.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email ID</label>
                     <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-600" placeholder="name@example.com" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Mobile Number</label>
                     <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-600" placeholder="+91" />
                   </div>
                </div>
              </div>

              {/* GST Details */}
              <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <Building2 className="text-slate-400" />
                     <div>
                       <h3 className="font-bold text-slate-900">Add GST Details</h3>
                       <p className="text-xs text-slate-500">Optional • For business travel input tax credit</p>
                     </div>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                     <input type="checkbox" className="sr-only peer" checked={hasGST} onChange={e => setHasGST(e.target.checked)} />
                     <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                   </label>
                 </div>
                 
                 {hasGST && (
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                     <div>
                       <label className="block text-xs font-bold uppercase text-slate-500 mb-1">GST Number</label>
                       <input type="text" value={gstNumber} onChange={e => setGstNumber(e.target.value.toUpperCase())} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-600" placeholder="22AAAAA0000A1Z5" />
                     </div>
                     <div>
                       <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Company Name</label>
                       <input type="text" value={gstName} onChange={e => setGstName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-600" placeholder="Company Ltd." />
                     </div>
                     <div>
                       <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Company Email</label>
                       <input type="email" value={gstEmail} onChange={e => setGstEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-600" placeholder="finance@company.com" />
                     </div>
                   </div>
                 )}
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
                  {addInsurance && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 flex items-center gap-1">Travel Insurance</span>
                      <span className="font-medium">₹{insurancePrice}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mb-8">
                  <span className="font-black text-lg">Total Amount</span>
                  <span className="font-black text-2xl text-blue-600">₹{total}</span>
                </div>

                <div className="bg-green-50 text-green-700 p-3 rounded-xl flex items-center gap-2 text-sm font-medium mb-6">
                  <ShieldCheck size={18} />
                  Safe & Secure Payments
                </div>

                <button
                  type="submit"
                  form="booking-form"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all text-lg uppercase tracking-wider mt-6"
                >
                  {selectedEmployee ? "Pay with Corporate Wallet" : "Proceed to Payment"}
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FlightReviewPage() {
  return (
    <Suspense>
      <FlightReviewContent />
    </Suspense>
  );
}
