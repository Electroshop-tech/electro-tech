import Link from "next/link";
import ReturnRequestForm from "@/components/ReturnRequestForm";

const conditions = [
  { ok: true,  text: "Produit dans son emballage d'origine (boite, accessoires inclus)" },
  { ok: true,  text: "Produit non utilise ou peu utilise (test uniquement)" },
  { ok: true,  text: "Demande effectuee dans les 14 jours suivant la reception" },
  { ok: false, text: "Produit endommage par une mauvaise utilisation" },
  { ok: false, text: "Produit sans emballage d'origine" },
  { ok: false, text: "Produit avec signes d'usure importants" },
];

const steps = [
  { n: "01", title: "Contactez-nous", desc: "Envoyez un email a contact@electroshop-tech.com ou appelez le (+212) 716-408919 avec votre numero de commande." },
  { n: "02", title: "Confirmation", desc: "Notre equipe confirme la prise en charge de votre retour sous 24h et vous indique la procedure." },
  { n: "03", title: "Renvoi du produit", desc: "Emballez soigneusement le produit et renvoyez-le a notre adresse. Les frais retour sont a votre charge sauf produit defectueux." },
  { n: "04", title: "Remboursement", desc: "Des reception et verification, votre remboursement est effectue sous 5-7 jours ouvres via le moyen de paiement original." },
];

export default function RetoursPage() {
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
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                Politique de retour
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight mb-5">
                Retours &amp;<br />
                <span className="text-orange-400">Remboursements</span>
              </h1>
              <p className="text-slate-400 text-base leading-relaxed max-w-md">
                Satisfait ou remboursé sous 14 jours. Aucune question posée, aucune justification requise.
              </p>
            </div>

            {/* Right — stats */}
            <div className="hidden lg:flex flex-col gap-4 pb-16">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                  <p className="text-3xl font-black text-orange-400">14j</p>
                  <p className="text-slate-400 text-xs mt-1">Pour changer d'avis</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                  <p className="text-3xl font-black text-orange-400">5-7j</p>
                  <p className="text-slate-400 text-xs mt-1">Délai de remboursement</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Sans justification</p>
                  <p className="text-slate-400 text-xs">Aucune question posée</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Remboursement garanti</p>
                  <p className="text-slate-400 text-xs">Via le moyen de paiement original</p>
                </div>
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
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-10">

            {/* 14-day banner */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h2 className="text-slate-900 font-black text-base">14 jours pour changer d&rsquo;avis</h2>
                <p className="text-slate-600 text-sm mt-1 leading-relaxed">Vous disposez de 14 jours calendaires a compter de la reception pour demander un retour, sans avoir a justifier votre decision.</p>
              </div>
            </div>

            {/* Conditions */}
            <div>
              <p className="text-orange-500 text-xs font-black uppercase tracking-widest mb-3">Eligibilite</p>
              <h2 className="text-2xl font-black text-slate-900 mb-5">Conditions de <span className="text-orange-500">retour</span></h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {conditions.map((c) => (
                  <div key={c.text} className={`flex items-start gap-3 rounded-xl p-4 border ${c.ok ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                    <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${c.ok ? "text-green-500" : "text-red-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={c.ok ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                    </svg>
                    <span className={`text-xs leading-relaxed ${c.ok ? "text-green-700" : "text-red-600"}`}>{c.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div className="bg-slate-950 rounded-3xl p-8">
              <p className="text-orange-400 text-xs font-black uppercase tracking-widest mb-2">Procedure</p>
              <h2 className="text-2xl font-black text-white mb-7">Comment effectuer un <span className="text-orange-400">retour ?</span></h2>
              <div className="space-y-5">
                {steps.map((s) => (
                  <div key={s.n} className="flex gap-4">
                    <div className="w-9 h-9 rounded-xl bg-orange-500 text-white font-black text-xs flex items-center justify-center flex-shrink-0">{s.n}</div>
                    <div>
                      <p className="text-white font-black text-sm">{s.title}</p>
                      <p className="text-slate-400 text-xs mt-1 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 sticky top-24">
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-5">A savoir</p>
              <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
                <p>Les frais de retour sont a votre charge, sauf en cas de produit defectueux ou d&rsquo;erreur de notre part.</p>
                <p>Le remboursement est effectue via le meme moyen de paiement utilise lors de l&rsquo;achat.</p>
                <p>Les produits retournes sont inspectes avant validation du remboursement.</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6">
              <p className="text-white font-black text-sm mb-1">Une question ?</p>
              <p className="text-orange-100 text-xs mb-4 leading-relaxed">Notre equipe SAV est disponible 7j/7 pour vous aider.</p>
              <Link href="/contact" className="block text-center bg-white text-orange-500 font-black text-xs px-4 py-2.5 rounded-xl hover:bg-orange-50 transition-colors">
                Contacter le support &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Return request form */}
        <div className="mt-14 max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-orange-500 text-xs font-black uppercase tracking-widest mb-2">Formulaire</p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Demander un <span className="text-orange-500">retour</span></h2>
            <p className="text-slate-500 text-sm mt-2">Remplissez ce formulaire avec votre numéro de commande pour lancer votre demande.</p>
          </div>
          <ReturnRequestForm />
        </div>
      </section>
    </main>
  );
}
