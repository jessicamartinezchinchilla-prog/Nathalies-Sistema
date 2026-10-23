import { useState, useEffect, useRef } from "react";

type Props = { title: string; subtitle?: string };

interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
}

export default function Header({ title, subtitle }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [notifData, setNotifData] = useState({
    stock_bajo_count: 0,
    ctas_pendientes: 0,
    ctas_total: 0
  });

  // Cargar datos de notificaciones desde el backend
  useEffect(() => {
    fetch("http://localhost:8000/api/dashboard/resumen.php")
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setNotifData({
            stock_bajo_count: json.data.stock_bajo_count || 0,
            ctas_pendientes: json.data.ctas_pendientes || 0,
            ctas_total: json.data.ctas_total || 0
          });
        }
      })
      .catch(err => console.error("Error cargando notificaciones:", err));
  }, []);

  // Generar notificaciones dinámicamente
  const notificaciones: Notificacion[] = [];
  if (notifData.ctas_pendientes > 0) {
    notificaciones.push({
      id: "ctas-pagar",
      titulo: "Cuentas por pagar pendientes",
      mensaje: `Tienes ${notifData.ctas_pendientes} cuenta(s) por pagar con un total de $${notifData.ctas_total.toFixed(2)}.`
    });
  }
  if (notifData.stock_bajo_count > 0) {
    notificaciones.push({
      id: "stock-bajo",
      titulo: "Stock bajo en inventario",
      mensaje: `${notifData.stock_bajo_count} producto(s) o insumo(s) están por debajo del stock mínimo.`
    });
  }

  // Cerrar dropdown al hacer clic fuera
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
    <header style={{ 
      height: "64px", 
      background: "var(--card)", 
      borderBottom: "1px solid var(--border)", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "space-between", 
      padding: "0 32px", 
      flexShrink: 0 
    }}>
      <div>
        <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--foreground)", margin: 0, fontFamily: "'DM Serif Display', serif" }}>
          {title}
        </h2>
        {subtitle && <p style={{ fontSize: "12px", color: "var(--muted-foreground)", margin: "2px 0 0" }}>{subtitle}</p>}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        
        {/* ══════════════════════════════════════════
            CAMPANITA DE NOTIFICACIONES INTEGRADA
        ══════════════════════════════════════════ */}
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{ 
              width: "36px", 
              height: "36px", 
              borderRadius: "8px", 
              background: "var(--muted)", 
              border: "none", 
              color: "var(--muted-foreground)", 
              fontSize: "16px", 
              cursor: "pointer", 
              position: "relative", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center" 
            }}
          >
            🔔
            {totalAlertas > 0 && (
              <span style={{ 
                position: "absolute", 
                top: "-4px", 
                right: "-4px", 
                background: "var(--danger)", 
                color: "white", 
                borderRadius: "50%", 
                width: "18px", 
                height: "18px", 
                fontSize: "11px", 
                fontWeight: "bold", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                border: "2px solid var(--card)"
              }}>
                {totalAlertas}
              </span>
            )}
          </button>

          {/* Dropdown de notificaciones */}
          {isOpen && (
            <div style={{
              position: "absolute",
              right: 0,
              top: "46px",
              width: "340px",
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
              zIndex: 1000,
              overflow: "hidden"
            }}>
              <div style={{ padding: "16px", borderBottom: "1px solid var(--border)" }}>
                <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "var(--foreground)" }}>
                  Notificaciones
                </h3>
              </div>

              {totalAlertas === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: "40px", marginBottom: "12px", opacity: 0.3 }}>🔕</div>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "var(--foreground)" }}>
                    No tienes notificaciones
                  </p>
                  <p style={{ margin: "8px 0 0", fontSize: "12px", color: "var(--muted-foreground)", lineHeight: 1.5 }}>
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
                        borderBottom: "1px solid var(--border)",
                        display: "flex",
                        gap: "12px",
                        alignItems: "flex-start",
                        background: "rgba(239, 68, 68, 0.05)"
                      }}
                    >
                      <div style={{ fontSize: "20px" }}>⚠️</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "var(--foreground)" }}>
                          {notif.titulo}
                        </p>
                        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--muted-foreground)", lineHeight: 1.4 }}>
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

        {/* Fecha y Hora */}
        <div style={{ textAlign: "right", fontSize: "12px", color: "var(--muted-foreground)", lineHeight: 1.4 }}>
          <div style={{ color: "var(--foreground)", fontWeight: 500 }}>
            {new Date().toLocaleDateString("es-GT", { weekday: "short", day: "numeric", month: "short" })}
          </div>
          <div>
            {new Date().toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>
    </header>
  );
}