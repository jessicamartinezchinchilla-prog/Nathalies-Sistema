import { useState, useEffect } from "react";
import { Card, SectionHeader, Button, Badge } from "../components/ui";

const tabs = [
  "Estado de resultados",
  "Ventas",
  "Compras",
  "Inventario",
  "Cuentas por pagar",
] as const;

const meses: Record<string, { inicio: string; fin: string; label: string }> = {
  "octubre-2026": { inicio: "2026-10-01", fin: "2026-10-31", label: "Octubre 2026" },
  "septiembre-2026": { inicio: "2026-09-01", fin: "2026-09-30", label: "Septiembre 2026" },
  "bimestre-sep-oct": { inicio: "2026-09-01", fin: "2026-10-31", label: "Septiembre - Octubre 2026" },
  "agosto-2026": { inicio: "2026-08-01", fin: "2026-08-31", label: "Agosto 2026" },
  "julio-2026": { inicio: "2026-07-01", fin: "2026-07-31", label: "Julio 2026" },
  "anual-2026": { inicio: "2026-01-01", fin: "2026-12-31", label: "Año 2026 Completo" },
};

export default function Reportes() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Estado de resultados");
  const [periodo, setPeriodo] = useState("octubre-2026");
  const [fechaInicioCustom, setFechaInicioCustom] = useState("2026-09-01");
  const [fechaFinCustom, setFechaFinCustom] = useState("2026-10-31");
  const [showExport, setShowExport] = useState(false);

  const [datos, setDatos] = useState({
    venta_productos: 0,
    ingreso_servicios: 0,
    total_ingresos: 0,
    costo_ventas: 0,
    total_compras: 0,
    utilidad_bruta: 0,
    alquiler: 0,
    servicios_basicos: 0,
    otros_gastos: 0,
    total_gastos: 0,
    utilidad_neta: 0,
    cantidad_ventas: 0,
    cantidad_compras: 0,
  });

  const [ventasLista, setVentasLista] = useState<any[]>([]);
  const [comprasLista, setComprasLista] = useState<any[]>([]);
  const [inventarioLista, setInventarioLista] = useState<any[]>([]);
  const [cuentasLista, setCuentasLista] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const getFechasActivas = () => {
    if (periodo === "personalizado") {
      return {
        inicio: fechaInicioCustom,
        fin: fechaFinCustom,
        label: `${fechaInicioCustom} al ${fechaFinCustom}`,
      };
    }
    return meses[periodo] || meses["octubre-2026"];
  };

  useEffect(() => {
    const cargarDatos = async () => {
      const fechas = getFechasActivas();
      if (!fechas.inicio || !fechas.fin) return;

      setLoading(true);
      try {
        const url = `http://localhost:8000/api/reportes/estado-resultados.php?fecha_inicio=${fechas.inicio}&fecha_fin=${fechas.fin}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.success) {
          setDatos({
            venta_productos: Number(data.totales.venta_productos || 0),
            ingreso_servicios: Number(data.totales.ingreso_servicios || 0),
            total_ingresos: Number(data.totales.ingresos || 0),
            costo_ventas: Number(data.totales.costo_ventas || 0),
            total_compras: Number(data.totales.total_compras || 0),
            utilidad_bruta: Number(data.totales.utilidad_bruta || 0),
            alquiler: Number(data.totales.alquiler || 0),
            servicios_basicos: Number(data.totales.servicios_basicos || 0),
            otros_gastos: Number(data.totales.otros_gastos || 0),
            total_gastos: Number(data.totales.gastos || 0),
            utilidad_neta: Number(data.totales.utilidad || 0),
            cantidad_ventas: Number(data.totales.cantidad_ventas || 0),
            cantidad_compras: Number(data.totales.cantidad_compras || 0),
          });
          setVentasLista(Array.isArray(data.ventas) ? data.ventas : []);
          setComprasLista(Array.isArray(data.compras) ? data.compras : []);
          setInventarioLista(Array.isArray(data.inventario) ? data.inventario : []);
          setCuentasLista(Array.isArray(data.cuentas_por_pagar) ? data.cuentas_por_pagar : []);
        }
      } catch (error) {
        console.error("Error cargando reportes:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [periodo, fechaInicioCustom, fechaFinCustom]);

  const formatMoney = (amount: number) => {
    return `$ ${Number(amount || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Exportar a PDF profesional (pestaña actual o reporte ejecutivo completo)
  const exportarPDF = (tipo: string = activeTab) => {
    const fechas = getFechasActivas();
    const url = `http://localhost:8000/api/reportes/exportar-pdf.php?fecha_inicio=${fechas.inicio}&fecha_fin=${fechas.fin}&tipo=${encodeURIComponent(tipo)}`;
    window.open(url, "_blank");
    setShowExport(false);
  };

  // Exportar a Excel Profesional con diseño corporativo (.xls compatible con Microsoft Excel)
  const exportarExcelProfesional = () => {
    const fechas = getFechasActivas();
    const fechaEmision = new Date().toLocaleString("es-GT");

    let tablaDetalleHTML = "";

    if (activeTab === "Estado de resultados") {
      tablaDetalleHTML = `
        <table>
          <thead>
            <tr>
              <th colspan="2" style="background:#190C30; color:#ffffff; font-weight:bold; padding:10px; text-align:left; border:1px solid #d1d5db;">CONCEPTO FINANCIERO</th>
              <th style="background:#190C30; color:#ffffff; font-weight:bold; padding:10px; text-align:left; border:1px solid #d1d5db;">CATEGORÍA</th>
              <th style="background:#190C30; color:#ffffff; font-weight:bold; padding:10px; text-align:right; border:1px solid #d1d5db;">MONTO (USD)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="2" style="padding:8px; border:1px solid #e5e7eb;">Venta de productos (${datos.cantidad_ventas} ventas)</td>
              <td style="padding:8px; border:1px solid #e5e7eb;">Ingresos Operativos</td>
              <td style="padding:8px; border:1px solid #e5e7eb; text-align:right;">${formatMoney(datos.venta_productos)}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:8px; border:1px solid #e5e7eb;">Ingresos por servicios de salón</td>
              <td style="padding:8px; border:1px solid #e5e7eb;">Ingresos Operativos</td>
              <td style="padding:8px; border:1px solid #e5e7eb; text-align:right;">${formatMoney(datos.ingreso_servicios)}</td>
            </tr>
            <tr style="background:#ecfdf5; font-weight:bold;">
              <td colspan="3" style="padding:10px; border:1px solid #a7f3d0; color:#065f46;">TOTAL INGRESOS BRUTOS</td>
              <td style="padding:10px; border:1px solid #a7f3d0; text-align:right; color:#065f46;">${formatMoney(datos.total_ingresos)}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:8px; border:1px solid #e5e7eb;">Costo de productos vendidos</td>
              <td style="padding:8px; border:1px solid #e5e7eb;">Costo de Ventas</td>
              <td style="padding:8px; border:1px solid #e5e7eb; text-align:right;">${formatMoney(datos.costo_ventas)}</td>
            </tr>
            <tr style="background:#f3f4f6; font-weight:bold;">
              <td colspan="3" style="padding:10px; border:1px solid #d1d5db;">UTILIDAD BRUTA</td>
              <td style="padding:10px; border:1px solid #d1d5db; text-align:right;">${formatMoney(datos.utilidad_bruta)}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:8px; border:1px solid #e5e7eb;">Alquiler de local</td>
              <td style="padding:8px; border:1px solid #e5e7eb;">Gastos Operativos</td>
              <td style="padding:8px; border:1px solid #e5e7eb; text-align:right;">${formatMoney(datos.alquiler)}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:8px; border:1px solid #e5e7eb;">Servicios básicos (Agua, Luz, Internet)</td>
              <td style="padding:8px; border:1px solid #e5e7eb;">Gastos Operativos</td>
              <td style="padding:8px; border:1px solid #e5e7eb; text-align:right;">${formatMoney(datos.servicios_basicos)}</td>
            </tr>
            ${datos.otros_gastos > 0 ? `
            <tr>
              <td colspan="2" style="padding:8px; border:1px solid #e5e7eb;">Otros gastos operativos</td>
              <td style="padding:8px; border:1px solid #e5e7eb;">Gastos Operativos</td>
              <td style="padding:8px; border:1px solid #e5e7eb; text-align:right;">${formatMoney(datos.otros_gastos)}</td>
            </tr>` : ""}
            <tr style="background:#fef2f2; font-weight:bold;">
              <td colspan="3" style="padding:10px; border:1px solid #fecaca; color:#991b1b;">TOTAL GASTOS OPERATIVOS</td>
              <td style="padding:10px; border:1px solid #fecaca; text-align:right; color:#991b1b;">${formatMoney(datos.total_gastos)}</td>
            </tr>
            <tr style="background:#fdf2f8; font-weight:bold; font-size:14px;">
              <td colspan="3" style="padding:12px; border:2px solid #c08497; color:#190C30;">UTILIDAD NETA DEL PERÍODO</td>
              <td style="padding:12px; border:2px solid #c08497; text-align:right; color:#190C30;">${formatMoney(datos.utilidad_neta)}</td>
            </tr>
          </tbody>
        </table>
      `;
    } else if (activeTab === "Ventas") {
      const filas = ventasLista
        .map(
          (v) => `
          <tr>
            <td style="padding:8px; border:1px solid #e5e7eb; font-weight:bold;">${v.codigo}</td>
            <td style="padding:8px; border:1px solid #e5e7eb;">${v.fecha}</td>
            <td style="padding:8px; border:1px solid #e5e7eb;">${v.resumen_items || "Venta general"}</td>
            <td style="padding:8px; border:1px solid #e5e7eb;">${v.vendedor}</td>
            <td style="padding:8px; border:1px solid #e5e7eb;">${v.metodo_pago}</td>
            <td style="padding:8px; border:1px solid #e5e7eb;">${v.estado}</td>
            <td style="padding:8px; border:1px solid #e5e7eb; text-align:right;">${formatMoney(v.total)}</td>
          </tr>`
        )
        .join("");

      tablaDetalleHTML = `
        <table>
          <thead>
            <tr>
              <th style="background:#190C30; color:#ffffff; padding:10px;">CÓDIGO</th>
              <th style="background:#190C30; color:#ffffff; padding:10px;">FECHA</th>
              <th style="background:#190C30; color:#ffffff; padding:10px;">CONCEPTO / PRODUCTOS</th>
              <th style="background:#190C30; color:#ffffff; padding:10px;">USUARIO</th>
              <th style="background:#190C30; color:#ffffff; padding:10px;">MÉTODO DE PAGO</th>
              <th style="background:#190C30; color:#ffffff; padding:10px;">ESTADO</th>
              <th style="background:#190C30; color:#ffffff; padding:10px; text-align:right;">TOTAL (USD)</th>
            </tr>
          </thead>
          <tbody>
            ${filas}
            <tr style="background:#fdf2f8; font-weight:bold;">
              <td colspan="6" style="padding:10px; border:2px solid #c08497;">TOTAL VENTAS COMPLETADAS</td>
              <td style="padding:10px; border:2px solid #c08497; text-align:right;">${formatMoney(datos.total_ingresos)}</td>
            </tr>
          </tbody>
        </table>
      `;
    } else if (activeTab === "Compras") {
      const filas = comprasLista
        .map(
          (c) => `
          <tr>
            <td style="padding:8px; border:1px solid #e5e7eb; font-weight:bold;">${c.codigo}</td>
            <td style="padding:8px; border:1px solid #e5e7eb;">${c.fecha}</td>
            <td style="padding:8px; border:1px solid #e5e7eb;">${c.proveedor}</td>
            <td style="padding:8px; border:1px solid #e5e7eb;">${c.metodo_pago}</td>
            <td style="padding:8px; border:1px solid #e5e7eb;">${c.estado_pago}</td>
            <td style="padding:8px; border:1px solid #e5e7eb; text-align:right;">${formatMoney(c.total)}</td>
          </tr>`
        )
        .join("");

      tablaDetalleHTML = `
        <table>
          <thead>
            <tr>
              <th style="background:#190C30; color:#ffffff; padding:10px;">CÓDIGO</th>
              <th style="background:#190C30; color:#ffffff; padding:10px;">FECHA</th>
              <th style="background:#190C30; color:#ffffff; padding:10px;">PROVEEDOR</th>
              <th style="background:#190C30; color:#ffffff; padding:10px;">MÉTODO DE PAGO</th>
              <th style="background:#190C30; color:#ffffff; padding:10px;">ESTADO</th>
              <th style="background:#190C30; color:#ffffff; padding:10px; text-align:right;">TOTAL (USD)</th>
            </tr>
          </thead>
          <tbody>
            ${filas}
            <tr style="background:#fdf2f8; font-weight:bold;">
              <td colspan="5" style="padding:10px; border:2px solid #c08497;">TOTAL COMPRAS DEL PERÍODO</td>
              <td style="padding:10px; border:2px solid #c08497; text-align:right;">${formatMoney(datos.total_compras)}</td>
            </tr>
          </tbody>
        </table>
      `;
    } else if (activeTab === "Inventario") {
      const totalInv = inventarioLista.reduce((acc, i) => acc + Number(i.valor_inventario || 0), 0);
      const filas = inventarioLista
        .map(
          (i) => `
          <tr>
            <td style="padding:8px; border:1px solid #e5e7eb; font-weight:bold;">${i.codigo}</td>
            <td style="padding:8px; border:1px solid #e5e7eb;">${i.nombre}</td>
            <td style="padding:8px; border:1px solid #e5e7eb;">${i.tipo}</td>
            <td style="padding:8px; border:1px solid #e5e7eb;">${i.categoria}</td>
            <td style="padding:8px; border:1px solid #e5e7eb; text-align:right;">${i.stock}</td>
            <td style="padding:8px; border:1px solid #e5e7eb; text-align:right;">${formatMoney(i.costo_unitario)}</td>
            <td style="padding:8px; border:1px solid #e5e7eb; text-align:right;">${formatMoney(i.valor_inventario)}</td>
          </tr>`
        )
        .join("");

      tablaDetalleHTML = `
        <table>
          <thead>
            <tr>
              <th style="background:#190C30; color:#ffffff; padding:10px;">CÓDIGO</th>
              <th style="background:#190C30; color:#ffffff; padding:10px;">ARTÍCULO</th>
              <th style="background:#190C30; color:#ffffff; padding:10px;">TIPO</th>
              <th style="background:#190C30; color:#ffffff; padding:10px;">CATEGORÍA</th>
              <th style="background:#190C30; color:#ffffff; padding:10px; text-align:right;">STOCK</th>
              <th style="background:#190C30; color:#ffffff; padding:10px; text-align:right;">COSTO UNIT.</th>
              <th style="background:#190C30; color:#ffffff; padding:10px; text-align:right;">VALOR TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${filas}
            <tr style="background:#fdf2f8; font-weight:bold;">
              <td colspan="6" style="padding:10px; border:2px solid #c08497;">VALOR TOTAL DE INVENTARIO</td>
              <td style="padding:10px; border:2px solid #c08497; text-align:right;">${formatMoney(totalInv)}</td>
            </tr>
          </tbody>
        </table>
      `;
    } else {
      const totalSaldo = cuentasLista.reduce((acc, c) => acc + Number(c.saldo_pendiente || 0), 0);
      const filas = cuentasLista
        .map(
          (c) => `
          <tr>
            <td style="padding:8px; border:1px solid #e5e7eb; font-weight:bold;">${c.compra_codigo}</td>
            <td style="padding:8px; border:1px solid #e5e7eb;">${c.proveedor}</td>
            <td style="padding:8px; border:1px solid #e5e7eb;">${c.fecha_vencimiento}</td>
            <td style="padding:8px; border:1px solid #e5e7eb;">${c.estado}</td>
            <td style="padding:8px; border:1px solid #e5e7eb; text-align:right;">${formatMoney(c.monto_original)}</td>
            <td style="padding:8px; border:1px solid #e5e7eb; text-align:right;">${formatMoney(c.monto_pagado)}</td>
            <td style="padding:8px; border:1px solid #e5e7eb; text-align:right; font-weight:bold;">${formatMoney(c.saldo_pendiente)}</td>
          </tr>`
        )
        .join("");

      tablaDetalleHTML = `
        <table>
          <thead>
            <tr>
              <th style="background:#190C30; color:#ffffff; padding:10px;">COMPRA REF.</th>
              <th style="background:#190C30; color:#ffffff; padding:10px;">PROVEEDOR</th>
              <th style="background:#190C30; color:#ffffff; padding:10px;">VENCIMIENTO</th>
              <th style="background:#190C30; color:#ffffff; padding:10px;">ESTADO</th>
              <th style="background:#190C30; color:#ffffff; padding:10px; text-align:right;">MONTO ORIGINAL</th>
              <th style="background:#190C30; color:#ffffff; padding:10px; text-align:right;">PAGADO</th>
              <th style="background:#190C30; color:#ffffff; padding:10px; text-align:right;">SALDO PENDIENTE</th>
            </tr>
          </thead>
          <tbody>
            ${filas}
            <tr style="background:#fdf2f8; font-weight:bold;">
              <td colspan="6" style="padding:10px; border:2px solid #c08497;">TOTAL SALDO POR PAGAR</td>
              <td style="padding:10px; border:2px solid #c08497; text-align:right;">${formatMoney(totalSaldo)}</td>
            </tr>
          </tbody>
        </table>
      `;
    }

    const excelHTML = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${activeTab}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
      </head>
      <body style="font-family: Calibri, Arial, sans-serif;">
        <table>
          <tr>
            <td colspan="4" style="background:#190C30; color:#ffffff; font-size:18px; font-weight:bold; padding:14px;">
              NATHALIE'S NAILS &amp; LASHES — REPORTE OFICIAL
            </td>
          </tr>
          <tr>
            <td colspan="4" style="background:#fdf2f8; color:#9d174d; font-size:13px; font-weight:bold; padding:8px; border-bottom:2px solid #c08497;">
              Módulo: ${activeTab.toUpperCase()} | Período: ${fechas.label} (${fechas.inicio} al ${fechas.fin}) | Emitido: ${fechaEmision}
            </td>
          </tr>
          <tr><td colspan="4"></td></tr>
        </table>
        ${tablaDetalleHTML}
      </body>
      </html>
    `;

    const blob = new Blob(["\uFEFF" + excelHTML], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Reporte_${activeTab.replace(/\s+/g, "_")}_${fechas.inicio}_${fechas.fin}.xls`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExport(false);
  };

  const fechasActivas = getFechasActivas();
  const totalValorInventario = inventarioLista.reduce(
    (acc, item) => acc + Number(item.valor_inventario || 0),
    0
  );
  const totalSaldoCuentas = cuentasLista.reduce(
    (acc, c) => acc + Number(c.saldo_pendiente || 0),
    0
  );

  return (
    <div>
      <SectionHeader
        title="Reportes Ejecutivos y Financieros"
        sub="Estado de resultados, auditoría de ventas, compras, valoración de inventario y cuentas por pagar"
        actions={
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              style={{
                padding: "9px 14px",
                borderRadius: "8px",
                border: "1px solid var(--border, #d1d5db)",
                background: "var(--card, white)",
                color: "var(--foreground, #111827)",
                fontSize: "13px",
                fontWeight: 600,
                outline: "none",
                cursor: "pointer",
              }}
            >
              {Object.entries(meses).map(([key, value]) => (
                <option key={key} value={key}>
                  📅 {value.label}
                </option>
              ))}
              <option value="personalizado">🗓️ Rango de fechas personalizado...</option>
            </select>

            {periodo === "personalizado" && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <input
                  type="date"
                  value={fechaInicioCustom}
                  onChange={(e) => setFechaInicioCustom(e.target.value)}
                  style={{ padding: "8px 10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px" }}
                />
                <span style={{ fontSize: "12px", color: "#6b7280" }}>a</span>
                <input
                  type="date"
                  value={fechaFinCustom}
                  onChange={(e) => setFechaFinCustom(e.target.value)}
                  style={{ padding: "8px 10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "13px" }}
                />
              </div>
            )}

            {/* Menú desplegable de Exportación */}
            <div style={{ position: "relative" }}>
              <Button onClick={() => setShowExport(!showExport)}>
                ⬇ Exportar Reporte
              </Button>

              {showExport && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "100%",
                    marginTop: "8px",
                    width: "260px",
                    background: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    boxShadow: "0 12px 28px rgba(0,0,0,0.15)",
                    zIndex: 50,
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={() => exportarPDF(activeTab)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "12px 16px",
                      background: "transparent",
                      border: "none",
                      color: "#111827",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span>📄</span>
                    <div>
                      <div>Exportar {activeTab} (PDF)</div>
                      <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: 400 }}>Diseño ejecutivo listo para imprimir</div>
                    </div>
                  </button>

                  <button
                    onClick={() => exportarPDF("Completo")}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "12px 16px",
                      background: "transparent",
                      border: "none",
                      borderTop: "1px solid #f3f4f6",
                      color: "#111827",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span>📑</span>
                    <div>
                      <div>Reporte General Completo (PDF)</div>
                      <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: 400 }}>Incluye todas las secciones y tablas</div>
                    </div>
                  </button>

                  <button
                    onClick={exportarExcelProfesional}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "12px 16px",
                      background: "transparent",
                      border: "none",
                      borderTop: "1px solid #f3f4f6",
                      color: "#065f46",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#ecfdf5")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span>📊</span>
                    <div>
                      <div>Descargar en Excel (.xls)</div>
                      <div style={{ fontSize: "11px", color: "#047857", fontWeight: 400 }}>Tabla con formato corporativo y totales</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        }
      />

      {/* Indicadores Superiores (KPIs) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "white", padding: "18px 20px", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>Ingresos del Período</div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#10b981", marginTop: "6px" }}>{formatMoney(datos.total_ingresos)}</div>
          <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>{datos.cantidad_ventas} ventas completadas</div>
        </div>
        <div style={{ background: "white", padding: "18px 20px", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>Costo de Ventas</div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#f59e0b", marginTop: "6px" }}>{formatMoney(datos.costo_ventas)}</div>
          <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>Costo de productos vendidos</div>
        </div>
        <div style={{ background: "white", padding: "18px 20px", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>Gastos Operativos</div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#ef4444", marginTop: "6px" }}>{formatMoney(datos.total_gastos)}</div>
          <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>Alquiler y servicios activos</div>
        </div>
        <div style={{ background: datos.utilidad_neta >= 0 ? "#ecfdf5" : "#fef2f2", padding: "18px 20px", borderRadius: "12px", border: `1px solid ${datos.utilidad_neta >= 0 ? "#6ee7b7" : "#fca5a5"}` }}>
          <div style={{ fontSize: "12px", color: datos.utilidad_neta >= 0 ? "#065f46" : "#991b1b", fontWeight: 700, textTransform: "uppercase" }}>Utilidad Neta</div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: datos.utilidad_neta >= 0 ? "#047857" : "#dc2626", marginTop: "6px" }}>{formatMoney(datos.utilidad_neta)}</div>
          <div style={{ fontSize: "12px", color: datos.utilidad_neta >= 0 ? "#047857" : "#b91c1c", marginTop: "4px" }}>{fechasActivas.label}</div>
        </div>
      </div>

      {/* Pestañas de navegación */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border)", marginBottom: "24px", overflowX: "auto" }}>
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              padding: "10px 18px",
              fontSize: "14px",
              fontWeight: activeTab === t ? 700 : 500,
              border: "none",
              background: "transparent",
              color: activeTab === t ? "#c08497" : "#6b7280",
              borderBottom: activeTab === t ? "3px solid #c08497" : "3px solid transparent",
              cursor: "pointer",
              marginBottom: "-1px",
              whiteSpace: "nowrap",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <Card style={{ padding: "48px", textAlign: "center", color: "#6b7280" }}>
          Cargando información financiera del período...
        </Card>
      ) : (
        <>
          {/* ════════════════════════════════════════════════════════
              1. ESTADO DE RESULTADOS
          ════════════════════════════════════════════════════════ */}
          {activeTab === "Estado de resultados" && (
            <div style={{ maxWidth: "860px" }}>
              <Card>
                <div style={{ padding: "24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#190C30", color: "white", borderRadius: "12px 12px 0 0" }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>
                      Estado de Resultados — {fechasActivas.label}
                    </h2>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#d8b4e2" }}>
                      Nathalie's Nails & Lashes | Período: {fechasActivas.inicio} al {fechasActivas.fin}
                    </p>
                  </div>
                  <button
                    onClick={() => exportarPDF("Estado de resultados")}
                    style={{ background: "#c08497", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                  >
                    🖨️ Imprimir / PDF
                  </button>
                </div>

                <div style={{ padding: "28px" }}>
                  {/* Ingresos */}
                  <div style={{ marginBottom: "24px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "bold", color: "#059669", letterSpacing: "1px", marginBottom: "10px" }}>
                      1. INGRESOS OPERATIVOS
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 8px 16px", fontSize: "14px", borderBottom: "1px dashed #e5e7eb" }}>
                      <span>Venta de productos ({datos.cantidad_ventas} transacciones en el período)</span>
                      <span style={{ fontWeight: 600 }}>{formatMoney(datos.venta_productos)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 8px 16px", fontSize: "14px" }}>
                      <span>Ingresos por servicios de salón (Uñas, Pestañas, Cejas, Cabello)</span>
                      <span style={{ fontWeight: 600 }}>{formatMoney(datos.ingreso_servicios)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", marginTop: "8px", background: "#ecfdf5", borderRadius: "8px", fontWeight: 700, color: "#065f46" }}>
                      <span>Total Ingresos Brutos</span>
                      <span>{formatMoney(datos.total_ingresos)}</span>
                    </div>
                  </div>

                  {/* Costos */}
                  <div style={{ marginBottom: "24px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "bold", color: "#d97706", letterSpacing: "1px", marginBottom: "10px" }}>
                      2. COSTO DE VENTAS
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 8px 16px", fontSize: "14px" }}>
                      <span>Costo de productos vendidos</span>
                      <span style={{ fontWeight: 600 }}>{formatMoney(datos.costo_ventas)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", marginTop: "8px", background: "#f3f4f6", borderRadius: "8px", fontWeight: 700 }}>
                      <span>Utilidad Bruta Operativa</span>
                      <span>{formatMoney(datos.utilidad_bruta)}</span>
                    </div>
                  </div>

                  {/* Gastos */}
                  <div style={{ marginBottom: "24px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "bold", color: "#dc2626", letterSpacing: "1px", marginBottom: "10px" }}>
                      3. GASTOS OPERATIVOS
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 8px 16px", fontSize: "14px", borderBottom: "1px dashed #e5e7eb" }}>
                      <span>Alquiler / Arrendamiento de local</span>
                      <span style={{ fontWeight: 600 }}>{formatMoney(datos.alquiler)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 8px 16px", fontSize: "14px" }}>
                      <span>Servicios básicos (Agua, Luz, Internet)</span>
                      <span style={{ fontWeight: 600 }}>{formatMoney(datos.servicios_basicos)}</span>
                    </div>
                    {datos.otros_gastos > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 8px 16px", fontSize: "14px", borderTop: "1px dashed #e5e7eb" }}>
                        <span>Otros gastos operativos</span>
                        <span style={{ fontWeight: 600 }}>{formatMoney(datos.otros_gastos)}</span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", marginTop: "8px", background: "#fef2f2", borderRadius: "8px", fontWeight: 700, color: "#991b1b" }}>
                      <span>Total Gastos Operativos</span>
                      <span>{formatMoney(datos.total_gastos)}</span>
                    </div>
                  </div>

                  {/* Resultado Final */}
                  <div
                    style={{
                      background: datos.utilidad_neta >= 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.08)",
                      border: `2px solid ${datos.utilidad_neta >= 0 ? "#10b981" : "#ef4444"}`,
                      borderRadius: "10px",
                      padding: "20px 24px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "17px", color: "#111827" }}>
                        UTILIDAD NETA DEL PERÍODO
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                        Resultado final después de costo de ventas y gastos ({fechasActivas.label})
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "26px",
                        fontWeight: 800,
                        color: datos.utilidad_neta >= 0 ? "#047857" : "#dc2626",
                      }}
                    >
                      {formatMoney(datos.utilidad_neta)}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              2. REPORTE DE VENTAS
          ════════════════════════════════════════════════════════ */}
          {activeTab === "Ventas" && (
            <Card>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px" }}>Historial Detallado de Ventas ({ventasLista.length})</h3>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#6b7280" }}>Período: {fechasActivas.label}</p>
                </div>
                <Button variant="secondary" onClick={() => exportarPDF("Ventas")}>🖨️ Imprimir / PDF de Ventas</Button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                      <th style={{ padding: "12px 16px", textAlign: "left", color: "#6b7280" }}>CÓDIGO</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", color: "#6b7280" }}>FECHA Y HORA</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", color: "#6b7280" }}>ARTÍCULOS / SERVICIOS</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", color: "#6b7280" }}>VENDEDOR</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", color: "#6b7280" }}>MÉTODO</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", color: "#6b7280" }}>ESTADO</th>
                      <th style={{ padding: "12px 16px", textAlign: "right", color: "#6b7280" }}>TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventasLista.map((v) => (
                      <tr key={v.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 700 }}>{v.codigo}</td>
                        <td style={{ padding: "12px 16px", color: "#4b5563" }}>{v.fecha}</td>
                        <td style={{ padding: "12px 16px" }}>{v.resumen_items || "Venta general"}</td>
                        <td style={{ padding: "12px 16px" }}>{v.vendedor}</td>
                        <td style={{ padding: "12px 16px" }}>{v.metodo_pago}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <Badge variant={v.estado === "Completada" ? "success" : "danger"}>{v.estado}</Badge>
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700 }}>{formatMoney(v.total)}</td>
                      </tr>
                    ))}
                    {ventasLista.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
                          No se encontraron ventas registradas en este período.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* ════════════════════════════════════════════════════════
              3. REPORTE DE COMPRAS
          ════════════════════════════════════════════════════════ */}
          {activeTab === "Compras" && (
            <Card>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px" }}>Reporte de Compras a Proveedores ({comprasLista.length})</h3>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#6b7280" }}>Período: {fechasActivas.label}</p>
                </div>
                <Button variant="secondary" onClick={() => exportarPDF("Compras")}>🖨️ Imprimir / PDF de Compras</Button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                      <th style={{ padding: "12px 16px", textAlign: "left", color: "#6b7280" }}>CÓDIGO</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", color: "#6b7280" }}>FECHA</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", color: "#6b7280" }}>PROVEEDOR</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", color: "#6b7280" }}>MÉTODO DE PAGO</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", color: "#6b7280" }}>ESTADO</th>
                      <th style={{ padding: "12px 16px", textAlign: "right", color: "#6b7280" }}>MONTO TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comprasLista.map((c) => (
                      <tr key={c.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 700 }}>{c.codigo}</td>
                        <td style={{ padding: "12px 16px" }}>{c.fecha}</td>
                        <td style={{ padding: "12px 16px", fontWeight: 600 }}>{c.proveedor}</td>
                        <td style={{ padding: "12px 16px" }}>{c.metodo_pago}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <Badge variant={c.estado_pago === "Pagada" ? "success" : "warning"}>{c.estado_pago}</Badge>
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700 }}>{formatMoney(c.total)}</td>
                      </tr>
                    ))}
                    {comprasLista.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
                          No se encontraron compras en este período.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* ════════════════════════════════════════════════════════
              4. REPORTE DE INVENTARIO
          ════════════════════════════════════════════════════════ */}
          {activeTab === "Inventario" && (
            <Card>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px" }}>Valoración de Inventario Actual ({inventarioLista.length} ítems)</h3>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#6b7280" }}>
                    Valor total en existencias: <strong style={{ color: "#111827" }}>{formatMoney(totalValorInventario)}</strong>
                  </p>
                </div>
                <Button variant="secondary" onClick={() => exportarPDF("Inventario")}>🖨️ Imprimir / PDF de Inventario</Button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                      <th style={{ padding: "12px 16px", textAlign: "left", color: "#6b7280" }}>CÓDIGO</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", color: "#6b7280" }}>ARTÍCULO</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", color: "#6b7280" }}>TIPO / CATEGORÍA</th>
                      <th style={{ padding: "12px 16px", textAlign: "right", color: "#6b7280" }}>STOCK ACTUAL</th>
                      <th style={{ padding: "12px 16px", textAlign: "center", color: "#6b7280" }}>NIVEL</th>
                      <th style={{ padding: "12px 16px", textAlign: "right", color: "#6b7280" }}>COSTO UNIT.</th>
                      <th style={{ padding: "12px 16px", textAlign: "right", color: "#6b7280" }}>VALOR TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventarioLista.map((item, idx) => {
                      const bajo = Number(item.stock) <= Number(item.stock_minimo);
                      return (
                        <tr key={`${item.codigo}-${idx}`} style={{ borderBottom: "1px solid #e5e7eb" }}>
                          <td style={{ padding: "12px 16px", fontWeight: 700 }}>{item.codigo}</td>
                          <td style={{ padding: "12px 16px", fontWeight: 600 }}>{item.nombre}</td>
                          <td style={{ padding: "12px 16px", color: "#4b5563" }}>{item.tipo} • {item.categoria}</td>
                          <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700 }}>
                            {item.stock} <span style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 400 }}>(Mín: {item.stock_minimo})</span>
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "center" }}>
                            <Badge variant={bajo ? "danger" : "success"}>{bajo ? "Stock Bajo" : "Óptimo"}</Badge>
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "right" }}>{formatMoney(item.costo_unitario)}</td>
                          <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700 }}>{formatMoney(item.valor_inventario)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* ════════════════════════════════════════════════════════
              5. REPORTE DE CUENTAS POR PAGAR
          ════════════════════════════════════════════════════════ */}
          {activeTab === "Cuentas por pagar" && (
            <Card>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px" }}>Estado de Cuentas por Pagar a Proveedores ({cuentasLista.length})</h3>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#6b7280" }}>
                    Saldo total pendiente: <strong style={{ color: "#dc2626" }}>{formatMoney(totalSaldoCuentas)}</strong>
                  </p>
                </div>
                <Button variant="secondary" onClick={() => exportarPDF("Cuentas por pagar")}>🖨️ Imprimir / PDF de Cuentas</Button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                      <th style={{ padding: "12px 16px", textAlign: "left", color: "#6b7280" }}>COMPRA REF.</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", color: "#6b7280" }}>PROVEEDOR</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", color: "#6b7280" }}>VENCIMIENTO</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", color: "#6b7280" }}>ESTADO</th>
                      <th style={{ padding: "12px 16px", textAlign: "right", color: "#6b7280" }}>MONTO ORIGINAL</th>
                      <th style={{ padding: "12px 16px", textAlign: "right", color: "#6b7280" }}>PAGADO</th>
                      <th style={{ padding: "12px 16px", textAlign: "right", color: "#6b7280" }}>SALDO PENDIENTE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cuentasLista.map((c) => (
                      <tr key={c.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 700 }}>{c.compra_codigo}</td>
                        <td style={{ padding: "12px 16px", fontWeight: 600 }}>{c.proveedor}</td>
                        <td style={{ padding: "12px 16px" }}>{c.fecha_vencimiento}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <Badge variant={c.estado === "Pagada" ? "success" : c.estado === "Vencida" ? "danger" : "warning"}>
                            {c.estado}
                          </Badge>
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right" }}>{formatMoney(c.monto_original)}</td>
                        <td style={{ padding: "12px 16px", textAlign: "right", color: "#059669" }}>{formatMoney(c.monto_pagado)}</td>
                        <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: Number(c.saldo_pendiente) > 0 ? "#dc2626" : "#111827" }}>
                          {formatMoney(c.saldo_pendiente)}
                        </td>
                      </tr>
                    ))}
                    {cuentasLista.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
                          No hay cuentas por pagar registradas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
