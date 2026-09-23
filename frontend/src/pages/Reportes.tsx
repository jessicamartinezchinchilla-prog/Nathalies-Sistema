import { useState } from "react";
import { Card, SectionHeader, Button } from "../components/ui";

const tabs = ["Estado de resultados", "Ventas", "Compras", "Inventario", "Cuentas por pagar"] as const;

export default function Reportes() {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("Estado de resultados");
  const [periodo, setPeriodo] = useState("septiembre-2026");
  const [showExport, setShowExport] = useState(false);

  return (
    <div>
      <SectionHeader
        title="Reportes"
        sub="Información financiera y operativa del negocio"
        actions={
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <select 
              value={periodo} 
              onChange={(e) => setPeriodo(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)", fontSize: "13px", outline: "none" }}
            >
              <option value="septiembre-2026">Septiembre 2026</option>
              <option value="agosto-2026">Agosto 2026</option>
              <option value="julio-2026">Julio 2026</option>
            </select>

            {/* Botón con menú desplegable */}
            <div style={{ position: "relative" }}>
              <Button variant="secondary" onClick={() => setShowExport(!showExport)}>
                ⬇ Exportar
              </Button>

              {showExport && (
                <div style={{ 
                  position: "absolute", right: 0, top: "100%", marginTop: "8px", width: "180px", 
                  background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", 
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", zIndex: 10, overflow: "hidden" 
                }}>
                  <button
                    onClick={() => { alert("Generando PDF..."); setShowExport(false); }}
                    style={{ width: "100%", textAlign: "left", padding: "12px 16px", background: "transparent", border: "none", color: "var(--foreground)", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--muted)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    📄 Guardar como PDF
                  </button>
                  <button
                    onClick={() => { alert("Generando Excel..."); setShowExport(false); }}
                    style={{ width: "100%", textAlign: "left", padding: "12px 16px", background: "transparent", border: "none", color: "var(--foreground)", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", borderTop: "1px solid var(--border)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--muted)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    📊 Guardar como Excel
                  </button>
                </div>
              )}
            </div>
          </div>
        }
      />

      {/* Pestañas de navegación */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border)", marginBottom: "24px" }}>
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              padding: "10px 16px", fontSize: "14px", fontWeight: 500, border: "none", background: "transparent",
              color: activeTab === t ? "var(--primary)" : "var(--muted-foreground)",
              borderBottom: activeTab === t ? "2px solid var(--primary)" : "2px solid transparent",
              cursor: "pointer", marginBottom: "-1px"
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Contenido del Estado de Resultados */}
      {activeTab === "Estado de resultados" && (
        <div style={{ maxWidth: "800px" }}>
          <Card>
            <div style={{ padding: "24px", borderBottom: "1px solid var(--border)" }}>
              <h2 style={{ margin: 0, fontFamily: "'DM Serif Display', serif", fontSize: "20px" }}>
                Estado de Resultados — Septiembre 2026
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--muted-foreground)" }}>Nathalie's Nails & Lashes</p>
            </div>

            <div style={{ padding: "24px" }}>
              {/* Ingresos */}
              <div style={{ marginBottom: "24px" }}>
                <div style={{ fontSize: "11px", fontWeight: "bold", color: "var(--success)", letterSpacing: "1px", marginBottom: "8px" }}>INGRESOS</div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0 6px 16px", fontSize: "14px" }}>
                  <span>Venta de productos</span>
                  <span style={{ fontFamily: "'DM Mono', monospace" }}>$ 5,840.00</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0 6px 16px", fontSize: "14px" }}>
                  <span>Ingresos por servicios</span>
                  <span style={{ fontFamily: "'DM Mono', monospace" }}>$ 12,610.00</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", marginTop: "8px", borderTop: "1px solid var(--border)", fontWeight: "bold" }}>
                  <span>Total ingresos</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", color: "var(--success)" }}>$ 18,450.00</span>
                </div>
              </div>

              {/* Costos */}
              <div style={{ marginBottom: "24px" }}>
                <div style={{ fontSize: "11px", fontWeight: "bold", color: "var(--warning)", letterSpacing: "1px", marginBottom: "8px" }}>COSTO DE VENTAS</div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0 6px 16px", fontSize: "14px" }}>
                  <span>Costo de productos vendidos</span>
                  <span style={{ fontFamily: "'DM Mono', monospace" }}>$ 4,200.00</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", marginTop: "8px", borderTop: "1px solid var(--border)", fontWeight: "bold" }}>
                  <span>Utilidad bruta</span>
                  <span style={{ fontFamily: "'DM Mono', monospace" }}>$ 14,250.00</span>
                </div>
              </div>

              {/* Gastos */}
              <div style={{ marginBottom: "24px" }}>
                <div style={{ fontSize: "11px", fontWeight: "bold", color: "var(--danger)", letterSpacing: "1px", marginBottom: "8px" }}>GASTOS OPERATIVOS</div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0 6px 16px", fontSize: "14px" }}>
                  <span>Alquiler</span>
                  <span style={{ fontFamily: "'DM Mono', monospace" }}>$ 1,200.00</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0 6px 16px", fontSize: "14px" }}>
                  <span>Servicios básicos</span>
                  <span style={{ fontFamily: "'DM Mono', monospace" }}>$ 180.00</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", marginTop: "8px", borderTop: "1px solid var(--border)", fontWeight: "bold" }}>
                  <span>Total gastos</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", color: "var(--danger)" }}>$ 2,280.00</span>
                </div>
              </div>

              {/* Resultado Final */}
              <div style={{ 
                background: "rgba(61,139,101,0.08)", border: "1px solid rgba(61,139,101,0.2)", 
                borderRadius: "8px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" 
              }}>
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "16px", fontFamily: "'DM Serif Display', serif" }}>
                    Utilidad neta del período
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--muted-foreground)", marginTop: "4px" }}>Septiembre 2026</div>
                </div>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--success)", fontFamily: "'DM Serif Display', serif" }}>
                  $ 11,970.00
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Contenido para las demás pestañas (Placeholder) */}
      {activeTab !== "Estado de resultados" && (
        <Card style={{ padding: "60px", textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "16px", opacity: 0.3 }}>📊</div>
          <h3 style={{ margin: "0 0 8px", fontFamily: "'DM Serif Display', serif" }}>Reporte de {activeTab}</h3>
          <p style={{ color: "var(--muted-foreground)", fontSize: "14px", maxWidth: "400px", margin: "0 auto" }}>
            Selecciona un rango de fechas y aplica filtros para generar el reporte detallado de {activeTab.toLowerCase()}.
          </p>
        </Card>
      )}
    </div>
  );
}