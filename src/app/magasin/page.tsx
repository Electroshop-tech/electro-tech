import Link from "next/link";

const hours = [
  { day: "Lundi - Vendredi", time: "09h00 - 19h00", open: true },
  { day: "Samedi", time: "09h00 - 18h00", open: true },
  { day: "Dimanche", time: "10h00 - 15h00", open: true },
];

const services = [
  { icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", label: "Demonstration produit" },
  { icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", label: "Conseil personnalise" },
  { icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z", label: "Retrait en boutique" },
  { icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z", label: "SAV & reparations" },
];

export default function MagasinPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* HERO */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 pt-10 sm:pt-20 pb-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-end">
            <div className="pb-10 sm:pb-20">
              <div className="inline-flex items-center gap-2 border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-black px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Notre magasin
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight mb-5">
                Venez nous<br />
                <span className="text-orange-400">rendre visite</span>
              </h1>
              <p className="text-slate-400 text-base leading-relaxed max-w-md">
                Retrouvez-nous en boutique a Casablanca. Notre equipe vous accueille 7j/7 pour vous conseiller et tester nos produits.
              </p>
              <div className="mt-8 flex gap-3">
                <a href="https://maps.google.com/?q=Boulevard+Zerktouni+Maarif+Casablanca" target="_blank" rel="noopener noreferrer"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-black px-6 py-3 rounded-xl transition-all text-sm shadow-lg shadow-orange-500/30">
                  Itineraire &rarr;
                </a>
                <Link href="/contact" className="border border-slate-700 hover:border-orange-400 text-slate-400 hover:text-orange-400 font-bold px-6 py-3 rounded-xl transition-all text-sm">
                  Nous appeler
                </Link>
              </div>
            </div>

          </div>
        </div>
        <div className="relative h-16 overflow-hidden">
          <svg viewBox="0 0 1440 64" className="absolute bottom-0 w-full" fill="white" preserveAspectRatio="none">
            <path d="M0,64 C360,0 1080,64 1440,0 L1440,64 Z" />
          </svg>
        </div>
      </section>

      {/* CONTENT */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12">

          {/* Info cards */}
          <div className="space-y-5">
            {/* Address */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 hover:border-orange-200 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <h2 className="text-slate-900 font-black text-sm">Adresse</h2>
              </div>
              <p className="text-slate-700 font-bold text-sm">ElectroShop-Tech</p>
              <p className="text-slate-500 text-sm mt-1">Boulevard Zerktouni, Maarif<br />Casablanca 20100, Maroc</p>
            </div>

            {/* Hours */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 hover:border-orange-200 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h2 className="text-slate-900 font-black text-sm">Horaires d&rsquo;ouverture</h2>
              </div>
              <div className="space-y-2.5">
                {hours.map((h) => (
                  <div key={h.day} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{h.day}</span>
                    <span className="text-slate-900 font-bold">{h.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 hover:border-orange-200 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                <h2 className="text-slate-900 font-black text-sm">Contact</h2>
              </div>
              <p className="text-slate-500 text-sm">Tel : <span className="font-bold text-slate-900">(+212) 716-408919</span></p>
              <p className="text-slate-500 text-sm mt-1">Email : <span className="font-bold text-slate-900">contact@electroshop-tech.com</span></p>
              <Link href="/contact" className="mt-4 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors">
                Envoyer un message &rarr;
              </Link>
            </div>
          </div>

          {/* Right side */}
          <div className="space-y-5">
            {/* Map */}
            <div className="bg-slate-950 rounded-3xl overflow-hidden h-64 flex items-center justify-center border border-slate-800 relative">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                </div>
                <p className="text-slate-300 font-bold text-sm mb-1">Boulevard Zerktouni</p>
                <p className="text-slate-500 text-xs mb-4">Maarif, Casablanca</p>
                <a href="https://maps.google.com/?q=Boulevard+Zerktouni+Maarif+Casablanca" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all">
                  Ouvrir dans Google Maps &rarr;
                </a>
              </div>
            </div>

            {/* Services */}
            <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800">
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-5">Services en boutique</p>
              <div className="grid grid-cols-2 gap-3">
                {services.map((s) => (
                  <div key={s.label} className="flex items-center gap-3 bg-slate-900/60 rounded-xl px-4 py-3 border border-slate-700/30">
                    <svg className="w-4 h-4 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                    </svg>
                    <span className="text-slate-300 text-xs font-medium">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
