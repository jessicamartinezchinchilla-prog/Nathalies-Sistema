import { useState } from "react";

type NavItem = {
  id: string;
  label: string;
  icon: string;
  children?: { id: string; label: string }[];
};

const nav: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "" },
  {
    id: "ventas", label: "Ventas", icon: "",
    children: [{ id: "nueva-venta", label: "Nueva venta" }, { id: "historial-ventas", label: "Historial" }, { id: "cierre-caja", label: "Cierre de caja" }],
  },
  {
    id: "inventario-op", label: "Inventario y Operaciones", icon: "",
    children: [{ id: "productos", label: "Productos" }, { id: "insumos", label: "Insumos" }, { id: "servicios", label: "Servicios" },],
  },
  { id: "compras", label: "Compras", icon: "" },
  { id: "proveedores", label: "Proveedores", icon: "" },
  { id: "cuentas-pagar", label: "Cuentas por pagar", icon: "" },
  { id: "gastos", label: "Gastos", icon: "" },
  { id: "contabilidad", label: "Contabilidad", icon: "" },
  { id: "reportes", label: "Reportes", icon: "" },
  {
    id: "config-group", label: "Configuración", icon: "",
    children: [{ id: "usuarios", label: "Usuarios" }, { id: "configuracion", label: "General" }],
  },
];

type Props = { current: string; onNavigate: (id: string) => void };

export default function Sidebar({ current, onNavigate }: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>({ "inventario-op": true });
  const toggle = (id: string) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  const isActive = (item: NavItem) => item.id === current || item.children?.some((c) => c.id === current);

  return (
    <aside style={{ width: "260px", background: "#190C30", height: "100vh", display: "flex", flexDirection: "column", color: "#A0A0B0", flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "36px", height: "36px", background: "#B5738A", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: "18px", fontFamily: "'DM Serif Display', serif" }}>N</div>
        <div>
          <div style={{ color: "#fff", fontWeight: 600, fontSize: "15px", lineHeight: 1.2 }}>Nathalie's</div>
          <div style={{ fontSize: "11px", opacity: 0.6 }}>Nails & Lashes</div>
        </div>
      </div>

      {/* Menú */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "16px 12px" }}>
        {nav.map((item) => {
          const active = isActive(item);
          const expanded = open[item.id] ?? active;
          const hasChildren = !!item.children?.length;

          return (
            <div key={item.id} style={{ marginBottom: "4px" }}>
              <button
                onClick={() => { if (hasChildren) { toggle(item.id); if (!expanded && item.children) onNavigate(item.children[0].id); } else { onNavigate(item.id); } }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "8px",
                  background: active && !hasChildren ? "rgba(181, 115, 138, 0.1)" : "transparent",
                  color: active ? "#fff" : "#A0A0B0", fontWeight: active ? 500 : 400,
                  border: "none", cursor: "pointer", textAlign: "left", fontSize: "13px", transition: "all 0.2s"
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#2B2B40"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ flex: 1 }}>{item.label}</span>
                {hasChildren && <span style={{ fontSize: "10px", transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>▶</span>}
              </button>

              {hasChildren && expanded && (
                <div style={{ marginLeft: "20px", paddingLeft: "12px", borderLeft: "1px solid rgba(255,255,255,0.05)", marginTop: "4px", marginBottom: "4px" }}>
                  {item.children!.map((child) => (
                    <button
                      key={child.id} onClick={() => onNavigate(child.id)}
                      style={{
                        width: "100%", textAlign: "left", padding: "8px 12px", borderRadius: "6px", fontSize: "12px",
                        background: current === child.id ? "rgba(181, 115, 138, 0.1)" : "transparent",
                        color: current === child.id ? "#fff" : "#A0A0B0", fontWeight: current === child.id ? 500 : 400,
                        border: "none", cursor: "pointer", marginBottom: "2px", transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => { if (current !== child.id) e.currentTarget.style.background = "#2B2B40"; }}
                      onMouseLeave={(e) => { if (current !== child.id) e.currentTarget.style.background = "transparent"; }}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Usuario Footer */}
      <div style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "32px", height: "32px", background: "#B5738A", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px", fontWeight: 600 }}>A</div>
        <div style={{ overflow: "hidden" }}>
          <div style={{ color: "#fff", fontSize: "12px", fontWeight: 500, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>Administrador</div>
          <div style={{ fontSize: "11px", opacity: 0.5, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>admin@nathalies.com</div>
        </div>
      </div>
    </aside>
  );
}