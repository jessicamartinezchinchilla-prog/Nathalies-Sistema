import { useState } from "react";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Productos from "./pages/Productos";
import Insumos from "./pages/Insumos";
import Servicios from "./pages/Servicios";
import Movimientos from "./pages/Movimientos";
import NuevaVenta from "./pages/NuevaVenta";
import HistorialVentas from "./pages/HistorialVentas";
import Compras from "./pages/Compras";
import Proveedores from "./pages/Proveedores";
import CuentasPorPagar from "./pages/CuentasPorPagar";
import Gastos from "./pages/Gastos";
import Contabilidad from "./pages/Contabilidad";
import CierreCaja from "./pages/CierreCaja";
import Usuarios from "./pages/Usuarios";
import Reportes from "./pages/Reportes";
import Configuracion from "./pages/Configuracion";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  if (!isLoggedIn) {
    return (
      <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
        <Login onLogin={() => setIsLoggedIn(true)} />
      </div>
    );
  }

  const handleNavigate = (page: string) => setCurrentPage(page);

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      dashboard: "Dashboard", productos: "Productos", insumos: "Insumos", servicios: "Servicios", movimientos: "Movimientos",
      "nueva-venta": "Nueva Venta", "historial-ventas": "Historial de Ventas", "cierre-caja": "Cierre de Caja",
      compras: "Compras", proveedores: "Proveedores", "cuentas-pagar": "Cuentas por Pagar", gastos: "Gastos",
      contabilidad: "Contabilidad", usuarios: "Usuarios", reportes: "Reportes", configuracion: "Configuración General",
    };
    return titles[currentPage] || "Sistema";
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--background)", overflow: "hidden" }}>
      <Sidebar current={currentPage} onNavigate={handleNavigate} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header title={getPageTitle()} subtitle="Gestión del sistema" />
        <main style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
          {currentPage === "dashboard" && <Dashboard onNavigate={handleNavigate} />}
          {currentPage === "productos" && <Productos />}
          {currentPage === "insumos" && <Insumos />}
          {currentPage === "servicios" && <Servicios />}
          {currentPage === "movimientos" && <Movimientos />}
          {currentPage === "nueva-venta" && <NuevaVenta />}
          {currentPage === "historial-ventas" && <HistorialVentas />}
          {currentPage === "compras" && <Compras />}
          {currentPage === "proveedores" && <Proveedores />}
          {currentPage === "cuentas-pagar" && <CuentasPorPagar />}
          {currentPage === "gastos" && <Gastos />}
          {currentPage === "contabilidad" && <Contabilidad />}
          {currentPage === "cierre-caja" && <CierreCaja />}
          {currentPage === "usuarios" && <Usuarios />}
          {currentPage === "reportes" && <Reportes />}
          {currentPage === "configuracion" && <Configuracion />}
        </main>
      </div>
    </div>
  );
}