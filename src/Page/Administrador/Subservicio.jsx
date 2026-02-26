import { useEffect, useState } from "react";

export default function SubserviciosAdmin({ servicioCreado }) {
  const [servicios, setServicios] = useState([]);
  const [subservicios, setSubservicios] = useState([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [servicioId, setServicioId] = useState("");
  const [duracion, setDuracion] = useState("60");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [subservicioCreado, setSubservicioCreado] = useState(false);

  // Estados para edición
  const [editando, setEditando] = useState(false);
  const [subservicioEditando, setSubservicioEditando] = useState(null);
  const [loadingEdicion, setLoadingEdicion] = useState(false);

  const API = import.meta.env.VITE_API_URL;

  // Cargar servicios y subservicios
  const cargarServicios = async () => {
    try {
      const res = await fetch(`${API}/servicios/obtener_servicios`);
      const data = await res.json();
      if (data.success) {
        setServicios(data.data);
        if (data.data.length > 0 && !servicioId) {
          setServicioId(data.data[0].ID);
        }
      }
    } catch (error) {
      console.error("Error al cargar servicios:", error);
    }
  };

  const cargarSubservicios = async () => {
    try {
      const res = await fetch(`${API}/subservicio/obtener_subservicios`);
      const data = await res.json();
      if (data.success) {
        setSubservicios(data.data || []);
      }
    } catch (error) {
      console.error("Error al cargar subservicios:", error);
    }
  };

  // Cargar datos cuando el componente se monta o cuando servicioCreado cambia
  useEffect(() => {
    cargarServicios();
    cargarSubservicios();
  }, [servicioCreado, subservicioCreado]);

  // Iniciar modo edición
  const iniciarEdicion = (subservicio) => {
    setEditando(true);
    setSubservicioEditando(subservicio);
    setServicioId(subservicio.SERVICIO_ID || subservicio.servicioId || "");
    setNombre(subservicio.NOMBRE || subservicio.nombre || "");
    setPrecio(subservicio.PRECIO || subservicio.precio || "");
    setDescripcion(subservicio.DESCRIPCION || subservicio.descripcion || "");
    setDuracion(
      subservicio.DURACION_MINUTOS || subservicio.duracionMinutos || "60",
    );

    // Desplazar al formulario
    document.querySelector("form")?.scrollIntoView({ behavior: "smooth" });
  };

  // Cancelar edición
  const cancelarEdicion = () => {
    setEditando(false);
    setSubservicioEditando(null);
    setServicioId("");
    setNombre("");
    setPrecio("");
    setDescripcion("");
    setDuracion("60");
  };

  // Crear nuevo subservicio
  const crearSubservicio = async () => {
    if (!nombre.trim() || !precio.trim() || !servicioId) {
      setMensaje("❌ Todos los campos son obligatorios");
      return;
    }

    if (isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) {
      setMensaje("❌ El precio debe ser un número positivo");
      return;
    }

    if (duracion && (isNaN(parseInt(duracion)) || parseInt(duracion) < 15)) {
      setMensaje("❌ La duración debe ser al menos 15 minutos");
      return;
    }

    setLoading(true);
    setMensaje("");

    try {
      const res = await fetch(`${API}/subservicio/registrar_subservicio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          servicioId: parseInt(servicioId),
          nombre: nombre.trim(),
          precio: parseFloat(precio),
          descripcion: descripcion.trim(),
          duracionMinutos: parseInt(duracion) || 60,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMensaje("✅ Subservicio creado correctamente");
        // Limpiar formulario
        cancelarEdicion();

        // Actualizar lista automáticamente
        setSubservicioCreado((prev) => !prev);

        // Limpiar mensaje después de 3 segundos
        setTimeout(() => {
          setMensaje("");
        }, 3000);
      } else {
        setMensaje(`❌ ${data.message || "Error al crear subservicio"}`);
      }
    } catch (error) {
      console.error("Error al crear subservicio:", error);
      setMensaje("❌ Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // Actualizar subservicio existente
  const actualizarSubservicio = async () => {
    if (!subservicioEditando) return;

    if (!nombre.trim() || !precio.trim() || !servicioId) {
      setMensaje("❌ Todos los campos son obligatorios");
      return;
    }

    if (isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) {
      setMensaje("❌ El precio debe ser un número positivo");
      return;
    }

    if (duracion && (isNaN(parseInt(duracion)) || parseInt(duracion) < 15)) {
      setMensaje("❌ La duración debe ser al menos 15 minutos");
      return;
    }

    setLoadingEdicion(true);
    setMensaje("");

    try {
      const res = await fetch(
        `${API}/subservicio/actualizar_subservicio/${subservicioEditando.ID}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            servicioId: parseInt(servicioId),
            nombre: nombre.trim(),
            precio: parseFloat(precio),
            descripcion: descripcion.trim(),
            duracionMinutos: parseInt(duracion) || 60,
          }),
        },
      );

      const data = await res.json();

      if (data.success) {
        setMensaje("✅ Subservicio actualizado correctamente");
        // Limpiar formulario y salir del modo edición
        cancelarEdicion();

        // Actualizar lista automáticamente
        setSubservicioCreado((prev) => !prev);

        // Limpiar mensaje después de 3 segundos
        setTimeout(() => {
          setMensaje("");
        }, 3000);
      } else {
        setMensaje(`❌ ${data.message || "Error al actualizar subservicio"}`);
      }
    } catch (error) {
      console.error("Error al actualizar subservicio:", error);
      setMensaje("❌ Error de conexión con el servidor");
    } finally {
      setLoadingEdicion(false);
    }
  };

  // Eliminar subservicio - CORREGIDA
  const eliminarSubservicio = async (subservicioId) => {
    if (
      !confirm(
        "¿Estás seguro de eliminar este subservicio? Esta acción no se puede deshacer.",
      )
    ) {
      return;
    }

    try {
      // URL CORREGIDA: usar eliminar_subservicio en lugar de eliminar
      const res = await fetch(`${API}/subservicio/eliminar_subservicio/${subservicioId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        setMensaje("✅ Subservicio eliminado correctamente");
        // Si estamos editando este subservicio, cancelar edición
        if (subservicioEditando && subservicioEditando.ID === subservicioId) {
          cancelarEdicion();
        }
        // Actualizar lista
        setSubservicioCreado((prev) => !prev);

        setTimeout(() => {
          setMensaje("");
        }, 3000);
      } else {
        setMensaje(`❌ ${data.message || "Error al eliminar subservicio"}`);
      }
    } catch (error) {
      console.error("Error al eliminar subservicio:", error);
      setMensaje("❌ Error al eliminar subservicio");
    }
  };

  // Función para recargar manualmente
  const recargarDatos = () => {
    cargarServicios();
    cargarSubservicios();
    cancelarEdicion();
    setMensaje("🔄 Datos actualizados");

    setTimeout(() => {
      setMensaje("");
    }, 2000);
  };

  return (
    <div className="bg-linear-to-br from-black to-gray-900 rounded-2xl shadow-xl border-2 border-amber-500/30 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl md:text-3xl font-bold text-amber-300">
          {" "}
          Administrar Subservicios
        </h2>
        <button
          onClick={recargarDatos}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border-2 border-amber-500/30 text-amber-300 rounded-lg transition-colors text-sm md:text-base"
        >
          <span>🔄</span>
          <span>Actualizar</span>
        </button>
      </div>

      {mensaje && (
        <div
          className={`mb-6 p-4 rounded-xl border flex items-center text-sm md:text-base ${
            mensaje.includes("✅")
              ? "bg-green-900/20 text-green-300 border-green-500/30"
              : mensaje.includes("❌")
              ? "bg-red-900/20 text-red-300 border-red-500/30"
              : "bg-blue-900/20 text-blue-300 border-blue-500/30"
          }`}
        >
          <span className="mr-3 text-xl">
            {mensaje.includes("✅") ? "✅" : mensaje.includes("❌") ? "❌" : "🔄"}
          </span>
          <span>
            {mensaje
              .replace("✅", "")
              .replace("❌", "")
              .replace("🔄", "")
              .trim()}
          </span>
        </div>
      )}
      {/* Formulario */}
      <div className="bg-gray-800/50 rounded-xl p-4 md:p-6 border-2 border-amber-500/30">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h3 className="text-lg font-bold text-amber-300">
            {editando
              ? `✏️ Editando: ${subservicioEditando?.NOMBRE}`
              : "➕ Crear Nuevo Subservicio"}
          </h3>
          {editando && (
            <button
              onClick={cancelarEdicion}
              className="px-4 py-2 text-sm text-amber-400 hover:text-amber-300 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancelar edición
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-amber-300 mb-2">
              Servicio *
            </label>
            <select
              value={servicioId}
              onChange={(e) => setServicioId(e.target.value)}
              className="w-full p-3 bg-gray-800 border-2 border-amber-500/30 text-amber-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 text-sm md:text-base"
            >
              <option value="" className="bg-gray-800">
                Seleccione un servicio
              </option>
              {servicios.map((s) => (
                <option key={s.ID} value={s.ID} className="bg-gray-800">
                  {s.NOMBRE}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-300 mb-2">
              Nombre del subservicio *
            </label>
            <input
              type="text"
              placeholder="Ej: Corte Caballero"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full p-3 bg-gray-800 border-2 border-amber-500/30 text-amber-200 rounded-lg placeholder-gray-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 text-sm md:text-base"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  editando ? actualizarSubservicio() : crearSubservicio();
                }
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-300 mb-2">
              Precio ($) *
            </label>
            <input
              type="number"
              placeholder="Ej: 15000"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className="w-full p-3 bg-gray-800 border-2 border-amber-500/30 text-amber-200 rounded-lg placeholder-gray-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 text-sm md:text-base"
              min="0"
              step="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-300 mb-2">
              Duración (min) *
            </label>
            <select
              value={duracion}
              onChange={(e) => setDuracion(e.target.value)}
              className="w-full p-3 bg-gray-800 border-2 border-amber-500/30 text-amber-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 text-sm md:text-base"
            >
              <option value="15" className="bg-gray-800">
                15 minutos
              </option>
              <option value="30" className="bg-gray-800">
                30 minutos
              </option>
              <option value="45" className="bg-gray-800">
                45 minutos
              </option>
              <option value="60" className="bg-gray-800">
                1 hora
              </option>
              <option value="90" className="bg-gray-800">
                1 hora 30 min
              </option>
              <option value="120" className="bg-gray-800">
                2 horas
              </option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-amber-300 mb-2">
            Descripción (opcional)
          </label>
          <textarea
            placeholder="Ej: Corte básico para hombres con lavado incluido"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full p-3 bg-gray-800 border-2 border-amber-500/30 text-amber-200 rounded-lg placeholder-gray-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 h-32 resize-none text-sm md:text-base"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={editando ? actualizarSubservicio : crearSubservicio}
            disabled={
              loading ||
              loadingEdicion ||
              !nombre.trim() ||
              !precio.trim() ||
              !servicioId
            }
            className={`px-6 md:px-8 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 text-sm md:text-base ${
              loading ||
              loadingEdicion ||
              !nombre.trim() ||
              !precio.trim() ||
              !servicioId
                ? "bg-gray-700 cursor-not-allowed text-gray-400 border border-gray-600"
                : editando
                ? "bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border border-blue-500 shadow-lg hover:shadow-xl"
                : "bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white border border-amber-500 shadow-lg hover:shadow-xl"
            }`}
          >
            {loading || loadingEdicion ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{editando ? "Actualizando..." : "Creando..."}</span>
              </>
            ) : (
              <>
                <span className="text-xl">{editando ? "" : "+"}</span>
                <span>
                  {editando ? "Actualizar Subservicio" : "Crear Subservicio"}
                </span>
              </>
            )}
          </button>

          {editando && (
            <button
              onClick={cancelarEdicion}
              className="px-4 md:px-6 py-3 bg-gray-800 hover:bg-gray-700 border-2 border-amber-500/30 text-amber-300 rounded-xl font-medium transition-colors text-sm md:text-base"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
      {/* ============ VISTA MÓVIL ============ */}
      <div className="md:hidden">
        {/* Encabezado móvil */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-amber-300">Subservicios</h3>
          <div className="bg-gray-800/50 border border-amber-500/30 px-3 py-1 rounded-lg">
            <span className="text-amber-300 text-sm">Total: </span>
            <span className="font-bold text-amber-400">
              {subservicios.length}
            </span>
          </div>
        </div>

        {/* Mensaje vacío */}
        {subservicios.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-amber-500/20 rounded-xl mb-6">
            <div className="text-amber-500/50 text-4xl mb-3">📋</div>
            <p className="text-amber-300 font-medium">No hay subservicios</p>
            <p className="text-amber-500/70 text-xs mt-1">
              Crea tu primer subservicio abajo
            </p>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {subservicios.map((ss) => (
              <div
                key={ss.ID}
                className={`bg-gray-800/30 border-2 border-amber-500/20 rounded-xl p-4 ${
                  editando && subservicioEditando?.ID === ss.ID
                    ? "bg-blue-900/30 border-blue-500/30"
                    : ""
                }`}
              >
                {/* Header de la tarjeta */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-amber-400">
                        #{ss.ID}
                      </span>
                      <span className="px-2 py-0.5 bg-amber-900/50 text-amber-300 border border-amber-500/30 rounded-full text-xs">
                        {ss.SERVICIO_NOMBRE || "Sin servicio"}
                      </span>
                    </div>
                    <h4 className="font-bold text-amber-300 text-base">
                      {ss.NOMBRE}
                    </h4>
                  </div>

                  {/* Precio */}
                  <span className="text-lg font-bold text-green-400 whitespace-nowrap ml-2">
                    ${parseFloat(ss.PRECIO || 0).toLocaleString()}
                  </span>
                </div>

                {/* Duración */}
                <div className="mb-3">
                  <span className="px-2 py-1 bg-purple-900/30 text-purple-300 border border-purple-500/30 rounded-full text-xs">
                    {ss.DURACION_MINUTOS || 60} min
                  </span>
                </div>

                {/* Descripción */}
                <div className="mb-4">
                  {ss.DESCRIPCION ? (
                    <p className="text-sm text-gray-300">{ss.DESCRIPCION}</p>
                  ) : (
                    <span className="text-gray-500 text-sm italic">
                      Sin descripción
                    </span>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2">
                  <button
                    onClick={() => iniciarEdicion(ss)}
                    className="flex-1 px-3 py-2 bg-blue-900/30 text-blue-300 hover:bg-blue-800/50 border border-blue-500/30 rounded-lg text-sm transition-colors flex items-center justify-center gap-1"
                  >
                    <span>✏️</span>
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => eliminarSubservicio(ss.ID)}
                    className="flex-1 px-3 py-2 bg-red-900/30 text-red-300 hover:bg-red-800/50 border border-red-500/30 rounded-lg text-sm transition-colors flex items-center justify-center gap-1"
                  >
                    <span>🗑️</span>
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============ VISTA DESKTOP ============ */}
      <div className="hidden md:block">
        {/* Lista de Subservicios - TABLA DESKTOP */}
        <div>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h3 className="text-xl font-bold text-amber-300">
              Subservicios Registrados
            </h3>
            <div className="bg-gray-800/50 border border-amber-500/30 px-4 py-2 rounded-xl">
              <span className="text-amber-300">Total: </span>
              <span className="font-bold text-amber-400 text-xl">
                {subservicios.length}
              </span>
            </div>
          </div>

          {subservicios.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-amber-500/20 rounded-2xl">
              <div className="text-amber-500/50 text-6xl mb-4">📋</div>
              <p className="text-amber-300 text-lg font-medium">
                No hay subservicios registrados
              </p>
              <p className="text-amber-500/70 text-sm mt-2">
                Crea tu primer subservicio usando el formulario de arriba
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border-2 border-amber-500/20">
              <table className="min-w-full divide-y divide-amber-500/20">
                <thead className="bg-linear-to-r from-amber-700/50 to-amber-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-amber-300 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Servicio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Subservicio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Duración
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800/30 divide-y divide-amber-500/10">
                  {subservicios.map((ss) => (
                    <tr
                      key={ss.ID}
                      className={`hover:bg-gray-700/50 transition-colors ${
                        editando && subservicioEditando?.ID === ss.ID
                          ? "bg-blue-900/30"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-amber-400">
                          #{ss.ID}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-block px-3 py-1 bg-amber-900/50 text-amber-300 border border-amber-500/30 rounded-full text-xs font-medium">
                          {ss.SERVICIO_NOMBRE || "Sin servicio"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-amber-300">
                          {ss.NOMBRE}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-green-400">
                          ${parseFloat(ss.PRECIO || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-purple-900/30 text-purple-300 border border-purple-500/30 rounded-full text-sm font-medium">
                          {ss.DURACION_MINUTOS || 60} min
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          {ss.DESCRIPCION ? (
                            <p className="text-sm text-gray-300 line-clamp-2">
                              {ss.DESCRIPCION}
                            </p>
                          ) : (
                            <span className="text-gray-500 text-sm italic">
                              Sin descripción
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => iniciarEdicion(ss)}
                            className="px-3 py-1 bg-blue-900/30 text-blue-300 hover:bg-blue-800/50 border border-blue-500/30 rounded text-sm transition-colors flex items-center space-x-1"
                            title="Editar subservicio"
                          >
                            <span>✏️</span>
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => eliminarSubservicio(ss.ID)}
                            className="px-3 py-1 bg-red-900/30 text-red-300 hover:bg-red-800/50 border border-red-500/30 rounded text-sm transition-colors flex items-center space-x-1"
                            title="Eliminar subservicio"
                          >
                            <span>🗑️</span>
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      {subservicios.length > 0 && (
        <div className="mt-6 mb-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-blue-900/20 p-3 md:p-4 rounded-xl border border-blue-500/30">
            <p className="text-lg md:text-2xl font-bold text-blue-300">
              {subservicios.length}
            </p>
            <p className="text-xs md:text-sm text-gray-400">
              Total subservicios
            </p>
          </div>
          <div className="bg-green-900/20 p-3 md:p-4 rounded-xl border border-green-500/30">
            <p className="text-lg md:text-2xl font-bold text-green-300">
              $
              {subservicios
                .reduce((sum, ss) => sum + parseFloat(ss.PRECIO || 0), 0)
                .toLocaleString()}
            </p>
            <p className="text-xs md:text-sm text-gray-400">Valor total</p>
          </div>
          <div className="bg-purple-900/20 p-3 md:p-4 rounded-xl border border-purple-500/30">
            <p className="text-lg md:text-2xl font-bold text-purple-300">
              {servicios.length}
            </p>
            <p className="text-xs md:text-sm text-gray-400">
              Servicios disponibles
            </p>
          </div>
          <div className="bg-amber-900/20 p-3 md:p-4 rounded-xl border border-amber-500/30">
            <p className="text-lg md:text-2xl font-bold text-amber-300">
              {Math.round(
                subservicios.reduce(
                  (sum, ss) => sum + (ss.DURACION_MINUTOS || 60),
                  0,
                ) / subservicios.length,
              )}{" "}
              min
            </p>
            <p className="text-xs md:text-sm text-gray-400">
              Duración promedio
            </p>
          </div>
        </div>
      )}
    </div>
  );
}