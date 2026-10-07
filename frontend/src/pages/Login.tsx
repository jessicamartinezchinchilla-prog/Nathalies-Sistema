import { useState } from "react";

// Definimos que este componente recibe la función onLogin
interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8000/api/auth/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        // 1. Guardamos los datos del usuario en el navegador
        localStorage.setItem("user", JSON.stringify(data.usuario));
        
        // 2. Llamamos a la función que nos pasa App.tsx para mostrar el sistema
        onLogin(); 
      } else {
        setError(data.error || "Credenciales incorrectas");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor");
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
      background: "#190C30", // Tu color de fondo correcto
    }}>
      <div style={{ 
        background: "white", 
        padding: "40px", 
        borderRadius: "12px", 
        boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        width: "100%",
        maxWidth: "400px"
      }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{ 
            width: "60px", 
            height: "60px", 
            background: "#c08497", 
            borderRadius: "12px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            margin: "0 auto 16px",
            color: "white",
            fontSize: "24px",
            fontWeight: "bold"
          }}>
            N
          </div>
          <h1 style={{ margin: 0, fontSize: "24px", color: "#1f2937" }}>Iniciar sesión</h1>
          <p style={{ margin: "8px 0 0", color: "#6b7280", fontSize: "14px" }}>
            Ingresa tus credenciales para continuar
          </p>
        </div>

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
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>
              Correo electrónico *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{ 
                width: "100%", 
                padding: "12px", 
                border: "1px solid #d1d5db", 
                borderRadius: "8px", 
                fontSize: "14px",
                boxSizing: "border-box"
              }}
              placeholder="tu@correo.com"
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>
              Contraseña *
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ 
                  width: "100%", 
                  padding: "12px 45px 12px 12px", 
                  border: "1px solid #d1d5db", 
                  borderRadius: "8px", 
                  fontSize: "14px",
                  boxSizing: "border-box"
                }}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#6b7280",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ 
              width: "100%", 
              padding: "14px", 
              background: loading ? "#9ca3af" : "#c08497", 
              color: "white", 
              border: "none", 
              borderRadius: "8px", 
              fontSize: "16px", 
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Verificando..." : "Ingresar al sistema"}
          </button>
        </form>

        <p style={{ 
          marginTop: "20px", 
          fontSize: "12px", 
          color: "#6b7280", 
          textAlign: "center" 
        }}>
          ¿Problemas para ingresar? Contacta al administrador.
        </p>
      </div>
    </div>
  );
}