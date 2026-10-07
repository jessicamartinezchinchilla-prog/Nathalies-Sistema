import { useState, useEffect } from "react";
import { Card, Badge, Table, TR, TD, Button } from "../components/ui";

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

type FormProducto = {
  id?: number;
  codigo: string;
  nombre: string;
  categoria: string;
  precio_venta: string;
  costo: string;
  stock: string;
  stock_minimo: string;
  estado: "Activo" | "Inactivo";
};

type Filtros = {
  search: string;
  categoria: string;
  estado: string;
  precio: string;
  stock_bajo: boolean;
};

type Estadisticas = {
  total: number;
  activos: number;
  inactivos: number;
  stock_bajo: number;
};

const CATEGORIAS = [
  { value: "", label: "Todas las categorías" },
  { value: "Carteras", label: "Carteras" },
  { value: "Ropa", label: "Ropa" },
  { value: "Productos para el cabello", label: "Productos para el cabello" },
  { value: "Joyería", label: "Joyería" },
  { value: "Productos para el cuidado de la piel", label: "Productos para el cuidado de la piel" },
  { value: "Otro", label: "Otro" }
];

// Iconos SVG
const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const IconToggle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="5" width="22" height="14" rx="7" ry="7"/>
    <circle cx="16" cy="12" r="3"/>
  </svg>
);

const IconDelete = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

const IconBox = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const IconCheck = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const IconInactive = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
  </svg>
);

const IconAlert = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormProducto>({
    codigo: "", nombre: "", categoria: "", precio_venta: "", costo: "",
    stock: "0", stock_minimo: "0", estado: "Activo"
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [generandoCodigo, setGenerandoCodigo] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState<Estadisticas>({ total: 0, activos: 0, inactivos: 0, stock_bajo: 0 });

  const [filtros, setFiltros] = useState<Filtros>({
    search: "", categoria: "", estado: "", precio: "", stock_bajo: false
  });

  useEffect(() => { cargarProductos(); }, [filtros]);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (filtros.search) params.append('search', filtros.search);
      if (filtros.categoria) params.append('categoria', filtros.categoria);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.precio) params.append('precio', filtros.precio);
      if (filtros.stock_bajo) params.append('stock_bajo', 'true');

      const response = await fetch(`http://localhost:8000/api/productos/listar.php?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setProductos(data.productos);
        setStats(data.estadisticas);
      } else {
        setError(data.error || "Error al cargar productos");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoriaChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevaCategoria = e.target.value;
    setFormData({ ...formData, categoria: nuevaCategoria, codigo: "" });
    
    if (nuevaCategoria) {
      setGenerandoCodigo(true);
      try {
        const response = await fetch(`http://localhost:8000/api/productos/siguiente_codigo.php?categoria=${encodeURIComponent(nuevaCategoria)}`);
        const data = await response.json();
        if (data.success) setFormData(prev => ({ ...prev, codigo: data.codigo }));
      } catch (err) {
        console.error("Error al generar código:", err);
      } finally {
        setGenerandoCodigo(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number' && parseFloat(value) < 0) return;
    setFormData({ ...formData, [name]: value });
  };

  const handleFiltroChange = (name: keyof Filtros, value: any) => {
    setFiltros({ ...filtros, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    if (!formData.nombre || !formData.categoria || !formData.precio_venta || !formData.costo) {
      setFormError("Todos los campos marcados con * son obligatorios");
      setFormLoading(false);
      return;
    }

    try {
      const url = isEditing 
        ? "http://localhost:8000/api/productos/actualizar.php"
        : "http://localhost:8000/api/productos/crear.php";

      const body: any = {
        nombre: formData.nombre,
        categoria: formData.categoria,
        precio_venta: parseFloat(formData.precio_venta),
        costo: parseFloat(formData.costo),
        stock: parseInt(formData.stock) || 0,
        stock_minimo: parseInt(formData.stock_minimo) || 0,
        estado: formData.estado
      };

      if (isEditing) body.id = formData.id;
      else body.codigo = formData.codigo;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        setShowModal(false);
        resetForm();
        await cargarProductos();
      } else {
        setFormError(data.error || "Error al guardar producto");
      }
    } catch (err) {
      setFormError("No se pudo conectar con el servidor");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditar = (producto: Producto) => {
    setFormData({
      id: producto.id,
      codigo: producto.codigo,
      nombre: producto.nombre,
      categoria: producto.categoria,
      precio_venta: producto.precio_venta.toString(),
      costo: producto.costo.toString(),
      stock: producto.stock.toString(),
      stock_minimo: producto.stock_minimo.toString(),
      estado: producto.estado
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleToggleEstado = async (id: number) => {
    try {
      const response = await fetch("http://localhost:8000/api/productos/toggle_estado.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await response.json();
      if (data.success) await cargarProductos();
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleEliminar = async (id: number) => {
    try {
      const response = await fetch("http://localhost:8000/api/productos/eliminar.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await response.json();
      if (data.success) {
        setShowConfirmDelete(null);
        await cargarProductos();
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const resetForm = () => {
    setFormData({ codigo: "", nombre: "", categoria: "", precio_venta: "", costo: "", stock: "0", stock_minimo: "0", estado: "Activo" });
    setIsEditing(false);
    setFormError("");
  };

  const openNuevo = () => {
    resetForm();
    setShowModal(true);
  };

  // Estilo compartido para inputs de filtro
  const filterInputStyle: React.CSSProperties = {
    height: "40px",
    padding: "0 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "13px",
    background: "white",
    outline: "none",
    boxSizing: "border-box"
  };

  return (
    <div>
      {/* Botón Nuevo Producto arriba */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <Button onClick={openNuevo}>+ Nuevo producto</Button>
      </div>

      {/* Tarjetas de estadísticas (estáticas) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "white", borderRadius: "12px", padding: "20px", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0 }}>
            <IconBox />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Total de productos</div>
            <div style={{ fontSize: "24px", fontWeight: 700 }}>{stats.total}</div>
          </div>
        </div>

        <div style={{ background: "white", borderRadius: "12px", padding: "20px", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0 }}>
            <IconCheck />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Productos activos</div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "#10b981" }}>{stats.activos}</div>
          </div>
        </div>

        <div style={{ background: "white", borderRadius: "12px", padding: "20px", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0 }}>
            <IconInactive />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Productos inactivos</div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "#6b7280" }}>{stats.inactivos}</div>
          </div>
        </div>

        <div style={{ background: "white", borderRadius: "12px", padding: "20px", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0 }}>
            <IconAlert />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Alerta stock bajo</div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "#ef4444" }}>{stats.stock_bajo}</div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", padding: "12px", marginBottom: "20px", fontSize: "13px", color: "#EF4444" }}>
          ⚠️ {error}
          <button onClick={cargarProductos} style={{ marginLeft: "10px", background: "none", border: "none", color: "#EF4444", textDecoration: "underline", cursor: "pointer" }}>
            Reintentar
          </button>
        </div>
      )}

      <Card>
        {/* Filtros alineados en una sola fila */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1.5fr 1fr auto", gap: "12px", alignItems: "center" }}>
            
            {/* Búsqueda */}
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", display: "flex" }}>
                <IconSearch />
              </span>
              <input
                type="text"
                placeholder="Buscar por nombre o código..."
                value={filtros.search}
                onChange={(e) => handleFiltroChange('search', e.target.value)}
                style={{ ...filterInputStyle, width: "100%", paddingLeft: "36px" }}
              />
            </div>

            {/* Categoría */}
            <select
              value={filtros.categoria}
              onChange={(e) => handleFiltroChange('categoria', e.target.value)}
              style={{ ...filterInputStyle, width: "100%", cursor: "pointer" }}
            >
              {CATEGORIAS.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
            </select>

            {/* Estado */}
            <select
              value={filtros.estado}
              onChange={(e) => handleFiltroChange('estado', e.target.value)}
              style={{ ...filterInputStyle, width: "100%", cursor: "pointer" }}
            >
              <option value="">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>

            {/* Precio */}
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Precio"
              value={filtros.precio}
              onChange={(e) => handleFiltroChange('precio', e.target.value)}
              style={{ ...filterInputStyle, width: "100%" }}
            />

            {/* Stock bajo */}
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap", height: "40px" }}>
              <input
                type="checkbox"
                checked={filtros.stock_bajo}
                onChange={(e) => handleFiltroChange('stock_bajo', e.target.checked)}
                style={{ width: "16px", height: "16px", cursor: "pointer" }}
              />
              Stock bajo
            </label>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--muted-foreground)" }}>Cargando...</div>
        ) : (
          <Table headers={["CÓDIGO", "NOMBRE", "CATEGORÍA", "PRECIO", "COSTO", "STOCK", "ESTADO", "ACCIONES"]}>
            {productos.map((p) => (
              <TR key={p.id}>
                <TD mono>{p.codigo}</TD>
                <TD><span style={{ fontWeight: 600 }}>{p.nombre}</span></TD>
                <TD>{p.categoria}</TD>
                <TD mono style={{ color: "var(--success)", fontWeight: 600 }}>${Number(p.precio_venta).toFixed(2)}</TD>
                <TD mono>${Number(p.costo).toFixed(2)}</TD>
                <TD>
                  <span style={{ color: p.stock <= p.stock_minimo ? "var(--danger)" : "var(--foreground)", fontWeight: p.stock <= p.stock_minimo ? 600 : 400 }}>
                    {p.stock} / {p.stock_minimo}
                  </span>
                </TD>
                <TD><Badge variant={p.estado === "Activo" ? "success" : "muted"}>{p.estado}</Badge></TD>
                <TD>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={() => handleEditar(p)} title="Editar" style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}>
                      <IconEdit />
                    </button>
                    <button onClick={() => handleToggleEstado(p.id)} title={p.estado === "Activo" ? "Desactivar" : "Activar"} style={{ background: "none", border: "none", color: p.estado === "Activo" ? "#f59e0b" : "var(--success)", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}>
                      <IconToggle />
                    </button>
                    <button onClick={() => setShowConfirmDelete(p.id)} title="Eliminar" style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}>
                      <IconDelete />
                    </button>
                  </div>
                </TD>
              </TR>
            ))}
            {productos.length === 0 && (
              <TR>
                <TD mono colSpan={8} style={{ textAlign: "center", color: "var(--muted-foreground)", padding: "40px" }}>
                  No se encontraron productos
                </TD>
              </TR>
            )}
          </Table>
        )}
      </Card>

      {/* MODAL CREAR/EDITAR */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: "white", borderRadius: "12px", padding: "32px", width: "100%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: "24px", fontSize: "20px" }}>
              {isEditing ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            
            {formError && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", padding: "12px", marginBottom: "16px", fontSize: "13px", color: "#EF4444" }}>
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>Código (automático)</label>
                  <input type="text" name="codigo" value={formData.codigo} readOnly style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", background: "#f3f4f6", color: "#6b7280" }} placeholder="Se genera al seleccionar categoría" />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>Nombre *</label>
                  <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }} placeholder="Ej: Cartera rosa con pedrería" />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>Categoría *</label>
                  <select name="categoria" value={formData.categoria} onChange={handleCategoriaChange} required disabled={isEditing} style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", background: "white" }}>
                    {CATEGORIAS.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>Precio Venta *</label>
                    <input type="number" step="0.01" min="0" name="precio_venta" value={formData.precio_venta} onChange={handleInputChange} onFocus={(e) => e.target.select()} required style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }} placeholder="0.00" />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>Costo *</label>
                    <input type="number" step="0.01" min="0" name="costo" value={formData.costo} onChange={handleInputChange} onFocus={(e) => e.target.select()} required style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }} placeholder="0.00" />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>Stock *</label>
                    <input type="number" min="0" name="stock" value={formData.stock} onChange={handleInputChange} onFocus={(e) => e.target.select()} required style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>Stock Mínimo *</label>
                    <input type="number" min="0" name="stock_minimo" value={formData.stock_minimo} onChange={handleInputChange} onFocus={(e) => e.target.select()} required style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>Estado *</label>
                  <select name="estado" value={formData.estado} onChange={handleInputChange} required style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", background: "white" }}>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "12px", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                  Cancelar
                </button>
                <button type="submit" disabled={formLoading || generandoCodigo} style={{ flex: 1, padding: "12px", border: "none", borderRadius: "6px", background: (formLoading || generandoCodigo) ? "#9ca3af" : "var(--primary)", color: "white", fontSize: "14px", fontWeight: 600, cursor: (formLoading || generandoCodigo) ? "not-allowed" : "pointer" }}>
                  {formLoading ? "Guardando..." : (isEditing ? "Actualizar" : "Guardar Producto")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR ELIMINACIÓN */}
      {showConfirmDelete !== null && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1001 }} onClick={() => setShowConfirmDelete(null)}>
          <div style={{ background: "white", borderRadius: "12px", padding: "32px", width: "100%", maxWidth: "400px" }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, marginBottom: "16px", fontSize: "20px" }}>¿Eliminar producto?</h2>
            <p style={{ color: "var(--muted-foreground)", marginBottom: "24px" }}>
              Esta acción no se puede deshacer. El producto será eliminado permanentemente.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setShowConfirmDelete(null)} style={{ flex: 1, padding: "12px", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={() => handleEliminar(showConfirmDelete)} style={{ flex: 1, padding: "12px", border: "none", borderRadius: "6px", background: "var(--danger)", color: "white", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}