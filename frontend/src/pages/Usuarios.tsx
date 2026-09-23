import { useState } from "react";
import { Card, Badge, Table, TR, TD, SearchBar, SectionHeader, Button, Modal, Input, Select } from "../components/ui";

type Usuario = {
  id: string;
  nombre: string;
  email: string;
  rol: "Administrador" | "Contador" | "Cajero";
  estado: "Activo" | "Inactivo";
};

const initialUsuarios: Usuario[] = [
  { id: "U01", nombre: "Nathalie López", email: "admin@nathalies.com", rol: "Administrador", estado: "Activo" },
  { id: "U02", nombre: "Karla Méndez", email: "karla@nathalies.com", rol: "Cajero", estado: "Activo" },
  { id: "U03", nombre: "Lic. Roberto Díaz", email: "contador@nathalies.com", rol: "Contador", estado: "Activo" },
  { id: "U04", nombre: "Ana García", email: "ana@nathalies.com", rol: "Cajero", estado: "Inactivo" },
];

function getRolBadge(rol: Usuario["rol"]) {
  const styles: Record<Usuario["rol"], { bg: string; color: string }> = {
    Administrador: { bg: "rgba(181,115,138,0.15)", color: "var(--primary)" },
    Contador: { bg: "rgba(78,99,200,0.15)", color: "#4E63C8" },
    Cajero: { bg: "rgba(61,139,101,0.15)", color: "var(--success)" },
  };
  const style = styles[rol];
  return (
    <span style={{ background: style.bg, color: style.color, padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 600 }}>
      {rol}
    </span>
  );
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsuarios);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [form, setForm] = useState<Partial<Usuario>>({});

  const filtered = usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.rol.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setEditing(null);
    setForm({ estado: "Activo", rol: "Cajero" });
    setShowModal(true);
  };

  const openEdit = (u: Usuario) => {
    setEditing(u);
    setForm({ ...u });
    setShowModal(true);
  };

  const save = () => {
    if (editing) {
      setUsuarios((prev) => prev.map((u) => (u.id === editing.id ? { ...u, ...form } as Usuario : u)));
    } else {
      const nuevo: Usuario = {
        id: `U${String(usuarios.length + 1).padStart(2, "0")}`,
        nombre: form.nombre || "",
        email: form.email || "",
        rol: (form.rol as Usuario["rol"]) || "Cajero",
        estado: "Activo",
      };
      setUsuarios((prev) => [nuevo, ...prev]);
    }
    setShowModal(false);
  };

  const toggleEstado = (id: string) => {
    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, estado: u.estado === "Activo" ? "Inactivo" : "Activo" } : u
      )
    );
  };

  return (
    <div>
      <SectionHeader
        title="Usuarios"
        sub={`${usuarios.filter(u => u.estado === "Activo").length} usuarios activos en el sistema`}
        actions={<Button onClick={openNew}>+ Nuevo usuario</Button>}
      />

      <Card>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nombre, email o rol..." />
          <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
            {filtered.length} resultados
          </span>
        </div>

        <Table headers={["ID", "Nombre", "Email", "Rol", "Estado", ""]}>
          {filtered.map((u) => (
            <TR key={u.id}>
              <TD mono>{u.id}</TD>
              <TD><span style={{ fontWeight: 600 }}>{u.nombre}</span></TD>
              <TD style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>{u.email}</TD>
              <TD>{getRolBadge(u.rol)}</TD>
              <TD>
                <Badge variant={u.estado === "Activo" ? "success" : "muted"}>{u.estado}</Badge>
              </TD>
              <TD>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => openEdit(u)} style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "12px", cursor: "pointer" }}>Editar</button>
                  <button onClick={() => toggleEstado(u.id)} style={{ background: "none", border: "none", color: "var(--muted-foreground)", fontSize: "12px", cursor: "pointer" }}>
                    {u.estado === "Activo" ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </TD>
            </TR>
          ))}
        </Table>
      </Card>

      {showModal && (
        <Modal title={editing ? "Editar usuario" : "Nuevo usuario"} onClose={() => setShowModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Input 
              label="Nombre completo" 
              value={form.nombre || ""} 
              onChange={(v: string) => setForm((f) => ({ ...f, nombre: v }))} 
              required 
            />
            <Input 
              label="Correo electrónico" 
              value={form.email || ""} 
              onChange={(v: string) => setForm((f) => ({ ...f, email: v }))} 
              type="email" 
              required 
            />
            <Select
              label="Rol de acceso"
              value={form.rol || "Cajero"}
              onChange={(v: string) => setForm((f) => ({ ...f, rol: v as Usuario["rol"] }))}
              options={[
                { value: "Administrador", label: "Administrador (Acceso total)" },
                { value: "Contador", label: "Contador (Solo finanzas y reportes)" },
                { value: "Cajero", label: "Cajero (Ventas, caja e inventario)" },
              ]}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={save}>Guardar usuario</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}