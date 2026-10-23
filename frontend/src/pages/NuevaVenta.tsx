import { useState, useEffect } from "react";
import { Card, Button } from "../components/ui";

type Producto = { id: number; codigo: string; nombre: string; precio_venta: string | number; stock: number; };
type Servicio = { id: number; codigo: string; nombre: string; precio: string | number; };
type ItemCarrito = { id: string; tipo: 'producto' | 'servicio'; item_id: number; codigo: string; nombre: string; cantidad: number; precio: number; subtotal: number; };

export default function NuevaVenta() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [metodoPago, setMetodoPago] = useState<"Efectivo" | "Transferencia">("Efectivo");
  const [montoRecibido, setMontoRecibido] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [modalExito, setModalExito] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => { cargarProductos(); cargarServicios(); }, []);

  const cargarProductos = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/productos/listar_activos.php");
      const data = await res.json();
      if (data.success) setProductos(data.productos || []);
    } catch (err) { setModalError("Error al cargar productos"); }
  };

  const cargarServicios = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/servicios/listar_activos.php");
      const data = await res.json();
      if (data.success) setServicios(data.servicios || []);
    } catch (err) { setModalError("Error al cargar servicios"); }
  };

  // Agrega 1 unidad al hacer clic en el producto de la lista
  const agregarAlCarrito = (tipo: 'producto' | 'servicio', item: any) => {
    const id = `${tipo}-${item.id}`;
    const existe = carrito.find(i => i.id === id);
    const precioReal = Number(tipo === 'producto' ? item.precio_venta : item.precio);

    if (existe) {
      if (tipo === 'producto' && (existe.cantidad + 1) > item.stock) {
        setModalError(`Stock insuficiente para ${item.nombre}`);
        return;
      }
      setCarrito(carrito.map(i => i.id === id ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * precioReal } : i));
    } else {
      if (tipo === 'producto' && 1 > item.stock) {
        setModalError(`Sin stock disponible para ${item.nombre}`);
        return;
      }
      setCarrito([...carrito, { id, tipo, item_id: item.id, codigo: item.codigo, nombre: item.nombre, cantidad: 1, precio: precioReal, subtotal: precioReal }]);
    }
    setBusqueda("");
  };

  // ACTUALIZA LA CANTIDAD AUTOMÁTICAMENTE DESDE EL SPINNER DEL CARRITO
  const actualizarCantidad = (id: string, cantidad: number) => {
    if (cantidad <= 0) {
      setCarrito(carrito.filter(i => i.id !== id));
      return;
    }
    
    const item = carrito.find(i => i.id === id);
    if (!item) return;

    // Validar que no supere el stock si es un producto
    if (item.tipo === 'producto') {
      const prod = productos.find(p => p.id === item.item_id);
      if (prod && cantidad > prod.stock) {
        setModalError(`No hay suficiente stock. Máximo disponible: ${prod.stock}`);
        return; // No actualiza si se pasa del stock
      }
    }

    // Actualiza cantidad y subtotal automáticamente
    setCarrito(carrito.map(i => i.id === id ? { ...i, cantidad, subtotal: cantidad * i.precio } : i));
  };

  const total = carrito.reduce((sum, item) => sum + item.subtotal, 0);
  const montoRecibidoNum = parseFloat(montoRecibido) || 0;
  const cambio = metodoPago === "Efectivo" && montoRecibidoNum >= total ? montoRecibidoNum - total : 0;

  const handleRegistrar = async () => {
    if (carrito.length === 0) { setModalError("El carrito está vacío"); return; }
    if (metodoPago === "Efectivo" && montoRecibidoNum < total) { setModalError("El monto recibido es menor al total"); return; }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/ventas/crear.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          detalles: carrito, total, metodo_pago: metodoPago,
          monto_efectivo: metodoPago === "Efectivo" ? total : 0,
          monto_transferencia: metodoPago === "Transferencia" ? total : 0,
          usuario_id: 1
        })
      });
      const data = await res.json();
      if (data.success) {
        setModalExito(`Venta registrada: ${data.codigo}`);
        setCarrito([]); setMontoRecibido(""); cargarProductos();
      } else {
        setModalError(data.error || "Error al registrar");
      }
    } catch (err) { setModalError("Error de conexión"); }
    finally { setLoading(false); }
  };

  const productosFiltrados = productos.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase())).slice(0, 8);
  const serviciosFiltrados = servicios.filter(s => s.nombre.toLowerCase().includes(busqueda.toLowerCase())).slice(0, 8);

  return (
    <div>
      {/* MODAL ÉXITO */}
      {modalExito && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", textAlign: "center", maxWidth: "400px" }}>
            <div style={{ fontSize: "50px", marginBottom: "10px" }}>✅</div>
            <h3 style={{ margin: "0 0 10px 0" }}>{modalExito}</h3>
            <Button onClick={() => setModalExito(null)}>Aceptar</Button>
          </div>
        </div>
      )}

      {/* MODAL ERROR */}
      {modalError && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", textAlign: "center", maxWidth: "400px" }}>
            <div style={{ fontSize: "50px", marginBottom: "10px" }}>⚠️</div>
            <h3 style={{ margin: "0 0 10px 0", color: "#ef4444" }}>Error</h3>
            <p>{modalError}</p>
            <Button onClick={() => setModalError(null)} style={{ background: "#ef4444" }}>Cerrar</Button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        
        {/* ══════════════════════════════════════════
            PANEL IZQUIERDO: LISTA DE PRODUCTOS/SERVICIOS
        ══════════════════════════════════════════ */}
        <Card>
          <div style={{ padding: "20px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>Buscar y Agregar</h2>
            <input 
              type="text" 
              placeholder="Escribe para buscar..." 
              value={busqueda} 
              onChange={(e) => setBusqueda(e.target.value)} 
              style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", marginBottom: "16px", fontSize: "15px" }} 
            />
            
            <div style={{ maxHeight: "450px", overflowY: "auto" }}>
              {productosFiltrados.map(p => (
                <div key={p.id} onClick={() => agregarAlCarrito('producto', p)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", border: "1px solid #e5e7eb", borderRadius: "8px", marginBottom: "8px", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#f0fdf4"} onMouseLeave={(e) => e.currentTarget.style.background = "white"}>
                  <div>
                    <strong style={{ fontSize: "14px" }}>{p.nombre}</strong><br/>
                    <small style={{ color: p.stock <= 5 ? "#ef4444" : "#6b7280" }}>Stock: {p.stock}</small>
                  </div>
                  <strong style={{ color: "#10b981", fontSize: "15px" }}>${Number(p.precio_venta).toFixed(2)}</strong>
                </div>
              ))}
              {serviciosFiltrados.map(s => (
                <div key={s.id} onClick={() => agregarAlCarrito('servicio', s)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", border: "1px solid #e5e7eb", borderRadius: "8px", marginBottom: "8px", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#eff6ff"} onMouseLeave={(e) => e.currentTarget.style.background = "white"}>
                  <strong style={{ fontSize: "14px" }}>{s.nombre}</strong>
                  <strong style={{ color: "#10b981", fontSize: "15px" }}>${Number(s.precio).toFixed(2)}</strong>
                </div>
              ))}
              {busqueda && productosFiltrados.length === 0 && serviciosFiltrados.length === 0 && (
                <p style={{ textAlign: "center", color: "#6b7280", padding: "20px" }}>No se encontraron resultados</p>
              )}
            </div>
          </div>
        </Card>

        {/* ══════════════════════════════════════════
            PANEL DERECHO: CARRITO CON SPINNER POR PRODUCTO
        ══════════════════════════════════════════ */}
        <Card>
          <div style={{ padding: "20px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>Carrito de Venta</h2>
            
            {carrito.length === 0 ? (
              <p style={{ textAlign: "center", color: "#6b7280", padding: "40px" }}>El carrito está vacío</p>
            ) : (
              <div style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "16px" }}>
                {carrito.map(item => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", borderBottom: "1px solid #f3f4f6" }}>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: "14px" }}>{item.nombre}</strong><br/>
                      <small style={{ color: "#6b7280" }}>${item.precio.toFixed(2)} c/u</small>
                    </div>
                    
                    {/* 🎯 AQUÍ ESTÁ EL SPINNER DE CANTIDAD QUE SE ACTUALIZA AUTOMÁTICAMENTE */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input 
                        type="number" 
                        min="1" 
                        value={item.cantidad} 
                        onChange={(e) => actualizarCantidad(item.id, parseInt(e.target.value) || 1)}
                        style={{ 
                          width: "65px", 
                          padding: "6px", 
                          textAlign: "center", 
                          border: "1px solid #d1d5db", 
                          borderRadius: "6px",
                          fontSize: "15px",
                          fontWeight: "600",
                          outline: "none"
                        }} 
                      />
                      <button 
                        onClick={() => setCarrito(carrito.filter(i => i.id !== item.id))} 
                        style={{ color: "#ef4444", border: "none", background: "#fee2e2", width: "32px", height: "32px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }} 
                        title="Eliminar del carrito"
                      >
                        🗑️
                      </button>
                    </div>
                    
                    <strong style={{ minWidth: "90px", textAlign: "right", fontSize: "15px", color: "#1f2937" }}>
                      ${item.subtotal.toFixed(2)}
                    </strong>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "22px", fontWeight: 700, marginBottom: "16px", paddingTop: "12px", borderTop: "2px solid #e5e7eb" }}>
              <span>Total:</span>
              <span style={{ color: "#10b981" }}>${total.toFixed(2)}</span>
            </div>

            <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value as any)} style={{ width: "100%", padding: "12px", marginBottom: "12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "15px" }}>
              <option value="Efectivo">💵 Efectivo</option>
              <option value="Transferencia">🏦 Transferencia</option>
            </select>

            {metodoPago === "Efectivo" && (
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: 600 }}>Monto Recibido:</label>
                <input type="number" value={montoRecibido} onChange={(e) => setMontoRecibido(e.target.value)} style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "16px" }} />
                {montoRecibidoNum >= total && total > 0 && (
                  <div style={{ marginTop: "10px", padding: "12px", background: "#ecfdf5", borderRadius: "6px", color: "#059669", fontWeight: "bold", textAlign: "center", fontSize: "16px" }}>
                    Cambio a entregar: ${cambio.toFixed(2)}
                  </div>
                )}
              </div>
            )}

            <Button onClick={handleRegistrar} disabled={loading} style={{ width: "100%", padding: "14px", fontSize: "16px", fontWeight: "bold" }}>
              {loading ? "Procesando..." : "✅ Registrar Venta"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}