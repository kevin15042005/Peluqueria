import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function SubserviciosAdmin() {
  const [servicios, setServicios] = useState([]);
  const [subservicios, setSubservicios] = useState([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [servicioId, setServicioId] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Cargar servicios y subservicios
  const cargarServicios = async () => {
    try {
      const res = await fetch(`${API}/servicios/obtener_servicios`);
      const data = await res.json();
      if (data.success) {
        setServicios(data.data);
        if (data.data.length > 0) setServicioId(data.data[0].ID);
      }
    } catch (error) {
      console.error("Error al cargar servicios:", error);
    }
  };

  

  useEffect(() => {
    cargarServicios();
  }, []);

  // Crear nuevo subservicio
  const crearSubservicio = async () => {
    if (!nombre || !precio || !servicioId) {
      setMensaje("Todos los campos son obligatorios");
      return;
    }

    try {
      const res = await fetch(`${API}/subservicio/registrar_subservicio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ servicioId, nombre, precio, descripcion }),
      });

      const data = await res.json();
      setMensaje(data.message);

      if (data.success) {
        setNombre("");
        setPrecio("");
        setDescripcion("");
      }
    } catch (error) {
      console.error("Error al crear subservicio:", error);
      setMensaje("Error de conexión");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Administrar Subservicios</h2>

      {mensaje && <div className="mb-3 text-red-600">{mensaje}</div>}

      <div className="flex flex-col gap-3 mb-6">
        <select
          value={servicioId}
          onChange={(e) => setServicioId(e.target.value)}
          className="border p-2 rounded"
        >
          {servicios.map((s) => (
            <option key={s.ID} value={s.ID}>
              {s.NOMBRE}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Nombre del subservicio"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Precio"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          className="border p-2 rounded"
        />
        <textarea
          placeholder="Descripción (opcional)"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          onClick={crearSubservicio}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Crear Subservicio
        </button>
      </div>

      <h3 className="font-semibold mb-2">Subservicios existentes</h3>
      <ul className="list-disc pl-5">
        {subservicios.map((s) => (
          <li key={s.SUBSERVICIO_ID}>
            {s.SERVICIO} - {s.NOMBRE} (${s.PRECIO})
          </li>
        ))}
      </ul>
    </div>
  );
}
