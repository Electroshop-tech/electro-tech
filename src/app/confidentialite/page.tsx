import Link from "next/link";

const sections = [
  { num: "01", title: "Collecte des données", content: "ElectroShop-Tech collecte les données personnelles suivantes lors de vos achats : nom et prénom, adresse email, numéro de téléphone, adresse de livraison. Ces données sont nécessaires au traitement de vos commandes." },
  { num: "02", title: "Utilisation des données", content: "Vos données personnelles sont utilisées exclusivement pour : le traitement et le suivi de vos commandes, la communication sur l'état de votre livraison, le service après-vente, et l'envoi d'offres commerciales si vous y avez consenti." },
  { num: "03", title: "Conservation des données", content: "Vos données sont conservées pendant la durée nécessaire à l'exécution du contrat, et au maximum 3 ans après votre dernier achat, conformément aux obligations légales marocaines." },
  { num: "04", title: "Partage des données", content: "Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées uniquement avec nos partenaires logistiques (transporteurs) dans le cadre de la livraison de vos commandes, sous clause de confidentialité stricte." },
  { num: "05", title: "Sécurité", content: "Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre la perte, l'accès non autorisé ou la divulgation. Nos paiements en ligne sont sécurisés via des protocoles SSL/TLS." },
  { num: "06", title: "Cookies", content: "Notre site utilise des cookies techniques nécessaires au fonctionnement du site (panier, session). Ces cookies ne collectent pas de données personnelles à des fins publicitaires." },
  { num: "07", title: "Vos droits", content: "Conformément à la loi 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel, vous disposez d'un droit d'accès, de rectification, d'effacement et d'opposition. Pour exercer ces droits : contact@electroshop-tech.com." },
  { num: "08", title: "Contact", content: "Pour toute question relative à notre politique de confidentialité : contact@electroshop-tech.com — ElectroShop-Tech, Boulevard Zerktouni, Maarif, Casablanca 20100, Maroc." },
];

export default function ConfidentialitePage() {
  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 pt-10 sm:pt-20 pb-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-end">
            <div className="pb-10 sm:pb-20">
              <div className="inline-flex items-center gap-2 border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-black px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                Juridique
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight mb-5">
                Politique de<br />
                <span className="text-orange-400">confidentialité</span>
              </h1>
              <p className="text-slate-400 text-base leading-relaxed max-w-md">
                Comment nous collectons, utilisons et protégeons vos données personnelles. Dernière mise à jour : 1er janvier 2024.
              </p>
            </div>

            {/* Right — stat cards */}
            <div className="hidden lg:flex flex-col gap-4 pb-16">
              {[
                { icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", value: "SSL 256-bit", label: "Paiements chiffrés" },
                { icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z", value: "Jamais revendue", label: "Données protégées" },
                { icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", value: "3 ans max", label: "Conservation des données" },
                { icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", value: "Loi 09-08", label: "Vos droits garantis" },
              ].map((s) => (
                <div key={s.value} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={s.icon} /></svg>
                  </div>
                  <div>
                    <p className="text-white font-black text-sm">{s.value}</p>
                    <p className="text-slate-400 text-xs">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        <div className="relative h-16 overflow-hidden">
          <svg viewBox="0 0 1440 64" className="absolute bottom-0 w-full" fill="white" preserveAspectRatio="none">
            <path d="M0,64 C360,0 1080,64 1440,0 L1440,64 Z" />
          </svg>
        </div>
      </section>

      {/* ── SECTIONS ── */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">
            {sections.map((s) => (
              <div key={s.num} className="bg-white border border-slate-100 rounded-2xl p-6 hover:border-orange-200 hover:shadow-md transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500/20 transition-colors">
                    <span className="text-orange-500 font-black text-xs">{s.num}</span>
                  </div>
                  <div>
                    <h2 className="text-slate-900 font-black text-sm mb-2">Section {s.num} — {s.title}</h2>
                    <p className="text-slate-500 text-sm leading-relaxed">{s.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-5">
            <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 sticky top-24">
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-5">Sommaire</p>
              <nav className="space-y-2">
                {sections.map((s) => (
                  <div key={s.num} className="flex items-center gap-3 group">
                    <span className="text-orange-500 font-black text-xs w-5 flex-shrink-0">{s.num}</span>
                    <span className="text-slate-400 text-xs group-hover:text-orange-400 transition-colors cursor-default">{s.title}</span>
                  </div>
                ))}
              </nav>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6">
              <p className="text-white font-black text-sm mb-1">Exercer vos droits</p>
              <p className="text-orange-100 text-xs mb-4 leading-relaxed">Accès, rectification ou suppression de vos données personnelles.</p>
              <Link href="/contact" className="block text-center bg-white text-orange-500 font-black text-xs px-4 py-2.5 rounded-xl hover:bg-orange-50 transition-colors">
                Nous contacter →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
