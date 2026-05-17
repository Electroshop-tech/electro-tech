import Link from "next/link";

const guarantees = [
  { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", title: "Garantie 1 an", subtitle: "Panne materielle couverte", desc: "Tous nos produits beneficient d'une garantie 1 an couvrant les pannes materielles d'origine. Remplacement ou reparation sans frais." },
  { icon: "M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6", title: "Retour 14 jours", subtitle: "Satisfait ou rembourse", desc: "Vous avez 14 jours pour retourner un produit si vous n'en etes pas satisfait, sans avoir a justifier votre decision." },
  { icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z", title: "Authenticite garantie", subtitle: "Produits 100% originaux", desc: "Nous ne vendons que des produits officiels, sources directement aupres des fabricants. Aucune contrefacon dans notre catalogue." },
  { icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z", title: "Support technique", subtitle: "Assistance incluse", desc: "Notre equipe technique vous accompagne pour l'installation et la configuration de vos produits, gratuitement." },
];

const process = [
  { n: "01", title: "Signalez le probleme", desc: "Contactez-nous par email ou telephone avec votre numero de commande et une description du probleme." },
  { n: "02", title: "Diagnostic", desc: "Notre equipe technique evalue la situation et vous propose une solution sous 24-48h." },
  { n: "03", title: "Resolution", desc: "Selon le cas, le produit est repare ou remplace a nos frais, sans surcoat pour vous." },
];

export default function GarantiesPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* HERO */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 pt-20 pb-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-end">
            <div className="pb-20">
              <div className="inline-flex items-center gap-2 border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-black px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Achetez en confiance
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight mb-5">
                Nos<br />
                <span className="text-orange-400">garanties</span>
              </h1>
              <p className="text-slate-400 text-base leading-relaxed max-w-md">
                Chaque produit vendu sur ElectroShop-Tech est couvert par des garanties solides pour votre tranquillite d&rsquo;esprit.
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

      {/* CONTENT */}
      <section className="py-16 max-w-7xl mx-auto px-4 space-y-16">

        {/* Guarantee cards */}
        <div>
          <div className="text-center mb-10">
            <p className="text-orange-500 text-xs font-black uppercase tracking-widest mb-2">Protection complete</p>
            <h2 className="text-3xl font-black text-slate-900">Vos <span className="text-orange-500">protections</span></h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {guarantees.map((g) => (
              <div key={g.title} className="bg-white border border-slate-100 rounded-2xl p-6 hover:border-orange-200 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-5 group-hover:bg-orange-500/20 transition-colors">
                  <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={g.icon} />
                  </svg>
                </div>
                <h2 className="text-slate-900 font-black text-sm">{g.title}</h2>
                <p className="text-orange-500 text-xs font-bold mt-0.5 mb-3">{g.subtitle}</p>
                <p className="text-slate-500 text-xs leading-relaxed">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Process */}
        <div className="bg-slate-950 rounded-3xl p-10">
          <div className="text-center mb-10">
            <p className="text-orange-400 text-xs font-black uppercase tracking-widest mb-2">Activation garantie</p>
            <h2 className="text-3xl font-black text-white">Comment activer la <span className="text-orange-400">garantie ?</span></h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {process.map((s) => (
              <div key={s.n} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white font-black text-sm flex items-center justify-center mx-auto mb-4">{s.n}</div>
                <p className="text-white font-black text-sm mb-2">{s.title}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-10 text-center">
          <h2 className="text-2xl font-black text-white mb-2">Un produit en panne ?</h2>
          <p className="text-orange-100 text-sm mb-6">Contactez notre SAV — nous trouvons une solution sous 24h.</p>
          <Link href="/contact" className="bg-white text-orange-500 font-black px-8 py-3 rounded-xl hover:bg-orange-50 transition-colors shadow-lg text-sm inline-block">
            Contacter le SAV &rarr;
          </Link>
        </div>
      </section>
    </main>
  );
}
