import { useState } from "react";

type Props = {
  onLogin: () => void;
};

export default function Login({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Enviar datos al backend PHP
      const response = await fetch("http://localhost:8000/api/auth/login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // 2. Leer la respuesta del servidor
      const data = await response.json();

      // 3. Verificar si fue exitoso
      if (response.ok && data.success) {
        // ¡Login exitoso! Guardamos el usuario en localStorage (opcional pero recomendado)
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        onLogin(); // Cambia la pantalla al Dashboard
      } else {
        // Si el servidor devolvió un error (contraseña incorrecta, usuario no existe, etc.)
        setError(data.error || "Error al iniciar sesión");
      }
    } catch (err) {
      // Si el servidor PHP no está corriendo o hay error de red
      console.error("Error de conexión:", err);
      setError("No se pudo conectar con el servidor. Verifica que el backend esté activo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #1E1E2D 0%, #2D2D44 100%)",
      padding: "20px"
    }}>
      <div style={{
        background: "#FFFFFF",
        borderRadius: "16px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        padding: "48px",
        width: "100%",
        maxWidth: "420px"
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "56px",
            height: "56px",
            background: "#B5738A",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: "24px",
            fontWeight: "bold",
            color: "#fff",
            fontFamily: "'DM Serif Display', serif"
          }}>
            N
          </div>
          <h1 style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#111827",
            margin: "0 0 8px",
            fontFamily: "'DM Serif Display', serif"
          }}>
            Iniciar sesión
          </h1>
          <p style={{ fontSize: "14px", color: "#6B7280", margin: 0 }}>
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "20px",
              fontSize: "13px",
              color: "#EF4444",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#111827", marginBottom: "6px" }}>
              Correo electrónico <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nathalies.com"
              required
              style={{
                width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E5E7EB",
                background: "#F9FAFB", color: "#111827", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "all 0.2s"
              }}
              onFocus={(e) => { e.target.style.borderColor = "#B5738A"; e.target.style.background = "#FFFFFF"; }}
              onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; e.target.style.background = "#F9FAFB"; }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#111827", marginBottom: "6px" }}>
              Contraseña <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #E5E7EB",
                background: "#F9FAFB", color: "#111827", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "all 0.2s"
              }}
              onFocus={(e) => { e.target.style.borderColor = "#B5738A"; e.target.style.background = "#FFFFFF"; }}
              onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; e.target.style.background = "#F9FAFB"; }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "14px", background: loading ? "#9CA3AF" : "#B5738A",
              color: "#FFFFFF", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s", marginBottom: "16px"
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#9d5f73"; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#B5738A"; }}
          >
            {loading ? "Verificando..." : "Ingresar al sistema"}
          </button>

          <p style={{ textAlign: "center", fontSize: "12px", color: "#6B7280", margin: 0 }}>
            ¿Problemas para ingresar? <span style={{ color: "#B5738A", cursor: "pointer" }}>Contacta al administrador.</span>
          </p>
        </form>
      </div>
    </div>
  );
}