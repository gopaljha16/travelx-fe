import Navbar from "@/components/Navbar";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-500">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
          {/* Contact Header */}
          <div className="flex flex-col justify-between py-12">
            <div>
              <span className="text-[#ec6a2a] font-bold text-xs uppercase tracking-widest mb-6 block animate-fade-in">Connect with us</span>
              <h1 className="text-[120px] font-black text-[var(--foreground)] tracking-tighter uppercase leading-[0.8] mb-12 animate-slide-up">
                Get <br />
                In <br />
                Touch.
              </h1>
            </div>
            
            <div className="space-y-12 animate-fade-in delay-200">
              <div className="group">
                <p className="text-[var(--foreground)] opacity-40 text-[10px] font-black uppercase tracking-widest mb-2">The Office</p>
                <p className="text-xl font-bold text-[var(--foreground)] group-hover:text-[#ec6a2a] transition-colors leading-relaxed">
                  24B Heritage Plaza, BKC <br />
                  Mumbai, India (400051)
                </p>
              </div>
              <div className="group">
                <p className="text-[var(--foreground)] opacity-40 text-[10px] font-black uppercase tracking-widest mb-2">Inquiries</p>
                <p className="text-xl font-bold text-[var(--foreground)] group-hover:text-[#ec6a2a] transition-colors">
                  support@travelx.com <br />
                  +91 (022) 2344 5667
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-[var(--card)] p-12 rounded-[56px] border border-[var(--card-border)] mb-12 shadow-2xl shadow-black/5 animate-slide-up">
            <form className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] opacity-40">Your Name</label>
                <input 
                  type="text" 
                  placeholder="John Doe"
                  className="w-full bg-transparent border-b-2 border-[var(--card-border)] focus:border-[#ec6a2a] outline-none text-2xl font-bold text-[var(--foreground)] py-4 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] opacity-40">Your Email</label>
                <input 
                  type="email" 
                  placeholder="john@example.com"
                  className="w-full bg-transparent border-b-2 border-[var(--card-border)] focus:border-[#ec6a2a] outline-none text-2xl font-bold text-[var(--foreground)] py-4 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] opacity-40">Message</label>
                <textarea 
                  rows={4}
                  placeholder="Tell us about your next journey..."
                  className="w-full bg-transparent border-b-2 border-[var(--card-border)] focus:border-[#ec6a2a] outline-none text-xl font-bold text-[var(--foreground)] py-4 transition-all resize-none"
                />
              </div>
              
              <button 
                type="submit"
                className="w-full bg-[#ec6a2a] text-white py-6 rounded-full font-black uppercase text-sm tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#ec6a2a]/20"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="border-t border-[var(--card-border)] py-12 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] opacity-30">
          <p>© 2026 TRAVELX. BEYOND THE DESTINATION.</p>
          <div className="flex gap-8">
            <span>Instagram</span>
            <span>LinkedIn</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
