import { useState } from "react";
import { Card, Badge, Table, TR, TD, SearchBar, SectionHeader, Button, Modal, Input } from "../components/ui";

type Proveedor = {
  id: string;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  estado: "Activo" | "Inactivo";
};

const initialProveedores: Proveedor[] = [
  { id: "1", nombre: "BellyNails S.A.", contacto: "Sandra Pérez", telefono: "5555-1234", email: "ventas@bellynails.gt", estado: "Activo" },
  { id: "2", nombre: "Distribuidora Glamour", contacto: "Carlos Ruiz", telefono: "5555-5678", email: "pedidos@glamour.gt", estado: "Activo" },
  { id: "3", nombre: "ProLash Supply", contacto: "María García", telefono: "5555-9012", email: "info@prolash.gt", estado: "Activo" },
  { id: "4", nombre: "Importadora de Uñas", contacto: "Juan López", telefono: "5555-3456", email: "juan@importuñas.gt", estado: "Inactivo" },
];

export default function Proveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>(initialProveedores);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Proveedor | null>(null);
  const [form, setForm] = useState<Partial<Proveedor>>({});

  const filtered = proveedores.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.contacto.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setEditing(null);
    setForm({ estado: "Activo" });
    setShowModal(true);
  };

  const openEdit = (p: Proveedor) => {
    setEditing(p);
    setForm({ ...p });
    setShowModal(true);
  };

  const save = () => {
    if (editing) {
      setProveedores((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...form } as Proveedor : p)));
    } else {
      const nuevo: Proveedor = {
        id: String(proveedores.length + 1),
        nombre: form.nombre || "",
        contacto: form.contacto || "",
        telefono: form.telefono || "",
        email: form.email || "",
        estado: "Activo",
      };
      setProveedores((prev) => [nuevo, ...prev]);
    }
    setShowModal(false);
  };

  const toggleEstado = (id: string) => {
    setProveedores((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, estado: p.estado === "Activo" ? "Inactivo" : "Activo" } : p
      )
    );
  };

  return (
    <div>
      <SectionHeader
        title="Proveedores"
        sub={`${proveedores.filter(p => p.estado === "Activo").length} proveedores activos`}
        actions={<Button onClick={openNew}>+ Nuevo proveedor</Button>}
      />

      <Card>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nombre o contacto..." />
          <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
            {filtered.length} resultados
          </span>
        </div>

        <Table headers={["Nombre", "Persona de Contacto", "Teléfono", "Email", "Estado", ""]}>
          {filtered.map((p) => (
            <TR key={p.id}>
              <TD>
                <span style={{ fontWeight: 600 }}>{p.nombre}</span>
              </TD>
              <TD>{p.contacto}</TD>
              <TD mono>{p.telefono}</TD>
              <TD style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>{p.email}</TD>
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
        <Modal title={editing ? "Editar proveedor" : "Nuevo proveedor"} onClose={() => setShowModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Input label="Nombre de la empresa / Proveedor" value={form.nombre || ""} onChange={(v: string) => setForm((f) => ({ ...f, nombre: v }))} required />
            <Input label="Persona de contacto" value={form.contacto || ""} onChange={(v: string) => setForm((f) => ({ ...f, contacto: v }))} required />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <Input label="Teléfono" value={form.telefono || ""} onChange={(v: string) => setForm((f) => ({ ...f, telefono: v }))} />
              <Input label="Correo electrónico" value={form.email || ""} onChange={(v: string) => setForm((f) => ({ ...f, email: v }))} type="email" />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={save}>Guardar proveedor</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}