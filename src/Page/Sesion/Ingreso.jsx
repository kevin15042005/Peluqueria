import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FondoInicio from "../../assets/FondoInicio.webp";

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
        localStorage.setItem("USER", JSON.stringify(data.usuario));
        localStorage.setItem("isLoggedIn", "true");

        // Redirigir según el rol
        if (data.usuario.ROL === "administrador" || data.usuario.ROL === "2") {
          console.log("✅ Redirigiendo a /Administrador");
          navigate("/Administrador");
        } else if (
          data.usuario.ROL === "empleado" ||
          data.usuario.ROL === "1"
        ) {
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
    <div className="relative  min-h-screen flex items-center justify-center  overflow-hidden ">
      <img
        className="absolute inset-0 w-full h-full object-cover"
        src={FondoInicio}
        alt=""
      />
      <div className="absolute inset-0 bg-gray-900 opacity-[0.6] z-10">
        {" "}
      </div>

      <div className="relative bg-black p-8 rounded-2xl shadow-2xl w-[90%] max-w-md z-20">
        <div className="text-center mb-8">
      
          <h1 className="text-3xl font-bold text-amber-400">Inicio Sesion</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-amber-400 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full p-3 border border-gray-300 text-amber-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="admin@gmail.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-400 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 text-amber-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`
              w-full py-3 px-4 rounded-lg font-semibold text-black 
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-amber-600 hover:bg-amber-700"
              }
            `}
          >
            {loading ? " Verificando..." : " Iniciar Sesión"}
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
