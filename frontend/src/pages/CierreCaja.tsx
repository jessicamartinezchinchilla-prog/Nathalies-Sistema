import { useState, useEffect } from "react";
import { Card, Button } from "../components/ui";

type CierrePrevio = {
  id: number;
  fecha: string;
  ventas_total: number;
  ventas_efectivo: number;
  ventas_transferencia: number;
  efectivo_esperado: number;
  efectivo_real: number;
  diferencia: number;
  observaciones: string;
  created_at: string;
  usuario: string;
};

export default function CierreCaja() {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [resumen, setResumen] = useState<any>(null);
  const [cierresPrevios, setCierresPrevios] = useState<CierrePrevio[]>([]);
  const [efectivoInicial, setEfectivoInicial] = useState("0");
  const [efectivoReal, setEfectivoReal] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalExito, setModalExito] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
  }, [fecha]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      // Cargar resumen del día
      const resResumen = await fetch(`http://localhost:8000/api/cierres/resumen.php?fecha=${fecha}`);
      const dataResumen = await resResumen.json();
      if (dataResumen.success) setResumen(dataResumen.data);

      // Cargar cierres previos del día
      const resCierres = await fetch(`http://localhost:8000/api/cierres/listar_del_dia.php?fecha=${fecha}`);
      const dataCierres = await resCierres.json();
      if (dataCierres.success) setCierresPrevios(dataCierres.cierres);
    } catch (err) {
      setModalError("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async () => {
    if (!resumen) return;
    if (!efectivoReal || parseFloat(efectivoReal) < 0) {
      setModalError("Ingresa un monto válido para el efectivo real");
      return;
    }

    const inicial = parseFloat(efectivoInicial) || 0;
    const real = parseFloat(efectivoReal) || 0;
    const esperado = inicial + resumen.ventas_efectivo - resumen.gastos_efectivo;
    const diferencia = real - esperado;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/cierres/guardar.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha,
          ventas_total: resumen.ventas_total,
          ventas_efectivo: resumen.ventas_efectivo,
          ventas_transferencia: resumen.ventas_transferencia,
          ventas_tarjeta: resumen.ventas_tarjeta,
          gastos_efectivo: resumen.gastos_efectivo,
          efectivo_esperado: esperado,
          efectivo_real: real,
          diferencia,
          observaciones
        })
      });
      const data = await res.json();
      if (data.success) {
        setModalExito("✅ Cierre de caja registrado correctamente");
        setEfectivoReal("");
        setObservaciones("");
        cargarDatos(); // Recargar para mostrar el nuevo cierre en el historial
      } else {
        setModalError(data.error || "Error al guardar");
      }
    } catch (err) {
      setModalError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const inicialNum = parseFloat(efectivoInicial) || 0;
  const esperado = resumen ? (inicialNum + resumen.ventas_efectivo - resumen.gastos_efectivo) : 0;
  const realNum = parseFloat(efectivoReal) || 0;
  const diferencia = realNum - esperado;

  return (
    <div>
      {/* Modales de Éxito/Error */}
      {modalExito && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", textAlign: "center", maxWidth: "400px" }}>
            <div style={{ fontSize: "50px", marginBottom: "10px" }}>✅</div>
            <h3 style={{ margin: "0 0 16px 0" }}>{modalExito}</h3>
            <Button onClick={() => setModalExito(null)}>Aceptar</Button>
          </div>
        </div>
      )}
      {modalError && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", textAlign: "center", maxWidth: "400px" }}>
            <div style={{ fontSize: "50px", marginBottom: "10px" }}>⚠️</div>
            <h3 style={{ margin: "0 0 16px 0", color: "#ef4444" }}>Error</h3>
            <p style={{ marginBottom: "16px" }}>{modalError}</p>
            <Button onClick={() => setModalError(null)} style={{ background: "#ef4444" }}>Cerrar</Button>
          </div>
        </div>
      )}

      {/* Selector de Fecha */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>Fecha de cierre:</label>
          <input 
            type="date" 
            value={fecha} 
            onChange={(e) => setFecha(e.target.value)}
            style={{ padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px" }}
          />
        </div>
      </div>

      {/* AVISO si ya hubo cierres previos */}
      {resumen?.es_segundo_cierre && (
        <div style={{ 
          background: "#fef3c7", 
          border: "1px solid #f59e0b", 
          borderRadius: "8px", 
          padding: "14px 20px", 
          marginBottom: "20px",
          fontSize: "14px",
          color: "#92400e",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <span style={{ fontSize: "20px" }}>ℹ️</span>
          <span>
            <strong>Ya existe(n) {cierresPrevios.length} cierre(s) previo(s) hoy.</strong> 
            Este nuevo cierre solo considerará las operaciones realizadas después del último corte.
          </span>
        </div>
      )}

      {loading && !resumen ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>Calculando totales...</div>
      ) : resumen && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
          
          {/* PANEL IZQUIERDO: Resumen del Sistema */}
          <Card>
            <div style={{ padding: "24px" }}>
              <h3 style={{ marginTop: 0, marginBottom: "20px", fontSize: "18px", fontWeight: 700, color: "#1f2937" }}>
                Resumen del Sistema
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "#f9fafb", borderRadius: "8px" }}>
                  <span style={{ color: "#6b7280" }}>Total Ventas:</span>
                  <strong style={{ fontSize: "16px" }}>${resumen.ventas_total.toFixed(2)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "#f9fafb", borderRadius: "8px" }}>
                  <span style={{ color: "#6b7280" }}>Ventas Efectivo:</span>
                  <strong style={{ fontSize: "16px", color: "#10b981" }}>${resumen.ventas_efectivo.toFixed(2)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "#f9fafb", borderRadius: "8px" }}>
                  <span style={{ color: "#6b7280" }}>Ventas Transferencia:</span>
                  <strong style={{ fontSize: "16px", color: "#3b82f6" }}>${resumen.ventas_transferencia.toFixed(2)}</strong>
                </div>
                {resumen.ventas_tarjeta > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "#f9fafb", borderRadius: "8px" }}>
                    <span style={{ color: "#6b7280" }}>Ventas Tarjeta:</span>
                    <strong style={{ fontSize: "16px", color: "#8b5cf6" }}>${resumen.ventas_tarjeta.toFixed(2)}</strong>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "#f9fafb", borderRadius: "8px" }}>
                  <span style={{ color: "#6b7280" }}>Gastos del período:</span>
                  <strong style={{ fontSize: "16px", color: "#ef4444" }}>${resumen.gastos_efectivo.toFixed(2)}</strong>
                </div>
                
                <div style={{ borderTop: "2px solid #e5e7eb", marginTop: "8px", paddingTop: "16px", display: "flex", justifyContent: "space-between", fontSize: "18px" }}>
                  <span style={{ fontWeight: 700, color: "#1f2937" }}>Efectivo en Caja (Sistema):</span>
                  <strong style={{ color: "#10b981", fontSize: "20px" }}>${esperado.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </Card>

          {/* PANEL DERECHO: Conteo Físico */}
          <Card>
            <div style={{ padding: "24px" }}>
              <h3 style={{ marginTop: 0, marginBottom: "20px", fontSize: "18px", fontWeight: 700, color: "#1f2937" }}>
                Conteo Físico
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {/* CAJA CHICA / FONDO INICIAL */}
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "#374151" }}>
                    Caja Chica
                  </label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    value={efectivoInicial} 
                    onChange={(e) => setEfectivoInicial(e.target.value)}
                    style={{ 
                      width: "100%", 
                      padding: "12px 14px", 
                      border: "2px solid #c08497", 
                      borderRadius: "8px", 
                      fontSize: "16px", 
                      fontWeight: 600,
                      boxSizing: "border-box"
                    }}
                    placeholder="0.00"
                  />
                  
                </div>

                {/* EFECTIVO REAL */}
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "#374151" }}>
                     Efectivo Real
                  </label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    value={efectivoReal} 
                    onChange={(e) => setEfectivoReal(e.target.value)}
                    style={{ 
                      width: "100%", 
                      padding: "12px 14px", 
                      border: "1px solid #d1d5db", 
                      borderRadius: "8px", 
                      fontSize: "16px", 
                      fontWeight: 600,
                      boxSizing: "border-box"
                    }}
                    placeholder="0.00"
                  />
                </div>

                {/* DIFERENCIA */}
                <div style={{ 
                  padding: "16px", 
                  background: diferencia === 0 ? "#ecfdf5" : diferencia < 0 ? "#fef2f2" : "#fffbeb", 
                  borderRadius: "8px", 
                  border: `2px solid ${diferencia === 0 ? "#10b981" : diferencia < 0 ? "#ef4444" : "#f59e0b"}`,
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>Diferencia</div>
                  <div style={{ 
                    fontSize: "28px", 
                    fontWeight: 700, 
                    color: diferencia === 0 ? "#10b981" : diferencia < 0 ? "#ef4444" : "#f59e0b" 
                  }}>
                    ${diferencia.toFixed(2)}
                  </div>
                  <div style={{ fontSize: "12px", marginTop: "4px", color: "#6b7280" }}>
                    {diferencia < 0 ? "⚠️ Falta dinero en caja" : diferencia > 0 ? "️ Sobra dinero en caja" : "Cuadre perfecto"}
                  </div>
                </div>

                {/* OBSERVACIONES */}
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600, color: "#374151" }}>
                    Observaciones
                  </label>
                  <textarea 
                    value={observaciones} 
                    onChange={(e) => setObservaciones(e.target.value)}
                    rows={3}
                    style={{ 
                      width: "100%", 
                      padding: "10px 14px", 
                      border: "1px solid #d1d5db", 
                      borderRadius: "8px", 
                      fontSize: "14px", 
                      resize: "vertical",
                      boxSizing: "border-box"
                    }}
                    placeholder="Notas adicionales sobre el cierre..."
                  />
                </div>

                <Button 
                  onClick={handleGuardar} 
                  disabled={loading || !efectivoReal}
                  style={{ width: "100%", padding: "14px", fontSize: "16px", marginTop: "8px" }}
                >
                  {loading ? "Guardando..." : "💾 Guardar Cierre de Caja"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          HISTORIAL DE CIERRES DEL DÍA (SOLO LECTURA)
      ═══════════════════════════════════════════ */}
      {cierresPrevios.length > 0 && (
        <Card>
          <div style={{ padding: "24px" }}>
            <h3 style={{ marginTop: 0, marginBottom: "20px", fontSize: "18px", fontWeight: 700, color: "#1f2937" }}>
              📋 Historial de Cierres del Día (Solo lectura)
            </h3>
            
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>HORA</th>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>VENTAS</th>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>EFECTIVO ESP.</th>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>EFECTIVO REAL</th>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>DIFERENCIA</th>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>USUARIO</th>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>OBS.</th>
                  </tr>
                </thead>
                <tbody>
                  {cierresPrevios.map((c) => (
                    <tr key={c.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "12px", fontSize: "13px", fontFamily: "monospace" }}>
                        {new Date(c.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: "12px", fontSize: "14px", fontWeight: 600 }}>${Number(c.ventas_total).toFixed(2)}</td>
                      <td style={{ padding: "12px", fontSize: "14px", color: "#10b981" }}>${Number(c.efectivo_esperado).toFixed(2)}</td>
                      <td style={{ padding: "12px", fontSize: "14px", fontWeight: 600 }}>${Number(c.efectivo_real).toFixed(2)}</td>
                      <td style={{ padding: "12px", fontSize: "14px", fontWeight: 700, color: Number(c.diferencia) === 0 ? "#10b981" : "#ef4444" }}>
                        ${Number(c.diferencia).toFixed(2)}
                      </td>
                      <td style={{ padding: "12px", fontSize: "13px" }}>{c.usuario || 'Sistema'}</td>
                      <td style={{ padding: "12px", fontSize: "12px", color: "#6b7280", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.observaciones || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "16px", marginBottom: 0, fontStyle: "italic" }}>
               Los cierres guardados no pueden editarse ni eliminarse para mantener la trazabilidad contable.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}