import { useState, useEffect } from "react";
import { Card, Badge, Button } from "../components/ui";

type Venta = {
  id: number;
  codigo: string;
  fecha: string;
  total: number;
  metodo_pago: string;
  estado: string;
  usuario: string;
};

type DetalleVenta = {
  id: number;
  tipo: string;
  item_id: number;
  nombre_item: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
};

type Filtros = {
  fecha_desde: string;
  fecha_hasta: string;
  metodo_pago: string;
  estado: string;
};

export default function HistorialVentas() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDetalle, setShowDetalle] = useState<number | null>(null);
  const [detalleData, setDetalleData] = useState<{ venta: any; detalles: DetalleVenta[] } | null>(null);
  const [showConfirmAnular, setShowConfirmAnular] = useState<number | null>(null);
  const [totalMonto, setTotalMonto] = useState(0);

  const [filtros, setFiltros] = useState<Filtros>({
    fecha_desde: "",
    fecha_hasta: "",
    metodo_pago: "",
    estado: ""
  });

  useEffect(() => {
    cargarVentas();
  }, [filtros]);

  const cargarVentas = async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
      if (filtros.metodo_pago) params.append('metodo_pago', filtros.metodo_pago);
      if (filtros.estado) params.append('estado', filtros.estado);

      const response = await fetch(`http://localhost:8000/api/ventas/listar.php?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setVentas(data.ventas);
        setTotalMonto(data.total_monto);
      } else {
        setError(data.error || "Error al cargar ventas");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = async (ventaId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/ventas/detalle.php?id=${ventaId}`);
      const data = await response.json();
      
      if (data.success) {
        setDetalleData(data);
        setShowDetalle(ventaId);
      } else {
        setError(data.error || "Error al cargar detalle");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor");
    }
  };

  const anularVenta = async (ventaId: number) => {
    try {
      const response = await fetch("http://localhost:8000/api/ventas/anular.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ventaId })
      });
      const data = await response.json();
      
      if (data.success) {
        setShowConfirmAnular(null);
        setShowDetalle(null);
        await cargarVentas();
      } else {
        setError(data.error || "Error al anular venta");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor");
    }
  };

  const handleFiltroChange = (name: keyof Filtros, value: string) => {
    setFiltros({ ...filtros, [name]: value });
  };

  const filterInputStyle: React.CSSProperties = {
    height: "40px",
    padding: "0 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "13px",
    background: "white",
    outline: "none",
    boxSizing: "border-box"
  };

  return (
    <div>
    

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", padding: "12px", marginBottom: "20px", fontSize: "13px", color: "#EF4444" }}>
          ⚠️ {error}
          <button onClick={cargarVentas} style={{ marginLeft: "10px", background: "none", border: "none", color: "#EF4444", textDecoration: "underline", cursor: "pointer" }}>
            Reintentar
          </button>
        </div>
      )}

      {/* Tarjetas de resumen */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Total de ventas</div>
          <div style={{ fontSize: "24px", fontWeight: 700 }}>{ventas.length}</div>
        </div>

        <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Monto total</div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#10b981" }}>${Number(totalMonto).toFixed(2)}</div>
        </div>
      </div>

      <Card>
        {/* Filtros */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px", alignItems: "center" }}>
            <input
              type="date"
              value={filtros.fecha_desde}
              onChange={(e) => handleFiltroChange('fecha_desde', e.target.value)}
              style={{ ...filterInputStyle, width: "100%" }}
              placeholder="Fecha desde"
            />

            <input
              type="date"
              value={filtros.fecha_hasta}
              onChange={(e) => handleFiltroChange('fecha_hasta', e.target.value)}
              style={{ ...filterInputStyle, width: "100%" }}
              placeholder="Fecha hasta"
            />

            <select
              value={filtros.metodo_pago}
              onChange={(e) => handleFiltroChange('metodo_pago', e.target.value)}
              style={{ ...filterInputStyle, width: "100%", cursor: "pointer" }}
            >
              <option value="">Todos los métodos</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
            </select>

            <select
              value={filtros.estado}
              onChange={(e) => handleFiltroChange('estado', e.target.value)}
              style={{ ...filterInputStyle, width: "100%", cursor: "pointer" }}
            >
              <option value="">Todos los estados</option>
              <option value="Completada">Completada</option>
              <option value="Anulada">Anulada</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--muted-foreground)" }}>Cargando...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>CÓDIGO</th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>FECHA</th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>TOTAL</th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>MÉTODO</th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>ESTADO</th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((v) => (
                  <tr key={v.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "12px", fontFamily: "monospace", fontWeight: 600 }}>{v.codigo}</td>
                    <td style={{ padding: "12px" }}>{new Date(v.fecha).toLocaleString('es-MX')}</td>
                    <td style={{ padding: "12px", fontWeight: 700, color: "#10b981" }}>${Number(v.total).toFixed(2)}</td>
                    <td style={{ padding: "12px" }}>{v.metodo_pago}</td>
                    <td style={{ padding: "12px" }}>
                      <Badge variant={v.estado === "Completada" ? "success" : "muted"}>{v.estado}</Badge>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <button 
                        onClick={() => verDetalle(v.id)}
                        style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
                {ventas.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
                      No se encontraron ventas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* MODAL DETALLE DE VENTA */}
      {showDetalle !== null && detalleData && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }} onClick={() => setShowDetalle(null)}>
          <div style={{ background: "white", borderRadius: "12px", padding: "32px", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ margin: 0, fontSize: "20px" }}>Detalle de Venta {detalleData.venta.codigo}</h2>
              <button onClick={() => setShowDetalle(null)} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer" }}>×</button>
            </div>

            <div style={{ marginBottom: "20px", padding: "16px", background: "#f9fafb", borderRadius: "8px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "14px" }}>
                <div><strong>Fecha:</strong> {new Date(detalleData.venta.fecha).toLocaleString('es-MX')}</div>
                <div><strong>Método:</strong> {detalleData.venta.metodo_pago}</div>
                <div><strong>Usuario:</strong> {detalleData.venta.usuario || 'N/A'}</div>
                <div><strong>Estado:</strong> <Badge variant={detalleData.venta.estado === "Completada" ? "success" : "muted"}>{detalleData.venta.estado}</Badge></div>
              </div>
            </div>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>Productos/Servicios</h3>
            
            <div style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "16px" }}>
              {detalleData.detalles.map((d) => (
                <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", border: "1px solid #e5e7eb", borderRadius: "6px", marginBottom: "8px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{d.nombre_item}</div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      {d.tipo === 'producto' ? 'Producto' : 'Servicio'} | Cantidad: {d.cantidad}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>${Number(d.precio_unitario).toFixed(2)} c/u</div>
                    <div style={{ fontWeight: 700 }}>${Number(d.subtotal).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "2px solid #e5e7eb", paddingTop: "16px", display: "flex", justifyContent: "space-between", fontSize: "20px", fontWeight: 700, marginBottom: "24px" }}>
              <span>Total:</span>
              <span style={{ color: "#10b981" }}>${Number(detalleData.venta.total).toFixed(2)}</span>
            </div>

            {detalleData.venta.estado === "Completada" && (
              <Button 
                onClick={() => setShowConfirmAnular(detalleData.venta.id)}
                style={{ width: "100%", background: "#ef4444" }}
              >
                Anular Venta
              </Button>
            )}
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR ANULACIÓN */}
      {showConfirmAnular !== null && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1001 }} onClick={() => setShowConfirmAnular(null)}>
          <div style={{ background: "white", borderRadius: "12px", padding: "32px", width: "100%", maxWidth: "400px" }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: "16px", fontSize: "20px" }}>¿Anular venta?</h2>
            <p style={{ color: "var(--muted-foreground)", marginBottom: "24px" }}>
              Esta acción restaurará el stock de los productos vendidos.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setShowConfirmAnular(null)} style={{ flex: 1, padding: "12px", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={() => anularVenta(showConfirmAnular)} style={{ flex: 1, padding: "12px", border: "none", borderRadius: "6px", background: "#ef4444", color: "white", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                Sí, anular
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}