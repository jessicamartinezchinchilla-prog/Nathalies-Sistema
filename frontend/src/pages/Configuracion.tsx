import { useState, useEffect } from "react";
import { Card, Button } from "../components/ui";

export default function Configuracion() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalExito, setModalExito] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const [config, setConfig] = useState({
    nombre_negocio: "",
    telefono: "",
    direccion: "",
    correo: "",
    mensaje_ticket: ""
  });

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/configuracion/obtener.php");
      const data = await res.json();
      if (data.success) {
        setConfig({
          nombre_negocio: data.config.nombre_negocio || "",
          telefono: data.config.telefono || "",
          direccion: data.config.direccion || "",
          correo: data.config.correo || "",
          mensaje_ticket: data.config.mensaje_ticket || ""
        });
      }
    } catch (err) {
      setModalError("No se pudo cargar la configuración");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("http://localhost:8000/api/configuracion/guardar.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success) {
        setModalExito("✅ Configuración guardada correctamente");
      } else {
        setModalError(data.error || "Error al guardar");
      }
    } catch (err) {
      setModalError("Error de conexión con el servidor");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none"
  };

  return (
    <div>
      {/* Modales */}
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

      

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>Cargando configuración...</div>
      ) : (
        <Card>
          <form onSubmit={handleSave} style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px", maxWidth: "800px" }}>
            
            <div>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", color: "#374151", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px" }}>
                Datos del Negocio
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>Nombre del Negocio *</label>
                  <input type="text" name="nombre_negocio" value={config.nombre_negocio} onChange={handleChange} required style={inputStyle} placeholder="Ej: Nathalie's Nails" />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>Teléfono</label>
                  <input type="text" name="telefono" value={config.telefono} onChange={handleChange} style={inputStyle} placeholder="Ej: +52 55 1234 5678" />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>Dirección</label>
                  <input type="text" name="direccion" value={config.direccion} onChange={handleChange} style={inputStyle} placeholder="Calle, Número, Colonia, Ciudad" />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>Correo Electrónico</label>
                  <input type="email" name="correo" value={config.correo} onChange={handleChange} style={inputStyle} placeholder="contacto@negocio.com" />
                </div>
              </div>
            </div>

            <div>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", color: "#374151", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px" }}>
                Personalización de Documentos
              </h3>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>Mensaje para Tickets / Reportes</label>
                <textarea 
                  name="mensaje_ticket" 
                  value={config.mensaje_ticket} 
                  onChange={handleChange} 
                  rows={3} 
                  style={{ ...inputStyle, resize: "vertical" }} 
                  placeholder="Ej: ¡Gracias por su preferencia! Vuelva pronto."
                />
                <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>
                  Este mensaje aparecerá al final de los comprobantes o reportes que genere el sistema.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
              <Button type="submit" disabled={saving} style={{ padding: "12px 32px", fontSize: "15px" }}>
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>

          </form>
        </Card>
      )}
    </div>
  );
}