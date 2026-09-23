import { useState } from "react";
import { Card, Badge, Table, TR, TD, SearchBar, SectionHeader, Button, Modal } from "../components/ui";

type DetalleItem = {
  nombre: string;
  cantidad: number;
  precio: number;
};

type Venta = {
  id: string;
  fecha: string;
  itemsResumen: string;
  total: number;
  metodo: "Efectivo" | "Transferencia" | "Tarjeta";
  estado: "Completada" | "Anulada";
  detalle: DetalleItem[];
};

// Datos de prueba
const initialVentas: Venta[] = [
  { 
    id: "V-0090", fecha: "15/09/2026 10:32", itemsResumen: "Uñas acrílicas, Esmalte", total: 32.00, metodo: "Efectivo", estado: "Completada",
    detalle: [{ nombre: "Uñas acrílicas completas", cantidad: 1, precio: 25.00 }, { nombre: "Esmalte semipermanente", cantidad: 1, precio: 7.00 }]
  },
  { 
    id: "V-0089", fecha: "15/09/2026 09:15", itemsResumen: "Pedicure spa", total: 20.00, metodo: "Transferencia", estado: "Completada",
    detalle: [{ nombre: "Pedicure spa", cantidad: 1, precio: 20.00 }]
  },
  { 
    id: "V-0088", fecha: "14/09/2026 16:45", itemsResumen: "Shampoo reparador", total: 12.00, metodo: "Efectivo", estado: "Completada",
    detalle: [{ nombre: "Shampoo reparador 500ml", cantidad: 1, precio: 12.00 }]
  },
  { 
    id: "V-0087", fecha: "14/09/2026 11:20", itemsResumen: "Lifting de pestañas", total: 35.00, metodo: "Tarjeta", estado: "Completada",
    detalle: [{ nombre: "Lifting de pestañas", cantidad: 1, precio: 35.00 }]
  },
  { 
    id: "V-0086", fecha: "13/09/2026 15:10", itemsResumen: "Manicure clásico", total: 15.00, metodo: "Efectivo", estado: "Anulada",
    detalle: [{ nombre: "Manicure clásico", cantidad: 1, precio: 15.00 }]
  },
];

export default function HistorialVentas() {
  const [ventas] = useState<Venta[]>(initialVentas);
  const [search, setSearch] = useState("");
  const [filtroMetodo, setFiltroMetodo] = useState("Todos");
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);

  // Filtrar ventas
  const filtered = ventas.filter((v) => {
    const matchSearch = v.id.toLowerCase().includes(search.toLowerCase()) || v.itemsResumen.toLowerCase().includes(search.toLowerCase());
    const matchMetodo = filtroMetodo === "Todos" || v.metodo === filtroMetodo;
    return matchSearch && matchMetodo;
  });

  // Calcular totales para las tarjetas
  const totalDia = filtered.reduce((sum, v) => sum + v.total, 0);
  const totalEfectivo = filtered.filter(v => v.metodo === "Efectivo").reduce((sum, v) => sum + v.total, 0);
  const totalTransferencia = filtered.filter(v => v.metodo === "Transferencia").reduce((sum, v) => sum + v.total, 0);

  const getMetodoBadge = (metodo: string) => {
    if (metodo === "Efectivo") return <Badge variant="success">Efectivo</Badge>;
    if (metodo === "Transferencia") return <Badge variant="warning">Transferencia</Badge>;
    return <Badge variant="default">Tarjeta</Badge>;
  };

  return (
    <div>
      <SectionHeader
        title="Historial de Ventas"
        sub={`${filtered.length} ventas registradas`}
        actions={<Button variant="secondary">⬇ Exportar</Button>}
      />

      {/* Tarjetas de Resumen */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <Card style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "var(--muted-foreground)", marginBottom: "8px" }}>Total filtrado</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--primary)", fontFamily: "'DM Serif Display', serif" }}>${totalDia.toFixed(2)}</div>
        </Card>
        <Card style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "var(--muted-foreground)", marginBottom: "8px" }}>En Efectivo</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--success)", fontFamily: "'DM Serif Display', serif" }}>${totalEfectivo.toFixed(2)}</div>
        </Card>
        <Card style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "var(--muted-foreground)", marginBottom: "8px" }}>En Transferencia</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#4E63C8", fontFamily: "'DM Serif Display', serif" }}>${totalTransferencia.toFixed(2)}</div>
        </Card>
      </div>

      {/* Tabla de Ventas */}
      <Card>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar por ID o productos..." />
          <select 
            value={filtroMetodo} 
            onChange={(e) => setFiltroMetodo(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: "13px", outline: "none" }}
          >
            <option value="Todos">Todos los métodos</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Tarjeta">Tarjeta</option>
          </select>
        </div>

        <Table headers={["ID", "Fecha", "Productos / Servicios", "Total", "Método", "Estado", ""]}>
          {filtered.map((v) => (
            <TR key={v.id} onClick={() => setVentaSeleccionada(v)}>
              <TD mono style={{ color: "var(--primary)", fontWeight: 600 }}>{v.id}</TD>
              <TD style={{ fontSize: "12px" }}>{v.fecha}</TD>
              <TD>{v.itemsResumen}</TD>
              <TD mono style={{ fontWeight: "bold" }}>${v.total.toFixed(2)}</TD>
              <TD>{getMetodoBadge(v.metodo)}</TD>
              <TD>
                <Badge variant={v.estado === "Completada" ? "success" : "danger"}>{v.estado}</Badge>
              </TD>
              <TD>
                <button style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "12px", cursor: "pointer" }}>
                  Ver detalle →
                </button>
              </TD>
            </TR>
          ))}
        </Table>
      </Card>

      {/* Modal de Detalle */}
      {ventaSeleccionada && (
        <Modal title={`Detalle de Venta ${ventaSeleccionada.id}`} onClose={() => setVentaSeleccionada(null)}>
          <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", fontSize: "14px", color: "var(--muted-foreground)" }}>
            <span>Fecha: {ventaSeleccionada.fecha}</span>
            <span>Estado: {ventaSeleccionada.estado}</span>
          </div>
          
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
            {ventaSeleccionada.detalle.map((item, index) => (
              <div key={index} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed var(--border)" }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{item.nombre}</div>
                  <div style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>Cantidad: {item.cantidad} x ${item.precio.toFixed(2)}</div>
                </div>
                <div style={{ fontWeight: "bold" }}>${(item.cantidad * item.precio).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px", fontSize: "18px", fontWeight: "bold", color: "var(--primary)", fontFamily: "'DM Serif Display', serif" }}>
            <span>Total Pagado:</span>
            <span>${ventaSeleccionada.total.toFixed(2)}</span>
          </div>
        </Modal>
      )}
    </div>
  );
}