import { Card, StatCard, Badge } from "../components/ui";

type Props = {
  onNavigate: (page: string) => void;
};

export default function Dashboard({ onNavigate }: Props) {
  const ultimasVentas = [
    { id: "V-0089", hora: "10:32", items: "Uñas acrílicas + Esmalte", total: "$ 32.00", metodo: "Efectivo" },
    { id: "V-0088", hora: "09:15", items: "Pedicure clásico", total: "$ 25.00", metodo: "Transferencia" },
    { id: "V-0087", hora: "08:50", items: "Manicure + Lifting", total: "$ 55.00", metodo: "Efectivo" },
  ];

  const stockBajo = [
    { nombre: "Esmalte UV Nude #3", actual: 2, minimo: 5 },
    { nombre: "Gel acrílico transparente", actual: 1, minimo: 3 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Fila 1: KPIs principales */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        <StatCard label="Ventas del día" value="$ 1,240" sub="↑ 18% vs ayer" color="var(--primary)" />
        <StatCard label="Ventas del mes" value="$ 18,450" sub="Septiembre 2025" color="var(--foreground)" />
        <StatCard label="Gastos del mes" value="$ 6,280" sub="3 categorías" color="var(--warning)" />
        <StatCard label="Utilidad del mes" value="$ 12,170" sub="Margen: 66%" color="var(--success)" />
      </div>

      {/* Fila 2: Caja del día y Alertas */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
        
        {/* Caja del día */}
        <Card>
          <div style={{ padding: "20px", borderBottom: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0, fontFamily: "'DM Serif Display', serif" }}>Caja del día</h3>
          </div>
          <div style={{ padding: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "16px" }}>
              <div>
                <div style={{ fontSize: "12px", color: "var(--muted-foreground)", marginBottom: "4px" }}>Total del día</div>
                <div style={{ fontSize: "20px", fontWeight: "bold", color: "var(--foreground)", fontFamily: "'DM Serif Display', serif" }}>$ 1,240</div>
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "var(--muted-foreground)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary)" }} /> Efectivo
                </div>
                <div style={{ fontSize: "18px", fontWeight: "bold", color: "var(--primary)", fontFamily: "'DM Mono', monospace" }}>$ 840</div>
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "var(--muted-foreground)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4E63C8" }} /> Transferencia
                </div>
                <div style={{ fontSize: "18px", fontWeight: "bold", color: "#4E63C8", fontFamily: "'DM Mono', monospace" }}>$ 400</div>
              </div>
            </div>
            {/* Barra visual */}
            <div style={{ width: "100%", height: "8px", borderRadius: "4px", background: "var(--muted)", display: "flex", overflow: "hidden" }}>
              <div style={{ width: "67%", background: "var(--primary)" }} />
              <div style={{ width: "33%", background: "#4E63C8" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--muted-foreground)", marginTop: "4px" }}>
              <span>67% Efectivo</span>
              <span>33% Transferencia</span>
            </div>
          </div>
        </Card>

        {/* Alertas Clickeables */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Card onClick={() => onNavigate("cuentas-pagar")} style={{ cursor: "pointer", border: "1px solid rgba(196,126,26,0.3)" }}>
            <div style={{ padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>Cuentas por pagar</h4>
                <Badge variant="warning">2 pendientes</Badge>
              </div>
              <div style={{ fontSize: "20px", fontWeight: "bold", color: "var(--warning)", fontFamily: "'DM Serif Display', serif" }}>$ 1,640</div>
              <div style={{ fontSize: "11px", color: "var(--primary)", marginTop: "8px", fontWeight: 500 }}>Ver cuentas →</div>
            </div>
          </Card>

          <Card onClick={() => onNavigate("insumos")} style={{ cursor: "pointer", border: "1px solid rgba(184,64,64,0.2)" }}>
            <div style={{ padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>Stock bajo</h4>
                <Badge variant="danger">{stockBajo.length}</Badge>
              </div>
              {stockBajo.map((p) => (
                <div key={p.nombre} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
                  <span>{p.nombre}</span>
                  <span style={{ color: "var(--danger)", fontWeight: 600 }}>{p.actual}/{p.minimo}</span>
                </div>
              ))}
              <div style={{ fontSize: "11px", color: "var(--primary)", marginTop: "8px", fontWeight: 500 }}>Ver insumos →</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Fila 3: Últimas ventas */}
      <Card>
        <div style={{ padding: "20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0, fontFamily: "'DM Serif Display', serif" }}>Últimas ventas</h3>
          <button onClick={() => onNavigate("historial-ventas")} style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "12px", cursor: "pointer", fontWeight: 500 }}>
            Ver todas →
          </button>
        </div>
        <div>
          {ultimasVentas.map((v) => (
            <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ fontSize: "12px", fontFamily: "'DM Mono', monospace", color: "var(--primary)", fontWeight: 500 }}>{v.id}</div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 500 }}>{v.items}</div>
                  <div style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>{v.hora} · {v.metodo}</div>
                </div>
              </div>
              <div style={{ fontSize: "14px", fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>{v.total}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}