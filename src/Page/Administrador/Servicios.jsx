import { useEffect, useState } from "react";
import Subservicio from "./Subservicio";
const API = import.meta.env.VITE_API_URL;

export default function ServiciosAdmin() {
  const [servicios, setServicios] = useState([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Cargar servicios existentes
  const cargarServicios = async () => {
    try {
      const res = await fetch(`${API}/servicios/obtener_servicios`);
      const data = await res.json();
      if (data.success) setServicios(data.data);
    } catch (error) {
      console.error("Error al cargar servicios:", error);
    }
  };

  useEffect(() => {
    cargarServicios();
  }, []);

  // Crear nuevo servicio
  const crearServicio = async () => {
    if (!nombre) {
      setMensaje("El nombre es obligatorio");
      return;
    }

    try {
      const res = await fetch(`${API}/servicios/registrar_servicios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, descripcion }),
      });

      const data = await res.json();
      setMensaje(data.message);

      if (data.success) {
        setNombre("");
        setDescripcion("");
        cargarServicios();
      }
    } catch (error) {
      console.error("Error al crear servicio:", error);
      setMensaje("Error de conexión");
    }
  };

  return (
    <>
      <div className="max-w-lg mx-auto p-4 border rounded shadow">
        <h2 className="text-xl font-bold mb-4">Administrar Servicios</h2>

        {mensaje && <div className="mb-3 text-red-600">{mensaje}</div>}

        <div className="flex flex-col gap-3 mb-6">
          <input
            type="text"
            placeholder="Nombre del servicio"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="border p-2 rounded"
          />
          <textarea
            placeholder="Descripción (opcional)"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="border p-2 rounded"
          />
          <button
            onClick={crearServicio}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Crear Servicio
          </button>
        </div>

        <h3 className="font-semibold mb-2">Servicios existentes</h3>
        <ul className="list-disc pl-5">
          {servicios.map((s) => (
            <li key={s.ID}>
              {s.NOMBRE} {s.DESCRIPCION && `- ${s.DESCRIPCION}`}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <Subservicio />
      </div>
    </>
  );
}
