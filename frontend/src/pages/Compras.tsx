import { useState } from "react";
import { Card, Badge, Table, TR, TD, SearchBar, SectionHeader, Button, Modal, Input, Select } from "../components/ui";

type Compra = {
  id: string;
  fecha: string;
  proveedor: string;
  total: number;
  estado: "Pagada" | "Pendiente";
  metodo: string;
};

const initialCompras: Compra[] = [
  { id: "C-0023", fecha: "10/09/2026", proveedor: "BellyNails S.A.", total: 820.00, estado: "Pagada", metodo: "Transferencia" },
  { id: "C-0022", fecha: "05/09/2026", proveedor: "Distribuidora Glamour", total: 1240.00, estado: "Pendiente", metodo: "Crédito 30 días" },
  { id: "C-0021", fecha: "01/09/2026", proveedor: "ProLash Supply", total: 395.00, estado: "Pagada", metodo: "Efectivo" },
  { id: "C-0020", fecha: "28/08/2026", proveedor: "BellyNails S.A.", total: 560.00, estado: "Pagada", metodo: "Transferencia" },
];

export default function Compras() {
  const [compras, setCompras] = useState<Compra[]>(initialCompras);
  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ proveedor: "", total: "", estado: "Pendiente" });

  const filtered = compras.filter((c) => {
    const matchSearch = c.proveedor.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
    const matchEstado = filtroEstado === "Todos" || c.estado === filtroEstado;
    return matchSearch && matchEstado;
  });

  // Cálculos para tarjetas
  const totalGastado = filtered.reduce((sum, c) => sum + c.total, 0);
  const totalPendiente = filtered.filter(c => c.estado === "Pendiente").reduce((sum, c) => sum + c.total, 0);

  const handleSave = () => {
    const nuevaCompra: Compra = {
      id: `C-${String(compras.length + 1).padStart(4, "0")}`,
      fecha: new Date().toLocaleDateString("es-GT"),
      proveedor: form.proveedor,
      total: Number(form.total) || 0,
      estado: form.estado as "Pagada" | "Pendiente",
      metodo: "Efectivo",
    };
    setCompras((prev) => [nuevaCompra, ...prev]);
    setShowModal(false);
    setForm({ proveedor: "", total: "", estado: "Pendiente" });
  };

  return (
    <div>
      <SectionHeader
        title="Compras"
        sub="Registro de adquisiciones a proveedores"
        actions={<Button onClick={() => setShowModal(true)}>+ Registrar Compra</Button>}
      />

      {/* Tarjetas de Resumen */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <Card style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "var(--muted-foreground)", marginBottom: "8px" }}>Total Compras (filtrado)</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--primary)", fontFamily: "'DM Serif Display', serif" }}>${totalGastado.toFixed(2)}</div>
        </Card>
        <Card style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "var(--muted-foreground)", marginBottom: "8px" }}>Pagadas</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--success)", fontFamily: "'DM Serif Display', serif" }}>
            ${ (totalGastado - totalPendiente).toFixed(2) }
          </div>
        </Card>
        <Card style={{ padding: "20px", border: "1px solid rgba(196,126,26,0.3)" }}>
          <div style={{ fontSize: "12px", color: "var(--muted-foreground)", marginBottom: "8px" }}>Pendientes de pago</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--warning)", fontFamily: "'DM Serif Display', serif" }}>${totalPendiente.toFixed(2)}</div>
        </Card>
      </div>

      {/* Tabla */}
      <Card>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar por proveedor o ID..." />
          <select 
            value={filtroEstado} 
            onChange={(e) => setFiltroEstado(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: "13px", outline: "none" }}
          >
            <option value="Todos">Todos los estados</option>
            <option value="Pagada">Pagadas</option>
            <option value="Pendiente">Pendientes</option>
          </select>
        </div>

        <Table headers={["ID", "Fecha", "Proveedor", "Total", "Método", "Estado"]}>
          {filtered.map((c) => (
            <TR key={c.id}>
              <TD mono style={{ color: "var(--primary)", fontWeight: 600 }}>{c.id}</TD>
              <TD style={{ fontSize: "12px" }}>{c.fecha}</TD>
              <TD>{c.proveedor}</TD>
              <TD mono style={{ fontWeight: "bold" }}>${c.total.toFixed(2)}</TD>
              <TD style={{ fontSize: "12px" }}>{c.metodo}</TD>
              <TD>
                <Badge variant={c.estado === "Pagada" ? "success" : "warning"}>{c.estado}</Badge>
              </TD>
            </TR>
          ))}
        </Table>
      </Card>

      {/* Modal Nueva Compra */}
      {showModal && (
        <Modal title="Registrar Nueva Compra" onClose={() => setShowModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Input label="Proveedor" value={form.proveedor} onChange={(v: string) => setForm((f) => ({ ...f, proveedor: v }))} required placeholder="Ej. BellyNails S.A." />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Input label="Total ($)" value={form.total} onChange={(v: string) => setForm((f) => ({ ...f, total: v }))} type="number" required />
              <Select 
                label="Estado de pago" 
                value={form.estado} 
                onChange={(v: string) => setForm((f) => ({ ...f, estado: v }))}
                options={[
                  { value: "Pagada", label: "Pagada" },
                  { value: "Pendiente", label: "Pendiente (Crédito)" }
                ]}
              />
            </div>
            <div style={{ background: "rgba(78,99,200,0.08)", padding: "12px", borderRadius: "8px", fontSize: "13px", color: "#4E63C8" }}>
               Si seleccionas "Pendiente", esta compra aparecerá automáticamente en el módulo de Cuentas por Pagar.
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar Compra</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}