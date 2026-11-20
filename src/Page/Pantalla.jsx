import React, { useCallback, useEffect, useState } from "react";
import { Maximize, Scissors, WifiOff } from "lucide-react";
import Logo from "../assets/log/logo.png";

// Pantalla pública para la TV del salón: quién está siendo atendido y quién sigue.
const API = import.meta.env.VITE_API_URL;
const REFRESCO_MS = 10000;
const hora = (h) => (h ? h.substring(0, 5) : "--:--");

function Reloj() {
  const [ahora, setAhora] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="text-right">
      <p className="font-display text-4xl tabular-nums text-white md:text-5xl">
        {ahora.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
      </p>
      <p className="text-sm capitalize text-white/50">
        {ahora.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
      </p>
    </div>
  );
}

export default function Pantalla() {
  const [atendiendo, setAtendiendo] = useState([]);
  const [siguientes, setSiguientes] = useState([]);
  const [sinConexion, setSinConexion] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch(`${API}/turnos/pantalla`);
      const data = await res.json();
      if (data.success) {
        setAtendiendo(data.atendiendo);
        setSiguientes(data.siguientes);
        setSinConexion(false);
      }
    } catch {
      setSinConexion(true);
    }
  }, []);

  useEffect(() => {
    cargar();
    const t = setInterval(cargar, REFRESCO_MS);
    return () => clearInterval(t);
  }, [cargar]);

  const pantallaCompleta = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  return (
    <div className="flex min-h-screen flex-col bg-ink p-6 text-white md:p-10">
      {/* Encabezado */}
      <header className="flex items-center justify-between gap-6 border-b border-white/10 pb-6">
        <div className="flex items-center gap-5">
          <img src={Logo} alt="Peluquería El Dorado" className="h-12 w-auto md:h-14" />
          <h1 className="hidden font-display text-2xl text-gold md:block">Turnos de hoy</h1>
        </div>
        <div className="flex items-center gap-6">
          {sinConexion && (
            <span className="flex items-center gap-2 rounded-full bg-red-500/15 px-4 py-2 text-sm text-red-300">
              <WifiOff size={16} /> Sin conexión
            </span>
          )}
          <Reloj />
          <button
            onClick={pantallaCompleta}
            aria-label="Pantalla completa"
            className="rounded-full border border-white/15 p-3 text-white/50 transition-colors hover:border-gold hover:text-gold"
          >
            <Maximize size={20} />
          </button>
        </div>
      </header>

      <main className="grid grow grid-cols-1 gap-8 pt-8 lg:grid-cols-[3fr_2fr]">
        {/* Atendiendo ahora */}
        <section>
          <h2 className="mb-6 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
            </span>
            Atendiendo ahora
          </h2>

          {atendiendo.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 text-white/30">
              <Scissors size={40} />
              <p className="mt-4 text-lg">Nadie en atención en este momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {atendiendo.map((t) => (
                <article
                  key={t.ID}
                  className="rounded-3xl border-2 border-green-500/40 bg-linear-to-br from-green-500/10 to-transparent p-8"
                >
                  <p className="font-display text-6xl text-white md:text-7xl">{t.CODIGO}</p>
                  <p className="mt-4 text-2xl font-semibold">{t.CLIENTE}</p>
                  <p className="mt-1 text-lg text-white/60">{t.SERVICIO}</p>
                  <p className="mt-6 text-sm uppercase tracking-[0.2em] text-green-300">Con {t.EMPLEADO}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Siguientes */}
        <section>
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.3em] text-gold">Próximos turnos</h2>
          {siguientes.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-white/10 p-10 text-center text-white/30">
              No hay más turnos en espera
            </p>
          ) : (
            <ol className="space-y-3">
              {siguientes.slice(0, 8).map((t, i) => (
                <li
                  key={t.ID}
                  className={`flex items-center justify-between gap-4 rounded-2xl border p-5 ${
                    i === 0 ? "border-gold bg-gold/10" : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <span className={`font-display text-3xl ${i === 0 ? "text-gold" : "text-white"}`}>{t.CODIGO}</span>
                    <div>
                      <p className="text-lg font-semibold">{t.CLIENTE}</p>
                      <p className="text-sm text-white/50">
                        {t.SERVICIO} · {t.EMPLEADO}
                      </p>
                    </div>
                  </div>
                  <span className="font-display text-2xl tabular-nums text-white/80">{hora(t.HORA_INICIO)}</span>
                </li>
              ))}
              {siguientes.length > 8 && (
                <li className="text-center text-sm text-white/40">y {siguientes.length - 8} más…</li>
              )}
            </ol>
          )}
        </section>
      </main>

      <footer className="pt-6 text-center text-sm text-white/40">
        Consulta tu turno desde el celular en la sección <span className="text-gold">Mi turno</span>
      </footer>
    </div>
  );
}
