import React, { useState, useEffect, useCallback } from "react";
import { Clock, Scissors, User, Timer } from "lucide-react";

// Helpers básicos
const convertirHoraAMinutos = (h) => {
  if (!h) return 0;
  const [hrs, mins] = h.split(":").map(Number);
  return hrs * 60 + mins;
};

const formatearHora = (h) => (h ? h.substring(0, 5) : "--:--");

export default function PantallaPublicaTurnos() {
  const [turnos, setTurnos] = useState([]);
  const API = import.meta.env.VITE_API_URL;

  const cargarDatos = useCallback(async () => {
    try {
      const res = await fetch(`${API}/turnos/activos-hoy`);
      const data = await res.json();
      if (data.success) {
        // Ordenamos por hora de inicio
        const ordenados = data.turnos.sort((a, b) => 
          convertirHoraAMinutos(a.HORA_INICIO) - convertirHoraAMinutos(b.HORA_INICIO)
        );
        setTurnos(ordenados);
      }
    } catch (err) {
      console.error("Error en pantalla pública",err);
    }
  }, [API]);

  useEffect(() => {
    const interval = setInterval(cargarDatos, 30000); // Se actualiza solo cada 30s
    return () => clearInterval(interval);
  }, [cargarDatos]);

  return (
    <div className="max-h-screen max-w-full bg-slate-900 p-6 text-white font-sans">
      {/* Encabezado Estilo El Dorado */}
      <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-black text-yellow-400 tracking-tighter">EL DORADO</h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Turnos en Tiempo Real</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-mono text-white">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          <span className="text-green-500 flex items-center gap-2 justify-end text-sm">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" /> Conectado
          </span>
        </div>
      </div>

      {/* Grid de Turnos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {turnos.length > 0 ? (
          turnos.map((turno) => (
            <div 
              key={turno.ID} 
              className={`p-6 rounded-3xl border-2 transition-all ${
                turno.ESTADO === "en atención" 
                ? "bg-yellow-400 border-yellow-500 scale-105 shadow-[0_0_30px_rgba(250,204,21,0.2)]" 
                : "bg-white/5 border-white/10"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${turno.ESTADO === "en atención" ? "bg-black/10" : "bg-white/10"}`}>
                  <User size={28} className={turno.ESTADO === "en atención" ? "text-black" : "text-yellow-400"} />
                </div>
                <div className={`text-2xl font-black font-mono ${turno.ESTADO === "en atención" ? "text-black" : "text-white"}`}>
                  {formatearHora(turno.HORA_INICIO)}
                </div>
              </div>

              <h2 className={`text-2xl font-bold mb-1 truncate ${turno.ESTADO === "en atención" ? "text-black" : "text-white"}`}>
                {turno.CLIENTE_NOMBRE}
              </h2>
              
              <div className={`flex items-center gap-2 text-sm font-bold uppercase mb-4 ${turno.ESTADO === "en atención" ? "text-black/60" : "text-gray-400"}`}>
                <Scissors size={16} />
                {turno.SUBSERVICIO_NOMBRE || "Servicio General"}
              </div>

              <div className={`inline-block px-4 py-2 rounded-full text-xs font-black uppercase ${
                turno.ESTADO === "en atención" 
                ? "bg-black text-yellow-400 animate-pulse" 
                : "bg-white/10 text-white"
              }`}>
                {turno.ESTADO === "En espera" ? "Siéntate ahora" : " en atención"}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
            <p className="text-2xl text-gray-500 font-bold">No hay turnos pendientes para hoy</p>
          </div>
        )}
      </div>
    </div>
  );
}