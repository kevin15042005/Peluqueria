import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FondoInicio from "../../assets/FondoInicio.webp";
import Logo from "../../assets/log/logo.png";
import { EyeClosed, Eye, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../../Components/RutaProteguida/AutoContext.jsx";

// Normaliza el rol que llega del backend ("2", 2, "Administrador ", etc.)
const obtenerRuta = (rol) => {
  const r = String(rol ?? "").toLowerCase().trim();
  if (r === "administrador" || r === "2") return "/Asistencia";
  if (r === "empleado" || r === "1") return "/Empleado";
  return null;
};

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();
  const API = import.meta.env.VITE_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!correo.trim() || !password) {
      setError("Por favor ingrese correo y contraseña");
      return;
    }

    if (!API) {
      setError("Falta configurar VITE_API_URL en el archivo .env");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/administrador/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: correo.trim(), password }),
      });

      // El backend puede responder con algo que no es JSON (404, 500...)
      let data = {};
      try {
        data = await res.json();
      } catch {
        setError(`Error del servidor (${res.status})`);
        return;
      }

      if (!res.ok || !data.success || !data.usuario) {
        setError(data.message || "Correo o contraseña incorrectos");
        return;
      }

      const ruta = obtenerRuta(data.usuario.ROL);
      if (!ruta) {
        setError("Rol de usuario no reconocido");
        return;
      }

      // Guarda la sesión (localStorage + contexto) y redirige
      if (auth?.login) {
        auth.login(data.usuario);
      } else {
        localStorage.setItem("USER", JSON.stringify(data.usuario));
        localStorage.setItem("isLoggedIn", "true");
      }
      navigate(ruta, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/15 bg-white/[0.04] py-3.5 pl-11 pr-4 text-white placeholder:text-white/30 outline-none transition-colors focus:border-gold focus:bg-white/[0.06]";

  return (
    <div className="relative isolate flex min-h-[calc(100svh-5rem)] items-center justify-center overflow-hidden bg-ink px-4 py-16">
      <img
        className="absolute inset-0 -z-20 h-full w-full object-cover opacity-30 blur-sm"
        src={FondoInicio}
        alt=""
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-ink/70 via-ink/80 to-ink" />

      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#121214]/90 shadow-2xl shadow-black/60 backdrop-blur-md md:grid-cols-2">
        {/* Panel imagen (solo escritorio) */}
        <div className="relative hidden min-h-[520px] md:block">
          <img src={FondoInicio} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/50 to-ink/10" />
          <div className="absolute inset-x-0 bottom-0 p-10">
            <p className="mb-3 text-xs uppercase tracking-[0.35em] text-gold">Acceso interno</p>
            <h2 className="font-display text-3xl leading-tight text-white">
              Panel del <span className="text-gradient-gold italic">equipo</span>
            </h2>
            <p className="mt-3 text-sm text-white/60">
              Para administradores y empleados de Peluquería El Dorado.
            </p>
          </div>
        </div>

        {/* Formulario */}
        <div className="flex flex-col justify-center p-8 sm:p-12">
          <img src={Logo} alt="Peluquería El Dorado" className="mb-8 h-10 w-fit" />
          <h1 className="font-display text-3xl text-white">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-white/50">Ingresa con tu correo y contraseña.</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5" noValidate>
            <div>
              <label
                htmlFor="correo"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/60"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gold/70"
                />
                <input
                  id="correo"
                  type="email"
                  autoComplete="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className={inputClass}
                  placeholder="tu@correo.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/60"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gold/70"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-12`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-white/50 transition-colors hover:text-gold"
                >
                  {showPassword ? <Eye size={18} /> : <EyeClosed size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
              >
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gold py-4 text-sm font-semibold uppercase tracking-[0.15em] text-ink transition-all duration-300 hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Verificando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
