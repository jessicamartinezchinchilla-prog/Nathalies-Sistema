import { useState } from "react";
import { Card, Badge, Table, TR, TD, SearchBar, SectionHeader, Button, Modal, Input, Select } from "../components/ui";

type Servicio = {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  precio: number;
  duracion: number; // en minutos
  estado: "Activo" | "Inactivo";
};

const initialServicios: Servicio[] = [
  { id: "1", codigo: "SRV-001", nombre: "Uñas acrílicas completas", categoria: "Uñas", precio: 25.00, duracion: 60, estado: "Activo" },
  { id: "2", codigo: "SRV-002", nombre: "Manicure clásico", categoria: "Uñas", precio: 15.00, duracion: 30, estado: "Activo" },
  { id: "3", codigo: "SRV-003", nombre: "Pedicure spa", categoria: "Uñas", precio: 20.00, duracion: 45, estado: "Activo" },
  { id: "4", codigo: "SRV-004", nombre: "Lifting de pestañas", categoria: "Pestañas", precio: 35.00, duracion: 50, estado: "Activo" },
  { id: "5", codigo: "SRV-005", nombre: "Esmalte semipermanente", categoria: "Uñas", precio: 12.00, duracion: 25, estado: "Inactivo" },
];

export default function Servicios() {
  const [servicios, setServicios] = useState<Servicio[]>(initialServicios);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Servicio | null>(null);
  const [form, setForm] = useState<Partial<Servicio>>({});

  const filtered = servicios.filter((s) =>
    s.nombre.toLowerCase().includes(search.toLowerCase()) ||
    s.codigo.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setEditing(null);
    setForm({ estado: "Activo", categoria: "Uñas" });
    setShowModal(true);
  };

  const openEdit = (s: Servicio) => {
    setEditing(s);
    setForm({ ...s });
    setShowModal(true);
  };

  const save = () => {
    if (editing) {
      setServicios((prev) => prev.map((s) => (s.id === editing.id ? { ...s, ...form } as Servicio : s)));
    } else {
      const nuevo: Servicio = {
        id: String(servicios.length + 1),
        codigo: form.codigo || "",
        nombre: form.nombre || "",
        categoria: form.categoria || "Uñas",
        precio: Number(form.precio) || 0,
        duracion: Number(form.duracion) || 0,
        estado: "Activo",
      };
      setServicios((prev) => [nuevo, ...prev]);
    }
    setShowModal(false);
  };

  const toggleEstado = (id: string) => {
    setServicios((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, estado: s.estado === "Activo" ? "Inactivo" : "Activo" } : s
      )
    );
  };

  return (
    <div>
      <SectionHeader
        title="Servicios"
        sub={`${servicios.length} servicios en el catálogo`}
        actions={<Button onClick={openNew}>+ Nuevo servicio</Button>}
      />

      <Card>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar servicio o código..." />
          <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
            {filtered.length} resultados
          </span>
        </div>

        <Table headers={["Código", "Nombre", "Categoría", "Precio", "Duración", "Estado", ""]}>
          {filtered.map((s) => (
            <TR key={s.id}>
              <TD mono>{s.codigo}</TD>
              <TD>{s.nombre}</TD>
              <TD>{s.categoria}</TD>
              <TD mono>$ {s.precio.toFixed(2)}</TD>
              <TD>{s.duracion} min</TD>
              <TD>
                <Badge variant={s.estado === "Activo" ? "success" : "muted"}>{s.estado}</Badge>
              </TD>
              <TD>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => openEdit(s)} style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "12px", cursor: "pointer" }}>Editar</button>
                  <button onClick={() => toggleEstado(s.id)} style={{ background: "none", border: "none", color: "var(--muted-foreground)", fontSize: "12px", cursor: "pointer" }}>
                    {s.estado === "Activo" ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </TD>
            </TR>
          ))}
        </Table>
      </Card>

      {showModal && (
        <Modal title={editing ? "Editar servicio" : "Nuevo servicio"} onClose={() => setShowModal(false)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Input label="Código" value={form.codigo || ""} onChange={(v: string) => setForm((f) => ({ ...f, codigo: v }))} required />
            <Select
              label="Categoría"
              value={form.categoria || "Uñas"}
              onChange={(v: string) => setForm((f) => ({ ...f, categoria: v }))}
              options={[
                { value: "Uñas", label: "Uñas" },
                { value: "Pestañas", label: "Pestañas" },
                { value: "Otros", label: "Otros" },
              ]}
            />
            <div style={{ gridColumn: "1 / -1" }}>
              <Input label="Nombre del servicio" value={form.nombre || ""} onChange={(v: string) => setForm((f) => ({ ...f, nombre: v }))} required />
            </div>
            <Input label="Precio ($)" value={String(form.precio || "")} onChange={(v: string) => setForm((f) => ({ ...f, precio: Number(v) }))} type="number" />
            <Input label="Duración (minutos)" value={String(form.duracion || "")} onChange={(v: string) => setForm((f) => ({ ...f, duracion: Number(v) }))} type="number" />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={save}>Guardar servicio</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}