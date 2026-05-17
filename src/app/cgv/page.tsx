import Link from "next/link";

const articles = [
  {
    num: "01",
    title: "Objet",
    content: "Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre ElectroShop-Tech (ci-après « le Vendeur ») et tout acheteur (ci-après « le Client ») effectuant un achat sur le site electroshop-tech.ma ou en boutique physique.",
  },
  {
    num: "02",
    title: "Produits",
    content: "Le Vendeur propose à la vente des box Android TV, TV Sticks, caméras de surveillance, accessoires high-tech et produits connexes. Tous les produits sont neufs, authentiques et sourcés auprès de fournisseurs officiels. Les photos et descriptions sont fournies à titre indicatif.",
  },
  {
    num: "03",
    title: "Prix",
    content: "Les prix sont indiqués en Dirhams marocains (MAD) TTC. Le Vendeur se réserve le droit de modifier ses prix à tout moment, sans préavis. Les commandes sont facturées au prix en vigueur au moment de la validation.",
  },
  {
    num: "04",
    title: "Commande",
    content: "La commande est validée après confirmation du paiement. Un email de confirmation est envoyé au Client. Le Vendeur se réserve le droit de refuser ou annuler toute commande en cas de rupture de stock, d'erreur de prix ou de suspicion de fraude.",
  },
  {
    num: "05",
    title: "Paiement",
    content: "Le règlement peut s'effectuer par carte bancaire (Visa, Mastercard), virement bancaire, ou paiement à la livraison. Le paiement en ligne est sécurisé. Aucune information bancaire n'est conservée sur nos serveurs.",
  },
  {
    num: "06",
    title: "Livraison",
    content: "La livraison est effectuée partout au Maroc dans un délai de 24 à 72 heures ouvrées selon la zone géographique. Les frais de livraison sont offerts sur toutes les commandes. Le Vendeur ne peut être tenu responsable des retards liés aux transporteurs.",
  },
  {
    num: "07",
    title: "Droit de rétractation",
    content: "Conformément à la législation marocaine sur la protection du consommateur, le Client dispose d'un délai de 14 jours calendaires à compter de la réception pour exercer son droit de rétractation, sans justification. Le produit doit être retourné en parfait état dans son emballage d'origine.",
  },
  {
    num: "08",
    title: "Garantie",
    content: "Tous les produits sont garantis 1 an contre les vices de fabrication. La garantie ne couvre pas les dommages causés par une mauvaise utilisation, un accident ou une modification non autorisée du produit.",
  },
  {
    num: "09",
    title: "Responsabilité",
    content: "Le Vendeur ne saurait être tenu responsable des dommages indirects, pertes de données ou préjudices immatériels liés à l'utilisation de ses produits. Sa responsabilité est limitée au montant de la commande.",
  },
  {
    num: "10",
    title: "Droit applicable",
    content: "Les présentes CGV sont soumises au droit marocain. Tout litige sera soumis à la compétence exclusive des tribunaux de Casablanca, Maroc.",
  },
  {
    num: "11",
    title: "Contact",
    content: "Pour toute question relative aux présentes CGV : contact@electroshop-tech.com — (+212) 716-408919 — ElectroShop-Tech, Boulevard Zerktouni, Maarif, Casablanca 20100, Maroc.",
  },
];

export default function CGVPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 pt-10 sm:pt-20 pb-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-end">
            {/* Left */}
            <div className="pb-10 sm:pb-20">
              <div className="inline-flex items-center gap-2 border border-orange-500/30 bg-orange-500/10 text-orange-400 text-xs font-black px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                Juridique
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight mb-5">
                Conditions<br />
                <span className="text-orange-400">Générales</span><br />
                de Vente
              </h1>
              <p className="text-slate-400 text-base leading-relaxed max-w-md">
                Document régissant les relations contractuelles entre ElectroShop-Tech et ses clients. En vigueur depuis le 1er janvier 2024.
              </p>
            </div>


          </div>
        </div>

        {/* Wave */}
        <div className="relative h-16 overflow-hidden">
          <svg viewBox="0 0 1440 64" className="absolute bottom-0 w-full" fill="white" preserveAspectRatio="none">
            <path d="M0,64 C360,0 1080,64 1440,0 L1440,64 Z" />
          </svg>
        </div>
      </section>

      {/* ── ARTICLES ── */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {articles.map((a) => (
              <div key={a.num} className="bg-white border border-slate-100 rounded-2xl p-6 hover:border-orange-200 hover:shadow-md transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500/20 transition-colors">
                    <span className="text-orange-500 font-black text-xs">{a.num}</span>
                  </div>
                  <div>
                    <h2 className="text-slate-900 font-black text-sm mb-2">Article {a.num} — {a.title}</h2>
                    <p className="text-slate-500 text-sm leading-relaxed">{a.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* TOC */}
            <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 sticky top-24">
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-5">Sommaire</p>
              <nav className="space-y-2">
                {articles.map((a) => (
                  <div key={a.num} className="flex items-center gap-3 group">
                    <span className="text-orange-500 font-black text-xs w-5 flex-shrink-0">{a.num}</span>
                    <span className="text-slate-400 text-xs group-hover:text-orange-400 transition-colors cursor-default">{a.title}</span>
                  </div>
                ))}
              </nav>
            </div>

            {/* Contact card */}
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6">
              <p className="text-white font-black text-sm mb-1">Une question ?</p>
              <p className="text-orange-100 text-xs mb-4 leading-relaxed">Notre équipe répond à toutes vos questions juridiques et commerciales.</p>
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
