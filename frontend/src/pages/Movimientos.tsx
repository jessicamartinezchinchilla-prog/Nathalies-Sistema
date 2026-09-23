import { useState } from "react";
import { Card, Badge, Table, TR, TD, SearchBar, SectionHeader, Button, Modal, Input, Select } from "../components/ui";

type Movimiento = {
  id: string;
  fecha: string;
  tipo: "Entrada" | "Salida" | "Ajuste";
  origen: string;
  item: string;
  cantidad: number;
  usuario: string;
};

const initialMovimientos: Movimiento[] = [
  { id: "M-001", fecha: "15/09/2026 09:30", tipo: "Entrada", origen: "Compra a Proveedor", item: "Esmalte UV Nude #3", cantidad: 10, usuario: "Nathalie" },
  { id: "M-002", fecha: "15/09/2026 10:15", tipo: "Salida", origen: "Venta V-0089", item: "Shampoo reparador 500ml", cantidad: 1, usuario: "Karla" },
  { id: "M-003", fecha: "14/09/2026 16:45", tipo: "Ajuste", origen: "Ajuste manual (merma)", item: "Gel acrílico transparente", cantidad: -1, usuario: "Nathalie" },
  { id: "M-004", fecha: "14/09/2026 11:20", tipo: "Salida", origen: "Venta V-0085", item: "Pulsera acrílica rosa", cantidad: 2, usuario: "Karla" },
  { id: "M-005", fecha: "13/09/2026 08:00", tipo: "Entrada", origen: "Compra a Proveedor", item: "Limpiadera 500ml", cantidad: 5, usuario: "Nathalie" },
];

export default function Movimientos() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>(initialMovimientos);
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("Todos");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ tipo: "Ajuste", item: "", cantidad: "", motivo: "" });

  const filtered = movimientos.filter((m) => {
    const matchSearch = m.item.toLowerCase().includes(search.toLowerCase()) || m.id.toLowerCase().includes(search.toLowerCase());
    const matchTipo = filterTipo === "Todos" || m.tipo === filterTipo;
    return matchSearch && matchTipo;
  });

  const getTipoBadge = (tipo: string) => {
    if (tipo === "Entrada") return <Badge variant="success">Entrada</Badge>;
    if (tipo === "Salida") return <Badge variant="danger">Salida</Badge>;
    return <Badge variant="warning">Ajuste</Badge>;
  };

  const handleSaveAjuste = () => {
    const nuevoMov: Movimiento = {
      id: `M-${String(movimientos.length + 1).padStart(3, "0")}`,
      fecha: new Date().toLocaleString("es-GT"),
      tipo: "Ajuste",
      origen: form.motivo || "Ajuste manual",
      item: form.item,
      cantidad: Number(form.cantidad),
      usuario: "Administrador",
    };
    setMovimientos((prev) => [nuevoMov, ...prev]);
    setShowModal(false);
    setForm({ tipo: "Ajuste", item: "", cantidad: "", motivo: "" });
  };

  return (
    <div>
      <SectionHeader
        title="Movimientos"
        sub="Historial de entradas, salidas y ajustes de inventario"
        actions={<Button onClick={() => setShowModal(true)}>+ Registrar Ajuste</Button>}
      />

      <Card>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar por producto o ID..." />
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>Filtrar:</span>
            <select 
              value={filterTipo} 
              onChange={(e) => setFilterTipo(e.target.value)}
              style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: "12px", outline: "none" }}
            >
              <option value="Todos">Todos</option>
              <option value="Entrada">Entradas</option>
              <option value="Salida">Salidas</option>
              <option value="Ajuste">Ajustes</option>
            </select>
          </div>
        </div>

        <Table headers={["ID", "Fecha", "Tipo", "Origen", "Producto", "Cantidad", "Usuario"]}>
          {filtered.map((m) => (
            <TR key={m.id}>
              <TD mono>{m.id}</TD>
              <TD style={{ fontSize: "12px" }}>{m.fecha}</TD>
              <TD>{getTipoBadge(m.tipo)}</TD>
              <TD>{m.origen}</TD>
              <TD>{m.item}</TD>
              <TD mono style={{ color: m.cantidad > 0 ? "var(--success)" : "var(--danger)", fontWeight: 600 }}>
                {m.cantidad > 0 ? "+" : ""}{m.cantidad}
              </TD>
              <TD>{m.usuario}</TD>
            </TR>
          ))}
        </Table>
      </Card>

      {showModal && (
        <Modal title="Registrar Ajuste Manual" onClose={() => setShowModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "rgba(78,99,200,0.08)", padding: "12px", borderRadius: "8px", fontSize: "13px", color: "#4E63C8" }}>
              💡 Usa esto para corregir el stock cuando haya mermas, pérdidas o errores de conteo.
            </div>
            <Input label="Producto / Insumo" value={form.item} onChange={(v: string) => setForm((f) => ({ ...f, item: v }))} required />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Input label="Cantidad (usa negativo para restar)" value={form.cantidad} onChange={(v: string) => setForm((f) => ({ ...f, cantidad: v }))} type="number" required />
              <Input label="Motivo / Referencia" value={form.motivo} onChange={(v: string) => setForm((f) => ({ ...f, motivo: v }))} placeholder="Ej. Frasco roto" />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSaveAjuste}>Guardar Ajuste</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}