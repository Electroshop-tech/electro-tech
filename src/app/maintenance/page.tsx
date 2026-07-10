export default function MaintenancePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #060b14; }

        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.6; }
          70%  { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-12px) rotate(1.5deg); }
          66%       { transform: translateY(-6px) rotate(-1deg); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes orb-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25%       { transform: translate(40px, -30px) scale(1.08); }
          50%       { transform: translate(-20px, 50px) scale(0.95); }
          75%       { transform: translate(-50px, -20px) scale(1.05); }
        }
        @keyframes orb-drift-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(-60px, 40px) scale(1.1); }
          66%       { transform: translate(30px, -60px) scale(0.9); }
        }
        @keyframes particle-float {
          0%   { transform: translateY(100vh) translateX(0px); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(-10vh) translateX(var(--dx)); opacity: 0; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes progress-fill {
          0%   { width: 0%; }
          20%  { width: 28%; }
          45%  { width: 55%; }
          70%  { width: 72%; }
          100% { width: 88%; }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(249,115,22,0.3), 0 0 60px rgba(249,115,22,0.1); }
          50%       { box-shadow: 0 0 40px rgba(249,115,22,0.6), 0 0 100px rgba(249,115,22,0.2), 0 0 140px rgba(249,115,22,0.08); }
        }
        @keyframes ring-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes counter-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes spark {
          0%   { transform: scale(0) rotate(0deg); opacity: 1; }
          100% { transform: scale(1.4) rotate(180deg); opacity: 0; }
        }

        .maintenance-root {
          min-height: 100vh;
          background: #060b14;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #fff;
          overflow: hidden;
          position: relative;
        }

        /* Background orbs */
        .orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }
        .orb-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%);
          top: -200px; right: -200px;
          animation: orb-drift 18s ease-in-out infinite;
        }
        .orb-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(251,146,60,0.12) 0%, transparent 70%);
          bottom: -150px; left: -150px;
          animation: orb-drift-2 22s ease-in-out infinite;
        }
        .orb-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(234,88,12,0.1) 0%, transparent 70%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation: orb-drift 28s ease-in-out infinite reverse;
        }

        /* Grid overlay */
        .grid-overlay {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(249,115,22,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249,115,22,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          z-index: 0;
          pointer-events: none;
        }

        /* Particles */
        .particle {
          position: fixed;
          width: 2px; height: 2px;
          border-radius: 50%;
          background: #f97316;
          z-index: 0;
          pointer-events: none;
          animation: particle-float linear infinite;
        }

        .card {
          position: relative;
          z-index: 1;
          max-width: 560px;
          width: 100%;
          text-align: center;
          animation: fade-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        /* Icon area */
        .icon-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100px; height: 100px;
          margin-bottom: 2rem;
          animation: float 6s ease-in-out infinite;
        }
        .icon-bg {
          position: absolute;
          inset: 0;
          border-radius: 28px;
          background: linear-gradient(135deg, rgba(249,115,22,0.15), rgba(234,88,12,0.08));
          border: 1px solid rgba(249,115,22,0.35);
          animation: glow-pulse 3s ease-in-out infinite;
        }
        .icon-ring {
          position: absolute;
          inset: -16px;
          border-radius: 50%;
          border: 1.5px dashed rgba(249,115,22,0.25);
          animation: ring-spin 12s linear infinite;
        }
        .icon-ring-2 {
          position: absolute;
          inset: -32px;
          border-radius: 50%;
          border: 1px solid rgba(249,115,22,0.1);
          animation: counter-spin 20s linear infinite;
        }
        .icon-ring-dot {
          position: absolute;
          width: 6px; height: 6px;
          background: #f97316;
          border-radius: 50%;
          top: -3px; left: 50%;
          transform: translateX(-50%);
          box-shadow: 0 0 8px #f97316;
        }
        .icon-pulse {
          position: absolute;
          inset: 0;
          border-radius: 28px;
          background: rgba(249,115,22,0.15);
          animation: spark 2.5s ease-out infinite;
        }

        /* Status badge */
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1.1rem;
          border-radius: 99px;
          background: rgba(249,115,22,0.08);
          border: 1px solid rgba(249,115,22,0.3);
          font-size: 0.68rem;
          font-weight: 700;
          color: #fb923c;
          margin-bottom: 1.5rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          backdrop-filter: blur(8px);
        }
        .badge-dot {
          position: relative;
          width: 8px; height: 8px;
        }
        .badge-dot::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: #f97316;
          animation: pulse-dot 1.5s ease-in-out infinite;
        }
        .badge-dot::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: #f97316;
          animation: pulse-ring 1.5s ease-out infinite;
        }

        /* Brand */
        .brand {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #f97316;
          margin-bottom: 0.6rem;
          opacity: 0.8;
        }

        /* Title */
        .title {
          font-size: clamp(2rem, 5vw, 2.8rem);
          font-weight: 900;
          line-height: 1.15;
          margin-bottom: 1.25rem;
          background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .title span {
          background: linear-gradient(90deg, #f97316, #fb923c, #fdba74, #f97316);
          background-size: 400px auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }

        /* Description */
        .desc {
          color: #64748b;
          font-size: 0.95rem;
          line-height: 1.8;
          margin-bottom: 2.5rem;
          max-width: 420px;
          margin-left: auto;
          margin-right: auto;
        }

        /* Progress bar */
        .progress-section {
          margin-bottom: 2.5rem;
        }
        .progress-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.6rem;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #475569;
        }
        .progress-label span:last-child {
          color: #f97316;
        }
        .progress-track {
          height: 4px;
          background: rgba(255,255,255,0.05);
          border-radius: 99px;
          overflow: hidden;
          position: relative;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #ea580c, #f97316, #fb923c);
          border-radius: 99px;
          animation: progress-fill 8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          box-shadow: 0 0 12px rgba(249,115,22,0.5);
          position: relative;
        }
        .progress-fill::after {
          content: '';
          position: absolute;
          right: 0; top: 0; bottom: 0;
          width: 40px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4));
          border-radius: 99px;
        }

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(249,115,22,0.2), transparent);
        }
        .divider-text {
          font-size: 0.65rem;
          color: #334155;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        /* Contact */
        .contact-link {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.7rem 1.5rem;
          border-radius: 12px;
          background: rgba(249,115,22,0.06);
          border: 1px solid rgba(249,115,22,0.2);
          color: #f97316;
          font-weight: 600;
          font-size: 0.875rem;
          text-decoration: none;
          transition: all 0.25s ease;
          backdrop-filter: blur(4px);
        }
        .contact-link:hover {
          background: rgba(249,115,22,0.12);
          border-color: rgba(249,115,22,0.4);
          box-shadow: 0 0 24px rgba(249,115,22,0.15);
          transform: translateY(-1px);
        }

        /* Floating sparks */
        .spark {
          position: fixed;
          pointer-events: none;
          z-index: 0;
          width: 3px; height: 3px;
          border-radius: 50%;
          background: #f97316;
          box-shadow: 0 0 6px #f97316;
        }
      `}</style>

      <div className="maintenance-root">
        {/* Background */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-overlay" />

        {/* Floating particles */}
        {[
          { left: "10%", delay: "0s",  dur: "12s", dx: "30px",  size: "2px" },
          { left: "25%", delay: "2s",  dur: "16s", dx: "-40px", size: "1.5px" },
          { left: "40%", delay: "5s",  dur: "10s", dx: "20px",  size: "2.5px" },
          { left: "60%", delay: "1s",  dur: "14s", dx: "-30px", size: "2px" },
          { left: "75%", delay: "7s",  dur: "11s", dx: "50px",  size: "1.5px" },
          { left: "88%", delay: "3s",  dur: "18s", dx: "-20px", size: "2px" },
          { left: "50%", delay: "9s",  dur: "13s", dx: "35px",  size: "1px" },
          { left: "15%", delay: "11s", dur: "15s", dx: "-15px", size: "2px" },
        ].map((p, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: p.left,
              bottom: 0,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              animationDuration: p.dur,
              "--dx": p.dx,
              opacity: 0,
            } as React.CSSProperties}
          />
        ))}

        <div className="card">
          {/* Icon */}
          <div className="icon-wrapper">
            <div className="icon-pulse" />
            <div className="icon-bg" />
            <div className="icon-ring">
              <div className="icon-ring-dot" />
            </div>
            <div className="icon-ring-2" />
            <svg width="44" height="44" fill="none" stroke="#f97316" strokeWidth={1.5} viewBox="0 0 24 24" style={{ position: "relative", zIndex: 1 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
            </svg>
          </div>

          {/* Badge */}
          <div>
            <span className="badge">
              <span className="badge-dot" />
              Maintenance en cours
            </span>
          </div>

          {/* Brand */}
          <p className="brand">ElectroShop-Tech</p>

          {/* Title */}
          <h1 className="title">
            Site en cours de<br />
            <span>maintenance</span>
          </h1>

          {/* Description */}
          <p className="desc">
            Nous effectuons des améliorations pour vous offrir une meilleure expérience.
            Nous serons de retour très bientôt — merci pour votre patience.
          </p>

          {/* Progress */}
          <div className="progress-section">
            <div className="progress-label">
              <span>Progression</span>
              <span>Bientôt prêt ✦</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" />
            </div>
          </div>

          {/* Divider */}
          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">Nous contacter</span>
            <div className="divider-line" />
          </div>

          {/* Contact */}
          <a href="mailto:contact.electrotetch@gmail.com" className="contact-link">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            contact.electrotetch@gmail.com
          </a>
        </div>
      </div>
    </>
  );
}
