export type ModuloSistema = {
  id: string;
  label: string;
  grupo: string;
  descripcion: string;
};

export const MODULOS_SISTEMA: ModuloSistema[] = [
  { id: "dashboard", label: "Dashboard", grupo: "General", descripcion: "Resumen general, indicadores y alertas del negocio" },
  { id: "nueva-venta", label: "Nueva Venta", grupo: "Ventas", descripcion: "Punto de venta (POS) para cobrar productos y servicios" },
  { id: "historial-ventas", label: "Historial de Ventas", grupo: "Ventas", descripcion: "Consulta de tickets, ventas realizadas y anulaciones" },
  { id: "productos", label: "Productos", grupo: "Inventario y Operaciones", descripcion: "Catálogo y existencias de productos para venta" },
  { id: "insumos", label: "Insumos", grupo: "Inventario y Operaciones", descripcion: "Control de insumos de trabajo y stock mínimo" },
  { id: "servicios", label: "Servicios", grupo: "Inventario y Operaciones", descripcion: "Catálogo de servicios (uñas, pestañas, cejas, cabello)" },
  { id: "compras", label: "Compras", grupo: "Compras y Proveedores", descripcion: "Registro de compras de mercadería e insumos" },
  { id: "proveedores", label: "Proveedores", grupo: "Compras y Proveedores", descripcion: "Directorio y gestión de proveedores" },
  { id: "cuentas-pagar", label: "Cuentas por Pagar", grupo: "Finanzas y Contabilidad", descripcion: "Control de saldos pendientes a proveedores" },
  { id: "gastos", label: "Gastos", grupo: "Finanzas y Contabilidad", descripcion: "Registro de gastos operativos (alquiler, luz, agua, etc.)" },
  { id: "contabilidad", label: "Contabilidad", grupo: "Finanzas y Contabilidad", descripcion: "Activos fijos, balance e información contable" },
  { id: "reportes", label: "Reportes", grupo: "Finanzas y Contabilidad", descripcion: "Estado de resultados y exportación en PDF/Excel" },
  { id: "usuarios", label: "Usuarios y Roles", grupo: "Configuración", descripcion: "Administración de usuarios, asignación de roles y permisos" },
  { id: "configuracion", label: "Configuración General", grupo: "Configuración", descripcion: "Datos del negocio y personalización de comprobantes" },
];

export const PERMISOS_POR_DEFECTO: Record<string, string[]> = {
  Administrador: MODULOS_SISTEMA.map((m) => m.id),
  Contador: [
    "dashboard",
    "historial-ventas",
    "compras",
    "proveedores",
    "cuentas-pagar",
    "gastos",
    "contabilidad",
    "reportes",
  ],
  Cajero: [
    "nueva-venta",
    "historial-ventas",
    "productos",
    "insumos",
    "servicios",
  ],
};

export function getUsuarioActual(): any | null {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr && userStr !== "undefined" && userStr !== "null") {
      return JSON.parse(userStr);
    }
  } catch (e) {
    console.error("Error leyendo usuario de localStorage:", e);
  }
  return null;
}

export function getPermisosUsuario(user: any | null): string[] {
  if (!user) return [];
  if (Array.isArray(user.permisos) && user.permisos.length > 0) {
    return user.permisos;
  }
  const rolNombre = user.rol || (user.rol_id === 1 ? "Administrador" : user.rol_id === 2 ? "Contador" : "Cajero");
  return PERMISOS_POR_DEFECTO[rolNombre] || PERMISOS_POR_DEFECTO.Cajero;
}

export function tienePermisoModulo(user: any | null, moduloId: string): boolean {
  if (!user) return false;
  const rolNombre = user.rol || (user.rol_id === 1 ? "Administrador" : "");
  // El Administrador siempre tiene acceso a usuarios para evitar bloqueo accidental
  if (rolNombre === "Administrador" && moduloId === "usuarios") {
    return true;
  }
  const permisos = getPermisosUsuario(user);
  return permisos.includes(moduloId);
}

export function getPaginaInicialPorRol(user: any | null): string {
  const permisos = getPermisosUsuario(user);
  if (permisos.includes("dashboard")) return "dashboard";
  if (permisos.includes("nueva-venta")) return "nueva-venta";
  return permisos[0] || "dashboard";
}
