import { useState } from "react";
import { Card, Badge, Table, TR, TD, SearchBar, SectionHeader, Button, Modal, Input, Select } from "../components/ui";

type Insumo = {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  costo: number;
  stock: number;
  stockMin: number;
  estado: "Activo" | "Inactivo";
};

const initialInsumos: Insumo[] = [
  { id: "1", codigo: "ESM-001", nombre: "Esmalte UV Nude #3", categoria: "Esmaltes", costo: 2.50, stock: 2, stockMin: 5, estado: "Activo" },
  { id: "2", codigo: "GEL-001", nombre: "Gel acrílico transparente", categoria: "Geles", costo: 6.00, stock: 1, stockMin: 3, estado: "Activo" },
  { id: "3", codigo: "LIM-001", nombre: "Limpiadera 500ml", categoria: "Insumos", costo: 4.00, stock: 0, stockMin: 2, estado: "Activo" },
  { id: "4", codigo: "BSE-001", nombre: "Base coat protectora", categoria: "Esmaltes", costo: 3.00, stock: 8, stockMin: 4, estado: "Activo" },
  { id: "5", codigo: "POL-001", nombre: "Polvo acrílico blanco", categoria: "Geles", costo: 7.00, stock: 5, stockMin: 3, estado: "Inactivo" },
];

export default function Insumos() {
  const [insumos, setInsumos] = useState<Insumo[]>(initialInsumos);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Insumo | null>(null);
  const [form, setForm] = useState<Partial<Insumo>>({});

  const filtered = insumos.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.codigo.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setEditing(null);
    setForm({ estado: "Activo", categoria: "Esmaltes" });
    setShowModal(true);
  };

  const openEdit = (p: Insumo) => {
    setEditing(p);
    setForm({ ...p });
    setShowModal(true);
  };

  const save = () => {
    if (editing) {
      setInsumos((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...form } as Insumo : p)));
    } else {
      const nuevo: Insumo = {
        id: String(insumos.length + 1),
        codigo: form.codigo || "",
        nombre: form.nombre || "",
        categoria: form.categoria || "Esmaltes",
        costo: Number(form.costo) || 0,
        stock: Number(form.stock) || 0,
        stockMin: Number(form.stockMin) || 0,
        estado: "Activo",
      };
      setInsumos((prev) => [nuevo, ...prev]);
    }
    setShowModal(false);
  };

  const toggleEstado = (id: string) => {
    setInsumos((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, estado: p.estado === "Activo" ? "Inactivo" : "Activo" } : p
      )
    );
  };

  const getStockColor = (stock: number, min: number) => {
    if (stock === 0) return "var(--danger)";
    if (stock < min) return "var(--warning)";
    return "var(--success)";
  };

  return (
    <div>
      <SectionHeader
        title="Insumos"
        sub={`${insumos.length} insumos de trabajo registrados`}
        actions={<Button onClick={openNew}>+ Nuevo insumo</Button>}
      />

      <div style={{ 
        background: "rgba(78,99,200,0.08)", color: "#4E63C8", padding: "12px 16px", 
        borderRadius: "8px", fontSize: "13px", marginBottom: "16px", border: "1px solid rgba(78,99,200,0.15)" 
      }}>
        💡 Estos son los materiales que usas para dar tus servicios. Actualiza el stock cuando hagas tu conteo periódico.
      </div>

      <Card>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar insumo o código..." />
          <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
            {filtered.length} resultados
          </span>
        </div>

        <Table headers={["Código", "Nombre", "Categoría", "Costo", "Stock", "Estado", ""]}>
          {filtered.map((p) => (
            <TR key={p.id}>
              <TD mono>{p.codigo}</TD>
              <TD>{p.nombre}</TD>
              <TD>{p.categoria}</TD>
              <TD mono>$ {p.costo.toFixed(2)}</TD>
              <TD>
                <span style={{ fontWeight: 600, color: getStockColor(p.stock, p.stockMin) }}>
                  {p.stock}
                </span>
                <span style={{ fontSize: "11px", color: "var(--muted-foreground)", marginLeft: "4px" }}>/ {p.stockMin}</span>
              </TD>
              <TD>
                <Badge variant={p.estado === "Activo" ? "success" : "muted"}>{p.estado}</Badge>
              </TD>
              <TD>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => openEdit(p)} style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "12px", cursor: "pointer" }}>Editar</button>
                  <button onClick={() => toggleEstado(p.id)} style={{ background: "none", border: "none", color: "var(--muted-foreground)", fontSize: "12px", cursor: "pointer" }}>
                    {p.estado === "Activo" ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </TD>
            </TR>
          ))}
        </Table>
      </Card>

      {showModal && (
        <Modal title={editing ? "Editar insumo" : "Nuevo insumo"} onClose={() => setShowModal(false)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Input label="Código" value={form.codigo || ""} onChange={(v: string) => setForm((f) => ({ ...f, codigo: v }))} required />
            <Select
              label="Categoría"
              value={form.categoria || "Esmaltes"}
              onChange={(v: string) => setForm((f) => ({ ...f, categoria: v }))}
              options={[
                { value: "Esmaltes", label: "Esmaltes" },
                { value: "Geles", label: "Geles" },
                { value: "Insumos", label: "Insumos" },
                { value: "Herramientas", label: "Herramientas" },
              ]}
            />
            <div style={{ gridColumn: "1 / -1" }}>
              <Input label="Nombre" value={form.nombre || ""} onChange={(v: string) => setForm((f) => ({ ...f, nombre: v }))} required />
            </div>
            <Input label="Costo unitario ($)" value={String(form.costo || "")} onChange={(v: string) => setForm((f) => ({ ...f, costo: Number(v) }))} type="number" />
            <Input label="Stock actual" value={String(form.stock || "")} onChange={(v: string) => setForm((f) => ({ ...f, stock: Number(v) }))} type="number" />
            <Input label="Stock mínimo" value={String(form.stockMin || "")} onChange={(v: string) => setForm((f) => ({ ...f, stockMin: Number(v) }))} type="number" />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={save}>Guardar insumo</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}