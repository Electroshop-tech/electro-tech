import Link from "next/link";

const zones = [
  { zone: "Casablanca & Grand Casablanca", delay: "24h", price: "Gratuit" },
  { zone: "Rabat, Sale, Temara", delay: "24-48h", price: "Gratuit" },
  { zone: "Marrakech, Fes, Agadir", delay: "24-48h", price: "Gratuit" },
  { zone: "Autres villes du Maroc", delay: "48-72h", price: "Gratuit" },
];

const steps = [
  { n: "01", title: "Commande confirmee", desc: "Votre commande est validee par email des confirmation du paiement." },
  { n: "02", title: "Preparation du colis", desc: "Nos equipes preparent et verifient votre colis sous 2-4 heures." },
  { n: "03", title: "Expedition", desc: "Le colis est remis au transporteur. Vous recevez un numero de suivi par SMS/email." },
  { n: "04", title: "Livraison", desc: "Le livreur vous contacte pour convenir d'un creneau de livraison." },
];

export default function LivraisonPage() {
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
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" /></svg>
                Expedition rapide
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight mb-5">
                Livraison<br />
                <span className="text-orange-400">gratuite</span><br />
                partout au Maroc
              </h1>
              <p className="text-slate-400 text-base leading-relaxed max-w-md">
                Toutes nos commandes sont expediees gratuitement en 24-48h. Suivi en temps reel inclus.
              </p>
            </div>

          </div>
        </div>
        <div className="relative h-16 overflow-hidden">
          <svg viewBox="0 0 1440 64" className="absolute bottom-0 w-full" fill="white" preserveAspectRatio="none">
            <path d="M0,64 C360,0 1080,64 1440,0 L1440,64 Z" />
          </svg>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="bg-orange-500 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-8 text-white text-xs font-bold">
          {["Livraison gratuite", "Expedition le jour meme avant 14h", "Suivi en temps reel", "Emballage securise"].map(t => (
            <span key={t} className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <section className="py-16 max-w-7xl mx-auto px-4 space-y-16">

        {/* Zones */}
        <div>
          <div className="mb-8">
            <p className="text-orange-500 text-xs font-black uppercase tracking-widest mb-2">Zones de livraison</p>
            <h2 className="text-3xl font-black text-slate-900">Delais par <span className="text-orange-500">region</span></h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {zones.map((z) => (
              <div key={z.zone} className="bg-white border border-slate-100 rounded-2xl p-6 hover:border-orange-200 hover:shadow-md transition-all">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-slate-900 font-black text-sm mb-1">{z.zone}</p>
                <p className="text-orange-500 font-black text-lg">{z.delay}</p>
                <span className="inline-flex mt-2 px-2.5 py-0.5 rounded-full text-xs font-black bg-green-50 text-green-600 border border-green-200">{z.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="bg-slate-950 rounded-3xl p-10">
          <div className="mb-8">
            <p className="text-orange-400 text-xs font-black uppercase tracking-widest mb-2">Processus</p>
            <h2 className="text-3xl font-black text-white">Comment ca <span className="text-orange-400">marche ?</span></h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.n}>
                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white font-black text-xs flex items-center justify-center mb-4">{s.n}</div>
                <h3 className="text-white font-black text-sm mb-2">{s.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Note + CTA */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <h3 className="text-slate-900 font-black text-sm mb-3">Informations importantes</h3>
            <ul className="space-y-2 text-slate-600 text-xs leading-relaxed list-disc list-inside">
              <li>Les delais sont indicatifs et peuvent varier selon le transporteur.</li>
              <li>En cas d&rsquo;absence, le livreur vous recontacte pour reprogrammer.</li>
              <li>Vous recevrez un SMS avec votre numero de suivi des l&rsquo;expedition.</li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <p className="text-white font-black text-sm mb-1">Suivre ma commande</p>
              <p className="text-orange-100 text-xs leading-relaxed mb-5">Entrez votre numero de commande pour suivre votre livraison.</p>
            </div>
            <Link href="/suivi-commande" className="inline-block text-center bg-white text-orange-500 font-black text-xs px-6 py-2.5 rounded-xl hover:bg-orange-50 transition-colors">
              Suivre ma commande &rarr;
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
