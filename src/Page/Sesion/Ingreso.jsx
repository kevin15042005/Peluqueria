import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!correo || !password) {
      setError("Por favor ingrese correo y contraseña");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/administrador/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });

      const data = await res.json();

      console.log("🔍 DEBUG - Respuesta del backend:", data);

      if (res.ok && data.success) {
        // CORRECCIÓN: Usar "USER" (en mayúsculas) para coincidir con AuthContext
        localStorage.setItem("USER", JSON.stringify(data.usuario));
        localStorage.setItem("isLoggedIn", "true");
        
        console.log("🔍 DEBUG - Usuario guardado:", data.usuario);
        console.log("🔍 DEBUG - Rol:", data.usuario.ROL);
        
        // Redirigir según el rol
        if (data.usuario.ROL === "administrador" || data.usuario.ROL === "2") {
          console.log("✅ Redirigiendo a /Administrador");
          navigate("/Administrador");
        } else if (data.usuario.ROL === "empleado" || data.usuario.ROL === "1") {
          console.log("✅ Redirigiendo a /Empleado");
          navigate("/Empleado");
        } else {
          console.log("❌ Rol no reconocido:", data.usuario.ROL);
          setError("Rol de usuario no reconocido");
          localStorage.clear();
        }
      } else {
        setError(data.message || "Credenciales incorrectas");
      }
    } catch (error) {
      setError("Error de conexión con el servidor");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-96">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">💇‍♀️</div>
          <h1 className="text-3xl font-bold text-gray-800">Peluquería</h1>
          <p className="text-gray-600 mt-2">Sistema de Gestión</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="admin@peluqueria.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`
              w-full py-3 px-4 rounded-lg font-semibold text-white
              ${loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
              }
            `}
          >
            {loading ? '⏳ Verificando...' : '🚀 Iniciar Sesión'}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-700">
              <span className="mr-2">⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}