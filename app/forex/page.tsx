"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";

interface ForexQuote {
  type: string;
  rate: number;
  status: string;
  statusColor: string;
  fees: number;
  deliveryTime: string;
}

interface ForexProvider {
  id: string;
  provider_name: string;
  provider_type: string;
  rating: number;
  delivery_methods: string[];
  quotes: ForexQuote[];
  logoText: string;
  logoColor: string;
}

const DUMMY_PROVIDERS: ForexProvider[] = [
  {
    id: "fx1",
    provider_name: "Thomas Cook",
    provider_type: "Agency",
    rating: 4.8,
    delivery_methods: ["Doorstep Delivery", "Branch Pickup"],
    logoText: "TC",
    logoColor: "from-blue-600 to-blue-800",
    quotes: [
      { type: "Forex Card", rate: 82.95, status: "Instant Issue", statusColor: "text-[#00a19c]", fees: 0, deliveryTime: "Within 4 hrs" },
      { type: "Currency Notes", rate: 83.80, status: "Available", statusColor: "text-[#00a19c]", fees: 150, deliveryTime: "By Tomorrow" },
    ]
  },
  {
    id: "fx2",
    provider_name: "HDFC Bank Forex",
    provider_type: "Bank",
    rating: 4.6,
    delivery_methods: ["Branch Pickup"],
    logoText: "HD",
    logoColor: "from-red-600 to-red-800",
    quotes: [
      { type: "Forex Card", rate: 83.25, status: "Branch Pickup", statusColor: "text-[#00a19c]", fees: 250, deliveryTime: "Next Day" },
      { type: "Currency Notes", rate: 84.10, status: "Subject to stock", statusColor: "text-[#d67215]", fees: 0, deliveryTime: "Next Day" },
    ]
  },
  {
    id: "fx3",
    provider_name: "BookMyForex",
    provider_type: "Agency",
    rating: 4.9,
    delivery_methods: ["Doorstep Delivery"],
    logoText: "BMF",
    logoColor: "from-orange-500 to-amber-500",
    quotes: [
      { type: "Forex Card", rate: 82.90, status: "Same Day Delivery", statusColor: "text-[#00a19c]", fees: 0, deliveryTime: "Within 2 hrs" },
      { type: "Currency Notes", rate: 83.75, status: "In Stock", statusColor: "text-[#00a19c]", fees: 0, deliveryTime: "Within 4 hrs" },
    ]
  },
];

const CURRENCIES = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "AED", name: "UAE Dirham" },
  { code: "AUD", name: "Australian Dollar" },
];

const LIVE_RATES = [
  { pair: "USD/INR", rate: 82.85, up: true },
  { pair: "EUR/INR", rate: 90.15, up: false },
  { pair: "GBP/INR", rate: 105.40, up: true },
  { pair: "AED/INR", rate: 22.55, up: false },
  { pair: "AUD/INR", rate: 54.30, up: true },
];

function QuoteCard({ provider, amount, targetCurrency }: { provider: ForexProvider, amount: number, targetCurrency: string }) {
  const [selectedProductIdx, setSelectedProductIdx] = useState(0);
  const activeQuote = provider.quotes[selectedProductIdx];
  const totalInr = (amount * activeQuote.rate) + activeQuote.fees;

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-slate-200 overflow-hidden mb-5 hover:border-blue-500 transition-colors duration-300">
      <div className="p-5">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 lg:gap-6">
          
          {/* Provider Identity */}
          <div className="flex items-center gap-4 w-full lg:w-1/3">
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br ${provider.logoColor} text-white flex items-center justify-center font-black text-lg md:text-xl shadow-inner shrink-0`}>
              {provider.logoText}
            </div>
            <div>
              <h3 className="font-bold text-lg md:text-xl text-slate-900 leading-tight">{provider.provider_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center bg-[#00a19c] text-white px-1.5 py-0.5 rounded text-[10px] md:text-[11px] font-bold">
                  {provider.rating} <span className="material-symbols-outlined text-[10px] md:text-[11px] ml-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <span className="text-[12px] font-bold text-slate-400">•</span>
                <span className="text-[12px] font-bold text-slate-500 line-clamp-1">{provider.provider_type}</span>
              </div>
            </div>
          </div>

          {/* Product Toggle (Forex Card vs Cash) */}
          <div className="w-full lg:w-1/3 border-y lg:border-y-0 lg:border-l lg:border-r border-slate-100 py-4 lg:py-0 px-0 lg:px-6">
            <p className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Select Product</p>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {provider.quotes.map((quote, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedProductIdx(idx)}
                  className={`flex justify-between items-center p-2 md:p-2.5 rounded-xl cursor-pointer transition-all border ${selectedProductIdx === idx ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className={`w-3.5 h-3.5 md:w-4 md:h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedProductIdx === idx ? 'border-blue-600' : 'border-slate-300'}`}>
                      {selectedProductIdx === idx && <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-600"></div>}
                    </div>
                    <span className={`font-bold text-[11px] md:text-sm truncate ${selectedProductIdx === idx ? 'text-blue-900' : 'text-slate-700'}`}>
                      {quote.type}
                    </span>
                  </div>
                  <span className="text-[10px] md:text-xs font-black text-slate-900 whitespace-nowrap">₹{quote.rate.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout Info */}
          <div className="w-full lg:w-1/3 text-left lg:text-right flex flex-col justify-between h-full">
            <div>
              <p className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Payable (INR)</p>
              <div className="flex items-end justify-start lg:justify-end gap-2">
                <span className="font-black text-2xl md:text-3xl text-slate-900 tracking-tight">
                  ₹{totalInr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
              
              <div className="flex justify-start lg:justify-end gap-2 mt-2">
                {activeQuote.fees === 0 ? (
                  <span className="text-[10px] md:text-[11px] font-bold bg-[#e3fff2] text-[#00a19c] px-2 py-1 rounded-md">Zero Markup Fees</span>
                ) : (
                  <span className="text-[10px] md:text-[11px] font-medium text-slate-500">Includes ₹{activeQuote.fees} charges</span>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-row-reverse lg:flex-row gap-3 justify-between lg:justify-end items-center">
              <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-6 md:px-8 py-3 md:py-3.5 rounded-xl transition-all shadow-md active:scale-95 text-xs md:text-sm uppercase tracking-wider">
                Book Rate
              </button>
              <div className="text-left lg:text-right">
                <p className="text-[11px] md:text-[12px] font-bold text-slate-800">{activeQuote.deliveryTime}</p>
                <p className={`text-[10px] md:text-[11px] font-bold ${activeQuote.statusColor}`}>{activeQuote.status}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Footer Tags */}
      <div className="bg-slate-50 border-t border-slate-100 p-3 px-6 flex items-center gap-4 text-xs font-medium text-slate-500">
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="material-symbols-outlined text-[16px] text-green-600">verified_user</span> RBI Authorized
        </div>
        <span className="text-slate-300">|</span>
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="material-symbols-outlined text-[16px] text-[#6a2da8]">local_shipping</span> 
          {provider.delivery_methods.join(" & ")}
        </div>
      </div>
    </div>
  )
}

function ForexContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [providers, setProviders] = useState<ForexProvider[]>([]);
  const [loading, setLoading] = useState(false);

  // Widget States
  const [targetCurrency, setTargetCurrency] = useState(searchParams.get("currency") || "USD");
  const [amountStr, setAmountStr] = useState(searchParams.get("amount") || "1000");
  const [city, setCity] = useState(searchParams.get("city") || "New Delhi");
  
  const amount = parseFloat(amountStr) || 1000;

  // Sidebar Filter State
  const [selectedProviderTypes, setSelectedProviderTypes] = useState<string[]>([]);
  const [selectedDeliveryMethods, setSelectedDeliveryMethods] = useState<string[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  
  const fetchForex = useCallback(async () => {
    setLoading(true);
    setTimeout(() => {
      let filtered = [...DUMMY_PROVIDERS];
      if (selectedProviderTypes.length > 0) {
        filtered = filtered.filter(p => selectedProviderTypes.includes(p.provider_type));
      }
      if (selectedDeliveryMethods.length > 0) {
        filtered = filtered.filter(p => selectedDeliveryMethods.some(method => p.delivery_methods.includes(method)));
      }
      setProviders(filtered);
      setLoading(false);
    }, 800);
  }, [selectedProviderTypes, selectedDeliveryMethods]);

  useEffect(() => {
    fetchForex();
  }, [fetchForex]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("currency", targetCurrency);
    params.set("amount", amountStr);
    params.set("city", city);
    router.push(`/forex?${params.toString()}`);
  };

  const toggleProviderType = (type: string) => {
    setSelectedProviderTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const toggleDeliveryMethod = (method: string) => {
    setSelectedDeliveryMethods(prev => prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]);
  };

  const Filters = () => (
    <div className="space-y-8">
      {/* Provider Category */}
      <div className="border-b border-slate-100 pb-6">
        <h4 className="font-bold text-[13px] text-slate-900 mb-4 h-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600 text-lg">account_balance</span>
          Service Provider
        </h4>
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 mt-4">
          {["Bank", "Agency"].map(type => (
            <label key={type} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${selectedProviderTypes.includes(type) ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-blue-200'}`} onClick={() => toggleProviderType(type)}>
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${selectedProviderTypes.includes(type) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                {selectedProviderTypes.includes(type) && <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>}
              </div>
              <span className="text-sm font-bold flex-1">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Delivery Methods */}
      <div>
        <h4 className="font-bold text-[13px] text-slate-900 mb-4 h-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-600 text-lg">local_shipping</span>
          Delivery Need
        </h4>
        <div className="grid grid-cols-1  gap-3">
          {["Doorstep Delivery", "Branch Pickup"].map(method => (
             <label key={method} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${selectedDeliveryMethods.includes(method) ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-blue-200'}`} onClick={() => toggleDeliveryMethod(method)}>
               <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${selectedDeliveryMethods.includes(method) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                 {selectedDeliveryMethods.includes(method) && <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>}
               </div>
               <span className="text-sm font-bold flex-1">{method}</span>
             </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f4f7f9] min-h-screen text-slate-800 font-body pb-20">
      <Navbar />

      {/* Simple Search Bar Row */}
      <div className="pt-[50px] px-6 max-w-[1400px] mx-auto relative z-20">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row items-center gap-4 bg-white p-2 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-200 mt-4 mb-6 w-full max-w-7xl mx-auto">
          {/* City Selection */}
          <div className="flex-1 bg-slate-50 border border-slate-200 hover:border-blue-600 rounded-xl flex items-center px-4 py-3 group cursor-text transition-colors w-full focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 shadow-inner">
            <span className="material-symbols-outlined text-blue-600 mr-3 font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
            <div className="flex flex-col w-full relative">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Your City</label>
              <input 
                type="text" 
                value={city} 
                onChange={(e) => setCity(e.target.value)} 
                placeholder="City"
                className="bg-transparent border-none outline-none text-sm font-bold placeholder-slate-400 p-0 w-full text-slate-900"
              />
            </div>
          </div>

          {/* Currency */}
          <div className="flex-1 bg-slate-50 border border-slate-200 hover:border-blue-600 rounded-xl flex items-center px-4 py-3 group cursor-text transition-colors w-full focus-within:border-blue-600 shadow-inner relative">
            <span className="material-symbols-outlined text-blue-600 mr-3 font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
            <div className="flex flex-col w-full relative">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Currency Needed</label>
              <select 
                value={targetCurrency} 
                onChange={(e) => setTargetCurrency(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-bold text-slate-900 cursor-pointer appearance-none p-0 w-full"
              >
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm">expand_more</span>
            </div>
          </div>

          {/* Amount */}
          <div className="flex-1 bg-slate-50 border border-slate-200 hover:border-blue-600 rounded-xl flex items-center px-4 py-3 group cursor-text transition-colors w-full focus-within:border-blue-600 shadow-inner relative">
            <span className="material-symbols-outlined text-blue-600 mr-3 font-bold">payments</span>
            <div className="flex flex-col w-full relative">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Amount</label>
              <input 
                type="number" 
                value={amountStr} 
                onChange={(e) => setAmountStr(e.target.value)} 
                placeholder="1000"
                className="bg-transparent border-none outline-none text-sm font-bold placeholder-slate-400 p-0 w-full text-slate-900"
              />
            </div>
          </div>

          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-4 md:py-5 rounded-xl transition-colors shrink-0 w-full lg:w-auto text-sm shadow-md">
            Update Rates
          </button>
        </form>
      </div>

      {/* Live Market Rates Ticker */}
      <div className="bg-white border-b border-slate-200 shadow-sm relative z-20">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap mr-6 bg-slate-100 px-3 py-1.5 rounded-lg">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            Live Market
          </div>
          <div className="flex items-center gap-8 whitespace-nowrap">
            {LIVE_RATES.map((rate, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="font-bold text-slate-700">{rate.pair}</span>
                <span className="font-bold text-slate-900 text-sm">₹{rate.rate.toFixed(2)}</span>
                <span className={`material-symbols-outlined text-[14px] font-bold ${rate.up ? 'text-green-500' : 'text-red-500'}`}>
                  {rate.up ? 'trending_up' : 'trending_down'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="pt-6 md:pt-10 max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Mobile Filter Button */}
        <div className="lg:hidden flex items-center justify-between mb-6 gap-4">
          <button 
            onClick={() => setIsFilterModalOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 py-3.5 rounded-xl font-bold text-slate-700 shadow-sm active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-blue-600">filter_list</span>
            Sort & Filter
            {(selectedProviderTypes.length + selectedDeliveryMethods.length) > 0 && (
              <span className="bg-blue-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                {selectedProviderTypes.length + selectedDeliveryMethods.length}
              </span>
            )}
          </button>
          
          <div className="flex-1 bg-white border border-slate-200 py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-slate-700 shadow-sm">
            <span className="material-symbols-outlined text-blue-600">swap_vert</span>
            Recommend
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar - Desktop only */}
          <aside className="hidden lg:block w-[280px] shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline font-bold text-slate-900 uppercase tracking-widest text-sm">Filter Quotes</h3>
              </div>
              <Filters />
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
              <h2 className="text-lg md:text-xl font-headline font-black text-slate-900">
                {loading ? "Searching exchange rates..." : `Showing ${providers.length} Quotes for ${amount} ${targetCurrency}`}
              </h2>
              {!loading && providers.length > 0 && (
                 <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-tighter">
                   <span className="material-symbols-outlined text-sm">schedule</span>
                   Rates valid for 19:42 min
                 </div>
              )}
            </div>

            {loading ? (
              <div className="flex min-h-[300px] flex-col gap-4 items-center justify-center bg-white rounded-2xl border border-slate-200 px-6 text-center">
                <div className="relative">
                   <Loader2 size={40} className="animate-spin text-blue-600" />
                   <div className="absolute inset-0 flex items-center justify-center">
                     <span className="material-symbols-outlined text-blue-200 text-xl">currency_exchange</span>
                   </div>
                </div>
                <div>
                  <p className="text-base font-black text-slate-900">Fetching Real-time Quotes</p>
                  <p className="text-sm font-medium text-slate-500 mt-1">Comparing Thomas Cook, HDFC, and more...</p>
                </div>
              </div>
            ) : providers.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-[2rem] border border-dashed border-slate-300">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">No matching providers</h3>
                <p className="mt-2 text-sm text-slate-500 font-medium max-w-xs mx-auto">Try adjusting your filters or currency amount to see available exchange options.</p>
                <button 
                  onClick={() => { setSelectedProviderTypes([]); setSelectedDeliveryMethods([]); }}
                  className="mt-6 text-blue-600 font-bold underline text-sm"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {providers.map((p) => (
                  <QuoteCard key={p.id} provider={p} amount={amount} targetCurrency={targetCurrency} />
                ))}
              </div>
            )}
            
            {!loading && providers.length > 0 && (
               <div className="flex items-start gap-4 bg-blue-50/50 border border-blue-100 p-5 rounded-2xl mt-8">
                 <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-blue-600 text-xl">info</span>
                 </div>
                 <p className="text-[13px] text-blue-900 font-medium leading-relaxed">
                   <span className="font-bold block mb-1">Exchange Rate Information</span>
                   Exchange rates are subject to slight market fluctuations. Rates displayed can be locked in for 30 minutes upon clicking "Book Rate". Required documents: PAN Card and Passport scan.
                 </p>
               </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-[1001] lg:hidden animate-in fade-in transition-all">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsFilterModalOpen(false)} />
          <div className="absolute bottom-0 left-0 w-full bg-white rounded-t-[2.5rem] shadow-2xl p-6 pb-12 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900">Filter Quotes</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Refine your search</p>
              </div>
              <button onClick={() => setIsFilterModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:scale-90 transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <Filters />
            
            <button 
              onClick={() => setIsFilterModalOpen(false)}
              className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl mt-8 shadow-xl shadow-blue-600/20 active:scale-95 transition-all text-sm uppercase tracking-widest"
            >
              Show {providers.length} Quotes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ForexPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen bg-[#f4f7f9] flex items-center justify-center">
         <Loader2 size={32} className="animate-spin text-blue-600" />
       </div>
    }>
      <ForexContent />
    </Suspense>
  );
}
