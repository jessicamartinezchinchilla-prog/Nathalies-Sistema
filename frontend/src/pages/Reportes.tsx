import { useState, useEffect } from "react";
import { Card, SectionHeader, Button } from "../components/ui";

const tabs = ["Estado de resultados", "Ventas", "Compras", "Inventario", "Cuentas por pagar"] as const;

// Mapeo de meses a fechas reales
const meses: Record<string, { inicio: string; fin: string; label: string }> = {
  "septiembre-2026": { inicio: "2026-09-01", fin: "2026-09-30", label: "Septiembre 2026" },
  "agosto-2026": { inicio: "2026-08-01", fin: "2026-08-31", label: "Agosto 2026" },
  "julio-2026": { inicio: "2026-07-01", fin: "2026-07-31", label: "Julio 2026" },
  "octubre-2026": { inicio: "2026-10-01", fin: "2026-10-31", label: "Octubre 2026" },
};

export default function Reportes() {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("Estado de resultados");
  const [periodo, setPeriodo] = useState("septiembre-2026");
  const [showExport, setShowExport] = useState(false);
  
  // Estados para los datos reales del backend
  const [datos, setDatos] = useState({
    venta_productos: 0,
    ingreso_servicios: 0,
    total_ingresos: 0,
    costo_ventas: 0,
    utilidad_bruta: 0,
    alquiler: 0,
    servicios_basicos: 0,
    total_gastos: 0,
    utilidad_neta: 0,
  });
  const [loading, setLoading] = useState(false);

  // Cargar datos cuando cambie el periodo
  useEffect(() => {
    const cargarDatos = async () => {
      const fechas = meses[periodo];
      if (!fechas) return;

      setLoading(true);
      try {
        const url = `http://localhost:8000/api/reportes/estado-resultados.php?fecha_inicio=${fechas.inicio}&fecha_fin=${fechas.fin}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.success) {
          setDatos({
            venta_productos: data.totales.venta_productos || 0,
            ingreso_servicios: data.totales.ingreso_servicios || 0,
            total_ingresos: data.totales.ingresos || 0,
            costo_ventas: data.totales.costo_ventas || 0,
            utilidad_bruta: data.totales.utilidad_bruta || 0,
            alquiler: data.totales.alquiler || 0,
            servicios_basicos: data.totales.servicios_basicos || 0,
            total_gastos: data.totales.gastos || 0,
            utilidad_neta: data.totales.utilidad || 0,
          });
        }
      } catch (error) {
        console.error("Error cargando reportes:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [periodo]);

  // Función para exportar a PDF
  const exportarPDF = () => {
    const fechas = meses[periodo];
    if (!fechas) return;
    const url = `http://localhost:8000/api/reportes/exportar-pdf.php?fecha_inicio=${fechas.inicio}&fecha_fin=${fechas.fin}`;
    window.open(url, "_blank");
    setShowExport(false);
  };

  // ✅ FUNCIÓN CORREGIDA: Exporta a Excel (CSV) sin instalar nada, formato tabla limpia
  const exportarExcel = () => {
    const fechas = meses[periodo];
    if (!fechas) return;

    // 1. Armamos los datos en filas (Array de Arrays)
    const filas = [
      ["CONCEPTO", "MONTO"],
      ["", ""],
      ["INGRESOS", ""],
      ["Venta de productos", datos.venta_productos.toFixed(2)],
      ["Ingresos por servicios", datos.ingreso_servicios.toFixed(2)],
      ["Total ingresos", datos.total_ingresos.toFixed(2)],
      ["", ""],
      ["COSTO DE VENTAS", ""],
      ["Costo de productos vendidos", datos.costo_ventas.toFixed(2)],
      ["Utilidad bruta", datos.utilidad_bruta.toFixed(2)],
      ["", ""],
      ["GASTOS OPERATIVOS", ""],
      ["Alquiler", datos.alquiler.toFixed(2)],
      ["Servicios básicos", datos.servicios_basicos.toFixed(2)],
      ["Total gastos", datos.total_gastos.toFixed(2)],
      ["", ""],
      ["UTILIDAD NETA DEL PERIODO", datos.utilidad_neta.toFixed(2)]
    ];

    // 2. Convertimos el array a texto separado por comas (formato CSV)
    const contenidoCSV = filas.map(fila => fila.join(",")).join("\n");

    // 3. Creamos el archivo en memoria (\uFEFF es para que Excel reconozca tildes y ñ)
    const blob = new Blob(["\uFEFF" + contenidoCSV], { type: "text/csv;charset=utf-8;" });
    
    // 4. Forzamos la descarga en el navegador
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Estado_Resultados_${periodo}.csv`); // Excel abre esto como tabla automáticamente
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowExport(false);
  };

  // Formatear números como moneda
  const formatMoney = (amount: number) => {
    return `$ ${amount.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

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
              {Object.entries(meses).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
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
                    onClick={exportarPDF}
                    style={{ width: "100%", textAlign: "left", padding: "12px 16px", background: "transparent", border: "none", color: "var(--foreground)", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--muted)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    📄 Guardar como PDF
                  </button>
                  <button
                    onClick={exportarExcel}
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
                Estado de Resultados — {meses[periodo]?.label || periodo}
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--muted-foreground)" }}>Nathalie's Nails & Lashes</p>
            </div>

            <div style={{ padding: "24px" }}>
              {loading ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--muted-foreground)" }}>
                  Cargando datos...
                </div>
              ) : (
                <>
                  {/* Ingresos */}
                  <div style={{ marginBottom: "24px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "bold", color: "var(--success)", letterSpacing: "1px", marginBottom: "8px" }}>INGRESOS</div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0 6px 16px", fontSize: "14px" }}>
                      <span>Venta de productos</span>
                      <span style={{ fontFamily: "'DM Mono', monospace" }}>{formatMoney(datos.venta_productos)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0 6px 16px", fontSize: "14px" }}>
                      <span>Ingresos por servicios</span>
                      <span style={{ fontFamily: "'DM Mono', monospace" }}>{formatMoney(datos.ingreso_servicios)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", marginTop: "8px", borderTop: "1px solid var(--border)", fontWeight: "bold" }}>
                      <span>Total ingresos</span>
                      <span style={{ fontFamily: "'DM Mono', monospace", color: "var(--success)" }}>{formatMoney(datos.total_ingresos)}</span>
                    </div>
                  </div>

                  {/* Costos */}
                  <div style={{ marginBottom: "24px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "bold", color: "var(--warning)", letterSpacing: "1px", marginBottom: "8px" }}>COSTO DE VENTAS</div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0 6px 16px", fontSize: "14px" }}>
                      <span>Costo de productos vendidos</span>
                      <span style={{ fontFamily: "'DM Mono', monospace" }}>{formatMoney(datos.costo_ventas)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", marginTop: "8px", borderTop: "1px solid var(--border)", fontWeight: "bold" }}>
                      <span>Utilidad bruta</span>
                      <span style={{ fontFamily: "'DM Mono', monospace" }}>{formatMoney(datos.utilidad_bruta)}</span>
                    </div>
                  </div>

                  {/* Gastos */}
                  <div style={{ marginBottom: "24px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "bold", color: "var(--danger)", letterSpacing: "1px", marginBottom: "8px" }}>GASTOS OPERATIVOS</div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0 6px 16px", fontSize: "14px" }}>
                      <span>Alquiler</span>
                      <span style={{ fontFamily: "'DM Mono', monospace" }}>{formatMoney(datos.alquiler)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0 6px 16px", fontSize: "14px" }}>
                      <span>Servicios básicos</span>
                      <span style={{ fontFamily: "'DM Mono', monospace" }}>{formatMoney(datos.servicios_basicos)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", marginTop: "8px", borderTop: "1px solid var(--border)", fontWeight: "bold" }}>
                      <span>Total gastos</span>
                      <span style={{ fontFamily: "'DM Mono', monospace", color: "var(--danger)" }}>{formatMoney(datos.total_gastos)}</span>
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
                      <div style={{ fontSize: "12px", color: "var(--muted-foreground)", marginTop: "4px" }}>
                        {meses[periodo]?.label || periodo}
                      </div>
                    </div>
                    <div style={{ fontSize: "24px", fontWeight: "bold", color: datos.utilidad_neta >= 0 ? "var(--success)" : "var(--danger)", fontFamily: "'DM Serif Display', serif" }}>
                      {formatMoney(datos.utilidad_neta)}
                    </div>
                  </div>
                </>
              )}
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