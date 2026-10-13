import { useState, useEffect } from "react";
import { Card, Button } from "../components/ui";

type Proveedor = {
  id: number;
  codigo: string;
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  estado: string;
};

export default function Proveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalExito, setModalExito] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/proveedores/listar.php");
      const data = await res.json();
      if (data.success) setProveedores(data.proveedores);
    } catch (err) {
      setModalError("Error al cargar proveedores");
    } finally {
      setLoading(false);
    }
  };

  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio";
    }

    // Validar teléfono: exactamente 8 dígitos
    if (!formData.telefono) {
      nuevosErrores.telefono = "El teléfono es obligatorio";
    } else if (!/^\d{8}$/.test(formData.telefono)) {
      nuevosErrores.telefono = "Debe tener exactamente 8 números";
    }

    // Validar email
    if (!formData.email) {
      nuevosErrores.email = "El correo es obligatorio";
    } else if (!formData.email.includes('@')) {
      nuevosErrores.email = "El correo debe contener @";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nuevosErrores.email = "El correo no tiene un formato válido";
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setFormLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/proveedores/crear.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setModalExito(`✅ Proveedor registrado: ${data.codigo}`);
        setShowModal(false);
        setFormData({ nombre: "", telefono: "", email: "", direccion: "" });
        setErrors({});
        cargarProveedores();
      } else {
        setModalError(data.error || "Error al registrar");
      }
    } catch (err) {
      setModalError("Error de conexión");
    } finally {
      setFormLoading(false);
    }
  };

  const handleTelefonoChange = (value: string) => {
    // Solo permitir números y máximo 8 caracteres
    const soloNumeros = value.replace(/\D/g, '').slice(0, 8);
    setFormData({ ...formData, telefono: soloNumeros });
    if (errors.telefono) {
      setErrors({ ...errors, telefono: "" });
    }
  };

  const handleEmailChange = (value: string) => {
    setFormData({ ...formData, email: value });
    if (errors.email) {
      setErrors({ ...errors, email: "" });
    }
  };

  return (
    <div>
      {/* MODAL ÉXITO */}
      {modalExito && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", textAlign: "center", maxWidth: "400px" }}>
            <div style={{ fontSize: "50px", marginBottom: "10px" }}>✅</div>
            <h3 style={{ margin: "0 0 10px 0" }}>{modalExito}</h3>
            <Button onClick={() => setModalExito(null)}>Aceptar</Button>
          </div>
        </div>
      )}

      {/* MODAL ERROR */}
      {modalError && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", textAlign: "center", maxWidth: "400px" }}>
            <div style={{ fontSize: "50px", marginBottom: "10px" }}>⚠️</div>
            <h3 style={{ margin: "0 0 10px 0", color: "#ef4444" }}>Error</h3>
            <p>{modalError}</p>
            <Button onClick={() => setModalError(null)} style={{ background: "#ef4444" }}>Cerrar</Button>
          </div>
        </div>
      )}

      {/* Botón Nuevo Proveedor */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
        <Button onClick={() => setShowModal(true)}>+ Nuevo Proveedor</Button>
      </div>

      <Card>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Cargando...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                  <th style={{ padding: "14px 24px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>CÓDIGO</th>
                  <th style={{ padding: "14px 24px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>NOMBRE</th>
                  <th style={{ padding: "14px 24px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>TELÉFONO</th>
                  <th style={{ padding: "14px 24px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>EMAIL</th>
                  <th style={{ padding: "14px 24px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>DIRECCIÓN</th>
                  <th style={{ padding: "14px 24px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {proveedores.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "14px 24px", fontFamily: "monospace", fontWeight: 600, fontSize: "13px" }}>{p.codigo}</td>
                    <td style={{ padding: "14px 24px", fontSize: "14px", fontWeight: 500 }}>{p.nombre}</td>
                    <td style={{ padding: "14px 24px", fontSize: "13px" }}>{p.telefono}</td>
                    <td style={{ padding: "14px 24px", fontSize: "13px" }}>{p.email}</td>
                    <td style={{ padding: "14px 24px", fontSize: "13px", color: "#6b7280" }}>{p.direccion || '-'}</td>
                    <td style={{ padding: "14px 24px" }}>
                      <span style={{ 
                        padding: "4px 10px", 
                        borderRadius: "12px", 
                        fontSize: "12px", 
                        fontWeight: 600,
                        background: p.estado === 'Activo' ? '#d1fae5' : '#fee2e2',
                        color: p.estado === 'Activo' ? '#065f46' : '#991b1b'
                      }}>
                        {p.estado}
                      </span>
                    </td>
                  </tr>
                ))}
                {proveedores.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
                      No hay proveedores registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* MODAL AGREGAR PROVEEDOR */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: "white", padding: "32px", borderRadius: "12px", width: "100%", maxWidth: "500px" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: "24px", fontSize: "20px", fontWeight: 700 }}>Nuevo Proveedor</h2>
            
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>Nombre *</label>
                <input 
                  type="text" 
                  value={formData.nombre} 
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  style={{ 
                    width: "100%", 
                    padding: "10px", 
                    border: errors.nombre ? "2px solid #ef4444" : "1px solid #d1d5db", 
                    borderRadius: "6px", 
                    fontSize: "14px" 
                  }}
                  placeholder="Nombre del proveedor"
                />
                {errors.nombre && <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", marginBottom: 0 }}>{errors.nombre}</p>}
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>Teléfono * (8 dígitos)</label>
                <input 
                  type="text" 
                  value={formData.telefono} 
                  onChange={(e) => handleTelefonoChange(e.target.value)}
                  maxLength={8}
                  style={{ 
                    width: "100%", 
                    padding: "10px", 
                    border: errors.telefono ? "2px solid #ef4444" : "1px solid #d1d5db", 
                    borderRadius: "6px", 
                    fontSize: "14px" 
                  }}
                  placeholder="12345678"
                />
                {errors.telefono && <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", marginBottom: 0 }}>{errors.telefono}</p>}
                <p style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px", marginBottom: 0 }}>Solo números, máximo 8 dígitos</p>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>Correo Electrónico *</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => handleEmailChange(e.target.value)}
                  style={{ 
                    width: "100%", 
                    padding: "10px", 
                    border: errors.email ? "2px solid #ef4444" : "1px solid #d1d5db", 
                    borderRadius: "6px", 
                    fontSize: "14px" 
                  }}
                  placeholder="ejemplo@correo.com"
                />
                {errors.email && <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", marginBottom: 0 }}>{errors.email}</p>}
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>Dirección</label>
                <textarea 
                  value={formData.direccion} 
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  rows={3}
                  style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", resize: "vertical" }}
                  placeholder="Dirección del proveedor (opcional)"
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "12px", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>
                  Cancelar
                </button>
                <button type="submit" disabled={formLoading} style={{ flex: 1, padding: "12px", border: "none", borderRadius: "6px", background: "#c08497", color: "white", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>
                  {formLoading ? "Guardando..." : "Guardar Proveedor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}