import { type ReactNode } from "react";

// --- Botón ---
export function Button({ children, onClick, variant = "primary", size = "md", disabled, type = "button", className = "" }: any) {
  const bg = variant === "primary" ? "#B5738A" : variant === "danger" ? "#EF4444" : "#F3F4F6";
  const color = variant === "secondary" || variant === "ghost" ? "#111827" : "#fff";
  const padding = size === "sm" ? "6px 12px" : size === "lg" ? "12px 24px" : "8px 16px";
  const fontSize = size === "sm" ? "12px" : size === "lg" ? "16px" : "14px";

  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled} 
      className={className}
      style={{ 
        background: bg, color, padding, fontSize, borderRadius: "8px", border: "none", 
        fontWeight: 500, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1,
        transition: "all 0.2s", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px",
        boxShadow: variant === "primary" ? "0 2px 4px rgba(181,115,138,0.3)" : "none"
      }}
      onMouseEnter={(e) => { if (!disabled && variant === "primary") e.currentTarget.style.background = "#9d5f73"; }}
      onMouseLeave={(e) => { if (!disabled && variant === "primary") e.currentTarget.style.background = bg; }}
    >
      {children}
    </button>
  );
}

// --- Tarjeta (Card) ---
export function Card({ children, className = "", onClick }: any) {
  return (
    <div onClick={onClick} className={className} style={{ 
      background: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", 
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden", width: "100%"
    }}>
      {children}
    </div>
  );
}

// --- Etiqueta (Badge) ---
export function Badge({ children, variant = "default" }: any) {
  const styles: any = {
    default: { bg: "#F3F4F6", color: "#111827" },
    success: { bg: "rgba(16,185,129,0.1)", color: "#10B981" },
    warning: { bg: "rgba(245,158,11,0.1)", color: "#F59E0B" },
    danger: { bg: "rgba(239,68,68,0.1)", color: "#EF4444" },
    muted: { bg: "#F3F4F6", color: "#6B7280" },
  };
  const s = styles[variant] || styles.default;
  return (
    <span style={{ background: s.bg, color: s.color, padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600 }}>
      {children}
    </span>
  );
}

// --- Input ---
export function Input({ label, value, onChange, type = "text", placeholder, required }: any) {
  return (
    <div style={{ width: "100%", marginBottom: "12px" }}>
      {label && <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "6px", color: "#111827" }}>{label} {required && <span style={{ color: "#EF4444" }}>*</span>}</label>}
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#F9FAFB", color: "#111827", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
        onFocus={(e) => (e.target.style.borderColor = "#B5738A")}
        onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
      />
    </div>
  );
}

// --- Select ---
export function Select({ label, value, onChange, options, required }: any) {
  return (
    <div style={{ width: "100%", marginBottom: "12px" }}>
      {label && <label style={{ display: "block", fontSize: "12px", fontWeight: 500, marginBottom: "6px", color: "#111827" }}>{label} {required && <span style={{ color: "#EF4444" }}>*</span>}</label>}
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#F9FAFB", color: "#111827", fontSize: "14px", outline: "none", boxSizing: "border-box" }}>
        {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}

// --- Encabezado de Sección ---
export function SectionHeader({ title, sub, actions }: any) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#111827", fontFamily: "'DM Serif Display', serif", margin: 0 }}>{title}</h1>
        {sub && <p style={{ fontSize: "14px", color: "#6B7280", marginTop: "4px", marginBottom: 0 }}>{sub}</p>}
      </div>
      {actions && <div style={{ display: "flex", gap: "8px" }}>{actions}</div>}
    </div>
  );
}

// --- Barra de Búsqueda ---
export function SearchBar({ value, onChange, placeholder }: any) {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "300px" }}>
      <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6B7280", fontSize: "14px" }}>🔍</span>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#F9FAFB", color: "#111827", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
      />
    </div>
  );
}

// --- Tabla ---
export function Table({ headers, children }: any) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
        <thead>
          <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
            {headers.map((h: string, i: number) => <th key={i} style={{ padding: "12px 20px", fontSize: "11px", color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  );
}

export function TR({ children, onClick }: any) {
  return (
    <tr onClick={onClick} style={{ borderBottom: "1px solid #E5E7EB", cursor: onClick ? "pointer" : "default", transition: "background 0.15s" }}
        onMouseEnter={(e) => { if(onClick) e.currentTarget.style.background = "#F9FAFB"; }}
        onMouseLeave={(e) => { if(onClick) e.currentTarget.style.background = "transparent"; }}>
      {children}
    </tr>
  );
}

export function TD({ children, mono, className = "" }: any) {
  return (
    <td className={className} style={{ padding: "14px 20px", color: "#111827", fontFamily: mono ? "'DM Mono', monospace" : "inherit", fontSize: mono ? "13px" : "14px" }}>
      {children}
    </td>
  );
}

// --- Modal ---
export function Modal({ title, children, onClose }: any) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
      <div style={{ background: "#FFFFFF", borderRadius: "12px", width: "100%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #E5E7EB" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 600, margin: 0, fontFamily: "'DM Serif Display', serif" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "24px", color: "#6B7280", cursor: "pointer", lineHeight: 1 }}>&times;</button>
        </div>
        <div style={{ padding: "24px" }}>{children}</div>
      </div>
    </div>
  );
}

// --- Tarjeta de Estadística ---
export function StatCard({ label, value, sub, color }: any) {
  return (
    <Card className="p-5">
      <div style={{ padding: "20px" }}>
        <div style={{ fontSize: "12px", fontWeight: 500, color: "#6B7280", marginBottom: "8px" }}>{label}</div>
        <div style={{ fontSize: "24px", fontWeight: "bold", color: color, fontFamily: "'DM Serif Display', serif", marginBottom: "4px" }}>{value}</div>
        {sub && <div style={{ fontSize: "12px", color: "#6B7280" }}>{sub}</div>}
      </div>
    </Card>
  );
}