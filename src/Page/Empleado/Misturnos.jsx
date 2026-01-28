import React, { useEffect, useState } from "react";
import Asistencia from "./Asistencia";
export default function Misturnos() {
  const [turnos, setTurnos] = useState([]);
  const usuario = JSON.parse(localStorage.getItem("USER"));

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/turnos/mis-turnos/${usuario.ID}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTurnos(data.data);
        }
      });
  }, []);

  return (
    
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl mb-4">Mis Turnos</h2>

      {turnos.length === 0 && (
        <p>No tienes turnos asignados</p>
      )}

      <table className="w-full border">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Servicio</th>
            <th>Hora</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {turnos.map(t => (
            <tr key={t.ID}>
              <td>{t.FECHA}</td>
              <td>{t.SERVICIO} - {t.SUBSERVICIO}</td>
              <td>{t.HORA_INICIO} - {t.HORA_FIN}</td>
              <td>{t.ESTADO}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
