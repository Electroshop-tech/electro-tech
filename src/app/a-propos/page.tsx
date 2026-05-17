import Link from "next/link";

const highlights = [
  { label: "Produits authentiques", desc: "100% originaux, sourcés chez les fabricants", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" },
  { label: "SAV local", desc: "Support disponible 7j/7 en magasin & en ligne", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { label: "Livraison rapide", desc: "Expédition 24–48h partout au Maroc", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { label: "Garantie 1 an", desc: "Sur tous nos produits, sans exception", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
];

const milestones = [
  { year: "2016", text: "Ouverture de la boutique à Casablanca" },
  { year: "2018", text: "Lancement de la vente en ligne" },
  { year: "2021", text: "Développement de la gamme accessoires" },
  { year: "2024", text: "Expansion gamme caméras & accessoires" },
];

const values = [
  { icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z", title: "Authenticité", desc: "Produits 100% originaux, sourcés auprès des fabricants officiels. Zéro contrefaçon." },
  { icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", title: "Passion", desc: "Passionnés par la tech, nous guidons nos clients vers les meilleurs produits du marché." },
  { icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", title: "Proximité", desc: "Une équipe locale, disponible 7j/7 en magasin et en ligne pour votre satisfaction." },
  { icon: "M13 10V3L4 14h7v7l9-11h-7z", title: "Rapidité", desc: "Livraison express 24–48h. Votre commande expédiée le jour même avant 14h." },
];

export default function AProposPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 pt-20 pb-0 relative overflow-hidden">
        {/* Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-end">
            {/* Left */}
            <div className="pb-20">
              <div className="inline-flex items-center gap-2 border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-black px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Qui sommes-nous
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight mb-5">
                L&rsquo;expert tech<br />
                <span className="text-orange-400">de confiance</span><br />
                au Maroc
              </h1>
              <p className="text-slate-400 text-base leading-relaxed mb-8 max-w-md">
                Depuis 2016, ElectroShop-Tech accompagne les Marocains dans leur transition vers la Smart TV et la maison connectée — avec passion et expertise.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link href="/produits" className="bg-orange-500 hover:bg-orange-600 text-white font-black px-6 py-3 rounded-xl transition-all shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 text-sm">
                  Nos produits →
                </Link>
                <Link href="/contact" className="border border-slate-700 hover:border-orange-400 text-slate-400 hover:text-orange-400 font-bold px-6 py-3 rounded-xl transition-all text-sm">
                  Nous contacter
                </Link>
              </div>
            </div>


          </div>
        </div>

        {/* Wave bottom */}
        <div className="relative h-16 overflow-hidden">
          <svg viewBox="0 0 1440 64" className="absolute bottom-0 w-full" fill="white" preserveAspectRatio="none">
            <path d="M0,64 C360,0 1080,64 1440,0 L1440,64 Z" />
          </svg>
        </div>
      </section>

      {/* ── STORY + TIMELINE ── */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-orange-500 text-xs font-black uppercase tracking-widest mb-3">Notre histoire</p>
            <h2 className="text-3xl font-black text-slate-900 mb-5">Nés d&rsquo;une passion<br /><span className="text-orange-500">pour la technologie</span></h2>
            <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
              <p>ElectroShop-Tech a été fondé à Casablanca en 2016 avec une vision claire : rendre la technologie Android TV accessible à tous les foyers marocains, à des prix honnêtes et avec un service irréprochable.</p>
              <p>Ce qui a commencé comme une petite boutique spécialisée s&rsquo;est transformé en référence nationale pour les box Android TV, accessoires high-tech et caméras de surveillance.</p>
              <p>Aujourd&rsquo;hui, nous servons plus de 1000 clients satisfaits à travers tout le Maroc, avec une équipe passionnée et un catalogue soigneusement sélectionné.</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-orange-500 via-orange-400 to-orange-200" />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <div key={m.year} className="relative flex gap-6 pl-12">
                  <div className="absolute left-0 w-8 h-8 rounded-full bg-orange-500 text-white font-black text-[10px] flex items-center justify-center shadow-lg shadow-orange-500/30 z-10 -translate-x-0">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="bg-slate-50 rounded-2xl px-5 py-4 border border-slate-100 flex-1 hover:border-orange-200 hover:shadow-md transition-all">
                    <div className="text-orange-500 font-black text-lg leading-none">{m.year}</div>
                    <div className="text-slate-700 text-sm mt-1">{m.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="py-16 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-orange-500/8 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-blue-500/8 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-orange-400 text-xs font-black uppercase tracking-widest mb-2">Ce qui nous guide</p>
            <h2 className="text-3xl font-black text-white">Nos <span className="text-orange-400">valeurs</span></h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v) => (
              <div key={v.title} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-orange-500/40 hover:bg-slate-900 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-5 group-hover:bg-orange-500/20 transition-colors">
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={v.icon} />
                  </svg>
                </div>
                <h3 className="text-white font-black text-sm mb-2">{v.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── CTA ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-amber-500 py-16">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="relative max-w-xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-white mb-3">Prêt à transformer votre TV ?</h2>
          <p className="text-orange-100 text-sm mb-7">Découvrez nos box Android TV et accessoires — qualité garantie, livraison rapide partout au Maroc.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/produits" className="bg-white text-orange-500 font-black px-7 py-3 rounded-xl hover:bg-orange-50 transition-colors shadow-xl text-sm">
              Voir nos produits →
            </Link>
            <Link href="/contact" className="border-2 border-white/50 text-white font-bold px-7 py-3 rounded-xl hover:border-white hover:bg-white/10 transition-all text-sm">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
