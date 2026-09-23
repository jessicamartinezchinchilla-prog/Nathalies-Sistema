import { useState } from "react";
import { Card, SectionHeader, Button, Input, Select } from "../components/ui";

export default function Configuracion() {
  const [guardado, setGuardado] = useState(false);
  const [form, setForm] = useState({
    nombreNegocio: "Nathalie's Nails & Lashes",
    nit: "1234567-8",
    direccion: "Zona 1, Ciudad de Guatemala",
    telefono: "5555-0000",
    moneda: "USD",
    zonaHoraria: "America/Guatemala",
    passwordActual: "",
    passwordNueva: "",
    passwordConfirmar: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  };

  return (
    <div>
      <SectionHeader
        title="Configuración General"
        sub="Ajustes globales del sistema y datos del negocio"
        actions={
          <Button onClick={handleSave} variant="primary">
             Guardar cambios
          </Button>
        }
      />

      {guardado && (
        <div style={{ 
          background: "rgba(61,139,101,0.1)", color: "var(--success)", padding: "12px 16px", 
          borderRadius: "8px", fontSize: "13px", marginBottom: "24px", border: "1px solid rgba(61,139,101,0.2)",
          display: "flex", alignItems: "center", gap: "8px"
        }}>
          ✅ Los cambios se han guardado correctamente.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        
        {/* Columna 1: Datos del Negocio */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <Card style={{ padding: "24px" }}>
            <h3 style={{ margin: "0 0 20px", fontFamily: "'DM Serif Display', serif", fontSize: "18px" }}>Datos del Negocio</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <Input label="Nombre del salón" value={form.nombreNegocio} onChange={(v: string) => handleChange("nombreNegocio", v)} />
              <Input label="NIT / Identificación Fiscal" value={form.nit} onChange={(v: string) => handleChange("nit", v)} />
              <Input label="Dirección" value={form.direccion} onChange={(v: string) => handleChange("direccion", v)} />
              <Input label="Teléfono de contacto" value={form.telefono} onChange={(v: string) => handleChange("telefono", v)} />
            </div>
          </Card>

          <Card style={{ padding: "24px" }}>
            <h3 style={{ margin: "0 0 20px", fontFamily: "'DM Serif Display', serif", fontSize: "18px" }}>Seguridad</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <Input label="Contraseña actual" value={form.passwordActual} onChange={(v: string) => handleChange("passwordActual", v)} type="password" placeholder="••••••••" />
              <Input label="Nueva contraseña" value={form.passwordNueva} onChange={(v: string) => handleChange("passwordNueva", v)} type="password" placeholder="••••••••" />
              <Input label="Confirmar nueva contraseña" value={form.passwordConfirmar} onChange={(v: string) => handleChange("passwordConfirmar", v)} type="password" placeholder="••••••••" />
            </div>
          </Card>
        </div>

        {/* Columna 2: Preferencias del Sistema */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <Card style={{ padding: "24px" }}>
            <h3 style={{ margin: "0 0 20px", fontFamily: "'DM Serif Display', serif", fontSize: "18px" }}>Preferencias del Sistema</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <Select 
                label="Moneda predeterminada" 
                value={form.moneda} 
                onChange={(v: string) => handleChange("moneda", v)}
                options={[
                  { value: "USD", label: "Dólares (USD) $" },
                  { value: "GTQ", label: "Quetzales (GTQ) Q" },
                ]}
              />
              <Select 
                label="Zona horaria" 
                value={form.zonaHoraria} 
                onChange={(v: string) => handleChange("zonaHoraria", v)}
                options={[
                  { value: "America/Guatemala", label: "Guatemala (GMT-6)" },
                  { value: "America/Mexico_City", label: "Ciudad de México (GMT-6)" },
                  { value: "America/Bogota", label: "Bogotá (GMT-5)" },
                ]}
              />
            </div>
          </Card>

          <Card style={{ padding: "24px", background: "rgba(78,99,200,0.05)", border: "1px solid rgba(78,99,200,0.15)" }}>
            <h3 style={{ margin: "0 0 12px", fontFamily: "'DM Serif Display', serif", fontSize: "18px", color: "#4E63C8" }}>ℹ️ Información</h3>
            <p style={{ fontSize: "13px", color: "var(--muted-foreground)", margin: 0, lineHeight: 1.5 }}>
              Los cambios en los datos del negocio se reflejarán automáticamente en los reportes PDF y en las facturas generadas por el sistema.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}