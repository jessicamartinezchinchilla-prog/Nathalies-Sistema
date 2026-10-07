import { useState, useEffect } from "react";
import { Card, Table, TR, TD, Button, Badge } from "../components/ui";

type Proveedor = {
  id: number;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  estado: string;
};

export default function Proveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ nombre: "", contacto: "", telefono: "", email: "", estado: "Activo" });
  const [loading, setLoading] = useState(false);

  useEffect(() => { cargarProveedores(); }, []);

  const cargarProveedores = async () => {
    const res = await fetch("http://localhost:8000/api/proveedores/listar.php");
    const data = await res.json();
    if (data.success) setProveedores(data.proveedores);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("http://localhost:8000/api/proveedores/crear.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (data.success) {
      setShowModal(false);
      setFormData({ nombre: "", contacto: "", telefono: "", email: "", estado: "Activo" });
      cargarProveedores();
    }
    setLoading(false);
  };

  return (
    <div>
      
      {/* Botón nuevo gasto */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <Button onClick={() => setShowModal(true)}>+ Nuevo Proveedor</Button>
      </div>

      <Card>
        <Table headers={["NOMBRE", "CONTACTO", "TELÉFONO", "EMAIL", "ESTADO"]}>
          {proveedores.map(p => (
            <TR key={p.id}>
              <TD><strong>{p.nombre}</strong></TD>
              <TD>{p.contacto || "-"}</TD>
              <TD>{p.telefono || "-"}</TD>
              <TD>{p.email || "-"}</TD>
              <TD><Badge variant={p.estado === "Activo" ? "success" : "muted"}>{p.estado}</Badge></TD>
            </TR>
          ))}
          {proveedores.length === 0 && <TR><TD colSpan={5} style={{ textAlign: "center", padding: "40px" }}>No hay proveedores registrados</TD></TR>}
        </Table>
      </Card>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: "white", padding: "32px", borderRadius: "12px", width: "100%", maxWidth: "450px" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: "24px" }}>Nuevo Proveedor</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <input required placeholder="Nombre de la empresa *" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} style={{ padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
              <input placeholder="Nombre del contacto" value={formData.contacto} onChange={e => setFormData({...formData, contacto: e.target.value})} style={{ padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
              <input placeholder="Teléfono" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} style={{ padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
              <input type="email" placeholder="Correo electrónico" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
              
              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "12px", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", cursor: "pointer" }}>Cancelar</button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: "12px", border: "none", borderRadius: "6px", background: "#c08497", color: "white", cursor: "pointer" }}>{loading ? "Guardando..." : "Guardar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}