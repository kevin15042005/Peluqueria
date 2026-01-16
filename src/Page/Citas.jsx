import React, { useEffect, useState } from "react";

export default function Citas() {
  const [subservicios, setSubservicios] = useState([]);
  const [empleadoDisponible, setEmpleadoDisponible] = useState(null);
  const [subservicioId, setSubservicioId] = useState("");
  const [fecha, setFecha] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [turnoCreado, setTurnoCreado] = useState(false);

  const API = import.meta.env.VITE_API_URL;

  /* ===============================
     CARGAR SUBSERVICIOS
  ================================ */
  useEffect(() => {
    const cargarSubservicios = async () => {
      try {
        const res = await fetch(`${API}/turnos/subservicios`);
        const data = await res.json();

        if (data.success && data.data.length > 0) {
          setSubservicios(data.data);
          setSubservicioId(data.data[0].SUBSERVICIO_ID);
        }
      } catch (error) {
        console.error("Error al cargar subservicios:", error);
      }
    };

    cargarSubservicios();
  }, []);

  /* ===============================
     CARGAR EMPLEADO DISPONIBLE
  ================================ */
  useEffect(() => {
    if (!subservicioId) return;

    const cargarEmpleadoDisponible = async () => {
      try {
        const res = await fetch(
          `${API}/turnos/empleado-disponible/${subservicioId}`
        );
        const data = await res.json();

        if (data.success && data.data) {
          setEmpleadoDisponible(data.data);
        } else {
          setEmpleadoDisponible(null);
        }
      } catch (error) {
        console.error("Error al obtener empleado disponible:", error);
        setEmpleadoDisponible(null);
      }
    };

    cargarEmpleadoDisponible();
  }, [subservicioId]);

  /* ===============================
     SOLICITAR TURNO
  ================================ */
  const solicitarTurno = async () => {
    if (!subservicioId || !fecha) {
      setMensaje("Debe seleccionar fecha y subservicio");
      return;
    }

    if (!empleadoDisponible) {
      setMensaje("No hay empleados disponibles para este subservicio");
      return;
    }

    try {
      const res = await fetch(`${API}/turnos/registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subservicioId,
          fecha,
          trabajadorId: empleadoDisponible.TRABAJADOR_ID,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setTurnoCreado(true);
        setMensaje("Turno asignado correctamente");
      } else {
        setMensaje(data.message || "Error al crear el turno");
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al solicitar el turno");
    }
  };

  /* ===============================
     RENDER
  ================================ */
  return (
    <div className="max-w-md mx-auto p-6 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Solicitar Cita</h2>

      {/* FECHA */}
      <label className="block font-semibold mb-1">Fecha</label>
      <input
        type="date"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
        className="w-full border p-2 mb-4 rounded"
      />

      {/* SUBSERVICIO */}
      <label className="block font-semibold mb-1">Subservicio</label>
      <select
        value={subservicioId}
        onChange={(e) => setSubservicioId(e.target.value)}
        className="w-full border p-2 mb-4 rounded"
      >
        <option value="">Seleccione un subservicio</option>
        {subservicios.map((s) => (
          <option key={s.SUBSERVICIO_ID} value={s.SUBSERVICIO_ID}>
            {s.SERVICIO} - {s.NOMBRE} (${s.PRECIO})
          </option>
        ))}
      </select>

      {/* EMPLEADO ASIGNADO AUTOMÁTICAMENTE */}
      <label className="block font-semibold mb-1">Empleado asignado</label>
      <input
        type="text"
        disabled
        value={
          empleadoDisponible
            ? empleadoDisponible.NOMBRE
            : "No hay empleado disponible"
        }
        className="w-full border p-2 mb-4 rounded bg-gray-100"
      />

      {/* BOTÓN */}
      <button
        onClick={solicitarTurno}
        className="w-full bg-blue-600 text-white p-2 rounded"
      >
        Solicitar Turno
      </button>

      {/* MENSAJES */}
      {mensaje && <p className="mt-3 font-medium">{mensaje}</p>}
      {turnoCreado && (
        <p className="mt-2 font-bold text-green-600">Turno confirmado</p>
      )}
    </div>
  );
}
