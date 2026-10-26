import { useState, useEffect } from "react";
import { Card, Badge, Button } from "../components/ui";
import {
  MODULOS_SISTEMA,
  PERMISOS_POR_DEFECTO,
  getUsuarioActual,
} from "../utils/roles";

type Usuario = {
  id: number;
  nombre: string;
  email: string;
  rol_id: number;
  rol: string;
  estado: string;
};

type Rol = {
  id: number;
  nombre: string;
  descripcion: string;
  permisos: string[];
  total_usuarios?: number;
};

const ROLES_FALLBACK: Rol[] = [
  {
    id: 1,
    nombre: "Administrador",
    descripcion: "Acceso total al sistema",
    permisos: PERMISOS_POR_DEFECTO.Administrador,
  },
  {
    id: 2,
    nombre: "Contador",
    descripcion: "Solo finanzas, reportes y contabilidad",
    permisos: PERMISOS_POR_DEFECTO.Contador,
  },
  {
    id: 3,
    nombre: "Cajero",
    descripcion: "Ventas, cierre de caja e inventario (lectura)",
    permisos: PERMISOS_POR_DEFECTO.Cajero,
  },
];

export default function Usuarios() {
  const [activeTab, setActiveTab] = useState<"usuarios" | "roles">("usuarios");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>(ROLES_FALLBACK);
  const [selectedRolId, setSelectedRolId] = useState<number>(3); // Por defecto mostrar Cajero en configuración de permisos
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState<string>("Todos");

  // Modales de Crear / Editar / Resetear contraseña
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [showResetPass, setShowResetPass] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [savingRole, setSavingRole] = useState(false);
  const [modalExito, setModalExito] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    rol_id: "3",
    estado: "Activo",
  });

  const [editFormData, setEditFormData] = useState({
    id: 0,
    nombre: "",
    email: "",
    rol_id: "3",
    estado: "Activo",
  });

  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    cargarUsuarios();
    cargarRoles();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/usuarios/listar.php");
      const data = await res.json();
      if (data.success) setUsuarios(data.usuarios);
    } catch (err) {
      console.error("Error cargando usuarios", err);
    }
  };

  const cargarRoles = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/roles/listar.php");
      const data = await res.json();
      if (data.success && Array.isArray(data.roles) && data.roles.length > 0) {
        setRoles(data.roles);
      }
    } catch (err) {
      console.error("Error cargando roles, usando valores por defecto", err);
    }
  };

  // Crear nuevo usuario con rol
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/usuarios/crear.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setModalExito("Usuario creado exitosamente con su rol asignado");
        setShowCreateModal(false);
        setFormData({
          nombre: "",
          email: "",
          password: "",
          rol_id: "3",
          estado: "Activo",
        });
        cargarUsuarios();
        cargarRoles();
      } else {
        setModalError(data.error || "Error al crear usuario");
      }
    } catch (err) {
      setModalError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal de edición
  const handleOpenEdit = (u: Usuario) => {
    const rolObj = roles.find((r) => r.id === Number(u.rol_id) || r.nombre === u.rol);
    setEditingUser(u);
    setEditFormData({
      id: u.id,
      nombre: u.nombre,
      email: u.email,
      rol_id: String(rolObj?.id || u.rol_id || 3),
      estado: u.estado,
    });
  };

  // Guardar edición de usuario y rol
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/usuarios/actualizar.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });
      const data = await res.json();
      if (data.success) {
        setModalExito("Datos y rol del usuario actualizados correctamente");
        setEditingUser(null);
        await cargarUsuarios();
        await cargarRoles();

        // Si el usuario editado es el que tiene sesión activa, actualizar su localStorage
        const actual = getUsuarioActual();
        if (actual && Number(actual.id) === Number(editFormData.id)) {
          const nuevoRol = roles.find((r) => Number(r.id) === Number(editFormData.rol_id));
          if (nuevoRol) {
            const actualizado = {
              ...actual,
              nombre: editFormData.nombre,
              email: editFormData.email,
              rol_id: nuevoRol.id,
              rol: nuevoRol.nombre,
              permisos: nuevoRol.permisos,
            };
            localStorage.setItem("user", JSON.stringify(actualizado));
            window.dispatchEvent(new Event("roles-updated"));
          }
        }
      } else {
        setModalError(data.error || "Error al actualizar usuario");
      }
    } catch (err) {
      setModalError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // Cambio rápido de rol desde la tabla
  const handleQuickRoleChange = async (u: Usuario, nuevoRolId: number) => {
    try {
      const res = await fetch("http://localhost:8000/api/usuarios/actualizar.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: u.id,
          nombre: u.nombre,
          email: u.email,
          rol_id: nuevoRolId,
          estado: u.estado,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await cargarUsuarios();
        await cargarRoles();
        const actual = getUsuarioActual();
        if (actual && Number(actual.id) === Number(u.id)) {
          const nuevoRol = roles.find((r) => Number(r.id) === Number(nuevoRolId));
          if (nuevoRol) {
            localStorage.setItem(
              "user",
              JSON.stringify({
                ...actual,
                rol_id: nuevoRol.id,
                rol: nuevoRol.nombre,
                permisos: nuevoRol.permisos,
              })
            );
            window.dispatchEvent(new Event("roles-updated"));
          }
        }
      } else {
        setModalError(data.error || "No se pudo cambiar el rol");
      }
    } catch (err) {
      setModalError("Error al cambiar el rol del usuario");
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const res = await fetch("http://localhost:8000/api/usuarios/toggle_estado.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
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
        body: JSON.stringify({ id: showResetPass, password: newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setModalExito("Contraseña actualizada correctamente");
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

  // Gestión de permisos por rol
  const rolSeleccionado = roles.find((r) => Number(r.id) === Number(selectedRolId)) || roles[0];

  const togglePermisoRol = (moduloId: string) => {
    if (!rolSeleccionado) return;
    // Evitar quitar "usuarios" al Administrador
    if (rolSeleccionado.nombre === "Administrador" && moduloId === "usuarios") {
      return;
    }
    const tiene = rolSeleccionado.permisos.includes(moduloId);
    const nuevosPermisos = tiene
      ? rolSeleccionado.permisos.filter((p) => p !== moduloId)
      : [...rolSeleccionado.permisos, moduloId];

    setRoles((prev) =>
      prev.map((r) =>
        r.id === rolSeleccionado.id ? { ...r, permisos: nuevosPermisos } : r
      )
    );
  };

  const handleRestaurarPermisosDefecto = () => {
    if (!rolSeleccionado) return;
    const def = PERMISOS_POR_DEFECTO[rolSeleccionado.nombre] || [];
    setRoles((prev) =>
      prev.map((r) =>
        r.id === rolSeleccionado.id ? { ...r, permisos: [...def] } : r
      )
    );
  };

  const handleGuardarPermisosRol = async () => {
    if (!rolSeleccionado) return;
    setSavingRole(true);
    try {
      const res = await fetch("http://localhost:8000/api/roles/guardar.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rolSeleccionado.id,
          descripcion: rolSeleccionado.descripcion,
          permisos: rolSeleccionado.permisos,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setModalExito(`Permisos del rol "${rolSeleccionado.nombre}" actualizados`);
        window.dispatchEvent(new Event("roles-updated"));
      } else {
        setModalError(data.error || "Error al guardar permisos");
      }
    } catch (err) {
      setModalError("Error de conexión al guardar permisos");
    } finally {
      setSavingRole(false);
    }
  };

  const getRolBadgeStyle = (rolNombre: string) => {
    if (rolNombre === "Administrador") {
      return { background: "#fce7f3", color: "#9d174d", border: "1px solid #f9a8d4" };
    }
    if (rolNombre === "Contador") {
      return { background: "#dbeafe", color: "#1e40af", border: "1px solid #93c5fd" };
    }
    return { background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7" };
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const coincideTexto =
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      (u.rol || "").toLowerCase().includes(busqueda.toLowerCase());
    const coincideRol = filtroRol === "Todos" || u.rol === filtroRol;
    return coincideTexto && coincideRol;
  });

  // Agrupar módulos por categoría para la matriz de permisos
  const gruposModulos = Array.from(new Set(MODULOS_SISTEMA.map((m) => m.grupo)));

  return (
    <div>
      {/* Modales de Éxito/Error */}
      {modalExito && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", textAlign: "center", maxWidth: "400px" }}>
            <div style={{ fontSize: "50px", marginBottom: "10px" }}>✅</div>
            <h3 style={{ marginBottom: "16px" }}>{modalExito}</h3>
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

      {/* Pestañas superiores: Gestión de Usuarios vs Configuración de Roles */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", gap: "8px", background: "#e5e7eb", padding: "4px", borderRadius: "10px" }}>
          <button
            onClick={() => setActiveTab("usuarios")}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              background: activeTab === "usuarios" ? "white" : "transparent",
              color: activeTab === "usuarios" ? "#190C30" : "#4b5563",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
              boxShadow: activeTab === "usuarios" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            👥 Usuarios y Asignación de Roles
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              background: activeTab === "roles" ? "white" : "transparent",
              color: activeTab === "roles" ? "#190C30" : "#4b5563",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
              boxShadow: activeTab === "roles" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            🛡️ Permisos por Rol (Accesos del Sistema)
          </button>
        </div>

        {activeTab === "usuarios" && (
          <Button onClick={() => setShowCreateModal(true)}>+ Nuevo Usuario</Button>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          PESTAÑA 1: GESTIÓN DE USUARIOS Y ASIGNACIÓN DE ROLES
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "usuarios" && (
        <>
          {/* Tarjetas de resumen por rol */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "20px" }}>
            {roles.map((r) => {
              const cantidad = usuarios.filter((u) => u.rol === r.nombre || Number(u.rol_id) === Number(r.id)).length;
              const badge = getRolBadgeStyle(r.nombre);
              return (
                <div
                  key={r.id}
                  onClick={() => setFiltroRol(filtroRol === r.nombre ? "Todos" : r.nombre)}
                  style={{
                    background: "white",
                    padding: "18px 20px",
                    borderRadius: "12px",
                    border: filtroRol === r.nombre ? "2px solid #c08497" : "1px solid #e5e7eb",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ ...badge, padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 700 }}>
                      {r.nombre}
                    </span>
                    <span style={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>{cantidad}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: "12px", color: "#6b7280", lineHeight: 1.4 }}>
                    {r.descripcion}
                  </p>
                </div>
              );
            })}
          </div>

          <Card>
            {/* Barra de búsqueda y filtro por rol */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="Buscar usuario por nombre, correo o rol..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ flex: 1, minWidth: "240px", maxWidth: "400px", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "13px" }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>Filtrar por rol:</span>
                {["Todos", ...roles.map((r) => r.nombre)].map((nombreRol) => (
                  <button
                    key={nombreRol}
                    onClick={() => setFiltroRol(nombreRol)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: filtroRol === nombreRol ? "1px solid #c08497" : "1px solid #d1d5db",
                      background: filtroRol === nombreRol ? "#fdf2f8" : "white",
                      color: filtroRol === nombreRol ? "#9d174d" : "#374151",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {nombreRol}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e5e7eb", background: "#f9fafb" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>NOMBRE</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>CORREO</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>ROL DEL USUARIO</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>ESTADO</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map((u) => {
                    const rolActualObj = roles.find((r) => r.id === Number(u.rol_id) || r.nombre === u.rol);
                    const rolIdActual = rolActualObj?.id || u.rol_id || 3;
                    const badgeStyle = getRolBadgeStyle(u.rol || "Cajero");

                    return (
                      <tr key={u.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td style={{ padding: "14px 16px", fontWeight: 600, color: "#111827" }}>{u.nombre}</td>
                        <td style={{ padding: "14px 16px", color: "#4b5563", fontSize: "13px" }}>{u.email}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ ...badgeStyle, padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 700 }}>
                              {u.rol || "Sin rol"}
                            </span>
                            <select
                              value={rolIdActual}
                              onChange={(e) => handleQuickRoleChange(u, Number(e.target.value))}
                              title="Cambiar rol del usuario"
                              style={{
                                padding: "5px 8px",
                                borderRadius: "6px",
                                border: "1px solid #d1d5db",
                                fontSize: "12px",
                                background: "white",
                                color: "#374151",
                                cursor: "pointer",
                              }}
                            >
                              {roles.map((r) => (
                                <option key={r.id} value={r.id}>
                                  Cambiar a: {r.nombre}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <Badge variant={u.estado === "Activo" ? "success" : "muted"}>{u.estado}</Badge>
                        </td>
                        <td style={{ padding: "14px 16px", display: "flex", gap: "12px", alignItems: "center" }}>
                          <button
                            onClick={() => handleOpenEdit(u)}
                            style={{ background: "none", border: "none", color: "#8b5cf6", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleToggle(u.id)}
                            style={{ background: "none", border: "none", color: u.estado === "Activo" ? "#f59e0b" : "#10b981", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}
                          >
                            {u.estado === "Activo" ? "Desactivar" : "Activar"}
                          </button>
                          <button
                            onClick={() => setShowResetPass(u.id)}
                            style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}
                          >
                            Restablecer Clave
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {usuariosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
                        No se encontraron usuarios registrados con ese criterio
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          PESTAÑA 2: CONFIGURACIÓN DE ROLES Y PERMISOS DE MÓDULOS
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "roles" && (
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "24px", alignItems: "start" }}>
          {/* Lista de Roles a la izquierda */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h3 style={{ margin: "0 0 4px", fontSize: "15px", color: "#374151" }}>Selecciona un Rol</h3>
            {roles.map((r) => {
              const active = Number(r.id) === Number(selectedRolId);
              const badge = getRolBadgeStyle(r.nombre);
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRolId(r.id)}
                  style={{
                    background: active ? "#190C30" : "white",
                    color: active ? "white" : "#1f2937",
                    padding: "18px",
                    borderRadius: "12px",
                    border: active ? "2px solid #c08497" : "1px solid #e5e7eb",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontWeight: 700, fontSize: "16px" }}>{r.nombre}</span>
                    <span
                      style={{
                        ...badge,
                        padding: "2px 8px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: 700,
                      }}
                    >
                      {r.permisos.length} módulos
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "12px", color: active ? "#d1d5db" : "#6b7280", lineHeight: 1.4 }}>
                    {r.descripcion}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Matriz de Permisos a la derecha */}
          {rolSeleccionado && (
            <Card>
              <div style={{ padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #e5e7eb", paddingBottom: "16px", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h2 style={{ margin: "0 0 6px", fontSize: "20px", color: "#111827" }}>
                      Accesos del rol: <span style={{ color: "#c08497" }}>{rolSeleccionado.nombre}</span>
                    </h2>
                    <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                      Marca o desmarca los apartados que los usuarios con el rol <strong>{rolSeleccionado.nombre}</strong> pueden ver en el sistema.
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={handleRestaurarPermisosDefecto}
                      style={{
                        padding: "10px 16px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        background: "white",
                        color: "#374151",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Restaurar por defecto
                    </button>
                    <Button onClick={handleGuardarPermisosRol} disabled={savingRole}>
                      {savingRole ? "Guardando..." : "Guardar Permisos del Rol"}
                    </Button>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {gruposModulos.map((grupo) => {
                    const modulosDelGrupo = MODULOS_SISTEMA.filter((m) => m.grupo === grupo);
                    return (
                      <div key={grupo} style={{ border: "1px solid #e5e7eb", borderRadius: "10px", padding: "16px" }}>
                        <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 700, color: "#190C30", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          {grupo}
                        </h4>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px" }}>
                          {modulosDelGrupo.map((mod) => {
                            const checked = rolSeleccionado.permisos.includes(mod.id);
                            const bloqueado = rolSeleccionado.nombre === "Administrador" && mod.id === "usuarios";
                            return (
                              <label
                                key={mod.id}
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: "10px",
                                  padding: "12px",
                                  borderRadius: "8px",
                                  border: checked ? "1px solid #c08497" : "1px solid #e5e7eb",
                                  background: checked ? "rgba(192, 132, 151, 0.08)" : "#f9fafb",
                                  cursor: bloqueado ? "not-allowed" : "pointer",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  disabled={bloqueado}
                                  onChange={() => togglePermisoRol(mod.id)}
                                  style={{ marginTop: "3px", width: "16px", height: "16px", accentColor: "#c08497" }}
                                />
                                <div>
                                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
                                    {mod.label}
                                    {bloqueado && <span style={{ fontSize: "11px", color: "#9ca3af", marginLeft: "6px" }}>(Obligatorio)</span>}
                                  </div>
                                  <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px", lineHeight: 1.3 }}>
                                    {mod.descripcion}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MODAL CREAR NUEVO USUARIO (CON SELECTOR DE ROL)
      ══════════════════════════════════════════════════════════════════ */}
      {showCreateModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }} onClick={() => setShowCreateModal(false)}>
          <div style={{ background: "white", padding: "32px", borderRadius: "12px", width: "100%", maxWidth: "460px" }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: "20px", color: "#111827" }}>Nuevo Usuario</h2>
            <form onSubmit={handleCreateUser} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>Nombre completo *</label>
                <input required placeholder="Ej: María López" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>Correo electrónico *</label>
                <input type="email" required placeholder="correo@ejemplo.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>Contraseña *</label>
                <input type="password" required placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>Rol del usuario *</label>
                <select
                  value={formData.rol_id}
                  onChange={(e) => setFormData({ ...formData, rol_id: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", boxSizing: "border-box", background: "white" }}
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre} — {r.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", background: "white", cursor: "pointer", fontWeight: 600 }}>Cancelar</button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: "12px", border: "none", borderRadius: "8px", background: "#c08497", color: "white", cursor: "pointer", fontWeight: 600 }}>{loading ? "Guardando..." : "Crear Usuario"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MODAL EDITAR USUARIO Y CAMBIAR ROL
      ══════════════════════════════════════════════════════════════════ */}
      {editingUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }} onClick={() => setEditingUser(null)}>
          <div style={{ background: "white", padding: "32px", borderRadius: "12px", width: "100%", maxWidth: "460px" }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: "20px", color: "#111827" }}>Editar Usuario y Rol</h2>
            <form onSubmit={handleUpdateUser} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>Nombre completo *</label>
                <input required value={editFormData.nombre} onChange={(e) => setEditFormData({ ...editFormData, nombre: e.target.value })} style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>Correo electrónico *</label>
                <input type="email" required value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>Rol asignado *</label>
                <select
                  value={editFormData.rol_id}
                  onChange={(e) => setEditFormData({ ...editFormData, rol_id: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", boxSizing: "border-box", background: "white" }}
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre} — {r.descripcion}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>Estado</label>
                <select
                  value={editFormData.estado}
                  onChange={(e) => setEditFormData({ ...editFormData, estado: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", boxSizing: "border-box", background: "white" }}
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button type="button" onClick={() => setEditingUser(null)} style={{ flex: 1, padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", background: "white", cursor: "pointer", fontWeight: 600 }}>Cancelar</button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: "12px", border: "none", borderRadius: "8px", background: "#c08497", color: "white", cursor: "pointer", fontWeight: 600 }}>{loading ? "Guardando..." : "Guardar Cambios"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RESTABLECER CONTRASEÑA */}
      {showResetPass !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }} onClick={() => setShowResetPass(null)}>
          <div style={{ background: "white", padding: "32px", borderRadius: "12px", width: "100%", maxWidth: "400px" }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: "16px" }}>Restablecer Contraseña</h2>
            <p style={{ color: "#6b7280", marginBottom: "16px", fontSize: "14px" }}>Ingresa la nueva contraseña para este usuario.</p>
            <input type="password" placeholder="Nueva contraseña *" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", marginBottom: "16px", boxSizing: "border-box" }} />
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
