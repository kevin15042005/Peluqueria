import { useEffect, useState } from "react";
import SubserviciosAdmin from "./Subservicio";

export default function ServiciosAdmin() {
  const [servicios, setServicios] = useState([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [servicioCreado, setServicioCreado] = useState(false);

  const API = import.meta.env.VITE_API_URL;

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

  // Recargar servicios cuando servicioCreado cambie
  useEffect(() => {
    cargarServicios();
  }, [servicioCreado]);

  // Crear nuevo servicio
  const crearServicio = async () => {
    if (!nombre.trim()) {
      setMensaje("El nombre es obligatorio");
      return;
    }

    setLoading(true);
    setMensaje("");

    try {
      const res = await fetch(`${API}/servicios/registrar_servicios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, descripcion }),
      });

      const data = await res.json();

      if (data.success) {
        setMensaje("✅ Servicio creado correctamente");
        setNombre("");
        setDescripcion("");
        // Cambiar estado para disparar recarga
        setServicioCreado((prev) => !prev);

        // Mensaje temporal
        setTimeout(() => {
          setMensaje("");
        }, 3000);
      } else {
        setMensaje(`❌ ${data.message || "Error al crear servicio"}`);
      }
    } catch (error) {
      console.error("Error al crear servicio:", error);
      setMensaje("❌ Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar servicio
  const eliminarServicio = async (servicioId) => {
    if (
      !confirm(
        "¿Estás seguro de eliminar este servicio? Esta acción no se puede deshacer.",
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`${API}/servicios/eliminar/${servicioId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        setMensaje("✅ Servicio eliminado correctamente");
        // Recargar servicios
        setServicioCreado((prev) => !prev);

        setTimeout(() => {
          setMensaje("");
        }, 3000);
      } else {
        setMensaje(`❌ ${data.message || "Error al eliminar servicio"}`);
      }
    } catch (error) {
      console.error("Error al eliminar servicio:", error);
      setMensaje("❌ Error al eliminar servicio");
    }
  };

  // Si necesitas agregar la ruta DELETE en el backend, aquí está:
  /*
  // En tu archivo de rutas de servicios (servicios.js):
  router.delete("/eliminar/:id", async (req, res) => {
    const { id } = req.params;
    
    try {
      const db = await conectDb();
      await db.execute("UPDATE SERVICIO SET ESTADO = 'inactivo' WHERE ID = ?", [id]);
      
      res.json({ 
        success: true, 
        message: "Servicio eliminado correctamente" 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Error al eliminar servicio" 
      });
    }
  });
  */

  return (
    <>
    <div className="   items-center p-4 md:p-8 max-w-6xl w-full mx-auto text-amber-300 font-bold">
      <div className="space-y-8 my-20 px-4 sm:px-6 lg:px-8 mb-8 p-6 border-2 border-amber-500 rounded-xl bg-linear-to-br from-black to-gray-900 shadow-lg">
        {" "}
        {/* Formulario Crear Servicio */}
        <div className=" bg-linear-to-br from-black to-gray-900 rounded-2xl shadow-xl border-2 border-amber-500/30 p-6">
          {" "}
          <h2 className="text-2xl font-bold mb-6 text-amber-300">
            {" "}
            Administrar Servicios
          </h2>
          {mensaje && (
            <div
              className={`mb-4 p-3 rounded-lg flex items-center animate-pulse ${mensaje.includes("✅") ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-100 text-red-800 border border-red-200"}`}
            >
              <span className="mr-2">
                {mensaje.includes("✅") ? "✅" : "❌"}
              </span>
              <span>{mensaje.replace("✅", "").replace("❌", "").trim()}</span>
            </div>
          )}
          <div className="flex flex-col  gap-6">
            <div>
              <label className="block text-sm font-medium text-amber-300 mb-2">
                Nombre del servicio *
              </label>
              <input
                type="text"
                placeholder="Ej: Corte de Cabello"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full p-3 border border-gray-300 text-amber-300 rounded-lg focus:ring-2 focus:ring-amber-300 transition-colors"
                onKeyPress={(e) => {
                  if (e.key === "Enter") crearServicio();
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-300 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                placeholder="Ej: Servicios de corte para hombres y mujeres"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full p-3 border text-amber-300 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 transition-colors h-24"
              />
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={crearServicio}
              disabled={loading || !nombre.trim()}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                loading || !nombre.trim()
                  ? "bg-gray-400 cursor-not-allowed text-gray-600"
                  : " bg-linear-to-r bg-amber-700 from-amber-700/50 to-amber-800/50 hover:bg-amber-500 text-black shadow-lg hover:shadow-xl"
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white "></div>
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <span className="text-lg  text-white ">Crear Servicio</span>
                </>
              )}
            </button>

            <button
              onClick={cargarServicios}
              className="px-4 py-3 borderbg-linear-to-r bg-amber-700 from-amber-700/50 to-amber-800/50 text-black shadow-lg hover:shadow-xl rounded-lg hover:bg-amber-500 transition-colors flex items-center space-x-2"
            >
              <span className="text-white">🔄</span>
              <span>Actualizar Lista</span>
            </button>
          </div>
        </div>
        {/* Lista de Servicios Existentes */}
        <div className="bg-linear-to-br from-black to-gray-900 rounded-2xl shadow-xl border-2 border-amber-500/30  p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-amber-300">
              Servicios Registrados
            </h3>
            <div className="text-sm text-amber-300">
              Total:{" "}
              <span className="font-bold text-amber-600">
                {servicios.length}
              </span>
            </div>
          </div>

          {servicios.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay servicios registrados</p>
              <p className="text-gray-400 text-sm mt-2">
                Crea tu primer servicio usando el formulario de arriba
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {" "}
              {servicios.map((servicio) => (
                <div
                  key={servicio.ID}
                  className="border  border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all duration-300  bg-amber-500 group"
                >
                  <div className="flex  justify-between items-start mb-3">
                    <h4 className="font-bold  text-lg text-gray-800 group-hover:text-amber-00 transition-colors">
                      {servicio.NOMBRE}
                    </h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                      ID: {servicio.ID}
                    </span>
                  </div>

                  {servicio.DESCRIPCION ? (
                    <p className="text-black text-sm mb-4 line-clamp-2">
                      {servicio.DESCRIPCION}
                    </p>
                  ) : (
                    <p className="text-black text-sm mb-4 italic">
                      Sin descripción
                    </p>
                  )}

                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        servicio.ESTADO === "activo"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {servicio.ESTADO === "activo" ? "Activo" : "Inactivo"}
                    </span>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => eliminarServicio(servicio.ID)}
                        className=" text-xs px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors"
                        title="Eliminar servicio"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Componente Subservicios */}
        <div className="mt-8">
          <SubserviciosAdmin servicioCreado={servicioCreado} />
        </div>
      </div>
      </div>
    </>
  );
}
