import { useState, useEffect } from "react";
import { Card, Badge, Button } from "../components/ui";

type Cuenta = {
  id: number;
  compra_id: number;
  proveedor_id: number;
  proveedor: string;
  codigo_compra: string;
  monto_original: number;
  monto_pagado: number;
  fecha_vencimiento: string;
  estado: string;
};

export default function CuentasPorPagar() {
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalPago, setModalPago] = useState<Cuenta | null>(null);
  const [montoPagado, setMontoPagado] = useState("");
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [modalExito, setModalExito] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => { cargarCuentas(); }, [filtroEstado]);

  const cargarCuentas = async () => {
    try {
      setLoading(true);
      const params = filtroEstado ? `?estado=${filtroEstado}` : "";
      const res = await fetch(`http://localhost:8000/api/cuentas_por_pagar/listar.php${params}`);
      const data = await res.json();
      if (data.success) setCuentas(data.cuentas);
    } catch (err) {
      setModalError("Error al cargar cuentas");
    } finally {
      setLoading(false);
    }
  };

  const handlePagar = async () => {
    if (!modalPago || !montoPagado) return;
    
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/cuentas_por_pagar/marcar_pagada.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: modalPago.id,
          monto_pagado: parseFloat(montoPagado),
          metodo_pago: metodoPago
        })
      });
      const data = await res.json();
      if (data.success) {
        setModalExito(`Cuenta de ${modalPago.proveedor} marcada como pagada`);
        setModalPago(null);
        setMontoPagado("");
        cargarCuentas();
      } else {
        setModalError(data.error);
      }
    } catch (err) {
      setModalError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const totalPendiente = cuentas
    .filter(c => c.estado === 'Pendiente' || c.estado === 'Vencida')
    .reduce((sum, c) => sum + (Number(c.monto_original) - Number(c.monto_pagado)), 0);

  const getBadgeVariant = (estado: string) => {
    if (estado === 'Pagada') return 'success';
    if (estado === 'Vencida') return 'danger';
    return 'warning';
  };

  return (
    <div>
      {/* Modales */}
      {modalExito && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", textAlign: "center", maxWidth: "400px" }}>
            <div style={{ fontSize: "50px", marginBottom: "10px" }}>✅</div>
            <h3>{modalExito}</h3>
            <Button onClick={() => setModalExito(null)}>Aceptar</Button>
          </div>
        </div>
      )}

      {modalError && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", textAlign: "center", maxWidth: "400px" }}>
            <div style={{ fontSize: "50px", marginBottom: "10px" }}>️</div>
            <h3 style={{ color: "#ef4444" }}>Error</h3>
            <p>{modalError}</p>
            <Button onClick={() => setModalError(null)} style={{ background: "#ef4444" }}>Cerrar</Button>
          </div>
        </div>
      )}

      {/* Resumen */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Total por pagar</div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#ef4444" }}>${totalPendiente.toFixed(2)}</div>
        </div>
        <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Cuentas registradas</div>
          <div style={{ fontSize: "24px", fontWeight: 700 }}>{cuentas.length}</div>
        </div>
      </div>

      <Card>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", gap: "12px", alignItems: "center" }}>
          <label style={{ fontSize: "13px", fontWeight: 600 }}>Filtrar por estado:</label>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} style={{ padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px" }}>
            <option value="">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Pagada">Pagada</option>
            <option value="Vencida">Vencida</option>
          </select>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>Cargando...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>COMPRA</th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>PROVEEDOR</th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>MONTO</th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>PAGADO</th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>SALDO</th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>VENCIMIENTO</th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>ESTADO</th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>ACCIÓN</th>
                </tr>
              </thead>
              <tbody>
                {cuentas.map(c => {
                  const saldo = Number(c.monto_original) - Number(c.monto_pagado);
                  return (
                    <tr key={c.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "12px", fontFamily: "monospace", fontWeight: 600 }}>{c.codigo_compra}</td>
                      <td style={{ padding: "12px" }}>{c.proveedor}</td>
                      <td style={{ padding: "12px", fontWeight: 600 }}>${Number(c.monto_original).toFixed(2)}</td>
                      <td style={{ padding: "12px", color: "#10b981" }}>${Number(c.monto_pagado).toFixed(2)}</td>
                      <td style={{ padding: "12px", fontWeight: 700, color: saldo > 0 ? "#ef4444" : "#10b981" }}>${saldo.toFixed(2)}</td>
                      <td style={{ padding: "12px" }}>{new Date(c.fecha_vencimiento).toLocaleDateString('es-MX')}</td>
                      <td style={{ padding: "12px" }}>
                        <Badge variant={getBadgeVariant(c.estado) as any}>{c.estado}</Badge>
                      </td>
                      <td style={{ padding: "12px" }}>
                        {c.estado !== 'Pagada' && (
                          <button 
                            onClick={() => { setModalPago(c); setMontoPagado(saldo.toString()); }}
                            style={{ background: "none", border: "none", color: "#10b981", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}
                          >
                            Pagar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {cuentas.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>No hay cuentas por pagar</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* MODAL PAGAR */}
      {modalPago && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }} onClick={() => setModalPago(null)}>
          <div style={{ background: "white", padding: "32px", borderRadius: "12px", width: "100%", maxWidth: "450px" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: "8px" }}>Registrar Pago</h2>
            <p style={{ color: "#6b7280", marginBottom: "20px", fontSize: "14px" }}>
              Proveedor: <strong>{modalPago.proveedor}</strong><br/>
              Saldo pendiente: <strong style={{ color: "#ef4444" }}>${(Number(modalPago.monto_original) - Number(modalPago.monto_pagado)).toFixed(2)}</strong>
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>Monto a pagar *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={montoPagado} 
                  onChange={(e) => setMontoPagado(e.target.value)}
                  style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>Método de pago *</label>
                <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Tarjeta">Tarjeta</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button onClick={() => setModalPago(null)} style={{ flex: 1, padding: "12px", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", cursor: "pointer" }}>Cancelar</button>
                <button onClick={handlePagar} disabled={loading} style={{ flex: 1, padding: "12px", border: "none", borderRadius: "6px", background: "#10b981", color: "white", cursor: "pointer" }}>
                  {loading ? "Procesando..." : "Confirmar Pago"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}