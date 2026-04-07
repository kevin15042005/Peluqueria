import React, { useEffect, useState } from "react";


export default function RelojElegante() {
  const [hora, setHora] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setHora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hrs = hora.getHours();
  const min = hora.getMinutes();
  const sec = hora.getSeconds();

  // Lógica de Abierto/Cerrado (6:00 a 22:00)
  const estaAbierto = hrs >= 6 && hrs < 22;

  // Cálculo de rotación de agujas
  const rotacionHora = (hrs % 12) * 30 + min * 0.5;
  const rotacionMinuto = min * 6;
  const rotacionSegundo = sec * 6;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-zinc-900/80 backdrop-blur-md border border-amber-400/30 rounded-3xl shadow-2xl w-full max-w-xs mx-auto">
      
      {/* Reloj Analógico */}
      <div className="relative w-48 h-48 rounded-full border-4 border-amber-500 shadow-[0_0_20px_rgba(251,191,36,0.2)] bg-zinc-950 flex items-center justify-center mb-6">
        
        {/* Puntos de las horas */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-3 bg-amber-700"
            style={{ transform: `rotate(${i * 30}deg) translateY(-85px)` }}
          />
        ))}

        {/* Aguja Horas */}
        <div
          className="absolute w-1.5 h-15 bg-white rounded-full "
          style={{ transform: `rotate(${rotacionHora}deg) translateY(-24px)`, transition: 'transform 0.5s ease-in-out' }}
        />
        
        {/* Aguja Minutos */}
        <div
          className="absolute w-1 h-16 bg-amber-200 rounded-full"
          style={{ transform: `rotate(${rotacionMinuto}deg) translateY(-32px)`, transition: 'transform 0.5s ease-in-out' }}
        />

        {/* Aguja Segundos */}
        <div
          className="absolute w-0.5 h-10 bg-amber-500 rounded-full "
          style={{ transform: `rotate(${rotacionSegundo}deg) translateY(-36px)` }}
        />

        {/* Centro del reloj */}
        <div className="absolute w-3 h-3 bg-amber-500 rounded-full z-10 shadow-md" />
      </div>

      {/* Estado Abierto/Cerrado */}
      <div className="text-center">
        <div className={`px-6 py-2 rounded-full font-bold uppercase tracking-widest text-sm mb-2 transition-all duration-500 ${
          estaAbierto 
          ? "bg-green-500/20 text-green-400 border border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]" 
          : "bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
        }`}>
          {estaAbierto ? "● Abierto Ahora" : "○ Cerrado"}
        </div>
        
        <p className="text-zinc-400 text-xs font-medium">
          Horario: 06:00 AM - 10:00 PM
        </p>
      </div>
    </div>
  );
}