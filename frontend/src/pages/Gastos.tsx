import { useState } from "react";
import { Card, Badge, Table, TR, TD, SearchBar, SectionHeader, Button, Modal, Input, Select } from "../components/ui";

type Gasto = {
  id: string;
  fecha: string;
  descripcion: string;
  categoria: string;
  monto: number;
  metodo: string;
  estado: "Registrado" | "Anulado";
};

const initialGastos: Gasto[] = [
  { id: "G-001", fecha: "01/09/2026", descripcion: "Alquiler del local", categoria: "Alquiler", monto: 1200.00, metodo: "Transferencia", estado: "Registrado" },
  { id: "G-002", fecha: "05/09/2026", descripcion: "Factura de electricidad", categoria: "Servicios básicos", monto: 180.00, metodo: "Transferencia", estado: "Registrado" },
  { id: "G-003", fecha: "10/09/2026", descripcion: "Publicidad en Instagram", categoria: "Marketing", monto: 250.00, metodo: "Tarjeta", estado: "Registrado" },
  { id: "G-004", fecha: "12/09/2026", descripcion: "Reparación de secador", categoria: "Mantenimiento", monto: 150.00, metodo: "Efectivo", estado: "Anulado" },
  { id: "G-005", fecha: "14/09/2026", descripcion: "Pago de internet", categoria: "Servicios básicos", monto: 45.00, metodo: "Transferencia", estado: "Registrado" },
];

export default function Gastos() {
  const [gastos, setGastos] = useState<Gasto[]>(initialGastos);
  const [search, setSearch] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ descripcion: "", categoria: "Servicios básicos", monto: "", metodo: "Efectivo" });

  const filtered = gastos.filter((g) => {
    const matchSearch = g.descripcion.toLowerCase().includes(search.toLowerCase()) || g.id.toLowerCase().includes(search.toLowerCase());
    const matchCategoria = filtroCategoria === "Todas" || g.categoria === filtroCategoria;
    return matchSearch && matchCategoria && g.estado === "Registrado"; // Solo mostramos los no anulados por defecto
  });

  // Cálculos
  const totalGastos = filtered.reduce((sum, g) => sum + g.monto, 0);
  const gastosFijos = filtered.filter(g => g.categoria === "Alquiler" || g.categoria === "Servicios básicos").reduce((sum, g) => sum + g.monto, 0);

  const handleSave = () => {
    const nuevoGasto: Gasto = {
      id: `G-${String(gastos.length + 1).padStart(3, "0")}`,
      fecha: new Date().toLocaleDateString("es-GT"),
      descripcion: form.descripcion,
      categoria: form.categoria,
      monto: Number(form.monto) || 0,
      metodo: form.metodo,
      estado: "Registrado",
    };
    setGastos((prev) => [nuevoGasto, ...prev]);
    setShowModal(false);
    setForm({ descripcion: "", categoria: "Servicios básicos", monto: "", metodo: "Efectivo" });
  };

  const anularGasto = (id: string) => {
    setGastos((prev) => prev.map((g) => (g.id === id ? { ...g, estado: "Anulado" } : g)));
  };

  return (
    <div>
      <SectionHeader
        title="Gastos"
        sub="Control de egresos operativos del negocio"
        actions={<Button onClick={() => setShowModal(true)}>+ Registrar Gasto</Button>}
      />

      {/* Tarjetas de Resumen */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <Card style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "var(--muted-foreground)", marginBottom: "8px" }}>Total de gastos (filtrado)</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--danger)", fontFamily: "'DM Serif Display', serif" }}>${totalGastos.toFixed(2)}</div>
        </Card>
        <Card style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "var(--muted-foreground)", marginBottom: "8px" }}>Gastos Fijos (Alquiler y Servicios)</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--warning)", fontFamily: "'DM Serif Display', serif" }}>${gastosFijos.toFixed(2)}</div>
        </Card>
      </div>

      {/* Tabla */}
      <Card>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar por descripción o ID..." />
          <select 
            value={filtroCategoria} 
            onChange={(e) => setFiltroCategoria(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", fontSize: "13px", outline: "none" }}
          >
            <option value="Todas">Todas las categorías</option>
            <option value="Alquiler">Alquiler</option>
            <option value="Servicios básicos">Servicios básicos</option>
            <option value="Marketing">Marketing</option>
            <option value="Mantenimiento">Mantenimiento</option>
            <option value="Otros">Otros</option>
          </select>
        </div>

        <Table headers={["ID", "Fecha", "Descripción", "Categoría", "Monto", "Método", "Estado", ""]}>
          {filtered.map((g) => (
            <TR key={g.id}>
              <TD mono>{g.id}</TD>
              <TD style={{ fontSize: "12px" }}>{g.fecha}</TD>
              <TD>{g.descripcion}</TD>
              <TD>{g.categoria}</TD>
              <TD mono style={{ fontWeight: "bold", color: "var(--danger)" }}>${g.monto.toFixed(2)}</TD>
              <TD style={{ fontSize: "12px" }}>{g.metodo}</TD>
              <TD><Badge variant="muted">{g.estado}</Badge></TD>
              <TD>
                <button 
                  onClick={() => anularGasto(g.id)} 
                  style={{ background: "none", border: "none", color: "var(--muted-foreground)", fontSize: "12px", cursor: "pointer" }}
                >
                  Anular
                </button>
              </TD>
            </TR>
          ))}
        </Table>
      </Card>

      {/* Modal Nuevo Gasto */}
      {showModal && (
        <Modal title="Registrar Nuevo Gasto" onClose={() => setShowModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "rgba(78,99,200,0.08)", padding: "12px", borderRadius: "8px", fontSize: "13px", color: "#4E63C8" }}>
              💡 Recuerda: Usa este módulo para gastos operativos (luz, agua, alquiler). Si compraste inventario, usa el módulo de Compras.
            </div>
            <Input label="Descripción del gasto" value={form.descripcion} onChange={(v: string) => setForm((f) => ({ ...f, descripcion: v }))} required placeholder="Ej. Factura de luz septiembre" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Select 
                label="Categoría" 
                value={form.categoria} 
                onChange={(v: string) => setForm((f) => ({ ...f, categoria: v }))}
                options={[
                  { value: "Alquiler", label: "Alquiler" },
                  { value: "Servicios básicos", label: "Servicios básicos" },
                  { value: "Marketing", label: "Marketing" },
                  { value: "Mantenimiento", label: "Mantenimiento" },
                  { value: "Otros", label: "Otros" }
                ]}
              />
              <Select 
                label="Método de pago" 
                value={form.metodo} 
                onChange={(v: string) => setForm((f) => ({ ...f, metodo: v }))}
                options={[
                  { value: "Efectivo", label: "Efectivo" },
                  { value: "Transferencia", label: "Transferencia" },
                  { value: "Tarjeta", label: "Tarjeta" }
                ]}
              />
            </div>
            <Input label="Monto ($)" value={form.monto} onChange={(v: string) => setForm((f) => ({ ...f, monto: v }))} type="number" required />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar Gasto</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}