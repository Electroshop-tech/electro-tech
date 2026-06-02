import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-[#eef1f8] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-16 left-8 w-72 h-72 bg-orange-100 rounded-full opacity-50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-16 right-8 w-80 h-80 bg-indigo-100 rounded-full opacity-40 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-slate-100 rounded-full opacity-60 blur-3xl pointer-events-none" />

      <div className="text-center max-w-lg relative z-10">
        {/* 404 + icon */}
        <div className="relative mb-8 flex items-center justify-center">
          <p className="text-[150px] sm:text-[190px] font-black leading-none select-none bg-gradient-to-b from-slate-200 to-slate-100 bg-clip-text text-transparent">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-400 rounded-3xl blur-2xl opacity-35 scale-125" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-200 rotate-3">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Text */}
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">
          Oups&nbsp;! Page introuvable
        </h1>
        <p className="text-gray-500 text-sm mb-10 max-w-sm mx-auto leading-relaxed">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
          Pas de panique, vous pouvez retourner à l&apos;accueil.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-7 py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/produits"
            className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-7 py-3.5 rounded-2xl text-sm transition-all shadow-sm hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Voir les produits
          </Link>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-14 bg-gray-200" />
          <span className="text-xs text-gray-400">ou</span>
          <div className="h-px w-14 bg-gray-200" />
        </div>

        <Link
          href="/contact"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-orange-500 transition-colors font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Besoin d&apos;aide ? Contactez-nous
        </Link>
      </div>
    </div>
  );
}
