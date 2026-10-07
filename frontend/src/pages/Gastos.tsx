import { useState, useEffect } from "react";
import { Card, Badge, Button } from "../components/ui";

type Gasto = {
  id: number;
  codigo: string;
  fecha: string;
  descripcion: string;
  categoria_id: number;
  categoria: string;
  monto: number;
  metodo_pago: string;
  estado: string;
};

type Categoria = {
  id: number;
  nombre: string;
};

type Filtros = {
  search: string;
  categoria_id: string;
  metodo_pago: string;
  fecha_desde: string;
  fecha_hasta: string;
};

export default function Gastos() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmAnular, setShowConfirmAnular] = useState<number | null>(null);
  const [modalExito, setModalExito] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [totalMes, setTotalMes] = useState(0);

  const [filtros, setFiltros] = useState<Filtros>({
    search: "",
    categoria_id: "",
    metodo_pago: "",
    fecha_desde: "",
    fecha_hasta: ""
  });

  const [formData, setFormData] = useState({
    descripcion: "",
    categoria_id: "",
    monto: "",
    metodo_pago: "Efectivo",
    fecha: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    cargarCategorias();
  }, []);

  useEffect(() => {
    cargarGastos();
  }, [filtros]);

  const cargarCategorias = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/categorias/listar_gastos.php");
      const data = await res.json();
      if (data.success) setCategorias(data.categorias);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  };

  const cargarGastos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filtros.search) params.append('search', filtros.search);
      if (filtros.categoria_id) params.append('categoria_id', filtros.categoria_id);
      if (filtros.metodo_pago) params.append('metodo_pago', filtros.metodo_pago);
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);

      const res = await fetch(`http://localhost:8000/api/gastos/listar.php?${params.toString()}`);
      const data = await res.json();
      
      if (data.success) {
        setGastos(data.gastos);
        setTotalMes(data.estadisticas?.total_mes || 0);
      } else {
        setModalError(data.error || "Error al cargar gastos");
      }
    } catch (err) {
      setModalError("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (name: keyof Filtros, value: string) => {
    setFiltros({ ...filtros, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    if (!formData.descripcion || !formData.categoria_id || !formData.monto) {
      setModalError("Todos los campos marcados con * son obligatorios");
      setFormLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/gastos/crear.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          categoria_id: parseInt(formData.categoria_id),
          monto: parseFloat(formData.monto),
          usuario_id: 1
        })
      });

      const data = await res.json();

      if (data.success) {
        setModalExito(`✅ Gasto registrado: ${data.codigo}`);
        setShowModal(false);
        setFormData({
          descripcion: "",
          categoria_id: "",
          monto: "",
          metodo_pago: "Efectivo",
          fecha: new Date().toISOString().split('T')[0]
        });
        cargarGastos();
      } else {
        setModalError(data.error || "Error al registrar gasto");
      }
    } catch (err) {
      setModalError("No se pudo conectar con el servidor");
    } finally {
      setFormLoading(false);
    }
  };

  const handleAnular = async (id: number) => {
    try {
      const res = await fetch("http://localhost:8000/api/gastos/anular.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setShowConfirmAnular(null);
        setModalExito("Gasto anulado correctamente");
        cargarGastos();
      } else {
        setModalError(data.error);
      }
    } catch (err) {
      setModalError("Error de conexión");
    }
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
      {/* MODAL ÉXITO */}
      {modalExito && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", textAlign: "center", maxWidth: "400px" }}>
            <div style={{ fontSize: "50px", marginBottom: "10px" }}>✅</div>
            <h3 style={{ margin: "0 0 10px 0" }}>{modalExito}</h3>
            <Button onClick={() => setModalExito(null)}>Aceptar</Button>
          </div>
        </div>
      )}

      {/* MODAL ERROR */}
      {modalError && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", textAlign: "center", maxWidth: "400px" }}>
            <div style={{ fontSize: "50px", marginBottom: "10px" }}>⚠️</div>
            <h3 style={{ margin: "0 0 10px 0", color: "#ef4444" }}>Error</h3>
            <p>{modalError}</p>
            <Button onClick={() => setModalError(null)} style={{ background: "#ef4444" }}>Cerrar</Button>
          </div>
        </div>
      )}

      {/* Botón nuevo gasto */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <Button onClick={() => setShowModal(true)}>+ Nuevo gasto</Button>
      </div>

      {/* Tarjetas resumen */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Gastos del mes</div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#ef4444" }}>${totalMes.toFixed(2)}</div>
        </div>
        <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Registros activos</div>
          <div style={{ fontSize: "24px", fontWeight: 700 }}>{gastos.length}</div>
        </div>
      </div>

      <Card>
        {/* Filtros */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1.5fr 1fr 1fr", gap: "12px", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Buscar por descripción o código..."
              value={filtros.search}
              onChange={(e) => handleFiltroChange('search', e.target.value)}
              style={{ ...filterInputStyle, width: "100%" }}
            />
            <select
              value={filtros.categoria_id}
              onChange={(e) => handleFiltroChange('categoria_id', e.target.value)}
              style={{ ...filterInputStyle, width: "100%", cursor: "pointer" }}
            >
              <option value="">Todas las categorías</option>
              {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
            </select>
            <select
              value={filtros.metodo_pago}
              onChange={(e) => handleFiltroChange('metodo_pago', e.target.value)}
              style={{ ...filterInputStyle, width: "100%", cursor: "pointer" }}
            >
              <option value="">Todos los métodos</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Tarjeta">Tarjeta</option>
            </select>
            <input
              type="date"
              value={filtros.fecha_desde}
              onChange={(e) => handleFiltroChange('fecha_desde', e.target.value)}
              style={{ ...filterInputStyle, width: "100%" }}
              title="Fecha desde"
            />
            <input
              type="date"
              value={filtros.fecha_hasta}
              onChange={(e) => handleFiltroChange('fecha_hasta', e.target.value)}
              style={{ ...filterInputStyle, width: "100%" }}
              title="Fecha hasta"
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Cargando...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>CÓDIGO</th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>FECHA</th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>DESCRIPCIÓN</th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>CATEGORÍA</th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>MONTO</th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>MÉTODO</th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>ESTADO</th>
                  <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {gastos.map((g) => (
                  <tr key={g.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "12px", fontFamily: "monospace", fontWeight: 600 }}>{g.codigo}</td>
                    <td style={{ padding: "12px" }}>{new Date(g.fecha).toLocaleDateString('es-MX')}</td>
                    <td style={{ padding: "12px" }}>{g.descripcion}</td>
                    <td style={{ padding: "12px" }}>{g.categoria}</td>
                    <td style={{ padding: "12px", fontWeight: 700, color: "#ef4444" }}>${Number(g.monto).toFixed(2)}</td>
                    <td style={{ padding: "12px" }}>{g.metodo_pago}</td>
                    <td style={{ padding: "12px" }}>
                      <Badge variant={g.estado === "Activo" ? "success" : "muted"}>{g.estado}</Badge>
                    </td>
                    <td style={{ padding: "12px" }}>
                      {g.estado === "Activo" && (
                        <button 
                          onClick={() => setShowConfirmAnular(g.id)}
                          style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}
                        >
                          Anular
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {gastos.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
                      No se encontraron gastos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* MODAL CREAR GASTO */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: "white", borderRadius: "12px", padding: "32px", width: "100%", maxWidth: "500px" }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: "24px", fontSize: "20px" }}>Nuevo Gasto</h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>Descripción *</label>
                  <input 
                    type="text" 
                    value={formData.descripcion} 
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} 
                    required 
                    style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }} 
                    placeholder="Ej: Pago de luz del mes" 
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>Categoría *</label>
                  <select 
                    value={formData.categoria_id} 
                    onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })} 
                    required 
                    style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", background: "white" }}
                  >
                    <option value="">Selecciona una categoría</option>
                    {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>Monto *</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      value={formData.monto} 
                      onChange={(e) => setFormData({ ...formData, monto: e.target.value })} 
                      required 
                      style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }} 
                      placeholder="0.00" 
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>Fecha *</label>
                    <input 
                      type="date" 
                      value={formData.fecha} 
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })} 
                      required 
                      style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }} 
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>Método de Pago *</label>
                  <select 
                    value={formData.metodo_pago} 
                    onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value })} 
                    required 
                    style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", background: "white" }}
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Tarjeta">Tarjeta</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "12px", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                  Cancelar
                </button>
                <button type="submit" disabled={formLoading} style={{ flex: 1, padding: "12px", border: "none", borderRadius: "6px", background: formLoading ? "#9ca3af" : "#c08497", color: "white", fontSize: "14px", fontWeight: 600, cursor: formLoading ? "not-allowed" : "pointer" }}>
                  {formLoading ? "Guardando..." : "Guardar Gasto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR ANULACIÓN */}
      {showConfirmAnular !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1001 }} onClick={() => setShowConfirmAnular(null)}>
          <div style={{ background: "white", borderRadius: "12px", padding: "32px", width: "100%", maxWidth: "400px" }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: "16px", fontSize: "20px" }}>¿Anular gasto?</h2>
            <p style={{ color: "#6b7280", marginBottom: "24px" }}>
              Esta acción marcará el gasto como anulado y no será considerado en los totales.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setShowConfirmAnular(null)} style={{ flex: 1, padding: "12px", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={() => handleAnular(showConfirmAnular)} style={{ flex: 1, padding: "12px", border: "none", borderRadius: "6px", background: "#ef4444", color: "white", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                Sí, anular
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}