import { useState } from "react";
import { Card, SectionHeader, Button, Input, Table, TR, TD, Badge } from "../components/ui";

// Datos simulados del día (en un sistema real, esto vendría de la base de datos filtrado por fecha de hoy)
const ventasDelDia = [
  { id: "V-0090", items: "Uñas acrílicas + Esmalte", total: 32, metodo: "Efectivo" },
  { id: "V-0091", items: "Pedicure clásico", total: 20, metodo: "Transferencia" },
  { id: "V-0092", items: "Manicure + Lifting", total: 55, metodo: "Efectivo" },
  { id: "V-0093", items: "Shampoo reparador", total: 12, metodo: "Efectivo" },
];

const gastosDelDia = [
  { id: "G-006", descripcion: "Almuerzo equipo", monto: 15, metodo: "Efectivo" },
  { id: "G-007", descripcion: "Bolsas de basura", monto: 5, metodo: "Efectivo" },
];

export default function CierreCaja() {
  const [efectivoReal, setEfectivoReal] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [guardado, setGuardado] = useState(false);

  // Cálculos automáticos
  const ventasEfectivo = ventasDelDia.filter(v => v.metodo === "Efectivo").reduce((sum, v) => sum + v.total, 0);
  const ventasNoEfectivo = ventasDelDia.filter(v => v.metodo !== "Efectivo").reduce((sum, v) => sum + v.total, 0);
  const totalVentas = ventasEfectivo + ventasNoEfectivo;
  
  const gastosEfectivo = gastosDelDia.filter(g => g.metodo === "Efectivo").reduce((sum, g) => sum + g.monto, 0);

  const efectivoEsperado = ventasEfectivo - gastosEfectivo;
  const diferencia = Number(efectivoReal) - efectivoEsperado;

  const handleGuardar = () => {
    setGuardado(true);
  };

  if (guardado) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <Card style={{ padding: "40px", textAlign: "center", maxWidth: "400px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", marginBottom: "8px" }}>Cierre de caja registrado</h2>
          <p style={{ color: "var(--muted-foreground)", marginBottom: "24px" }}>El cierre del día se ha guardado correctamente en el historial.</p>
          <Button onClick={() => { setGuardado(false); setEfectivoReal(""); setObservaciones(""); }}>Realizar otro cierre</Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader
        title="Cierre de Caja"
        sub={`Resumen del día: ${new Date().toLocaleDateString("es-GT", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`}
      />

      {/* Tarjetas de Resumen */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <Card style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "var(--muted-foreground)", marginBottom: "8px" }}>Total Ventas del Día</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--primary)", fontFamily: "'DM Serif Display', serif" }}>${totalVentas.toFixed(2)}</div>
          <div style={{ fontSize: "11px", color: "var(--muted-foreground)", marginTop: "4px" }}>Efectivo: ${ventasEfectivo.toFixed(2)} · Otros: ${ventasNoEfectivo.toFixed(2)}</div>
        </Card>

        <Card style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "var(--muted-foreground)", marginBottom: "8px" }}>Gastos en Efectivo (Caja Chica)</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--danger)", fontFamily: "'DM Serif Display', serif" }}>${gastosEfectivo.toFixed(2)}</div>
          <div style={{ fontSize: "11px", color: "var(--muted-foreground)", marginTop: "4px" }}>{gastosDelDia.length} movimientos registrados</div>
        </Card>

        <Card style={{ padding: "20px", background: "rgba(78,99,200,0.05)", border: "1px solid rgba(78,99,200,0.15)" }}>
          <div style={{ fontSize: "12px", color: "#4E63C8", marginBottom: "8px", fontWeight: 600 }}>Efectivo Esperado en Caja</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#4E63C8", fontFamily: "'DM Serif Display', serif" }}>${efectivoEsperado.toFixed(2)}</div>
          <div style={{ fontSize: "11px", color: "#4E63C8", marginTop: "4px" }}>(Ventas efectivo - Gastos efectivo)</div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        
        {/* Columna Izquierda: Formulario de Conteo */}
        <Card style={{ padding: "24px" }}>
          <h3 style={{ margin: "0 0 20px", fontFamily: "'DM Serif Display', serif" }}>Conteo Físico</h3>
          
          <Input
            label="Efectivo real contado en el cajón ($)"
            value={efectivoReal}
            onChange={(v: string) => setEfectivoReal(v)}
            type="number"
            placeholder="0.00"
          />

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "8px", color: "var(--foreground)" }}>Observaciones del día</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={3}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical" }}
              placeholder="Ej: La cliente Ana queda debiendo $10. Se fue la luz a las 3pm."
            />
          </div>

          {/* Resultado de la diferencia */}
          {efectivoReal !== "" && (
            <div style={{ 
              padding: "16px", borderRadius: "8px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center",
              background: diferencia === 0 ? "rgba(61,139,101,0.1)" : diferencia > 0 ? "rgba(61,139,101,0.1)" : "rgba(184,64,64,0.1)",
              border: `1px solid ${diferencia === 0 ? "rgba(61,139,101,0.3)" : diferencia > 0 ? "rgba(61,139,101,0.3)" : "rgba(184,64,64,0.3)"}`
            }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: diferencia === 0 ? "var(--success)" : diferencia > 0 ? "var(--success)" : "var(--danger)" }}>
                  {diferencia === 0 ? "Caja Cuadrada ✓" : diferencia > 0 ? "Sobrante en caja" : "Faltante en caja"}
                </div>
                <div style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>Diferencia de $ {Math.abs(diferencia).toFixed(2)}</div>
              </div>
              <div style={{ fontSize: "20px", fontWeight: "bold", color: diferencia === 0 ? "var(--success)" : diferencia > 0 ? "var(--success)" : "var(--danger)", fontFamily: "'DM Serif Display', serif" }}>
                {diferencia > 0 ? "+" : ""}{diferencia.toFixed(2)}
              </div>
            </div>
          )}

          <Button 
            onClick={handleGuardar} 
            disabled={efectivoReal === ""}
            style={{ width: "100%", padding: "12px", fontSize: "16px" }}
          >
            Guardar Cierre de Caja
          </Button>
        </Card>

        {/* Columna Derecha: Detalle de movimientos */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Card>
            <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
              <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>Ventas en Efectivo del Día</h3>
            </div>
            <Table headers={["ID", "Descripción", "Monto"]}>
              {ventasDelDia.filter(v => v.metodo === "Efectivo").map((v) => (
                <TR key={v.id}>
                  <TD mono>{v.id}</TD>
                  <TD>{v.items}</TD>
                  <TD mono style={{ color: "var(--success)", fontWeight: 600 }}>+ $ {v.total.toFixed(2)}</TD>
                </TR>
              ))}
            </Table>
          </Card>

          <Card>
            <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
              <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>Gastos en Efectivo del Día</h3>
            </div>
            <Table headers={["ID", "Descripción", "Monto"]}>
              {gastosDelDia.filter(g => g.metodo === "Efectivo").map((g) => (
                <TR key={g.id}>
                  <TD mono>{g.id}</TD>
                  <TD>{g.descripcion}</TD>
                  <TD mono style={{ color: "var(--danger)", fontWeight: 600 }}>- $ {g.monto.toFixed(2)}</TD>
                </TR>
              ))}
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}