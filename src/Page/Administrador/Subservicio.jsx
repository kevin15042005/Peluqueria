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
    setDuracion(subservicio.DURACION_MINUTOS || subservicio.duracionMinutos || "60");
    
    // Desplazar al formulario
    document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' });
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
        setSubservicioCreado(prev => !prev);
        
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
      const res = await fetch(`${API}/subservicio/actualizar_subservicio/${subservicioEditando.ID}`, {
        method: "PUT",
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
        setMensaje("✅ Subservicio actualizado correctamente");
        // Limpiar formulario y salir del modo edición
        cancelarEdicion();
        
        // Actualizar lista automáticamente
        setSubservicioCreado(prev => !prev);
        
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

  // Eliminar subservicio
  const eliminarSubservicio = async (subservicioId) => {
    if (!confirm("¿Estás seguro de eliminar este subservicio? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      const res = await fetch(`${API}/subservicio/eliminar/${subservicioId}`, {
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
        setSubservicioCreado(prev => !prev);
        
        setTimeout(() => {
          setMensaje("");
        }, 3000);
      } else {
        setMensaje(`❌ ${data.message || "Error al eliminar subservicio"}`);
      }
    } catch (error) {
      console.error("Error al eliminar subservicio:", error);
      // Si no hay endpoint, simulamos eliminación local
      setSubservicios(prev => prev.filter(ss => ss.ID !== subservicioId));
      setMensaje("✅ Subservicio eliminado (localmente)");
      
      setTimeout(() => {
        setMensaje("");
      }, 3000);
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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">✨ Administrar Subservicios</h2>
        <button
          onClick={recargarDatos}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
        >
          <span>🔄</span>
          <span>Actualizar</span>
        </button>
      </div>

      {mensaje && (
        <div className={`mb-6 p-4 rounded-lg border flex items-center animate-pulse ${
          mensaje.includes('✅') 
            ? 'bg-green-100 text-green-800 border-green-200' 
            : mensaje.includes('❌')
            ? 'bg-red-100 text-red-800 border-red-200'
            : 'bg-blue-100 text-blue-800 border-blue-200'
        }`}>
          <span className="mr-3 text-xl">
            {mensaje.includes('✅') ? '✅' : mensaje.includes('❌') ? '❌' : '🔄'}
          </span>
          <span>{mensaje.replace('✅', '').replace('❌', '').replace('🔄', '').trim()}</span>
        </div>
      )}

      {/* Formulario */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            {editando ? `✏️ Editando: ${subservicioEditando?.NOMBRE}` : '➕ Crear Nuevo Subservicio'}
          </h3>
          {editando && (
            <button
              onClick={cancelarEdicion}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar edición
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Servicio *
            </label>
            <select
              value={servicioId}
              onChange={(e) => setServicioId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Seleccione un servicio</option>
              {servicios.map((s) => (
                <option key={s.ID} value={s.ID}>
                  {s.NOMBRE}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del subservicio *
            </label>
            <input
              type="text"
              placeholder="Ej: Corte Caballero"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  editando ? actualizarSubservicio() : crearSubservicio();
                }
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio ($) *
            </label>
            <input
              type="number"
              placeholder="Ej: 15000"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              min="0"
              step="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duración (min) *
            </label>
            <select
              value={duracion}
              onChange={(e) => setDuracion(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="15">15 minutos</option>
              <option value="30">30 minutos</option>
              <option value="45">45 minutos</option>
              <option value="60">1 hora</option>
              <option value="90">1 hora 30 min</option>
              <option value="120">2 horas</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción (opcional)
          </label>
          <textarea
            placeholder="Ej: Corte básico para hombres con lavado incluido"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors h-32"
          />
        </div>

        <div className="flex space-x-4">
          <button
            onClick={editando ? actualizarSubservicio : crearSubservicio}
            disabled={loading || loadingEdicion || !nombre.trim() || !precio.trim() || !servicioId}
            className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
              loading || loadingEdicion || !nombre.trim() || !precio.trim() || !servicioId
                ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                : editando
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {loading || loadingEdicion ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{editando ? 'Actualizando...' : 'Creando...'}</span>
              </>
            ) : (
              <>
                <span className="text-xl">{editando ? '✏️' : '+'}</span>
                <span>{editando ? 'Actualizar Subservicio' : 'Crear Subservicio'}</span>
              </>
            )}
          </button>

          {editando && (
            <button
              onClick={cancelarEdicion}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Lista de Subservicios */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Subservicios Registrados</h3>
          <div className="text-sm text-gray-600">
            Total: <span className="font-bold text-blue-600">{subservicios.length}</span>
          </div>
        </div>
        
        {subservicios.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-gray-500">No hay subservicios registrados</p>
            <p className="text-gray-400 text-sm mt-2">
              Crea tu primer subservicio usando el formulario de arriba
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Servicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subservicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duración
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subservicios.map((ss) => (
                  <tr 
                    key={ss.ID} 
                    className={`hover:bg-gray-50 transition-colors group ${
                      editando && subservicioEditando?.ID === ss.ID ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">#{ss.ID}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {ss.SERVICIO_NOMBRE || "Sin servicio"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {ss.NOMBRE}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-green-600">
                        ${parseFloat(ss.PRECIO || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                        {ss.DURACION_MINUTOS || 60} min
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        {ss.DESCRIPCION ? (
                          <p className="text-sm text-gray-600 line-clamp-2">{ss.DESCRIPCION}</p>
                        ) : (
                          <span className="text-gray-400 text-sm italic">Sin descripción</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => iniciarEdicion(ss)}
                          className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-sm transition-colors flex items-center space-x-1"
                          title="Editar subservicio"
                        >
                          <span>✏️</span>
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => eliminarSubservicio(ss.ID)}
                          className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-sm transition-colors flex items-center space-x-1"
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

      {/* Estadísticas */}
      {subservicios.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <p className="text-2xl font-bold text-blue-700">{subservicios.length}</p>
            <p className="text-sm text-gray-600">Total subservicios</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <p className="text-2xl font-bold text-green-700">
              ${subservicios.reduce((sum, ss) => sum + parseFloat(ss.PRECIO || 0), 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Valor total</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
            <p className="text-2xl font-bold text-purple-700">
              {servicios.length}
            </p>
            <p className="text-sm text-gray-600">Servicios disponibles</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
            <p className="text-2xl font-bold text-yellow-700">
              {Math.round(subservicios.reduce((sum, ss) => sum + (ss.DURACION_MINUTOS || 60), 0) / subservicios.length)} min
            </p>
            <p className="text-sm text-gray-600">Duración promedio</p>
          </div>
        </div>
      )}
    </div>
  );
}