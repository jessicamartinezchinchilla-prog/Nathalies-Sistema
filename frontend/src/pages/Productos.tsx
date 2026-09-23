import { useState, useEffect } from "react";
import { Card, Badge, Table, TR, TD, SearchBar, SectionHeader, Button } from "../components/ui";

type Producto = {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  precio_venta: number;
  costo: number;
  stock: number;
  stock_minimo: number;
  estado: "Activo" | "Inactivo";
};

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cargar productos desde el backend
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch("http://localhost:8000/api/productos/listar.php");
      const data = await response.json();
      
      if (data.success) {
        setProductos(data.productos);
      } else {
        setError(data.error || "Error al cargar productos");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar productos según la búsqueda
  const filtered = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.codigo.toLowerCase().includes(search.toLowerCase()) ||
      p.categoria.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <SectionHeader
        title="Productos"
        sub={`${filtered.length} productos registrados`}
        actions={<Button>+ Nuevo producto</Button>}
      />

      {error && (
        <div style={{
          background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: "8px",
          padding: "12px",
          marginBottom: "20px",
          fontSize: "13px",
          color: "#EF4444"
        }}>
          ⚠️ {error}
          <button 
            onClick={cargarProductos}
            style={{
              marginLeft: "10px",
              background: "none",
              border: "none",
              color: "#EF4444",
              textDecoration: "underline",
              cursor: "pointer"
            }}
          >
            Reintentar
          </button>
        </div>
      )}

      <Card>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar producto o código..." />
          <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
            {loading ? "Cargando..." : `${filtered.length} resultados`}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--muted-foreground)" }}>
            Cargando productos...
          </div>
        ) : (
          <Table headers={["CÓDIGO", "NOMBRE", "CATEGORÍA", "PRECIO", "COSTO", "STOCK", "ESTADO", ""]}>
            {filtered.map((p) => (
              <TR key={p.id}>
                <TD mono>{p.codigo}</TD>
                <TD><span style={{ fontWeight: 600 }}>{p.nombre}</span></TD>
                <TD>{p.categoria}</TD>
                <TD mono style={{ color: "var(--success)", fontWeight: 600 }}>${Number(p.precio_venta).toFixed(2)}</TD>
                <TD mono>${Number(p.costo).toFixed(2)}</TD>
                <TD>
                  <span style={{ 
                    color: p.stock <= p.stock_minimo ? "var(--danger)" : "var(--foreground)",
                    fontWeight: p.stock <= p.stock_minimo ? 600 : 400
                  }}>
                    {p.stock} / {p.stock_minimo}
                  </span>
                </TD>
                <TD>
                  <Badge variant={p.estado === "Activo" ? "success" : "muted"}>{p.estado}</Badge>
                </TD>
                <TD>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "12px", cursor: "pointer" }}>Editar</button>
                    <button style={{ background: "none", border: "none", color: "var(--muted-foreground)", fontSize: "12px", cursor: "pointer" }}>
                      {p.estado === "Activo" ? "Desactivar" : "Activar"}
                    </button>
                  </div>
                </TD>
              </TR>
            ))}
            {filtered.length === 0 && (
              <TR>
                <TD mono colSpan={8} style={{ textAlign: "center", color: "var(--muted-foreground)", padding: "40px" }}>
                  No se encontraron productos
                </TD>
              </TR>
            )}
          </Table>
        )}
      </Card>
    </div>
  );
}