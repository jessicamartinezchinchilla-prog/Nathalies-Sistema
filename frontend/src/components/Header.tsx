type Props = { title: string; subtitle?: string };

export default function Header({ title, subtitle }: Props) {
  return (
    <header style={{ height: "64px", background: "var(--card)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", flexShrink: 0 }}>
      <div>
        <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--foreground)", margin: 0, fontFamily: "'DM Serif Display', serif" }}>{title}</h2>
        {subtitle && <p style={{ fontSize: "12px", color: "var(--muted-foreground)", margin: "2px 0 0" }}>{subtitle}</p>}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <button style={{ width: "36px", height: "36px", borderRadius: "8px", background: "var(--muted)", border: "none", color: "var(--muted-foreground)", fontSize: "16px", cursor: "pointer", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          🔔
          <span style={{ position: "absolute", top: "8px", right: "10px", width: "6px", height: "6px", background: "var(--danger)", borderRadius: "50%", border: "2px solid var(--card)" }} />
        </button>
        <div style={{ textAlign: "right", fontSize: "12px", color: "var(--muted-foreground)", lineHeight: 1.4 }}>
          <div style={{ color: "var(--foreground)", fontWeight: 500 }}>{new Date().toLocaleDateString("es-GT", { weekday: "short", day: "numeric", month: "short" })}</div>
          <div>{new Date().toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" })}</div>
        </div>
      </div>
    </header>
  );
}