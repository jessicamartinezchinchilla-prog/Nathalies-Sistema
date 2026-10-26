import { useState, useEffect } from "react";
import { getUsuarioActual, tienePermisoModulo } from "../utils/roles";

interface SidebarProps {
  current: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ current, onNavigate, onLogout }: SidebarProps) {
  const [usuario, setUsuario] = useState<any>(() => getUsuarioActual());
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    ventas: true,
    inventario: true,
    configuracion: false,
  });

  const cargarPermisosActualizados = async () => {
    const userLocal = getUsuarioActual();
    if (!userLocal) {
      setUsuario(null);
      return;
    }
    setUsuario(userLocal);

    try {
      const res = await fetch("http://localhost:8000/api/roles/listar.php");
      const data = await res.json();
      if (data.success && Array.isArray(data.roles)) {
        const miRol = data.roles.find(
          (r: any) =>
            Number(r.id) === Number(userLocal.rol_id) ||
            r.nombre === userLocal.rol
        );
        if (miRol && Array.isArray(miRol.permisos)) {
          const actualizado = {
            ...userLocal,
            rol: miRol.nombre,
            permisos: miRol.permisos,
          };
          localStorage.setItem("user", JSON.stringify(actualizado));
          setUsuario(actualizado);
        }
      }
    } catch (error) {
      // Si falla la petición usamos los permisos guardados en localStorage
    }
  };

  useEffect(() => {
    cargarPermisosActualizados();

    const handleRolesUpdated = () => {
      cargarPermisosActualizados();
    };
    window.addEventListener("roles-updated", handleRolesUpdated);
    return () => window.removeEventListener("roles-updated", handleRolesUpdated);
  }, []);

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const rawMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: "-" },
    {
      id: "ventas",
      label: "Ventas",
      icon: "-",
      children: [
        { id: "nueva-venta", label: "Nueva Venta" },
        { id: "historial-ventas", label: "Historial de Ventas" },
      ],
    },
    {
      id: "inventario",
      label: "Inventario y Operaciones",
      icon: "-",
      children: [
        { id: "productos", label: "Productos" },
        { id: "insumos", label: "Insumos" },
        { id: "servicios", label: "Servicios" },
      ],
    },
    { id: "compras", label: "Compras", icon: "-" },
    { id: "proveedores", label: "Proveedores", icon: "-" },
    { id: "cuentas-pagar", label: "Cuentas por pagar", icon: "-" },
    { id: "gastos", label: "Gastos", icon: "-" },
    { id: "contabilidad", label: "Contabilidad", icon: "-" },
    { id: "reportes", label: "Reportes", icon: "-" },
    {
      id: "configuracion-menu",
      label: "Configuración",
      icon: "-",
      children: [
        { id: "usuarios", label: "Usuarios y Roles" },
        { id: "configuracion", label: "Configuración General" },
      ],
    },
  ];

  // Filtrar los módulos del menú según los permisos del rol del usuario activo
  const menuItems = rawMenuItems
    .map((item) => {
      if (item.children) {
        const allowedChildren = item.children.filter((child) =>
          tienePermisoModulo(usuario, child.id)
        );
        if (allowedChildren.length === 0) return null;
        return { ...item, children: allowedChildren };
      }
      return tienePermisoModulo(usuario, item.id) ? item : null;
    })
    .filter(Boolean);

  const isActive = (id: string) => current === id;

  const getRolBadgeColor = (rol?: string) => {
    if (rol === "Administrador") return { bg: "rgba(192, 132, 151, 0.25)", color: "#f4bbc9", border: "rgba(192, 132, 151, 0.5)" };
    if (rol === "Contador") return { bg: "rgba(59, 130, 246, 0.2)", color: "#93c5fd", border: "rgba(59, 130, 246, 0.4)" };
    return { bg: "rgba(16, 185, 129, 0.2)", color: "#6ee7b7", border: "rgba(16, 185, 129, 0.4)" };
  };

  const rolNombre = usuario?.rol || (usuario?.rol_id === 1 ? "Administrador" : usuario?.rol_id === 2 ? "Contador" : "Cajero");
  const badgeStyle = getRolBadgeColor(rolNombre);

  return (
    <div
      style={{
        width: "260px",
        background: "#190C30",
        color: "white",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        flexShrink: 0,
      }}
    >
      {/* LOGO */}
      <div
        style={{
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            background: "#c08497",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "20px",
            fontWeight: "bold",
          }}
        >
          N
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>
            Nathalie's
          </h1>
          <p style={{ margin: 0, fontSize: "11px", color: "#a78bfa" }}>
            Nails & Lashes
          </p>
        </div>
      </div>

      {/* MENÚ DE NAVEGACIÓN FILTRADO POR ROL */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "16px 0" }}>
        {menuItems.map((item: any) => {
          const hasChildren = item.children && item.children.length > 0;
          const isOpen = openMenus[item.id] ?? true;

          if (hasChildren) {
            return (
              <div key={item.id}>
                <button
                  onClick={() => toggleMenu(item.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 24px",
                    background: "transparent",
                    border: "none",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "16px" }}>{item.icon}</span>
                    {item.label}
                  </span>
                  <span
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                      fontSize: "12px",
                    }}
                  >
                    ▼
                  </span>
                </button>
                {isOpen && (
                  <div style={{ paddingLeft: "48px" }}>
                    {item.children.map((child: any) => (
                      <button
                        key={child.id}
                        onClick={() => onNavigate(child.id)}
                        style={{
                          width: "100%",
                          display: "block",
                          padding: "10px 16px",
                          background: isActive(child.id)
                            ? "rgba(192, 132, 151, 0.2)"
                            : "transparent",
                          border: "none",
                          borderLeft: isActive(child.id)
                            ? "3px solid #c08497"
                            : "3px solid transparent",
                          color: isActive(child.id) ? "#c08497" : "#d1d5db",
                          fontSize: "13px",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 24px",
                background: isActive(item.id)
                  ? "rgba(192, 132, 151, 0.2)"
                  : "transparent",
                border: "none",
                borderLeft: isActive(item.id)
                  ? "3px solid #c08497"
                  : "3px solid transparent",
                color: isActive(item.id) ? "#c08497" : "white",
                fontSize: "14px",
                fontWeight: isActive(item.id) ? 600 : 500,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* USUARIO, ROL Y CERRAR SESIÓN */}
      <div
        style={{
          padding: "16px 24px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(0,0,0,0.2)",
        }}
      >
        {/* Info del usuario */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#c08497",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {usuario?.nombre ? usuario.nombre.charAt(0).toUpperCase() : "U"}
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "white",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {usuario?.nombre || "Usuario"}
            </div>
            <div style={{ marginTop: "3px", marginBottom: "2px" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  fontSize: "10px",
                  fontWeight: 700,
                  background: badgeStyle.bg,
                  color: badgeStyle.color,
                  border: `1px solid ${badgeStyle.border}`,
                  letterSpacing: "0.3px",
                }}
              >
                {rolNombre}
              </span>
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#a78bfa",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {usuario?.email || ""}
            </div>
          </div>
        </div>

        {/* Botón Cerrar Sesión */}
        <button
          onClick={onLogout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "10px",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "8px",
            background: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
