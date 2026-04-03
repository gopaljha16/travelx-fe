import Navbar from "@/components/Navbar";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-500">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        {/* Editorial Hero */}
        <div className="mb-32">
          <span className="text-[#ec6a2a] font-bold text-xs uppercase tracking-widest mb-6 block animate-fade-in">Our Legacy</span>
          <h1 className="text-7xl md:text-9xl font-black text-[var(--foreground)] tracking-tighter uppercase leading-[0.8] mb-12 animate-slide-up">
            Defining <br />
            Modern <br />
            Travel.
          </h1>
          <p className="max-w-xl text-lg text-[var(--foreground)] font-medium leading-relaxed opacity-70 animate-fade-in delay-200">
            TravelX is not just a booking platform. It's an editorial concierge for the modern traveler who seeks elevated standards, seamless transitions, and the pulse of the destination.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 mb-48">
          <div className="space-y-8">
            <h2 className="text-4xl font-black text-[var(--foreground)] uppercase tracking-tight">The Vision.</h2>
            <p className="text-[var(--foreground)] opacity-60 leading-relaxed">
              We believe that the journey is as significant as the destination. By aggregating India's most premium hotel stays and reliable bus routes into a single, high-performance interface, we've eliminated the friction of movement.
            </p>
          </div>
          <div className="space-y-8">
            <h2 className="text-4xl font-black text-[var(--foreground)] uppercase tracking-tight">The Standard.</h2>
            <p className="text-[var(--foreground)] opacity-60 leading-relaxed">
              Every vendor on TravelX undergoes a rigorous verification process. From pet-friendly stays to AC sleeper comfort, our standards are non-negotiable. We're here to ensure you travel with absolute confidence.
            </p>
          </div>
        </div>

        {/* Brand Values */}
        <div className="border-t border-[var(--card-border)] pt-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: "Founded", value: "2024" },
              { label: "Verified Hotels", value: "5000+" },
              { label: "Active Routes", value: "1200+" },
              { label: "Happy Travelers", value: "500k+" },
            ].map((stat, i) => (
              <div key={i} className="group cursor-default">
                <p className="text-[var(--foreground)] opacity-40 text-[10px] font-black uppercase tracking-widest mb-2">{stat.label}</p>
                <p className="text-4xl font-black text-[var(--foreground)] group-hover:text-[#ec6a2a] transition-colors">{stat.value}</p>
              </div>
            ))}
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
