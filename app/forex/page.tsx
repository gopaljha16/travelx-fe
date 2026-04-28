"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
          
          {/* Provider Identity */}
          <div className="flex items-center gap-4 w-full lg:w-1/3">
            <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${provider.logoColor} text-white flex items-center justify-center font-black text-xl shadow-inner shrink-0`}>
              {provider.logoText}
            </div>
            <div>
              <h3 className="font-bold text-xl text-slate-900 leading-tight">{provider.provider_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center bg-[#00a19c] text-white px-1.5 py-0.5 rounded text-[11px] font-bold">
                  {provider.rating} <span className="material-symbols-outlined text-[11px] ml-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <span className="text-[12px] font-bold text-slate-400">•</span>
                <span className="text-[12px] font-bold text-slate-500">{provider.provider_type}</span>
              </div>
            </div>
          </div>

          {/* Product Toggle (Forex Card vs Cash) */}
          <div className="w-full lg:w-1/3 border-l border-r border-slate-100 px-0 lg:px-6">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Select Product</p>
            <div className="space-y-2">
              {provider.quotes.map((quote, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedProductIdx(idx)}
                  className={`flex justify-between items-center p-2.5 rounded-xl cursor-pointer transition-all border ${selectedProductIdx === idx ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedProductIdx === idx ? 'border-blue-600' : 'border-slate-300'}`}>
                      {selectedProductIdx === idx && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                    </div>
                    <span className={`font-bold text-sm ${selectedProductIdx === idx ? 'text-blue-900' : 'text-slate-700'}`}>
                      {quote.type}
                    </span>
                  </div>
                  <span className="text-xs font-black text-slate-900">₹{quote.rate.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout Info */}
          <div className="w-full lg:w-1/3 text-right flex flex-col justify-between h-full">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Payable (INR)</p>
              <div className="flex items-end justify-end gap-2">
                <span className="font-black text-3xl text-slate-900 tracking-tight">
                  ₹{totalInr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
              
              <div className="flex justify-end gap-2 mt-2">
                {activeQuote.fees === 0 ? (
                  <span className="text-[11px] font-bold bg-[#e3fff2] text-[#00a19c] px-2 py-1 rounded-md">Zero Markup Fees</span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-500">Includes ₹{activeQuote.fees} charges</span>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end items-center">
              <div className="text-right mr-2">
                <p className="text-[12px] font-bold text-slate-800">{activeQuote.deliveryTime}</p>
                <p className={`text-[11px] font-bold ${activeQuote.statusColor}`}>{activeQuote.status}</p>
              </div>
              <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-md active:scale-95 text-sm uppercase tracking-wider">
                Book Rate
              </button>
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

export default function ForexPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [providers, setProviders] = useState<ForexProvider[]>([]);
  const [loading, setLoading] = useState(false);

  // Widget States
  const [activeTab, setActiveTab] = useState("BUY");
  const [targetCurrency, setTargetCurrency] = useState(searchParams.get("currency") || "USD");
  const [amountStr, setAmountStr] = useState(searchParams.get("amount") || "1000");
  const [city, setCity] = useState(searchParams.get("city") || "New Delhi");
  
  const amount = parseFloat(amountStr) || 1000;

  // Sidebar Filter State
  const [selectedProviderTypes, setSelectedProviderTypes] = useState<string[]>([]);
  const [selectedDeliveryMethods, setSelectedDeliveryMethods] = useState<string[]>([]);
  
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

  return (
    <div className="bg-[#f4f7f9] min-h-screen text-slate-800 font-body pb-20">
      <Navbar />

      {/* Hero Section (Fintech Style) */}
      <div className="relative pt-[70px] pb-32 lg:pb-40 bg-[url('https://images.unsplash.com/photo-1559815074-ce7b7673fbec?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-[#003B95]/90 backdrop-blur-sm"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-headline font-black text-white text-center tracking-tight mb-4 shadow-sm">
            Online Foreign Exchange, <span className="text-blue-300">Simplified.</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-medium text-center mb-10 max-w-2xl">
            Compare live rates from RBI authorized banks & money changers. Get Forex cards or currency notes delivered to your doorstep.
          </p>

          {/* Calculator Widget */}
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-2 md:p-3 pb-8 md:pb-10">
            {/* Tabs */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 border border-slate-200">
              <button 
                onClick={() => setActiveTab("BUY")}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${activeTab === 'BUY' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                Buy Forex
              </button>
              <button 
                onClick={() => setActiveTab("SELL")}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${activeTab === 'SELL' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                Sell Forex
              </button>
              <button 
                onClick={() => setActiveTab("SEND")}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${activeTab === 'SEND' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                Send Money Abroad
              </button>
            </div>

            {/* Main Form Area inside Widget */}
            <form onSubmit={handleSearch} className="px-4 md:px-8 space-y-6">
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                
                {/* City Selection */}
                <div className="w-full md:w-1/3 relative border-b-2 border-slate-200 focus-within:border-blue-600 transition-colors pb-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-1">Your City</label>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400">location_on</span>
                    <input 
                      type="text" 
                      value={city} 
                      onChange={(e) => setCity(e.target.value)} 
                      className="w-full text-lg font-bold text-slate-900 bg-transparent border-none outline-none p-0" 
                    />
                  </div>
                </div>

                {/* You Need */}
                <div className="w-full md:w-2/3 flex items-center bg-slate-50 rounded-2xl border border-slate-200 p-2 focus-within:border-blue-600 transition-colors">
                  <div className="flex-1 px-4 border-r border-slate-200">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-1">Currency Needed</label>
                    <div className="flex items-center gap-2">
                      <select 
                        value={targetCurrency} 
                        onChange={(e) => setTargetCurrency(e.target.value)}
                        className="w-full text-2xl md:text-3xl font-black text-slate-900 bg-transparent border-none outline-none p-0 cursor-pointer appearance-none"
                      >
                        {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
                      </select>
                      <span className="material-symbols-outlined text-blue-600 font-bold">expand_more</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 px-4 relative">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-1">Amount</label>
                    <input 
                      type="number" 
                      value={amountStr} 
                      onChange={(e) => setAmountStr(e.target.value)} 
                      className="w-full text-2xl md:text-3xl font-black text-slate-900 bg-transparent border-none outline-none p-0" 
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-14 py-4 rounded-2xl text-lg shadow-[0_8px_20px_rgba(37,99,235,0.3)] transition-all active:scale-95 group flex items-center gap-3 w-full md:w-auto justify-center">
                  Compare Rates <span className="material-symbols-outlined font-bold group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
            </form>
          </div>
        </div>
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

      <main className="pt-10 max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <aside className="w-full lg:w-[280px] shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline font-bold text-slate-900 uppercase tracking-widest text-sm">Filter Quotes</h3>
              </div>

              {/* Provider Category */}
              <div className="mb-6 border-b border-slate-100 pb-6">
                <h4 className="font-bold text-[13px] text-slate-900 mb-4">Service Provider</h4>
                <div className="space-y-3 mt-4">
                  {["Bank", "Agency"].map(type => (
                    <label key={type} className="flex flex-row items-center gap-3 cursor-pointer group" onClick={() => toggleProviderType(type)}>
                      <div className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-colors ${selectedProviderTypes.includes(type) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 group-hover:border-blue-600 bg-slate-50'}`}>
                        {selectedProviderTypes.includes(type) && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
                      </div>
                      <span className="text-sm font-bold text-slate-600 flex-1">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Delivery Methods */}
              <div>
                <h4 className="font-bold text-[13px] text-slate-900 mb-4">Delivery Need</h4>
                <div className="space-y-3">
                  {["Doorstep Delivery", "Branch Pickup"].map(method => (
                     <label key={method} className="flex flex-row items-center gap-3 cursor-pointer group" onClick={() => toggleDeliveryMethod(method)}>
                       <div className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-colors ${selectedDeliveryMethods.includes(method) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 group-hover:border-blue-600 bg-slate-50'}`}>
                         {selectedDeliveryMethods.includes(method) && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
                       </div>
                       <span className="text-sm font-bold text-slate-600 flex-1">{method}</span>
                     </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            <h2 className="text-xl font-headline font-black text-slate-900 mb-6">
              {loading ? "Searching for the best exchange rates..." : `Showing ${providers.length} Quotes for ${amount} ${targetCurrency}`}
            </h2>

            {loading ? (
              <div className="flex min-h-[300px] flex-col gap-4 items-center justify-center bg-white rounded-2xl border border-slate-200">
                <Loader2 size={32} className="animate-spin text-blue-600" />
                <p className="text-sm font-bold text-slate-500 animate-pulse">Contacting Banking Partners...</p>
              </div>
            ) : providers.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">search_off</span>
                <h3 className="text-xl font-bold text-slate-900">No matching providers found</h3>
                <p className="mt-2 text-sm text-slate-500 font-medium">Try removing some filters to see available quotes.</p>
              </div>
            ) : (
              <div>
                {providers.map((p) => (
                  <QuoteCard key={p.id} provider={p} amount={amount} targetCurrency={targetCurrency} />
                ))}
              </div>
            )}
            
            {!loading && providers.length > 0 && (
               <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 p-4 rounded-xl mt-6">
                 <span className="material-symbols-outlined text-blue-600 text-xl">info</span>
                 <p className="text-[13px] text-blue-900 font-medium leading-relaxed">
                   Exchange rates are subject to change. Rates displayed lock in for 30 minutes upon clicking "Book Rate". Final documentation such as PAN Card and Passport are required at checkout.
                 </p>
               </div>
            )}
          </div>
        </div>
      </main>

    </div>
  );
}
