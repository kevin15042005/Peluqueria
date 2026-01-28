// Page/Empleado/Asistencia.jsx
import React, { useState, useEffect } from "react";
import { 
  Play, 
  CheckCircle, 
  Clock, 
  User, 
  Phone, 
  Scissors, 
  RefreshCw,
  Calendar
} from "lucide-react";

export default function Turnos() {
  const [usuario, setUsuario] = useState(null);
  const [turnoActual, setTurnoActual] = useState(null);
  const [siguienteTurno, setSiguienteTurno] = useState(null);
  const [turnosCompletados, setTurnosCompletados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCompletados, setLoadingCompletados] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const API = import.meta.env.VITE_API_URL;

  // Función auxiliar para convertir hora HH:MM a minutos
  const convertirHoraAMinutos = (horaString) => {
    if (!horaString) return 0;
    const horaFormateada = horaString.length === 4 ? `0${horaString}` : horaString;
    const [horas, minutos] = horaFormateada.substring(0, 5).split(':').map(Number);
    return horas * 60 + minutos;
  };

  // Cargar usuario
  useEffect(() => {
    const userData = localStorage.getItem("USER");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUsuario(parsedUser);
      cargarTurnos(parsedUser.ID);
      cargarTurnosCompletados(parsedUser.ID);
    }
  }, []);

  // Cargar turnos del empleado
  const cargarTurnos = async (empleadoId) => {
    setLoading(true);
    try {
      const resActual = await fetch(`${API}/turnos/mis-turnos/${empleadoId}`);
      const dataActual = await resActual.json();
      
      console.log("Turnos cargados:", dataActual);
      
      if (dataActual.success && dataActual.data) {
        // Filtrar solo los turnos de hoy
        const hoy = new Date().toISOString().split('T')[0];
        const turnosHoy = dataActual.data.filter(turno => turno.FECHA === hoy);
        
        // Ordenar turnos por hora de inicio (ascendente)
        const turnosOrdenados = [...turnosHoy].sort((a, b) => {
          const horaA = convertirHoraAMinutos(a.HORA_INICIO || a.HORA_SELECCIONADA);
          const horaB = convertirHoraAMinutos(b.HORA_INICIO || b.HORA_SELECCIONADA);
          return horaA - horaB;
        });
        
        console.log("Turnos ordenados:", turnosOrdenados);
        
        // Buscar turno en atención (confirmado)
        const turnoEnAtencion = turnosOrdenados.find(t => t.ESTADO === 'confirmado');
        if (turnoEnAtencion) {
          setTurnoActual(turnoEnAtencion);
        } else {
          setTurnoActual(null);
        }
        
        // Buscar siguiente turno pendiente
        const siguientePendiente = turnosOrdenados.find(t => t.ESTADO === 'pendiente');
        setSiguienteTurno(siguientePendiente || null);
      }
    } catch (error) {
      console.error("Error cargando turnos:", error);
      setMensaje("Error al cargar turnos");
    } finally {
      setLoading(false);
    }
  };

  // Cargar turnos completados hoy
  const cargarTurnosCompletados = async (empleadoId) => {
    setLoadingCompletados(true);
    try {
      const res = await fetch(`${API}/turnos/mis-turnos/${empleadoId}`);
      const data = await res.json();
      
      if (data.success && data.data) {
        // Filtrar solo los completados de hoy
        const hoy = new Date().toISOString().split('T')[0];
        const completadosHoy = data.data.filter(turno => 
          turno.ESTADO === 'completado' && 
          turno.FECHA === hoy
        );
        
        // Ordenar completados por hora
        const completadosOrdenados = completadosHoy.sort((a, b) => {
          const horaA = convertirHoraAMinutos(a.HORA_INICIO || a.HORA_SELECCIONADA);
          const horaB = convertirHoraAMinutos(b.HORA_INICIO || b.HORA_SELECCIONADA);
          return horaA - horaB;
        });
        
        setTurnosCompletados(completadosOrdenados);
        console.log("Turnos completados hoy:", completadosOrdenados);
      }
    } catch (error) {
      console.error("Error cargando turnos completados:", error);
    } finally {
      setLoadingCompletados(false);
    }
  };

  // Iniciar atención de un turno
  const iniciarTurno = async (turnoId) => {
    try {
      const res = await fetch(`${API}/turnos/iniciar-turno`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnoId })
      });

      const data = await res.json();
      if (data.success) {
        setMensaje("✅ Turno iniciado - Atendiendo cliente");
        cargarTurnos(usuario.ID);
        cargarTurnosCompletados(usuario.ID);
      } else {
        setMensaje(`❌ ${data.message || "Error al iniciar turno"}`);
      }
    } catch (error) {
      console.error("Error iniciando turno:", error);
      setMensaje("❌ Error de conexión");
    }
  };

  // Completar turno actual - VERSIÓN SIMPLIFICADA
  const completarTurno = async () => {
    if (!turnoActual || !usuario) return;

    try {
      console.log("Completando turno:", turnoActual.ID, "Empleado:", usuario.ID);
      
      // Usar la misma ruta que el administrador pero con el ID del empleado
      const res = await fetch(`${API}/turnos/finalizar-turno`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          turnoId: turnoActual.ID,
          empleadoId: usuario.ID
        })
      });

      // Verificar si la respuesta es JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Respuesta no JSON:", text.substring(0, 200));
        setMensaje("❌ Error en el servidor (respuesta no JSON)");
        return;
      }

      const data = await res.json();
      console.log("Respuesta completar turno:", data);
      
      if (data.success) {
        setTurnoActual(null);
        setMensaje("✅ ¡Turno completado! Cliente atendido");
        
        // Recargar todos los datos después de un breve delay
        setTimeout(() => {
          cargarTurnos(usuario.ID);
          cargarTurnosCompletados(usuario.ID);
        }, 1000);
      } else {
        setMensaje(`❌ ${data.message || "Error al completar turno"}`);
      }
    } catch (error) {
      console.error("Error completando turno:", error);
      setMensaje("❌ Error de conexión al servidor");
    }
  };

  // Función para recargar todo
  const recargarTodo = () => {
    if (usuario) {
      cargarTurnos(usuario.ID);
      cargarTurnosCompletados(usuario.ID);
      setMensaje("🔄 Datos actualizados");
    }
  };

  // Formatear hora
  const formatearHora = (horaString) => {
    if (!horaString) return "--:--";
    if (horaString.length === 4) return `0${horaString}`.substring(0, 5);
    return horaString.substring(0, 5);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                📋 Panel de Turnos - Empleado
              </h1>
              <p className="text-gray-600 mt-2">
                {usuario?.NOMBRE} - Gestiona tus turnos del día
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
                <Calendar size={20} />
                <span>{new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <button
                onClick={recargarTodo}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
              >
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                <span>Actualizar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mensajes */}
        {mensaje && (
          <div className={`mb-6 p-4 rounded-lg animate-pulse ${
            mensaje.includes("✅") || mensaje.includes("🔄") 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          }`}>
            {mensaje}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* COLUMNA IZQUIERDA: TURNO ACTUAL */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Play className="mr-2 text-green-600" />
                Turno en Atención
              </h2>
              {turnoActual && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                  EN ATENCIÓN
                </span>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando turnos...</p>
              </div>
            ) : turnoActual ? (
              <div className="space-y-6">
                {/* Info Cliente */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-center mb-4">
                    <User className="text-blue-600 mr-3" size={24} />
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {turnoActual.CLIENTE_NOMBRE || "Cliente"}
                      </h3>
                      {turnoActual.CLIENTE_TELEFONO && (
                        <p className="text-gray-600 flex items-center mt-1">
                          <Phone size={16} className="mr-2" />
                          {turnoActual.CLIENTE_TELEFONO}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Info Servicio */}
                  <div className="border-t border-blue-200 pt-4">
                    <div className="flex items-center mb-3">
                      <Scissors className="text-purple-600 mr-3" size={20} />
                      <div>
                        <p className="font-semibold text-gray-800">
                          {turnoActual.SERVICIO} - {turnoActual.SUBSERVICIO}
                        </p>
                        <p className="text-sm text-gray-600">
                          Duración estimada: {turnoActual.DURACION_MINUTOS || 60} min
                        </p>
                      </div>
                    </div>

                    {/* Horario */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-white p-3 rounded-lg border">
                        <p className="text-sm text-gray-600">Hora Programada</p>
                        <p className="font-bold text-blue-700">
                          {formatearHora(turnoActual.HORA_INICIO)}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border">
                        <p className="text-sm text-gray-600">Hora Estimada Fin</p>
                        <p className="font-bold text-green-700">
                          {formatearHora(turnoActual.HORA_FIN)}
                        </p>
                      </div>
                    </div>

                    {/* Horas reales */}
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {turnoActual.HORA_INICIO_REAL && (
                        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-sm text-gray-600">Inicio Real</p>
                          <p className="font-bold text-yellow-700">
                            {formatearHora(turnoActual.HORA_INICIO_REAL)}
                          </p>
                        </div>
                      )}
                      {turnoActual.HORA_FIN_REAL && (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm text-gray-600">Fin Real</p>
                          <p className="font-bold text-green-700">
                            {formatearHora(turnoActual.HORA_FIN_REAL)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botón Completar */}
                <button
                  onClick={completarTurno}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle size={24} />
                  <span>Marcar como Completado</span>
                </button>

                <p className="text-sm text-gray-500 text-center">
                  Al completar, se mostrará automáticamente el siguiente cliente
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">😴</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  Sin turnos en atención
                </h3>
                <p className="text-gray-600 mb-6">
                  No hay ningún cliente siendo atendido actualmente
                </p>
                {siguienteTurno && (
                  <button
                    onClick={() => iniciarTurno(siguienteTurno.ID)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Iniciar siguiente turno
                  </button>
                )}
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA: SIGUIENTE TURNO */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Clock className="mr-2 text-yellow-600" />
                Próximo Turno
              </h2>
              {siguienteTurno && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">
                  PENDIENTE
                </span>
              )}
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : siguienteTurno ? (
              <div className="space-y-6">
                {/* Info Siguiente Cliente */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
                  <div className="flex items-center mb-4">
                    <User className="text-yellow-600 mr-3" size={24} />
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {siguienteTurno.CLIENTE_NOMBRE || "Cliente"}
                      </h3>
                      {siguienteTurno.CLIENTE_TELEFONO && (
                        <p className="text-gray-600 flex items-center mt-1">
                          <Phone size={16} className="mr-2" />
                          {siguienteTurno.CLIENTE_TELEFONO}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Info Servicio */}
                  <div className="border-t border-yellow-200 pt-4">
                    <div className="flex items-center mb-3">
                      <Scissors className="text-purple-600 mr-3" size={20} />
                      <div>
                        <p className="font-semibold text-gray-800">
                          {siguienteTurno.SERVICIO} - {siguienteTurno.SUBSERVICIO}
                        </p>
                        <p className="text-sm text-gray-600">
                          Duración: {siguienteTurno.DURACION_MINUTOS || 60} min
                        </p>
                      </div>
                    </div>

                    {/* Horario */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-white p-3 rounded-lg border">
                        <p className="text-sm text-gray-600">Horario Cita</p>
                        <p className="font-bold text-gray-800">
                          {formatearHora(siguienteTurno.HORA_INICIO || siguienteTurno.HORA_SELECCIONADA)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {siguienteTurno.FECHA ? new Date(siguienteTurno.FECHA).toLocaleDateString('es-ES') : ''}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border">
                        <p className="text-sm text-gray-600">Orden del día</p>
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                          #1
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botón Iniciar */}
                <button
                  onClick={() => iniciarTurno(siguienteTurno.ID)}
                  disabled={!!turnoActual}
                  className={`w-full py-4 font-bold rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg ${
                    turnoActual
                      ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
                  }`}
                >
                  <Play size={24} />
                  <span>
                    {turnoActual ? 'Termina el turno actual primero' : 'Iniciar Atención'}
                  </span>
                </button>

                {/* Información */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <span className="font-bold">Instrucción:</span> 
                    Para atender a este cliente, primero debes completar el turno actual (si hay uno en curso).
                    Los turnos se muestran en orden cronológico (de más temprano a más tarde).
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  No hay turnos pendientes
                </h3>
                <p className="text-gray-600">
                  Todos los turnos del día han sido atendidos o no hay citas programadas
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Turnos Completados Hoy */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <CheckCircle className="mr-2 text-green-600" />
              Turnos Completados Hoy
            </h2>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                {turnosCompletados.length} {turnosCompletados.length === 1 ? 'turno' : 'turnos'}
              </span>
              <button
                onClick={() => cargarTurnosCompletados(usuario?.ID)}
                disabled={loadingCompletados}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700"
              >
                <RefreshCw size={14} className={loadingCompletados ? "animate-spin" : ""} />
                <span>Actualizar</span>
              </button>
            </div>
          </div>

          {loadingCompletados ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando turnos completados...</p>
            </div>
          ) : turnosCompletados.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-gray-500">
                Aún no has completado ningún turno hoy
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orden
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Servicio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hora Cita
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inicio Real
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fin Real
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duración
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {turnosCompletados.map((turno, index) => (
                    <tr key={turno.ID} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-block w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User size={16} className="text-gray-400 mr-2" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {turno.CLIENTE_NOMBRE || "Cliente"}
                            </div>
                            {turno.CLIENTE_TELEFONO && (
                              <div className="text-xs text-gray-500">
                                {turno.CLIENTE_TELEFONO}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {turno.SUBSERVICIO}
                        </div>
                        <div className="text-xs text-gray-500">
                          {turno.SERVICIO}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatearHora(turno.HORA_INICIO || turno.HORA_SELECCIONADA)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatearHora(turno.HORA_INICIO_REAL) || "--:--"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatearHora(turno.HORA_FIN_REAL) || "--:--"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {turno.DURACION_REAL_MINUTOS ? (
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              turno.DURACION_REAL_MINUTOS > (turno.DURACION_MINUTOS || 60)
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {turno.DURACION_REAL_MINUTOS} min
                              {turno.DURACION_REAL_MINUTOS > (turno.DURACION_MINUTOS || 60) && ' ⏱️'}
                            </span>
                          ) : (
                            <span className="text-gray-400">--</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Resumen estadístico */}
          {turnosCompletados.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{turnosCompletados.length}</p>
                  <p className="text-xs text-gray-600">Total atendidos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {turnosCompletados.filter(t => 
                      t.DURACION_REAL_MINUTOS && 
                      t.DURACION_REAL_MINUTOS <= (t.DURACION_MINUTOS || 60)
                    ).length}
                  </p>
                  <p className="text-xs text-gray-600">A tiempo</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {turnosCompletados.filter(t => 
                      t.DURACION_REAL_MINUTOS && 
                      t.DURACION_REAL_MINUTOS > (t.DURACION_MINUTOS || 60)
                    ).length}
                  </p>
                  <p className="text-xs text-gray-600">Con retraso</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {turnosCompletados.reduce((sum, t) => 
                      sum + (t.DURACION_REAL_MINUTOS || 0), 0
                    )} min
                  </p>
                  <p className="text-xs text-gray-600">Tiempo total</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Información del sistema */}
        <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-3">ℹ️ Información del sistema:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700">Para empleados:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <span className="font-medium">Iniciar turno:</span> Marca al cliente como "en atención"</li>
                <li>• <span className="font-medium">Completar turno:</span> Registra la hora real de finalización</li>
                <li>• Los turnos se ordenan automáticamente por hora</li>
                <li>• Solo puedes atender un cliente a la vez</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700">Para administradores:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Pueden completar cualquier turno desde el monitor</li>
                <li>• Visualizan todos los turnos activos en tiempo real</li>
                <li>• Pueden intervenir si un empleado no completa un turno</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}