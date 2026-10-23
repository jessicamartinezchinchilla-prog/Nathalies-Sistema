import { useState, useEffect } from "react";
import { Card, Button } from "../components/ui";

type Producto = {
  id: number;
  codigo: string;
  nombre: string;
  stock: number;
  stock_minimo?: number;
  precio_venta?: number; // ✅ Campo correcto según tu base de datos
  costo_unitario?: number;
};

type Insumo = {
  id: number;
  codigo: string;
  nombre: string;
  stock: number;
  stock_minimo?: number;
  precio_venta?: number; // ✅ Campo correcto según tu base de datos
  costo_unitario?: number;
};

type Proveedor = {
  id: number;
  nombre: string;
};

type ItemCarrito = {
  id: string;
  tipo: 'producto' | 'insumo';
  item_id: number;
  codigo: string;
  nombre: string;
  cantidad: number;
  costo_unitario: number;
  subtotal: number;
};

export default function Compras() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [proveedorId, setProveedorId] = useState("");
  const [estadoPago, setEstadoPago] = useState<"Pagada" | "Pendiente">("Pagada");
  const [metodoPago, setMetodoPago] = useState<string>("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalExito, setModalExito] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  
  // 🎯 Estado para la cantidad a agregar desde el panel izquierdo
  const [cantidadAgregar, setCantidadAgregar] = useState(1);

  useEffect(() => {
    cargarProductos();
    cargarInsumos();
    cargarProveedores();
  }, []);

  const cargarProductos = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/productos/listar_activos.php");
      const data = await res.json();
      if (data.success) setProductos(data.productos || []);
    } catch (err) {
      setModalError("Error al cargar productos");
    }
  };

  const cargarInsumos = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/insumos/listar_activos.php");
      const data = await res.json();
      if (data.success) setInsumos(data.insumos || []);
    } catch (err) {
      setModalError("Error al cargar insumos");
    }
  };

  const cargarProveedores = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/proveedores/listar.php");
      const data = await res.json();
      if (data.success) setProveedores(data.proveedores || []);
    } catch (err) {
      setModalError("Error al cargar proveedores");
    }
  };

  const agregarAlCarrito = (tipo: 'producto' | 'insumo', item: any) => {
    if (cantidadAgregar <= 0) return;

    const id = `${tipo}-${item.id}`;
    const existe = carrito.find(i => i.id === id);
    
    // ✅ AHORA SÍ: Busca primero 'precio_venta', y si no existe, usa fallbacks
    const costoUnitario = Number(item.precio_venta ?? item.costo_unitario ?? 0);

    if (existe) {
      setCarrito(carrito.map(i => 
        i.id === id 
          ? { ...i, cantidad: i.cantidad + cantidadAgregar, subtotal: (i.cantidad + cantidadAgregar) * costoUnitario }
          : i
      ));
    } else {
      setCarrito([...carrito, {
        id,
        tipo,
        item_id: item.id,
        codigo: item.codigo,
        nombre: item.nombre,
        cantidad: cantidadAgregar,
        costo_unitario: costoUnitario,
        subtotal: cantidadAgregar * costoUnitario
      }]);
    }
    setBusqueda("");
    setCantidadAgregar(1); // Resetear a 1 después de agregar exitosamente
  };

  const total = carrito.reduce((sum, item) => sum + item.subtotal, 0);

  const handleRegistrar = async () => {
    if (carrito.length === 0) {
      setModalError("Agrega al menos un producto o insumo");
      return;
    }
    if (!proveedorId) {
      setModalError("Selecciona un proveedor");
      return;
    }
    if (estadoPago === "Pagada" && !metodoPago) {
      setModalError("Selecciona un método de pago");
      return;
    }
    if (estadoPago === "Pendiente" && !fechaVencimiento) {
      setModalError("Ingresa la fecha de vencimiento");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/compras/crear.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          detalles: carrito,
          proveedor_id: parseInt(proveedorId),
          total,
          estado_pago: estadoPago,
          metodo_pago: estadoPago === "Pagada" ? metodoPago : null,
          fecha_vencimiento: estadoPago === "Pendiente" ? fechaVencimiento : null,
          fecha: new Date().toISOString().split('T')[0],
          usuario_id: 1
        })
      });
      const data = await res.json();
      if (data.success) {
        setModalExito(`Compra registrada: ${data.codigo}`);
        setCarrito([]);
        setProveedorId("");
        setMetodoPago("");
        setFechaVencimiento("");
        cargarProductos();
        cargarInsumos();
      } else {
        setModalError(data.error || "Error al registrar");
      }
    } catch (err) {
      setModalError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.codigo.toLowerCase().includes(busqueda.toLowerCase())
  ).slice(0, 8);

  const insumosFiltrados = insumos.filter(i => 
    i.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    i.codigo.toLowerCase().includes(busqueda.toLowerCase())
  ).slice(0, 8);

  const sugerencias = [
    ...productos.filter(p => p.stock <= (p.stock_minimo || 5)),
    ...insumos.filter(i => i.stock <= (i.stock_minimo || 5))
  ];

  return (
    <div>
      {/* MODALES */}
      {modalExito && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", textAlign: "center", maxWidth: "400px" }}>
            <div style={{ fontSize: "50px", marginBottom: "10px" }}>✅</div>
            <h3 style={{ margin: "0 0 10px 0" }}>{modalExito}</h3>
            <Button onClick={() => setModalExito(null)}>Aceptar</Button>
          </div>
        </div>
      )}
      {modalError && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", textAlign: "center", maxWidth: "400px" }}>
            <div style={{ fontSize: "50px", marginBottom: "10px" }}>⚠️</div>
            <h3 style={{ margin: "0 0 10px 0", color: "#ef4444" }}>Error</h3>
            <p>{modalError}</p>
            <Button onClick={() => setModalError(null)} style={{ background: "#ef4444" }}>Cerrar</Button>
          </div>
        </div>
      )}

      {/* SUGERENCIAS */}
      {sugerencias.length > 0 && (
        <Card style={{ marginBottom: "24px", border: "1px solid #f59e0b", background: "#fffbeb" }}>
          <div style={{ padding: "16px 20px" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", color: "#92400e", fontWeight: 700 }}>
              ⚠️ Sugerencias de Reabastecimiento
            </h3>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {sugerencias.map((item: any) => (
                <button 
                  key={item.id} 
                  onClick={() => agregarAlCarrito('stock' in item ? 'producto' : 'insumo', item)}
                  style={{ 
                    padding: "8px 12px", 
                    background: item.stock === 0 ? "#fee2e2" : "white",
                    border: item.stock === 0 ? "1px solid #ef4444" : "1px solid #f59e0b", 
                    borderRadius: "6px", 
                    cursor: "pointer", 
                    fontSize: "13px", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "8px",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <span style={{ fontWeight: 500 }}>{item.nombre}</span>
                  <span style={{ 
                    background: item.stock === 0 ? "#ef4444" : "#f59e0b", 
                    color: "white", 
                    padding: "2px 8px", 
                    borderRadius: "12px", 
                    fontSize: "11px", 
                    fontWeight: 700 
                  }}>
                    {item.stock === 0 ? 'AGOTADO' : `Stock: ${item.stock}`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        
        {/* ═══════════════════════════════════════════
            PANEL IZQUIERDO: BUSCADOR + SPINNER DE CANTIDAD
        ═══════════════════════════════════════════ */}
        <Card>
          <div style={{ padding: "20px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>Agregar Productos o Insumos</h2>
            
            {/* 🎯 Spinner de cantidad grande en el panel de agregar */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <label style={{ fontSize: "14px", fontWeight: 600, whiteSpace: "nowrap" }}>Cantidad a agregar:</label>
              <input 
                type="number" 
                min="1" 
                value={cantidadAgregar} 
                onChange={(e) => setCantidadAgregar(Math.max(1, parseInt(e.target.value) || 1))}
                style={{ 
                  width: "80px", 
                  height: "42px", 
                  fontSize: "18px", 
                  textAlign: "center", 
                  border: "1px solid #d1d5db", 
                  borderRadius: "8px",
                  fontWeight: "bold"
                }} 
              />
            </div>

            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", marginBottom: "16px", fontSize: "15px" }}
            />

            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {productosFiltrados.map(p => (
                <div key={p.id} onClick={() => agregarAlCarrito('producto', p)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", border: "1px solid #e5e7eb", borderRadius: "8px", marginBottom: "8px", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"} onMouseLeave={(e) => e.currentTarget.style.background = "white"}>
                  <div>
                    <strong style={{ fontSize: "14px" }}>{p.nombre}</strong>
                    <br/>
                    <small style={{ color: p.stock <= (p.stock_minimo || 5) ? "#ef4444" : "#6b7280" }}>{p.codigo} | Stock: {p.stock}</small>
                  </div>
                </div>
              ))}
              {insumosFiltrados.map(i => (
                <div key={i.id} onClick={() => agregarAlCarrito('insumo', i)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", border: "1px solid #e5e7eb", borderRadius: "8px", marginBottom: "8px", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"} onMouseLeave={(e) => e.currentTarget.style.background = "white"}>
                  <div>
                    <strong style={{ fontSize: "14px" }}>{i.nombre}</strong>
                    <br/>
                    <small style={{ color: i.stock <= (i.stock_minimo || 5) ? "#ef4444" : "#6b7280" }}>{i.codigo} | Stock: {i.stock}</small>
                  </div>
                </div>
              ))}
              {productosFiltrados.length === 0 && insumosFiltrados.length === 0 && busqueda !== "" && (
                <div style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>No se encontraron resultados</div>
              )}
            </div>
          </div>
        </Card>

        {/* ═══════════════════════════════════════════
            PANEL DERECHO: CARRITO (LIMPIO, SIN + y -)
        ═══════════════════════════════════════════ */}
        <Card>
          <div style={{ padding: "20px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>Carrito de Compra</h2>

            {carrito.length === 0 ? (
              <div style={{ textAlign: "center", color: "#6b7280", padding: "40px" }}>
                El carrito está vacío
              </div>
            ) : (
              <div style={{ maxHeight: "250px", overflowY: "auto", marginBottom: "16px" }}>
                {carrito.map(item => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", borderBottom: "1px solid #f3f4f6" }}>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: "14px" }}>{item.nombre}</strong>
                      <br/>
                      <small style={{ color: "#6b7280" }}>{item.tipo === 'producto' ? 'Producto' : 'Insumo'} | {item.codigo}</small>
                    </div>
                    
                    {/* 🎯 Solo muestra la cantidad y el botón de eliminar */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontWeight: "bold", fontSize: "15px", color: "#4b5563", background: "#f3f4f6", padding: "4px 10px", borderRadius: "6px" }}>
                        Cant: {item.cantidad}
                      </span>
                      <button onClick={() => setCarrito(carrito.filter(i => i.id !== item.id))} style={{ color: "#ef4444", border: "none", background: "#fee2e2", width: "32px", height: "32px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }} title="Eliminar">
                        🗑️
                      </button>
                    </div>
                    
                    <div style={{ textAlign: "right", minWidth: "90px" }}>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>${item.costo_unitario.toFixed(2)} c/u</div>
                      <strong style={{ fontSize: "15px", color: "#1f2937" }}>${item.subtotal.toFixed(2)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ borderTop: "2px solid #e5e7eb", paddingTop: "16px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "20px", fontWeight: 700 }}>
                <span>Total:</span>
                <span style={{ color: "#10b981" }}>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Proveedor */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>Proveedor *</label>
              <select value={proveedorId} onChange={(e) => setProveedorId(e.target.value)} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}>
                <option value="">Selecciona un proveedor</option>
                {proveedores.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>

            {/* Estado de Pago */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>Estado de Pago *</label>
              <select value={estadoPago} onChange={(e) => setEstadoPago(e.target.value as "Pagada" | "Pendiente")} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}>
                <option value="Pagada">Pagada</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            </div>

            {estadoPago === "Pagada" && (
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>Método de Pago *</label>
                <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}>
                  <option value="">Selecciona método</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Tarjeta">Tarjeta</option>
                </select>
              </div>
            )}

            {estadoPago === "Pendiente" && (
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>Fecha de Vencimiento *</label>
                <input type="date" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }} />
              </div>
            )}

            <Button onClick={handleRegistrar} disabled={loading || carrito.length === 0} style={{ width: "100%", padding: "14px", fontSize: "16px" }}>
              {loading ? "Registrando..." : "Registrar Compra"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}