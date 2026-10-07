import { useState, useEffect } from "react";
import { Card } from "../components/ui";

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/dashboard/resumen.php")
      .then(res => res.json())
      .then(json => { 
        if (json.success) setData(json.data); 
        setLoading(false); 
      })
      .catch(err => { 
        console.error(err); 
        setLoading(false); 
      });
  }, []);

  const handleNavigate = (page: string) => {
    if (onNavigate) onNavigate(page);
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center", fontSize: "16px", color: "#6b7280" }}>Cargando dashboard...</div>;
  if (!data) return <div style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}>Error al cargar los datos</div>;

  const totalCaja = data.ventas_dia_efectivo + data.ventas_dia_trans;
  const pctEfectivo = totalCaja > 0 ? (data.ventas_dia_efectivo / totalCaja) * 100 : 0;
  const pctTrans = totalCaja > 0 ? (data.ventas_dia_trans / totalCaja) * 100 : 0;

  return (
    <div>
      {/* ══════════════════════════════════════════
          FILA 1: 4 TARJETAS DE RESUMEN SUPERIOR
      ══════════════════════════════════════════ */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(4, 1fr)", 
        gap: "20px", 
        marginBottom: "24px" 
      }}>
        {/* Ventas del día */}
        <div style={{ 
          background: "white", 
          borderRadius: "12px", 
          padding: "24px", 
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          border: "1px solid #f3f4f6"
        }}>
          <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>Ventas del día</div>
          <div style={{ fontSize: "36px", fontWeight: 700, color: "#c08497", lineHeight: 1 }}>${data.ventas_dia.toFixed(2)}</div>
          <div style={{ fontSize: "12px", color: "#10b981", marginTop: "12px", fontWeight: 600 }}>↑ 18% vs ayer</div>
        </div>

        {/* Ventas del mes */}
        <div style={{ 
          background: "white", 
          borderRadius: "12px", 
          padding: "24px", 
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          border: "1px solid #f3f4f6"
        }}>
          <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>Ventas del mes</div>
          <div style={{ fontSize: "36px", fontWeight: 700, color: "#1f2937", lineHeight: 1 }}>${data.ventas_mes.toFixed(2)}</div>
          <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "12px" }}>Octubre 2026</div>
        </div>

        {/* Gastos del mes */}
        <div style={{ 
          background: "white", 
          borderRadius: "12px", 
          padding: "24px", 
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          border: "1px solid #f3f4f6"
        }}>
          <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>Gastos del mes</div>
          <div style={{ fontSize: "36px", fontWeight: 700, color: "#f59e0b", lineHeight: 1 }}>${data.gastos_mes.toFixed(2)}</div>
          <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "12px" }}>{data.gastos_categorias} categorías</div>
        </div>

        {/* Utilidad del mes */}
        <div style={{ 
          background: "white", 
          borderRadius: "12px", 
          padding: "24px", 
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          border: "1px solid #f3f4f6"
        }}>
          <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>Utilidad del mes</div>
          <div style={{ fontSize: "36px", fontWeight: 700, color: "#10b981", lineHeight: 1 }}>${data.utilidad_mes.toFixed(2)}</div>
          <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "12px" }}>Margen: {data.margen_mes}%</div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          FILA 2: CAJA DEL DÍA + CUENTAS/STOCK
      ═══════════════════════════════════════════ */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1.8fr 1fr", 
        gap: "20px", 
        marginBottom: "24px" 
      }}>
        
        {/* CAJA DEL DÍA */}
        <div style={{ 
          background: "white", 
          borderRadius: "12px", 
          padding: "28px", 
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          border: "1px solid #f3f4f6"
        }}>
          <h3 style={{ margin: "0 0 24px 0", fontSize: "18px", fontWeight: 700, color: "#1f2937" }}>Caja del día</h3>
          
          {/* Tres columnas: Total | Efectivo | Transferencia */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 1fr 1fr", 
            gap: "20px", 
            marginBottom: "24px" 
          }}>
            <div>
              <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>Total del día</div>
              <div style={{ fontSize: "28px", fontWeight: 700, color: "#1f2937" }}>${totalCaja.toFixed(2)}</div>
            </div>
            <div>
              <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#c08497" }}></span>
                Efectivo
              </div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#c08497" }}>${data.ventas_dia_efectivo.toFixed(2)}</div>
            </div>
            <div>
              <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3b82f6" }}></span>
                Transferencia
              </div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#3b82f6" }}>${data.ventas_dia_trans.toFixed(2)}</div>
            </div>
          </div>

          {/* Barra de progreso */}
          <div style={{ 
            height: "8px", 
            background: "#e5e7eb", 
            borderRadius: "4px", 
            overflow: "hidden", 
            display: "flex",
            marginBottom: "10px"
          }}>
            <div style={{ width: `${pctEfectivo}%`, background: "#c08497" }}></div>
            <div style={{ width: `${pctTrans}%`, background: "#3b82f6" }}></div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#6b7280" }}>
            <span>{pctEfectivo.toFixed(0)}% Efectivo</span>
            <span>{pctTrans.toFixed(0)}% Transferencia</span>
          </div>
        </div>

        {/* COLUMNA DERECHA: Cuentas + Stock */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Cuentas por pagar */}
          <div style={{ 
            background: "white", 
            borderRadius: "12px", 
            padding: "24px", 
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            border: "1px solid #f3f4f6",
            flex: 1
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1f2937" }}>Cuentas por pagar</h3>
              {data.ctas_pendientes > 0 && (
                <span style={{ 
                  background: "#fef3c7", 
                  color: "#d97706", 
                  padding: "3px 10px", 
                  borderRadius: "12px", 
                  fontSize: "12px", 
                  fontWeight: 600 
                }}>
                  {data.ctas_pendientes} pendientes
                </span>
              )}
            </div>
            <div style={{ fontSize: "32px", fontWeight: 700, color: "#d97706", marginBottom: "16px", lineHeight: 1 }}>
              ${data.ctas_total.toFixed(2)}
            </div>
            <button 
              onClick={() => handleNavigate('cuentas-pagar')} 
              style={{ 
                background: "none", 
                border: "none", 
                color: "#c08497", 
                cursor: "pointer", 
                fontSize: "13px", 
                fontWeight: 600, 
                padding: 0 
              }}
            >
              Ver cuentas →
            </button>
          </div>

          {/* Stock bajo */}
          <div style={{ 
            background: "white", 
            borderRadius: "12px", 
            padding: "24px", 
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            border: "1px solid #f3f4f6",
            flex: 1
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1f2937" }}>Stock bajo</h3>
              {data.stock_bajo_count > 0 && (
                <span style={{ 
                  background: "#fee2e2", 
                  color: "#dc2626", 
                  padding: "3px 10px", 
                  borderRadius: "12px", 
                  fontSize: "12px", 
                  fontWeight: 600 
                }}>
                  {data.stock_bajo_count}
                </span>
              )}
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
              {data.stock_bajo_list.map((item: any, idx: number) => (
                <div key={idx} style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  fontSize: "13px",
                  paddingBottom: "8px",
                  borderBottom: idx < data.stock_bajo_list.length - 1 ? "1px solid #f3f4f6" : "none"
                }}>
                  <span style={{ color: "#374151" }}>{item.nombre}</span>
                  <span style={{ color: "#dc2626", fontWeight: 700 }}>{item.stock}/{item.stock_minimo}</span>
                </div>
              ))}
              {data.stock_bajo_count === 0 && (
                <div style={{ fontSize: "13px", color: "#10b981" }}>✅ Inventario saludable</div>
              )}
            </div>
            
            <button 
              onClick={() => handleNavigate('insumos')} 
              style={{ 
                background: "none", 
                border: "none", 
                color: "#c08497", 
                cursor: "pointer", 
                fontSize: "13px", 
                fontWeight: 600, 
                padding: 0 
              }}
            >
              Ver insumos →
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          FILA 3: ÚLTIMAS VENTAS
      ═══════════════════════════════════════════ */}
      <div style={{ 
        background: "white", 
        borderRadius: "12px", 
        padding: "28px", 
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        border: "1px solid #f3f4f6"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#1f2937" }}>Últimas ventas</h3>
          <button 
            onClick={() => handleNavigate('historial-ventas')} 
            style={{ 
              background: "none", 
              border: "none", 
              color: "#c08497", 
              cursor: "pointer", 
              fontSize: "13px", 
              fontWeight: 600 
            }}
          >
            Ver todas →
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {data.ultimas_ventas.map((v: any, idx: number) => (
            <div key={idx} style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              padding: "14px 0", 
              borderBottom: idx < data.ultimas_ventas.length - 1 ? "1px solid #f3f4f6" : "none" 
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <span style={{ 
                  fontFamily: "monospace", 
                  fontWeight: 700, 
                  color: "#c08497", 
                  fontSize: "14px",
                  minWidth: "70px"
                }}>
                  {v.codigo}
                </span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "14px", color: "#1f2937", marginBottom: "3px" }}>
                    {v.descripcion}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    {new Date(v.fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} · {v.metodo_pago}
                  </div>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: "16px", color: "#1f2937" }}>
                ${Number(v.total).toFixed(2)}
              </div>
            </div>
          ))}
          {data.ultimas_ventas.length === 0 && (
            <div style={{ textAlign: "center", padding: "24px", color: "#6b7280", fontSize: "14px" }}>
              No hay ventas registradas hoy
            </div>
          )}
        </div>
      </div>
    </div>
  );
}