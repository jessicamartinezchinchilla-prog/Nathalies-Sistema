import { useState } from "react";
import { Card, Badge, Table, TR, TD, SearchBar, SectionHeader, Button, Modal, Input } from "../components/ui";

type CuentaPorPagar = {
  id: string;
  compraId: string;
  proveedor: string;
  montoOriginal: number;
  montoPagado: number;
  fechaVencimiento: string;
  estado: "Pendiente" | "Pagada" | "Vencida";
};

const initialCuentas: CuentaPorPagar[] = [
  { id: "CP-001", compraId: "C-0022", proveedor: "Distribuidora Glamour", montoOriginal: 1240.00, montoPagado: 0, fechaVencimiento: "10/10/2026", estado: "Pendiente" },
  { id: "CP-002", compraId: "C-0019", proveedor: "BellyNails S.A.", montoOriginal: 450.00, montoPagado: 450.00, fechaVencimiento: "01/09/2026", estado: "Pagada" },
  { id: "CP-003", compraId: "C-0015", proveedor: "ProLash Supply", montoOriginal: 320.00, montoPagado: 0, fechaVencimiento: "01/09/2026", estado: "Vencida" },
  { id: "CP-004", compraId: "C-0024", proveedor: "Importadora de Uñas", montoOriginal: 780.00, montoPagado: 300.00, fechaVencimiento: "20/10/2026", estado: "Pendiente" },
];

export default function CuentasPorPagar() {
  const [cuentas, setCuentas] = useState<CuentaPorPagar[]>(initialCuentas);
  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState<CuentaPorPagar | null>(null);
  const [montoPago, setMontoPago] = useState("");

  const filtered = cuentas.filter((c) => {
    const matchSearch = c.proveedor.toLowerCase().includes(search.toLowerCase()) || c.compraId.toLowerCase().includes(search.toLowerCase());
    const matchEstado = filtroEstado === "Todos" || c.estado === filtroEstado;
    return matchSearch && matchEstado;
  });

  // Cálculos para tarjetas
  const totalPendiente = filtered.filter(c => c.estado !== "Pagada").reduce((sum, c) => sum + (c.montoOriginal - c.montoPagado), 0);
  const totalVencido = filtered.filter(c => c.estado === "Vencida").reduce((sum, c) => sum + (c.montoOriginal - c.montoPagado), 0);
  const totalPagado = filtered.filter(c => c.estado === "Pagada").reduce((sum, c) => sum + c.montoPagado, 0);

  const handleRegistrarPago = () => {
    if (!cuentaSeleccionada || !montoPago) return;
    const monto = Number(montoPago);
    setCuentas((prev) =>
      prev.map((c) => {
        if (c.id === cuentaSeleccionada.id) {
          const nuevoPagado = c.montoPagado + monto;
          const nuevoEstado = nuevoPagado >= c.montoOriginal ? "Pagada" : "Pendiente";
          return { ...c, montoPagado: nuevoPagado, estado: nuevoEstado };
        }
        return c;
      })
    );
    setCuentaSeleccionada(null);
    setMontoPago("");
  };

  const getEstadoBadge = (estado: string) => {
    if (estado === "Pagada") return <Badge variant="success">Pagada</Badge>;
    if (estado === "Vencida") return <Badge variant="danger">Vencida</Badge>;
    return <Badge variant="warning">Pendiente</Badge>;
  };

  return (
    <div>
      <SectionHeader
        title="Cuentas por Pagar"
        sub="Control de deudas con proveedores"
      />

      {/* Tarjetas de Resumen */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <Card style={{ padding: "20px", border: "1px solid rgba(196,126,26,0.3)" }}>
          <div style={{ fontSize: "12px", color: "var(--muted-foreground)", marginBottom: "8px" }}>Total Pendiente</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--warning)", fontFamily: "'DM Serif Display', serif" }}>${totalPendiente.toFixed(2)}</div>
        </Card>
        <Card style={{ padding: "20px", border: "1px solid rgba(184,64,64,0.3)" }}>
          <div style={{ fontSize: "12px", color: "var(--muted-foreground)", marginBottom: "8px" }}>Total Vencido</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--danger)", fontFamily: "'DM Serif Display', serif" }}>${totalVencido.toFixed(2)}</div>
        </Card>
        <Card style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "var(--muted-foreground)", marginBottom: "8px" }}>Total Pagado</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--success)", fontFamily: "'DM Serif Display', serif" }}>${totalPagado.toFixed(2)}</div>
        </Card>
      </div>

      {/* Tabla */}
      <Card>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar por proveedor o compra..." />
          <select 
            value={filtroEstado} 
            onChange={(e) => setFiltroEstado(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: "13px", outline: "none" }}
          >
            <option value="Todos">Todos los estados</option>
            <option value="Pendiente">Pendientes</option>
            <option value="Vencida">Vencidas</option>
            <option value="Pagada">Pagadas</option>
          </select>
        </div>

        <Table headers={["ID", "Compra", "Proveedor", "Monto Original", "Pagado", "Restante", "Vencimiento", "Estado", ""]}>
          {filtered.map((c) => (
            <TR key={c.id}>
              <TD mono>{c.id}</TD>
              <TD mono>{c.compraId}</TD>
              <TD>{c.proveedor}</TD>
              <TD mono>${c.montoOriginal.toFixed(2)}</TD>
              <TD mono style={{ color: "var(--success)" }}>${c.montoPagado.toFixed(2)}</TD>
              <TD mono style={{ fontWeight: "bold", color: (c.montoOriginal - c.montoPagado) > 0 ? "var(--danger)" : "var(--success)" }}>
                ${(c.montoOriginal - c.montoPagado).toFixed(2)}
              </TD>
              <TD style={{ fontSize: "12px" }}>{c.fechaVencimiento}</TD>
              <TD>{getEstadoBadge(c.estado)}</TD>
              <TD>
                {c.estado !== "Pagada" && (
                  <button 
                    onClick={() => setCuentaSeleccionada(c)} 
                    style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "12px", cursor: "pointer", fontWeight: 500 }}
                  >
                    Registrar pago →
                  </button>
                )}
              </TD>
            </TR>
          ))}
        </Table>
      </Card>

      {/* Modal Registrar Pago */}
      {cuentaSeleccionada && (
        <Modal title={`Registrar Pago - ${cuentaSeleccionada.id}`} onClose={() => { setCuentaSeleccionada(null); setMontoPago(""); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "var(--muted)", padding: "16px", borderRadius: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>Proveedor:</span>
                <span style={{ fontWeight: 500 }}>{cuentaSeleccionada.proveedor}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>Monto original:</span>
                <span style={{ fontWeight: 500 }}>${cuentaSeleccionada.montoOriginal.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>Ya pagado:</span>
                <span style={{ fontWeight: 500, color: "var(--success)" }}>${cuentaSeleccionada.montoPagado.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid var(--border)" }}>
                <span style={{ fontSize: "13px", fontWeight: 600 }}>Restante por pagar:</span>
                <span style={{ fontWeight: "bold", color: "var(--danger)" }}>
                  ${(cuentaSeleccionada.montoOriginal - cuentaSeleccionada.montoPagado).toFixed(2)}
                </span>
              </div>
            </div>

            <Input 
              label="Monto a pagar ($)" 
              value={montoPago} 
              onChange={(v: string) => setMontoPago(v)} 
              type="number" 
              placeholder="0.00"
              required 
            />
            <div style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
              💡 Si pagas el monto completo, la cuenta se marcará automáticamente como "Pagada".
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
            <Button variant="secondary" onClick={() => { setCuentaSeleccionada(null); setMontoPago(""); }}>Cancelar</Button>
            <Button onClick={handleRegistrarPago}>Confirmar Pago</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}