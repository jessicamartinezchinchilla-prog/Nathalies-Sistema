import { useState, useEffect } from "react";
import { Card, Badge, Button } from "../components/ui";

type Usuario = {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  estado: string;
};

type Rol = {
  id: number;
  nombre: string;
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showResetPass, setShowResetPass] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalExito, setModalExito] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: "", email: "", password: "", rol_id: "1", estado: "Activo"
  });
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    cargarUsuarios();
    cargarRoles();
  }, []);

  const cargarUsuarios = async () => {
    const res = await fetch("http://localhost:8000/api/usuarios/listar.php");
    const data = await res.json();
    if (data.success) setUsuarios(data.usuarios);
  };

  const cargarRoles = async () => {
    const res = await fetch("http://localhost:8000/api/roles/listar.php"); // Asumiendo que existe, si no, hardcodeamos
    const data = await res.json();
    if (data.success) setRoles(data.roles);
    else setRoles([{ id: 1, nombre: "Administrador" }, { id: 2, nombre: "Contador" }, { id: 3, nombre: "Vendedor" }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/usuarios/crear.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setModalExito("Usuario creado exitosamente");
        setShowModal(false);
        setFormData({ nombre: "", email: "", password: "", rol_id: "1", estado: "Activo" });
        cargarUsuarios();
      } else {
        setModalError(data.error);
      }
    } catch (err) {
      setModalError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const res = await fetch("http://localhost:8000/api/usuarios/toggle_estado.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) cargarUsuarios();
    } catch (err) {
      setModalError("Error al cambiar estado");
    }
  };

  const handleResetPass = async () => {
    if (!showResetPass || !newPassword) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/usuarios/reset_password.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: showResetPass, password: newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setModalExito("Contraseña actualizada");
        setShowResetPass(null);
        setNewPassword("");
      } else {
        setModalError(data.error);
      }
    } catch (err) {
      setModalError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Modales de Éxito/Error (Reutilizados) */}
      {modalExito && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", textAlign: "center", maxWidth: "400px" }}>
            <div style={{ fontSize: "50px", marginBottom: "10px" }}>✅</div>
            <h3>{modalExito}</h3>
            <Button onClick={() => setModalExito(null)}>Aceptar</Button>
          </div>
        </div>
      )}
      {modalError && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", textAlign: "center", maxWidth: "400px" }}>
            <div style={{ fontSize: "50px", marginBottom: "10px" }}>⚠️</div>
            <h3 style={{ color: "#ef4444" }}>Error</h3>
            <p>{modalError}</p>
            <Button onClick={() => setModalError(null)} style={{ background: "#ef4444" }}>Cerrar</Button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <Button onClick={() => setShowModal(true)}>Nuevo Usuario</Button>
      </div>

      

      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>NOMBRE</th>
                <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>CORREO</th>
                <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>ROL</th>
                <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>ESTADO</th>
                <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "12px", fontWeight: 600 }}>{u.nombre}</td>
                  <td style={{ padding: "12px" }}>{u.email}</td>
                  <td style={{ padding: "12px" }}>{u.rol}</td>
                  <td style={{ padding: "12px" }}>
                    <Badge variant={u.estado === "Activo" ? "success" : "muted"}>{u.estado}</Badge>
                  </td>
                  <td style={{ padding: "12px", display: "flex", gap: "8px" }}>
                    <button onClick={() => handleToggle(u.id)} style={{ background: "none", border: "none", color: u.estado === "Activo" ? "#f59e0b" : "#10b981", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
                      {u.estado === "Activo" ? "Desactivar" : "Activar"}
                    </button>
                    <button onClick={() => setShowResetPass(u.id)} style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
                      Restablecer Clave
                    </button>
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>No hay usuarios registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL CREAR USUARIO */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: "white", padding: "32px", borderRadius: "12px", width: "100%", maxWidth: "450px" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: "24px" }}>Nuevo Usuario</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <input required placeholder="Nombre completo *" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} style={{ padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
              <input type="email" required placeholder="Correo electrónico *" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
              <input type="password" required placeholder="Contraseña *" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
              
              <select value={formData.rol_id} onChange={e => setFormData({...formData, rol_id: e.target.value})} style={{ padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px" }}>
                {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "12px", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", cursor: "pointer" }}>Cancelar</button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: "12px", border: "none", borderRadius: "6px", background: "#c08497", color: "white", cursor: "pointer" }}>{loading ? "Guardando..." : "Guardar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RESTABLECER CONTRASEÑA */}
      {showResetPass !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }} onClick={() => setShowResetPass(null)}>
          <div style={{ background: "white", padding: "32px", borderRadius: "12px", width: "100%", maxWidth: "400px" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: "16px" }}>Restablecer Contraseña</h2>
            <p style={{ color: "#6b7280", marginBottom: "16px", fontSize: "14px" }}>Ingresa la nueva contraseña para este usuario.</p>
            <input type="password" placeholder="Nueva contraseña *" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", marginBottom: "16px" }} />
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => { setShowResetPass(null); setNewPassword(""); }} style={{ flex: 1, padding: "12px", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", cursor: "pointer" }}>Cancelar</button>
              <button onClick={handleResetPass} disabled={loading} style={{ flex: 1, padding: "12px", border: "none", borderRadius: "6px", background: "#3b82f6", color: "white", cursor: "pointer" }}>{loading ? "Procesando..." : "Actualizar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}