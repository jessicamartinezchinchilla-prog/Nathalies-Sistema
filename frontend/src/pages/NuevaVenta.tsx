import { useState, useEffect } from "react";
import { Card, Button } from "../components/ui";

// ... (Mantén los tipos Producto, Servicio, ItemCarrito igual que antes) ...
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
  
  // Modales
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

  const agregarAlCarrito = (tipo: 'producto' | 'servicio', item: any) => {
    const id = `${tipo}-${item.id}`;
    const existe = carrito.find(i => i.id === id);
    const precioReal = Number(tipo === 'producto' ? item.precio_venta : item.precio);

    if (existe) {
      if (tipo === 'producto' && existe.cantidad >= item.stock) {
        setModalError(`Stock insuficiente para ${item.nombre}`);
        return;
      }
      setCarrito(carrito.map(i => i.id === id ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * precioReal } : i));
    } else {
      setCarrito([...carrito, { id, tipo, item_id: item.id, codigo: item.codigo, nombre: item.nombre, cantidad: 1, precio: precioReal, subtotal: precioReal }]);
    }
    setBusqueda("");
  };

  const actualizarCantidad = (id: string, cantidad: number) => {
    if (cantidad <= 0) setCarrito(carrito.filter(i => i.id !== id));
    else setCarrito(carrito.map(i => i.id === id ? { ...i, cantidad, subtotal: cantidad * i.precio } : i));
  };

  const total = carrito.reduce((sum, item) => sum + item.subtotal, 0);
  const montoRecibidoNum = parseFloat(montoRecibido) || 0;
  // CORRECCIÓN: El cambio es lo que me dieron menos el total
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
          monto_efectivo: metodoPago === "Efectivo" ? total : 0, // Guardamos el valor real de la venta
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

  const productosFiltrados = productos.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase())).slice(0, 5);
  const serviciosFiltrados = servicios.filter(s => s.nombre.toLowerCase().includes(busqueda.toLowerCase())).slice(0, 5);

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
        <Card>
          <div style={{ padding: "20px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>Agregar Productos o Servicios</h2>
            <input type="text" placeholder="Buscar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", marginBottom: "16px" }} />
            
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {productosFiltrados.map(p => (
                <div key={p.id} onClick={() => agregarAlCarrito('producto', p)} style={{ display: "flex", justifyContent: "space-between", padding: "10px", border: "1px solid #e5e7eb", borderRadius: "6px", marginBottom: "8px", cursor: "pointer" }}>
                  <div><strong>{p.nombre}</strong><br/><small style={{color:"#6b7280"}}>Stock: {p.stock}</small></div>
                  <strong style={{color:"#10b981"}}>${Number(p.precio_venta).toFixed(2)}</strong>
                </div>
              ))}
              {serviciosFiltrados.map(s => (
                <div key={s.id} onClick={() => agregarAlCarrito('servicio', s)} style={{ display: "flex", justifyContent: "space-between", padding: "10px", border: "1px solid #e5e7eb", borderRadius: "6px", marginBottom: "8px", cursor: "pointer" }}>
                  <strong>{s.nombre}</strong>
                  <strong style={{color:"#10b981"}}>${Number(s.precio).toFixed(2)}</strong>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ padding: "20px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>Carrito</h2>
            {carrito.length === 0 ? <p style={{textAlign:"center", color:"#6b7280"}}>Carrito vacío</p> : (
              <div style={{ maxHeight: "250px", overflowY: "auto", marginBottom: "16px" }}>
                {carrito.map(item => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", borderBottom: "1px solid #eee" }}>
                    <div style={{flex:1}}><strong>{item.nombre}</strong><br/><small>{item.cantidad} x ${item.precio.toFixed(2)}</small></div>
                    <div style={{display:"flex", gap:"5px", alignItems:"center"}}>
                      <button onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}>-</button>
                      <span>{item.cantidad}</span>
                      <button onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}>+</button>
                      <button onClick={() => setCarrito(carrito.filter(i => i.id !== item.id))} style={{color:"red", border:"none", background:"none", cursor:"pointer"}}>🗑️</button>
                    </div>
                    <strong>${item.subtotal.toFixed(2)}</strong>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>
              <span>Total:</span>
              <span style={{ color: "#10b981" }}>${total.toFixed(2)}</span>
            </div>

            <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value as any)} style={{ width: "100%", padding: "10px", marginBottom: "10px", border: "1px solid #d1d5db", borderRadius: "6px" }}>
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
            </select>

            {metodoPago === "Efectivo" && (
              <div style={{ marginBottom: "16px" }}>
                <label style={{display:"block", marginBottom:"5px", fontSize:"13px"}}>Monto Recibido:</label>
                <input type="number" value={montoRecibido} onChange={(e) => setMontoRecibido(e.target.value)} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
                {montoRecibidoNum >= total && total > 0 && (
                  <div style={{ marginTop: "10px", padding: "10px", background: "#ecfdf5", borderRadius: "6px", color: "#059669", fontWeight: "bold", textAlign: "center" }}>
                    Cambio a entregar: ${cambio.toFixed(2)}
                  </div>
                )}
              </div>
            )}

            <Button onClick={handleRegistrar} disabled={loading} style={{ width: "100%" }}>{loading ? "Procesando..." : "Registrar Venta"}</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}