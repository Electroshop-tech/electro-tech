export default function MaintenancePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #04080f; }

        @keyframes orb-drift {
          0%, 100% { transform: translate(0,0) scale(1); }
          25%  { transform: translate(50px,-40px) scale(1.08); }
          50%  { transform: translate(-30px,60px) scale(0.94); }
          75%  { transform: translate(-60px,-20px) scale(1.06); }
        }
        @keyframes orb-drift-2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          33%  { transform: translate(-70px,50px) scale(1.1); }
          66%  { transform: translate(40px,-70px) scale(0.9); }
        }
        @keyframes float-icon {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-14px); }
        }
        @keyframes spin-cw  { to { transform: rotate(360deg); } }
        @keyframes spin-ccw { to { transform: rotate(-360deg); } }
        @keyframes glow-breathe {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.06); }
        }
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(36px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes progress-fill {
          0%   { width: 0%; }
          15%  { width: 18%; }
          40%  { width: 46%; }
          65%  { width: 67%; }
          100% { width: 84%; }
        }
        @keyframes progress-glow {
          0%, 100% { box-shadow: 0 0 8px rgba(249,115,22,0.4); }
          50%       { box-shadow: 0 0 18px rgba(249,115,22,0.8), 0 0 32px rgba(249,115,22,0.3); }
        }
        @keyframes live-dot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.2; }
        }
        @keyframes live-ring {
          0%   { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes particle-rise {
          0%   { transform: translateY(0) translateX(0); opacity: 0; }
          8%   { opacity: 0.9; }
          92%  { opacity: 0.7; }
          100% { transform: translateY(-100vh) translateX(var(--pdx)); opacity: 0; }
        }
        @keyframes stat-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes wa-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(37,211,102,0.4); }
          50%       { box-shadow: 0 0 0 8px rgba(37,211,102,0); }
        }

        .page {
          min-height: 100vh;
          background: #04080f;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.25rem 3rem;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #fff;
          overflow: hidden;
          position: relative;
        }

        /* â”€â”€ Background â”€â”€ */
        .bg-orb {
          position: fixed; border-radius: 50%;
          filter: blur(90px); pointer-events: none; z-index: 0;
        }
        .bg-orb-1 {
          width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(249,115,22,0.16) 0%, transparent 65%);
          top: -260px; right: -220px;
          animation: orb-drift 20s ease-in-out infinite;
        }
        .bg-orb-2 {
          width: 550px; height: 550px;
          background: radial-gradient(circle, rgba(234,88,12,0.12) 0%, transparent 65%);
          bottom: -180px; left: -180px;
          animation: orb-drift-2 25s ease-in-out infinite;
        }
        .bg-orb-3 {
          width: 280px; height: 280px;
          background: radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%);
          top: 42%; left: 48%;
          animation: orb-drift 34s ease-in-out infinite reverse;
        }
        .bg-grid {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(249,115,22,0.028) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249,115,22,0.028) 1px, transparent 1px);
          background-size: 72px 72px;
        }
        .bg-vignette {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background: radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(4,8,15,0.7) 100%);
        }

        /* â”€â”€ Particles â”€â”€ */
        .particle {
          position: fixed; border-radius: 50%;
          background: #fb923c; z-index: 0; pointer-events: none;
          animation: particle-rise linear infinite;
        }

        /* â”€â”€ Card â”€â”€ */
        .card {
          position: relative; z-index: 1;
          width: 100%; max-width: 580px;
          text-align: center;
          animation: fade-up 1s cubic-bezier(0.16,1,0.3,1) both;
        }

        /* â”€â”€ Icon â”€â”€ */
        .icon-area {
          position: relative;
          display: inline-flex; align-items: center; justify-content: center;
          width: 108px; height: 108px;
          margin-bottom: 2rem;
          animation: float-icon 5s ease-in-out infinite;
        }
        .icon-bg-glow {
          position: absolute; inset: -18px; border-radius: 50%;
          background: radial-gradient(circle, rgba(249,115,22,0.22) 0%, transparent 70%);
          animation: glow-breathe 3s ease-in-out infinite;
        }
        .icon-box {
          position: absolute; inset: 0; border-radius: 28px;
          background: linear-gradient(145deg, rgba(249,115,22,0.14), rgba(234,88,12,0.06));
          border: 1px solid rgba(249,115,22,0.38);
          backdrop-filter: blur(12px);
        }
        .icon-ring-outer {
          position: absolute; inset: -20px; border-radius: 50%;
          border: 1.5px dashed rgba(249,115,22,0.22);
          animation: spin-cw 14s linear infinite;
        }
        .icon-ring-dot {
          position: absolute; top: -4px; left: calc(50% - 4px);
          width: 8px; height: 8px; border-radius: 50%;
          background: #f97316;
          box-shadow: 0 0 10px #f97316, 0 0 20px rgba(249,115,22,0.5);
        }
        .icon-ring-inner {
          position: absolute; inset: -38px; border-radius: 50%;
          border: 1px solid rgba(249,115,22,0.1);
          animation: spin-ccw 22s linear infinite;
        }
        .icon-svg { position: relative; z-index: 1; }

        /* â”€â”€ Badge â”€â”€ */
        .badge {
          display: inline-flex; align-items: center; gap: 0.55rem;
          padding: 0.42rem 1.2rem; border-radius: 99px;
          background: rgba(249,115,22,0.07);
          border: 1px solid rgba(249,115,22,0.28);
          font-size: 0.66rem; font-weight: 700;
          color: #fb923c; letter-spacing: 0.12em; text-transform: uppercase;
          backdrop-filter: blur(10px);
          margin-bottom: 1.6rem;
        }
        .live-indicator { position: relative; width: 8px; height: 8px; }
        .live-indicator::before {
          content: ''; position: absolute; inset: 0; border-radius: 50%;
          background: #f97316;
          animation: live-dot 1.6s ease-in-out infinite;
        }
        .live-indicator::after {
          content: ''; position: absolute; inset: 0; border-radius: 50%;
          background: #f97316;
          animation: live-ring 1.6s ease-out infinite;
        }

        /* â”€â”€ Brand â”€â”€ */
        .brand {
          font-size: 0.66rem; font-weight: 600;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: rgba(249,115,22,0.75); margin-bottom: 0.7rem;
        }

        /* â”€â”€ Title â”€â”€ */
        .title {
          font-size: clamp(2.1rem, 5.5vw, 3rem);
          font-weight: 900; line-height: 1.12; margin-bottom: 1.4rem;
          background: linear-gradient(160deg, #ffffff 0%, #cbd5e1 60%, #64748b 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .title-highlight {
          background: linear-gradient(90deg, #ea580c, #f97316, #fdba74, #fb923c, #ea580c);
          background-size: 600px auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        /* â”€â”€ Description â”€â”€ */
        .desc {
          color: #475569; font-size: 0.94rem; line-height: 1.85;
          margin-bottom: 2.5rem;
          max-width: 400px; margin-left: auto; margin-right: auto;
          font-weight: 400;
        }

        /* â”€â”€ Stats row â”€â”€ */
        .stats {
          display: flex; gap: 1px;
          background: rgba(249,115,22,0.12);
          border: 1px solid rgba(249,115,22,0.14);
          border-radius: 16px; overflow: hidden;
          margin-bottom: 2.5rem;
        }
        .stat {
          flex: 1; padding: 1rem 0.5rem;
          background: rgba(4,8,15,0.7);
          display: flex; flex-direction: column; align-items: center; gap: 0.3rem;
          animation: stat-in 0.8s cubic-bezier(0.16,1,0.3,1) both;
        }
        .stat:nth-child(1) { animation-delay: 0.15s; }
        .stat:nth-child(2) { animation-delay: 0.25s; }
        .stat:nth-child(3) { animation-delay: 0.35s; }
        .stat-value {
          font-size: 1.5rem; font-weight: 900;
          background: linear-gradient(135deg, #f97316, #fb923c);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .stat-label { font-size: 0.65rem; color: #475569; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }

        /* â”€â”€ Progress â”€â”€ */
        .progress-wrap { margin-bottom: 2.5rem; }
        .progress-meta {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 0.75rem;
          font-size: 0.7rem; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase;
        }
        .progress-meta-left { color: #334155; }
        .progress-meta-right { color: #f97316; }
        .progress-track {
          height: 5px; background: rgba(255,255,255,0.04);
          border-radius: 99px; overflow: hidden; position: relative;
        }
        .progress-bar {
          height: 100%; border-radius: 99px;
          background: linear-gradient(90deg, #c2410c, #f97316, #fb923c, #fde68a, #fb923c);
          background-size: 200% auto;
          animation: progress-fill 10s cubic-bezier(0.4,0,0.2,1) forwards,
                     shimmer 2.5s linear infinite,
                     progress-glow 2s ease-in-out infinite;
        }

        /* â”€â”€ Divider â”€â”€ */
        .divider {
          display: flex; align-items: center; gap: 1rem;
          margin-bottom: 1.4rem;
        }
        .divider-line {
          flex: 1; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(249,115,22,0.18), transparent);
        }
        .divider-text { font-size: 0.62rem; color: #1e293b; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }

        /* â”€â”€ Contact buttons â”€â”€ */
        .contact-row {
          display: flex; flex-direction: column; gap: 0.75rem;
          align-items: stretch;
        }
        @media (min-width: 480px) {
          .contact-row { flex-direction: row; }
        }
        .btn-contact {
          flex: 1; display: inline-flex; align-items: center; justify-content: center;
          gap: 0.65rem; padding: 0.85rem 1.4rem;
          border-radius: 14px; font-weight: 600; font-size: 0.875rem;
          text-decoration: none; transition: all 0.25s ease;
          cursor: pointer; border: none; font-family: inherit;
          position: relative; overflow: hidden;
        }
        .btn-contact::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0));
          border-radius: inherit;
        }
        .btn-email {
          background: rgba(249,115,22,0.08);
          border: 1px solid rgba(249,115,22,0.25);
          color: #fb923c;
        }
        .btn-email:hover {
          background: rgba(249,115,22,0.14);
          border-color: rgba(249,115,22,0.45);
          box-shadow: 0 4px 24px rgba(249,115,22,0.18), 0 1px 4px rgba(0,0,0,0.4);
          transform: translateY(-2px);
        }
        .btn-whatsapp {
          background: rgba(37,211,102,0.08);
          border: 1px solid rgba(37,211,102,0.25);
          color: #25d366;
          animation: wa-pulse 2.5s ease-in-out infinite;
        }
        .btn-whatsapp:hover {
          background: rgba(37,211,102,0.14);
          border-color: rgba(37,211,102,0.45);
          box-shadow: 0 4px 24px rgba(37,211,102,0.2), 0 1px 4px rgba(0,0,0,0.4);
          transform: translateY(-2px);
          animation: none;
        }

        /* â”€â”€ Footer note â”€â”€ */
        .footer-note {
          margin-top: 2.5rem;
          font-size: 0.68rem; color: #1e293b; font-weight: 500; letter-spacing: 0.04em;
        }
      `}</style>

      <div className="page">
        {/* Background layers */}
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
        <div className="bg-grid" />
        <div className="bg-vignette" />

        {/* Particles */}
        {[
          { l:"8%",  d:"0s",  dur:"13s", dx:"25px",  s:"1.5px" },
          { l:"22%", d:"3s",  dur:"17s", dx:"-35px", s:"2px" },
          { l:"38%", d:"6s",  dur:"11s", dx:"18px",  s:"2.5px" },
          { l:"55%", d:"1s",  dur:"15s", dx:"-28px", s:"1.5px" },
          { l:"70%", d:"8s",  dur:"12s", dx:"40px",  s:"2px" },
          { l:"84%", d:"4s",  dur:"19s", dx:"-18px", s:"1.5px" },
          { l:"46%", d:"10s", dur:"14s", dx:"30px",  s:"1px" },
          { l:"17%", d:"12s", dur:"16s", dx:"-12px", s:"2px" },
          { l:"92%", d:"2s",  dur:"10s", dx:"22px",  s:"1.5px" },
        ].map((p, i) => (
          <div key={i} className="particle" style={{
            left: p.l, bottom: 0,
            width: p.s, height: p.s,
            animationDelay: p.d, animationDuration: p.dur,
            "--pdx": p.dx, opacity: 0,
          } as React.CSSProperties} />
        ))}

        <div className="card">
          {/* Icon */}
          <div className="icon-area">
            <div className="icon-bg-glow" />
            <div className="icon-box" />
            <div className="icon-ring-outer">
              <div className="icon-ring-dot" />
            </div>
            <div className="icon-ring-inner" />
            <svg className="icon-svg" width="46" height="46" fill="none" stroke="#f97316" strokeWidth={1.4} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
            </svg>
          </div>

          {/* Badge */}
          <div>
            <span className="badge">
              <span className="live-indicator" />
              Maintenance en cours
            </span>
          </div>

          {/* Brand + Title */}
          <p className="brand">ElectroShop-Tech</p>
          <h1 className="title">
            Site en cours de<br />
            <span className="title-highlight">maintenance</span>
          </h1>

          {/* Description */}
          <p className="desc">
            Nous effectuons des amÃ©liorations importantes pour vous offrir une meilleure expÃ©rience d&apos;achat.
            Nous serons de retour trÃ¨s bientÃ´t â€” merci de votre patience.
          </p>

          {/* Stats */}
          <div className="stats">
            <div className="stat">
              <span className="stat-value">99%</span>
              <span className="stat-label">Uptime</span>
            </div>
            <div className="stat">
              <span className="stat-value">24h</span>
              <span className="stat-label">Support</span>
            </div>
            <div className="stat">
              <span className="stat-value">ðŸ”’</span>
              <span className="stat-label">SÃ©curisÃ©</span>
            </div>
          </div>

          {/* Progress */}
          <div className="progress-wrap">
            <div className="progress-meta">
              <span className="progress-meta-left">Progression</span>
              <span className="progress-meta-right">BientÃ´t prÃªt âœ¦</span>
            </div>
            <div className="progress-track">
              <div className="progress-bar" />
            </div>
          </div>

          {/* Divider */}
          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">Nous contacter</span>
            <div className="divider-line" />
          </div>

          {/* Contact buttons */}
          <div className="contact-row">
            <a href="mailto:contact.electrotetch@gmail.com" className="btn-contact btn-email">
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Email
            </a>

            <a
              href="https://wa.me/213XXXXXXXXX?text=Bonjour%20ElectroShop-Tech%2C%20j%27ai%20une%20question."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-contact btn-whatsapp"
            >
              {/* WhatsApp icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          </div>

          {/* Footer note */}
          <p className="footer-note">Â© 2025 ElectroShop-Tech Â· Tous droits rÃ©servÃ©s</p>
        </div>
      </div>
    </>
  );
}
