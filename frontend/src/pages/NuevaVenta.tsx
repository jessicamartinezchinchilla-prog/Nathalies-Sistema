import { useState } from "react";
import { Card, SectionHeader, Button, Input, Badge } from "../components/ui";

// Tipos
type ItemDisponible = {
  id: string;
  nombre: string;
  precio: number;
  tipo: "Servicio" | "Producto";
  stock?: number; // Solo para productos
};

type ItemCarrito = ItemDisponible & {
  cantidad: number;
};

// Datos de prueba (Catálogo)
const catalogo: ItemDisponible[] = [
  { id: "S1", nombre: "Uñas acrílicas completas", precio: 25.00, tipo: "Servicio" },
  { id: "S2", nombre: "Manicure clásico", precio: 15.00, tipo: "Servicio" },
  { id: "S3", nombre: "Lifting de pestañas", precio: 35.00, tipo: "Servicio" },
  { id: "P1", nombre: "Shampoo reparador", precio: 12.00, tipo: "Producto", stock: 8 },
  { id: "P2", nombre: "Pulsera acrílica", precio: 5.00, tipo: "Producto", stock: 20 },
  { id: "P3", nombre: "Esmalte semipermanente", precio: 18.00, tipo: "Producto", stock: 5 },
];

export default function NuevaVenta() {
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [mostrarExito, setMostrarExito] = useState(false);

  // Filtrar catálogo
  const resultados = catalogo.filter((item) =>
    item.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Agregar al carrito
  const agregarAlCarrito = (item: ItemDisponible) => {
    setCarrito((prev) => {
      const existe = prev.find((p) => p.id === item.id);
      if (existe) {
        return prev.map((p) => (p.id === item.id ? { ...p, cantidad: p.cantidad + 1 } : p));
      }
      return [...prev, { ...item, cantidad: 1 }];
    });
    setBusqueda(""); // Limpiar búsqueda
  };

  // Cambiar cantidad
  const cambiarCantidad = (id: string, delta: number) => {
    setCarrito((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, cantidad: p.cantidad + delta } : p))
        .filter((p) => p.cantidad > 0)
    );
  };

  // Calcular total
  const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  // Finalizar venta
  const cobrar = () => {
    if (carrito.length === 0) return;
    setMostrarExito(true);
    setTimeout(() => {
      setCarrito([]);
      setMetodoPago("Efectivo");
      setMostrarExito(false);
    }, 2000);
  };

  if (mostrarExito) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <Card style={{ padding: "40px", textAlign: "center", maxWidth: "400px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", marginBottom: "8px" }}>¡Venta Registrada!</h2>
          <p style={{ color: "var(--muted-foreground)" }}>Total cobrado: <strong>${total.toFixed(2)}</strong></p>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: "24px", height: "calc(100vh - 120px)" }}>
      
      {/* COLUMNA IZQUIERDA: Catálogo y Búsqueda */}
      <div style={{ flex: 1.5, display: "flex", flexDirection: "column", gap: "16px" }}>
        <SectionHeader title="Nueva Venta" sub="Busca y agrega servicios o productos" />
        
        <Card style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
          <Input 
            label="Buscar producto o servicio..." 
            value={busqueda} 
            onChange={(v: string) => setBusqueda(v)} 
            placeholder="Ej. Uñas, Shampoo..." 
          />
          
          <div style={{ marginTop: "16px", overflowY: "auto", flex: 1 }}>
            {busqueda === "" ? (
              <p style={{ textAlign: "center", color: "var(--muted-foreground)", marginTop: "40px" }}>
                Escribe para buscar en el catálogo
              </p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
                {resultados.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => agregarAlCarrito(item)}
                    style={{
                      background: "var(--background)", border: "1px solid var(--border)", borderRadius: "8px",
                      padding: "12px", textAlign: "left", cursor: "pointer", transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                  >
                    <div style={{ fontSize: "10px", color: "var(--muted-foreground)", marginBottom: "4px", textTransform: "uppercase" }}>
                      {item.tipo} {item.stock !== undefined && `· Stock: ${item.stock}`}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>{item.nombre}</div>
                    <div style={{ color: "var(--primary)", fontWeight: "bold" }}>${item.precio.toFixed(2)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* COLUMNA DERECHA: Ticket / Carrito */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Card style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ padding: "20px", borderBottom: "1px solid var(--border)" }}>
            <h3 style={{ margin: 0, fontFamily: "'DM Serif Display', serif" }}>Ticket de Venta</h3>
          </div>

          {/* Lista de items */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
            {carrito.length === 0 ? (
              <p style={{ textAlign: "center", color: "var(--muted-foreground)", marginTop: "40px" }}>
                El carrito está vacío
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {carrito.map((item) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: "14px" }}>{item.nombre}</div>
                      <div style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>${item.precio.toFixed(2)} c/u</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button onClick={() => cambiarCantidad(item.id, -1)} style={{ width: "24px", height: "24px", borderRadius: "4px", border: "1px solid var(--border)", background: "var(--card)", cursor: "pointer" }}>-</button>
                      <span style={{ fontWeight: 600, minWidth: "20px", textAlign: "center" }}>{item.cantidad}</span>
                      <button onClick={() => cambiarCantidad(item.id, 1)} style={{ width: "24px", height: "24px", borderRadius: "4px", border: "1px solid var(--border)", background: "var(--card)", cursor: "pointer" }}>+</button>
                    </div>
                    <div style={{ fontWeight: "bold", minWidth: "60px", textAlign: "right" }}>
                      ${(item.precio * item.cantidad).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totales y Pago */}
          <div style={{ padding: "20px", borderTop: "1px solid var(--border)", background: "var(--background)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", fontSize: "18px", fontWeight: "bold" }}>
              <span>Total a pagar:</span>
              <span style={{ color: "var(--primary)", fontFamily: "'DM Serif Display', serif" }}>${total.toFixed(2)}</span>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "8px" }}>Método de Pago</label>
              <select 
                value={metodoPago} 
                onChange={(e) => setMetodoPago(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--card)", fontSize: "14px" }}
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Tarjeta">Tarjeta</option>
              </select>
            </div>

            <Button 
              onClick={cobrar} 
              disabled={carrito.length === 0}
              style={{ width: "100%", padding: "14px", fontSize: "16px" }}
            >
              Cobrar Venta
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}