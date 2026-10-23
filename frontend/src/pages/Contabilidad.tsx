import { useState, useEffect } from "react";
import { Card, Badge, Button } from "../components/ui";

export default function Contabilidad() {
  // 1. Fechas por defecto: mes actual
  const hoy = new Date();
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
  const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];

  const [fechaInicio, setFechaInicio] = useState(primerDiaMes);
  const [fechaFin, setFechaFin] = useState(ultimoDiaMes);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activos, setActivos] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newActivo, setNewActivo] = useState({ nombre: "", categoria: "Equipo", valor_compra: "", fecha_compra: "" });

  // Función para formatear la fecha en el display
  const formatearFecha = (fechaStr: string) => {
    if (!fechaStr) return "";
    const [year, month, day] = fechaStr.split("-");
    const mesesCortos = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return `${parseInt(day)} ${mesesCortos[parseInt(month) - 1]} ${year}`;
  };

  // 2. Cargar datos UNA SOLA VEZ al montar el componente (mes actual)
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`http://localhost:8000/api/contabilidad/resumen.php?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`).then(r => r.json()),
      fetch(`http://localhost:8000/api/contabilidad/activos.php`).then(r => r.json())
    ]).then(([res1, res2]) => {
      if (res1.success) setData(res1.data);
      if (res2.success) setActivos(res2.activos);
    }).catch(err => console.error("Error cargando contabilidad:", err))
      .finally(() => setLoading(false));
  }, []); // 👈 Sin dependencias, solo se ejecuta una vez

  // 3. Función para filtrar cuando el usuario presione el botón
  const aplicarFiltro = () => {
    setLoading(true);
    Promise.all([
      fetch(`http://localhost:8000/api/contabilidad/resumen.php?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`).then(r => r.json()),
      fetch(`http://localhost:8000/api/contabilidad/activos.php`).then(r => r.json())
    ]).then(([res1, res2]) => {
      if (res1.success) setData(res1.data);
      if (res2.success) setActivos(res2.activos);
    }).catch(err => console.error("Error filtrando:", err))
      .finally(() => setLoading(false));
  };

  const fmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(n);

  const handleAddActivo = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("http://localhost:8000/api/contabilidad/activos.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newActivo, valor_compra: parseFloat(newActivo.valor_compra) })
    });
    setShowModal(false);
    setNewActivo({ nombre: "", categoria: "Equipo", valor_compra: "", fecha_compra: "" });

    const res = await fetch(`http://localhost:8000/api/contabilidad/activos.php`);
    const json = await res.json();
    if (json.success) setActivos(json.activos);
  };

  if (loading) return <div style={{ textAlign: "center", padding: "50px" }}>Calculando estado financiero...</div>;
  if (!data) return <div style={{ textAlign: "center", padding: "50px" }}>Sin datos</div>;

  const totalActivos = data.balance.efectivo_caja + data.balance.saldo_bancos + data.balance.inventario + data.balance.activos_fijos;
  const totalPasivos = data.balance.deuda_pendiente;
  const totalCapital = data.balance.utilidad_acumulada;

  return (
    <div>
      {/* ══════════════════════════════════════════
          HEADER CON SELECTORES DE FECHA Y BOTÓN FILTRAR
      ══════════════════════════════════════════ */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>Contabilidad y Finanzas</h1>
          <p style={{ color: "#6b7280", margin: "4px 0 0" }}>Estado de Resultados y Balance General</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          {/* Selector: Desde */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>Desde:</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", fontWeight: 500, outline: "none", cursor: "pointer" }}
            />
          </div>

          {/* Selector: Hasta */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>Hasta:</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", fontWeight: 500, outline: "none", cursor: "pointer" }}
            />
          </div>

          {/* 🎯 DISPLAY VISUAL DEL PERÍODO */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            padding: "8px 16px",
            borderRadius: "8px",
            color: "#15803d",
            fontWeight: 600,
            fontSize: "14px",
            whiteSpace: "nowrap"
          }}>
            📊 Período: {formatearFecha(fechaInicio)} → {formatearFecha(fechaFin)}
          </div>

          {/* 🔘 BOTÓN FILTRAR (Solo actualiza cuando lo presiones) */}
          <button
            onClick={aplicarFiltro}
            disabled={loading}
            style={{
              padding: "10px 20px",
              background: "#c08497",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            {loading ? "⏳ Procesando..." : "🔍 Filtrar"}
          </button>
        </div>
      </div>

      {/* SECCIÓN 1: ESTADO DE RESULTADOS (FIJO HASTA QUE FILTRES) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <Card>
          <div style={{ padding: "20px" }}>
            <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>Ingresos del Período</div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#10b981", margin: "8px 0" }}>{fmt(data.mes.ingresos)}</div>
          </div>
        </Card>
        <Card>
          <div style={{ padding: "20px" }}>
            <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>Egresos del Período</div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#ef4444", margin: "8px 0" }}>{fmt(data.mes.egresos)}</div>
          </div>
        </Card>
        <Card>
          <div style={{ padding: "20px" }}>
            <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>Utilidad Neta (Período)</div>
            <div style={{ fontSize: "26px", fontWeight: 700, color: data.mes.utilidad >= 0 ? "#3b82f6" : "#ef4444", margin: "8px 0" }}>{fmt(data.mes.utilidad)}</div>
          </div>
        </Card>
      </div>

      {/* SECCIÓN 2: BALANCE GENERAL */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px", marginBottom: "24px" }}>
        {/* ACTIVOS */}
        <Card>
          <div style={{ padding: "24px" }}>
            <h3 style={{ marginTop: 0, color: "#10b981", borderBottom: "2px solid #10b981", paddingBottom: "10px" }}>ACTIVOS</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280" }}> Efectivo en Caja</span>
                <strong>{fmt(data.balance.efectivo_caja)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280" }}>🏦 Saldo en Bancos/Transf.</span>
                <strong>{fmt(data.balance.saldo_bancos)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280" }}>📦 Valor Inventario</span>
                <strong>{fmt(data.balance.inventario)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280" }}>🪑 Activos Fijos</span>
                <strong>{fmt(data.balance.activos_fijos)}</strong>
              </div>
              <div style={{ borderTop: "2px solid #e5e7eb", paddingTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: 700, color: "#10b981" }}>
                <span>TOTAL ACTIVOS</span>
                <span>{fmt(totalActivos)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* PASIVOS */}
        <Card>
          <div style={{ padding: "24px" }}>
            <h3 style={{ marginTop: 0, color: "#f59e0b", borderBottom: "2px solid #f59e0b", paddingBottom: "10px" }}>PASIVOS</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280" }}>📄 Cuentas por Pagar</span>
                <strong>{fmt(data.balance.deuda_pendiente)}</strong>
              </div>
              <div style={{ borderTop: "2px solid #e5e7eb", paddingTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: 700, color: "#f59e0b" }}>
                <span>TOTAL PASIVOS</span>
                <span>{fmt(totalPasivos)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* CAPITAL CONTABLE */}
        <Card>
          <div style={{ padding: "24px" }}>
            <h3 style={{ marginTop: 0, color: "#3b82f6", borderBottom: "2px solid #3b82f6", paddingBottom: "10px" }}>CAPITAL CONTABLE</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280" }}> Utilidad Acumulada</span>
                <strong>{fmt(data.balance.utilidad_acumulada)}</strong>
              </div>
              <div style={{ borderTop: "2px solid #e5e7eb", paddingTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: 700, color: "#3b82f6" }}>
                <span>TOTAL CAPITAL</span>
                <span>{fmt(totalCapital)}</span>
              </div>

              <div style={{ marginTop: "20px", padding: "12px", background: "#f0f9ff", borderRadius: "8px", fontSize: "12px", textAlign: "center" }}>
                <strong>Ecuación:</strong> Activo ({fmt(totalActivos)}) = Pasivo ({fmt(totalPasivos)}) + Capital ({fmt(totalCapital)})
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* SECCIÓN 3: GESTIÓN DE ACTIVOS FIJOS */}
      <Card>
        <div style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ margin: 0 }}>🪑 Registro de Activos Fijos</h3>
            <Button onClick={() => setShowModal(true)}>+ Nuevo Activo</Button>
          </div>

          {activos.length === 0 ? (
            <p style={{ color: "#6b7280", textAlign: "center" }}>No hay activos fijos registrados.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
                  <th style={{ padding: "10px" }}>NOMBRE</th>
                  <th style={{ padding: "10px" }}>CATEGORÍA</th>
                  <th style={{ padding: "10px" }}>FECHA COMPRA</th>
                  <th style={{ padding: "10px", textAlign: "right" }}>VALOR</th>
                </tr>
              </thead>
              <tbody>
                {activos.map((a: any) => (
                  <tr key={a.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "10px", fontWeight: 600 }}>{a.nombre}</td>
                    <td style={{ padding: "10px" }}><Badge variant="muted">{a.categoria}</Badge></td>
                    <td style={{ padding: "10px" }}>{new Date(a.fecha_compra).toLocaleDateString('es-MX')}</td>
                    <td style={{ padding: "10px", textAlign: "right", fontWeight: 700 }}>{fmt(a.valor_compra)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* MODAL AGREGAR ACTIVO */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", width: "100%", maxWidth: "400px" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Registrar Activo Fijo</h3>
            <form onSubmit={handleAddActivo} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input required placeholder="Nombre (ej: Lámpara UV)" value={newActivo.nombre} onChange={e => setNewActivo({ ...newActivo, nombre: e.target.value })} style={{ padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
              <select value={newActivo.categoria} onChange={e => setNewActivo({ ...newActivo, categoria: e.target.value })} style={{ padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px" }}>
                <option value="Equipo">Equipo</option>
                <option value="Mobiliario">Mobiliario</option>
                <option value="Tecnología">Tecnología</option>
                <option value="Vehículo">Vehículo</option>
              </select>
              <input required type="number" step="0.01" placeholder="Valor de compra" value={newActivo.valor_compra} onChange={e => setNewActivo({ ...newActivo, valor_compra: e.target.value })} style={{ padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
              <input required type="date" value={newActivo.fecha_compra} onChange={e => setNewActivo({ ...newActivo, fecha_compra: e.target.value })} style={{ padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", cursor: "pointer" }}>Cancelar</button>
                <button type="submit" style={{ flex: 1, padding: "10px", border: "none", borderRadius: "6px", background: "#10b981", color: "white", cursor: "pointer" }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}