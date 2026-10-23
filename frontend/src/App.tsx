import { useState } from "react";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Productos from "./pages/Productos";
import Insumos from "./pages/Insumos";
import Servicios from "./pages/Servicios";
import NuevaVenta from "./pages/NuevaVenta";
import HistorialVentas from "./pages/HistorialVentas";
import Compras from "./pages/Compras";
import Proveedores from "./pages/Proveedores";
import CuentasPorPagar from "./pages/CuentasPorPagar";
import Gastos from "./pages/Gastos";
import Contabilidad from "./pages/Contabilidad";
import Usuarios from "./pages/Usuarios";
import Reportes from "./pages/Reportes";
import Configuracion from "./pages/Configuracion";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  const [showOpenCashModal, setShowOpenCashModal] = useState(false);
  const [montoApertura, setMontoApertura] = useState("");

  const [showCloseCashModal, setShowCloseCashModal] = useState(false);
  const [montoCierreReal, setMontoCierreReal] = useState("");
  const [loadingCaja, setLoadingCaja] = useState(false);
  const [ventasTurno, setVentasTurno] = useState(0);

  if (!isLoggedIn && !showOpenCashModal) {
    return (
      <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
        <Login onLogin={() => setShowOpenCashModal(true)} />
      </div>
    );
  }

  if (showOpenCashModal) {
    const handleOpenCash = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!montoApertura || parseFloat(montoApertura) < 0) {
        alert("Por favor ingresa un monto válido para la apertura de caja.");
        return;
      }
      setLoadingCaja(true);
      try {
        localStorage.setItem("caja_inicial", montoApertura);
        localStorage.setItem("fecha_apertura", new Date().toISOString());
        setIsLoggedIn(true);
        setShowOpenCashModal(false);
        setMontoApertura("");
      } catch (err) {
        alert("Error al registrar la apertura de caja");
      } finally {
        setLoadingCaja(false);
      }
    };

    return (
      <div style={{ width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)" }}>
        <div style={{ background: "white", padding: "32px", borderRadius: "12px", width: "100%", maxWidth: "400px" }}>
          <h2 style={{ marginTop: 0, textAlign: "center", color: "#1f2937" }}>💵 Apertura de Caja</h2>
          <p style={{ textAlign: "center", color: "#6b7280", marginBottom: "24px" }}>Ingresa el monto con el que inicias tu turno hoy.</p>
          <form onSubmit={handleOpenCash} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>Monto inicial en caja *</label>
              <input type="number" step="0.01" min="0" value={montoApertura} onChange={(e) => setMontoApertura(e.target.value)} required placeholder="0.00" style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "16px", boxSizing: "border-box" }} />
            </div>
            <button type="submit" disabled={loadingCaja} style={{ width: "100%", padding: "14px", background: loadingCaja ? "#9ca3af" : "#10b981", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: 600, cursor: "pointer" }}>
              {loadingCaja ? "Procesando..." : "Iniciar Turno"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ✅ FUNCIÓN CORREGIDA CON LA URL EXACTA Y LOGS DE DIAGNÓSTICO
  const solicitarCierre = async () => {
    setLoadingCaja(true);
    try {
      const fechaApertura = localStorage.getItem("fecha_apertura") || new Date().toISOString().split('T')[0];
      const hoy = new Date().toISOString().split('T')[0];

      console.log("🔍 Buscando ventas en el backend...");
      console.log("Fechas enviadas:", { fecha_inicio: fechaApertura, fecha_fin: hoy });

      // ⚠️ AQUÍ ESTABA EL ERROR: Ahora apunta a 'cierres/resumen.php'
      const res = await fetch(`http://localhost:8000/api/cierres/resumen.php?fecha_inicio=${fechaApertura}&fecha_fin=${hoy}`);
      const data = await res.json();

      console.log("📊 Respuesta del servidor:", data);

      setVentasTurno(data.success ? (data.total_ventas || 0) : 0);
      setShowCloseCashModal(true);
    } catch (err) {
      console.error("❌ Error al obtener ventas del turno", err);
      setVentasTurno(0);
      setShowCloseCashModal(true);
    } finally {
      setLoadingCaja(false);
    }
  };

  const confirmarCierreYSalir = async () => {
    if (!montoCierreReal) {
      alert("Por favor ingresa el monto real contado en caja.");
      return;
    }

    setLoadingCaja(true);
    try {
      const cajaInicial = parseFloat(localStorage.getItem("caja_inicial") || "0");
      const totalEsperado = cajaInicial + ventasTurno;
      const diferencia = parseFloat(montoCierreReal) - totalEsperado;

      await fetch("http://localhost:8000/api/cierres/guardar.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caja_inicial: cajaInicial,
          ventas_turno: ventasTurno,
          monto_real: parseFloat(montoCierreReal),
          diferencia: diferencia,
          fecha_apertura: localStorage.getItem("fecha_apertura"),
          usuario_id: 1
        })
      });

      localStorage.removeItem("caja_inicial");
      localStorage.removeItem("fecha_apertura");
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      setShowCloseCashModal(false);
      setMontoCierreReal("");
    } catch (err) {
      alert("Error al registrar el cierre de caja");
    } finally {
      setLoadingCaja(false);
    }
  };

  const handleNavigate = (page: string) => setCurrentPage(page);

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      dashboard: "Dashboard", productos: "Productos", insumos: "Insumos", servicios: "Servicios",
      "nueva-venta": "Nueva Venta", "historial-ventas": "Historial de Ventas", compras: "Compras",
      proveedores: "Proveedores", "cuentas-pagar": "Cuentas por Pagar", gastos: "Gastos",
      contabilidad: "Contabilidad", usuarios: "Usuarios", reportes: "Reportes", configuracion: "Configuración General",
    };
    return titles[currentPage] || "Sistema";
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--background, #f9fafb)", overflow: "hidden" }}>
      <Sidebar current={currentPage} onNavigate={handleNavigate} onLogout={solicitarCierre} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header title={getPageTitle()} subtitle="Gestión del sistema" />
        <main style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
          {currentPage === "dashboard" && <Dashboard onNavigate={handleNavigate} />}
          {currentPage === "productos" && <Productos />}
          {currentPage === "insumos" && <Insumos />}
          {currentPage === "servicios" && <Servicios />}
          {currentPage === "nueva-venta" && <NuevaVenta />}
          {currentPage === "historial-ventas" && <HistorialVentas />}
          {currentPage === "compras" && <Compras />}
          {currentPage === "proveedores" && <Proveedores />}
          {currentPage === "cuentas-pagar" && <CuentasPorPagar />}
          {currentPage === "gastos" && <Gastos />}
          {currentPage === "contabilidad" && <Contabilidad />}
          {currentPage === "usuarios" && <Usuarios />}
          {currentPage === "reportes" && <Reportes />}
          {currentPage === "configuracion" && <Configuracion />}
        </main>
      </div>

      {showCloseCashModal && (() => {
        const cajaInicial = parseFloat(localStorage.getItem("caja_inicial") || "0");
        const totalEsperado = cajaInicial + ventasTurno;
        const diferencia = parseFloat(montoCierreReal || "0") - totalEsperado;
        const fmt = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(n);

        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 3000 }}>
            <div style={{ background: "white", padding: "32px", borderRadius: "12px", width: "100%", maxWidth: "450px" }}>
              <h2 style={{ marginTop: 0, textAlign: "center", color: "#1f2937" }}>🔒 Cierre de Caja y Sesión</h2>

              <div style={{ background: "#f9fafb", padding: "16px", borderRadius: "8px", marginBottom: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                  <span style={{ color: "#6b7280" }}>Caja Inicial:</span>
                  <strong>{fmt(cajaInicial)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                  <span style={{ color: "#6b7280" }}>Ventas del Turno:</span>
                  <strong style={{ color: "#10b981" }}>+ {fmt(ventasTurno)}</strong>
                </div>
                <div style={{ borderTop: "1px solid #e5e7eb", margin: "4px 0" }}></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: 700 }}>
                  <span>Total Esperado en Caja:</span>
                  <span>{fmt(totalEsperado)}</span>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>💵 Efectivo real contado *</label>
                <input type="number" step="0.01" min="0" value={montoCierreReal} onChange={(e) => setMontoCierreReal(e.target.value)} placeholder="0.00" style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "16px", boxSizing: "border-box" }} />
              </div>

              {montoCierreReal && (
                <div style={{
                  padding: "12px", borderRadius: "8px", marginBottom: "20px", textAlign: "center", fontWeight: 600, fontSize: "15px",
                  background: diferencia === 0 ? "#ecfdf5" : diferencia > 0 ? "#eff6ff" : "#fef2f2",
                  color: diferencia === 0 ? "#059669" : diferencia > 0 ? "#2563eb" : "#dc2626"
                }}>
                  {diferencia === 0 ? "✅ Cuadre perfecto" : diferencia > 0 ? `⚠️ Sobrante: ${fmt(diferencia)}` : `🚨 Faltante: ${fmt(Math.abs(diferencia))}`}
                </div>
              )}

              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={() => { setShowCloseCashModal(false); setMontoCierreReal(""); }} style={{ flex: 1, padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", background: "white", cursor: "pointer", fontWeight: 600 }}>Cancelar</button>
                <button onClick={confirmarCierreYSalir} disabled={loadingCaja} style={{ flex: 1, padding: "12px", border: "none", borderRadius: "8px", background: loadingCaja ? "#9ca3af" : "#ef4444", color: "white", cursor: "pointer", fontWeight: 600 }}>
                  {loadingCaja ? "Procesando..." : "Cerrar Caja y Salir"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}