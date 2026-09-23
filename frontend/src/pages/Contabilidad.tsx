import { useState } from "react";
import { Card, SectionHeader, Button, Badge } from "../components/ui";

export default function Contabilidad() {
  const [periodo, setPeriodo] = useState("Septiembre 2026");

  // Datos simulados del Estado de Resultados
  const datos = {
    ingresos: [
      { concepto: "Ventas de Servicios", monto: 12610.00 },
      { concepto: "Ventas de Productos (Retail)", monto: 5840.00 },
    ],
    costos: [
      { concepto: "Costo de Servicios (Insumos)", monto: 3200.00 },
      { concepto: "Costo de Productos Vendidos", monto: 2100.00 },
    ],
    gastos: [
      { concepto: "Alquiler del local", monto: 1200.00 },
      { concepto: "Servicios básicos (Luz, Agua, Internet)", monto: 225.00 },
      { concepto: "Marketing y Publicidad", monto: 250.00 },
      { concepto: "Mantenimiento y Reparaciones", monto: 150.00 },
      { concepto: "Otros gastos operativos", monto: 455.00 },
    ]
  };

  // Cálculos automáticos
  const totalIngresos = datos.ingresos.reduce((sum: any, item: any) => sum + item.monto, 0);
  const totalCostos = datos.costos.reduce((sum: any, item: any) => sum + item.monto, 0);
  const utilidadBruta = totalIngresos - totalCostos;
  const totalGastos = datos.gastos.reduce((sum: any, item: any) => sum + item.monto, 0);
  const utilidadNeta = utilidadBruta - totalGastos;
  const margenNeto = (utilidadNeta / totalIngresos) * 100;

  return (
    <div>
      <SectionHeader
        title="Contabilidad"
        sub="Estado de Resultados y situación financiera"
        actions={
          <select 
            value={periodo} 
            onChange={(e) => setPeriodo(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)", fontSize: "13px", outline: "none" }}
          >
            <option value="Septiembre 2026">Septiembre 2026</option>
            <option value="Agosto 2026">Agosto 2026</option>
            <option value="Julio 2026">Julio 2026</option>
          </select>
        }
      />

      {/* Tarjetas de Resumen Financiero */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <Card style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "var(--muted-foreground)", marginBottom: "8px" }}>Ingresos Totales</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--success)", fontFamily: "'DM Serif Display', serif" }}>
            ${totalIngresos.toLocaleString("en-US", {minimumFractionDigits: 2})}
          </div>
        </Card>
        <Card style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "var(--muted-foreground)", marginBottom: "8px" }}>Costos y Gastos</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--danger)", fontFamily: "'DM Serif Display', serif" }}>
            ${(totalCostos + totalGastos).toLocaleString("en-US", {minimumFractionDigits: 2})}
          </div>
        </Card>
        <Card style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "var(--muted-foreground)", marginBottom: "8px" }}>Utilidad Neta</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--primary)", fontFamily: "'DM Serif Display', serif" }}>
            ${utilidadNeta.toLocaleString("en-US", {minimumFractionDigits: 2})}
          </div>
        </Card>
        <Card style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "var(--muted-foreground)", marginBottom: "8px" }}>Margen de Ganancia</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--foreground)", fontFamily: "'DM Serif Display', serif" }}>
            {margenNeto.toFixed(1)}%
          </div>
        </Card>
      </div>

      {/* Reporte Detallado (Estado de Resultados) */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        
        {/* Tabla del Estado de Resultados */}
        <Card>
          <div style={{ padding: "20px", borderBottom: "1px solid var(--border)" }}>
            <h3 style={{ margin: 0, fontFamily: "'DM Serif Display', serif" }}>Estado de Resultados — {periodo}</h3>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--muted-foreground)" }}>Nathalie's Nails & Lashes</p>
          </div>
          
          <div style={{ padding: "20px" }}>
            {/* Ingresos */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "11px", fontWeight: "bold", color: "var(--success)", letterSpacing: "1px", marginBottom: "8px" }}>INGRESOS</div>
              {datos.ingresos.map((item: any, i: number) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "14px", paddingLeft: "16px" }}>
                  <span>{item.concepto}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace" }}>${item.monto.toLocaleString("en-US", {minimumFractionDigits: 2})}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", marginTop: "8px", borderTop: "1px solid var(--border)", fontWeight: "bold" }}>
                <span>Total Ingresos</span>
                <span style={{ fontFamily: "'DM Mono', monospace", color: "var(--success)" }}>${totalIngresos.toLocaleString("en-US", {minimumFractionDigits: 2})}</span>
              </div>
            </div>

            {/* Costos */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "11px", fontWeight: "bold", color: "var(--warning)", letterSpacing: "1px", marginBottom: "8px" }}>COSTOS DE VENTA</div>
              {datos.costos.map((item: any, i: number) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "14px", paddingLeft: "16px" }}>
                  <span>{item.concepto}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace" }}>${item.monto.toLocaleString("en-US", {minimumFractionDigits: 2})}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", marginTop: "8px", borderTop: "1px solid var(--border)", fontWeight: "bold" }}>
                <span>Utilidad Bruta</span>
                <span style={{ fontFamily: "'DM Mono', monospace" }}>${utilidadBruta.toLocaleString("en-US", {minimumFractionDigits: 2})}</span>
              </div>
            </div>

            {/* Gastos */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "11px", fontWeight: "bold", color: "var(--danger)", letterSpacing: "1px", marginBottom: "8px" }}>GASTOS OPERATIVOS</div>
              {datos.gastos.map((item: any, i: number) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "14px", paddingLeft: "16px" }}>
                  <span>{item.concepto}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace" }}>${item.monto.toLocaleString("en-US", {minimumFractionDigits: 2})}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", marginTop: "8px", borderTop: "1px solid var(--border)", fontWeight: "bold" }}>
                <span>Total Gastos</span>
                <span style={{ fontFamily: "'DM Mono', monospace", color: "var(--danger)" }}>${totalGastos.toLocaleString("en-US", {minimumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Panel Lateral de Acciones */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Card style={{ padding: "24px", textAlign: "center", background: "rgba(61,139,101,0.05)", border: "1px solid rgba(61,139,101,0.2)" }}>
            <div style={{ fontSize: "12px", color: "var(--muted-foreground)", marginBottom: "8px" }}>UTILIDAD NETA DEL PERIODO</div>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "var(--success)", fontFamily: "'DM Serif Display', serif", marginBottom: "4px" }}>
              ${utilidadNeta.toLocaleString("en-US", {minimumFractionDigits: 2})}
            </div>
            <Badge variant="success">Ganancia</Badge>
          </Card>

          <Card style={{ padding: "20px" }}>
            <h4 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 600 }}>Acciones</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Button variant="secondary" style={{ width: "100%" }}>📄 Exportar a PDF</Button>
              <Button variant="secondary" style={{ width: "100%" }}>📊 Exportar a Excel</Button>
            </div>
          </Card>

          <Card style={{ padding: "20px" }}>
            <h4 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 600 }}>Indicadores</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted-foreground)" }}>Margen Bruto</span>
                <span style={{ fontWeight: 600 }}>{((utilidadBruta / totalIngresos) * 100).toFixed(1)}%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted-foreground)" }}>Margen Neto</span>
                <span style={{ fontWeight: 600 }}>{margenNeto.toFixed(1)}%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted-foreground)" }}>Gasto más alto</span>
                <span style={{ fontWeight: 600 }}>Alquiler</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}