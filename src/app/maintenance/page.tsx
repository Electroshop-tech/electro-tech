export default function MaintenancePage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0f1a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
      color: "#fff",
    }}>
      <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
        {/* Icon */}
        <div style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 80, height: 80,
          background: "rgba(249,115,22,0.1)",
          border: "1px solid rgba(249,115,22,0.3)",
          borderRadius: 24, marginBottom: "1.5rem",
        }}>
          <svg width="40" height="40" fill="none" stroke="#f97316" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
          </svg>
        </div>

        {/* Status badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "0.5rem",
          padding: "0.375rem 1rem", borderRadius: 99,
          background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)",
          fontSize: "0.7rem", fontWeight: 700, color: "#fb923c",
          marginBottom: "1.25rem", letterSpacing: "0.08em", textTransform: "uppercase" as const,
        }}>
          <span style={{
            display: "inline-block", width: 8, height: 8, borderRadius: "50%",
            background: "#f97316", animation: "none", opacity: 1,
          }} />
          Maintenance en cours
        </div>

        {/* Brand */}
        <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#f97316", marginBottom: "0.4rem" }}>
          ElectroShop-Tech
        </p>

        {/* Title */}
        <h1 style={{ fontSize: "2rem", fontWeight: 900, lineHeight: 1.2, marginBottom: "1rem" }}>
          Site en cours de<br />maintenance
        </h1>

        {/* Description */}
        <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "2rem" }}>
          Nous effectuons des améliorations pour vous offrir une meilleure expérience.
          Nous serons de retour très bientôt — merci pour votre patience.
        </p>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          <span style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>Nous contacter</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* Contact */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#64748b" }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          <a href="mailto:contact.electrotetch@gmail.com" style={{ color: "#f97316", fontWeight: 600, textDecoration: "none" }}>
            contact.electrotetch@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
