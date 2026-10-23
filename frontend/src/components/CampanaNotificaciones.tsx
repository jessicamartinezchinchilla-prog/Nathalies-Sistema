import { useState, useRef, useEffect } from "react";

interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: "alerta" | "info";
}

interface CampanaProps {
  stockBajoCount: number;
  ctasPendientes: number;
  ctasTotal: number;
}

export default function CampanaNotificaciones({ stockBajoCount, ctasPendientes, ctasTotal }: CampanaProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generar notificaciones dinámicamente con los datos del dashboard
  const notificaciones: Notificacion[] = [];

  if (ctasPendientes > 0) {
    notificaciones.push({
      id: "ctas-pagar",
      titulo: "Cuentas por pagar pendientes",
      mensaje: `Tienes ${ctasPendientes} cuenta(s) por pagar con un total de $${ctasTotal.toFixed(2)}.`,
      tipo: "alerta"
    });
  }

  if (stockBajoCount > 0) {
    notificaciones.push({
      id: "stock-bajo",
      titulo: "Stock bajo en inventario",
      mensaje: `${stockBajoCount} producto(s) o insumo(s) están por debajo del stock mínimo.`,
      tipo: "alerta"
    });
  }

  // Cerrar el menú si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalAlertas = notificaciones.length;

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      {/* Botón de la Campanita */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          width: "42px",
          height: "42px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          position: "relative",
          fontSize: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          transition: "all 0.2s"
        }}
      >
        🔔
        {/* Badge rojo si hay alertas */}
        {totalAlertas > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              background: "#ef4444",
              color: "white",
              borderRadius: "50%",
              width: "18px",
              height: "18px",
              fontSize: "11px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid white"
            }}
          >
            {totalAlertas}
          </span>
        )}
      </button>

      {/* Menú Desplegable */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "52px",
            width: "340px",
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
            zIndex: 100,
            overflow: "hidden"
          }}
        >
          <div style={{ padding: "16px", borderBottom: "1px solid #f3f4f6" }}>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#1f2937" }}>
              Notificaciones
            </h3>
          </div>

          {/* ESTADO VACÍO o LISTA DE ALERTAS */}
          {totalAlertas === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px", opacity: 0.3 }}>🔕</div>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#1f2937" }}>
                No tienes notificaciones
              </p>
              <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#6b7280", lineHeight: 1.5 }}>
                Las alertas de stock bajo o cuentas por pagar aparecerán aquí.
              </p>
            </div>
          ) : (
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {notificaciones.map((notif) => (
                <div
                  key={notif.id}
                  style={{
                    padding: "14px 16px",
                    borderBottom: "1px solid #f3f4f6",
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                    background: "#fff1f2" // Fondo rosado suave para alertas no leídas
                  }}
                >
                  <div style={{ fontSize: "20px" }}>⚠️</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#1f2937" }}>
                      {notif.titulo}
                    </p>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#4b5563", lineHeight: 1.4 }}>
                      {notif.mensaje}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}