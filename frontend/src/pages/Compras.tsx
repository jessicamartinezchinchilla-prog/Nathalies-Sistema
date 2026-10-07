import { useState, useEffect } from "react";
import { Card, Button } from "../components/ui";

type Producto = {
  id: number;
  codigo: string;
  nombre: string;
  stock: number;
  stock_minimo?: number;
  costo_unitario?: number;
};

type Insumo = {
  id: number;
  codigo: string;
  nombre: string;
  stock: number;
  stock_minimo?: number;
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
      const res = await fetch("http://localhost:8000/api/proveedores/listar_activos.php");
      const data = await res.json();
      if (data.success) setProveedores(data.proveedores || []);
    } catch (err) {
      setModalError("Error al cargar proveedores");
    }
  };

  const agregarAlCarrito = (tipo: 'producto' | 'insumo', item: any) => {
    const id = `${tipo}-${item.id}`;
    const existe = carrito.find(i => i.id === id);
    const costoUnitario = Number(item.costo_unitario || 0);

    if (existe) {
      setCarrito(carrito.map(i => 
        i.id === id 
          ? { ...i, cantidad: i.cantidad + 1, subtotal: (i.cantidad + 1) * costoUnitario }
          : i
      ));
    } else {
      setCarrito([...carrito, {
        id,
        tipo,
        item_id: item.id,
        codigo: item.codigo,
        nombre: item.nombre,
        cantidad: 1,
        costo_unitario: costoUnitario,
        subtotal: costoUnitario
      }]);
    }
    setBusqueda("");
  };

  const actualizarCantidad = (id: string, cantidad: number) => {
    if (cantidad <= 0) {
      setCarrito(carrito.filter(i => i.id !== id));
    } else {
      setCarrito(carrito.map(i => 
        i.id === id 
          ? { ...i, cantidad, subtotal: cantidad * i.costo_unitario }
          : i
      ));
    }
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
  ).slice(0, 5);

  const insumosFiltrados = insumos.filter(i => 
    i.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    i.codigo.toLowerCase().includes(busqueda.toLowerCase())
  ).slice(0, 5);

  // Lógica para sugerencias de reabastecimiento
  const sugerencias = [
    ...productos.filter(p => p.stock <= (p.stock_minimo || 5)),
    ...insumos.filter(i => i.stock <= (i.stock_minimo || 5))
  ];

  return (
    <div>
      {/* MODAL ÉXITO */}
      {modalExito && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", textAlign: "center", maxWidth: "400px" }}>
            <div style={{ fontSize: "50px", marginBottom: "10px" }}>✅</div>
            <h3 style={{ margin: "0 0 10px 0" }}>{modalExito}</h3>
            <Button onClick={() => setModalExito(null)}>Aceptar</Button>
          </div>
        </div>
      )}

      {/* MODAL ERROR */}
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

      {/* ═══════════════════════════════════════════
          SECCIÓN DE SUGERENCIAS DE REABASTECIMIENTO
      ═══════════════════════════════════════════ */}
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
        {/* Panel Izquierdo: Buscador */}
        <Card>
          <div style={{ padding: "20px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>Agregar Productos o Insumos</h2>
            
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", marginBottom: "16px" }}
            />

            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {productosFiltrados.map(p => (
                <div key={p.id} onClick={() => agregarAlCarrito('producto', p)} style={{ display: "flex", justifyContent: "space-between", padding: "10px", border: "1px solid #e5e7eb", borderRadius: "6px", marginBottom: "8px", cursor: "pointer" }}>
                  <div>
                    <strong>{p.nombre}</strong>
                    <br/>
                    <small style={{ color: "#6b7280" }}>{p.codigo} | Stock: {p.stock}</small>
                  </div>
                </div>
              ))}
              {insumosFiltrados.map(i => (
                <div key={i.id} onClick={() => agregarAlCarrito('insumo', i)} style={{ display: "flex", justifyContent: "space-between", padding: "10px", border: "1px solid #e5e7eb", borderRadius: "6px", marginBottom: "8px", cursor: "pointer" }}>
                  <div>
                    <strong>{i.nombre}</strong>
                    <br/>
                    <small style={{ color: "#6b7280" }}>{i.codigo} | Stock: {i.stock}</small>
                  </div>
                </div>
              ))}
              {productosFiltrados.length === 0 && insumosFiltrados.length === 0 && busqueda !== "" && (
                <div style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>No se encontraron resultados</div>
              )}
            </div>
          </div>
        </Card>

        {/* Panel Derecho: Carrito y Pago */}
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
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", borderBottom: "1px solid #eee" }}>
                    <div style={{ flex: 1 }}>
                      <strong>{item.nombre}</strong>
                      <br/>
                      <small style={{ color: "#6b7280" }}>{item.tipo === 'producto' ? 'Producto' : 'Insumo'} | {item.codigo}</small>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button onClick={() => actualizarCantidad(item.id, item.cantidad - 1)} style={{ width: "28px", height: "28px", border: "1px solid #d1d5db", borderRadius: "4px", background: "white", cursor: "pointer" }}>-</button>
                      <span style={{ fontWeight: 600, minWidth: "30px", textAlign: "center" }}>{item.cantidad}</span>
                      <button onClick={() => actualizarCantidad(item.id, item.cantidad + 1)} style={{ width: "28px", height: "28px", border: "1px solid #d1d5db", borderRadius: "4px", background: "white", cursor: "pointer" }}>+</button>
                      <button onClick={() => setCarrito(carrito.filter(i => i.id !== item.id))} style={{ marginLeft: "8px", background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>🗑️</button>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>${item.costo_unitario.toFixed(2)} c/u</div>
                      <strong>${item.subtotal.toFixed(2)}</strong>
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