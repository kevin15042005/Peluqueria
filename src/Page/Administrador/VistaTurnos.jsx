// Page/Administrador/MonitorTurnos.jsx
import React, { useState, useEffect } from "react";
import { 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  User, 
  AlertCircle,
  Calendar,
  Scissors,
  Phone,
  History,
  CheckSquare,
  PlayCircle,
  Timer
} from "lucide-react";

export default function MonitorTurnos() {
  const [turnosActivos, setTurnosActivos] = useState([]);
  const [historialTurnos, setHistorialTurnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  const API = import.meta.env.VITE_API_URL;

  // Cargar turnos activos
  const cargarTurnosActivos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/turnos/activos-hoy`);
      const data = await res.json();
      
      if (data.success) {
        // Ordenar turnos por hora de inicio
        const turnosOrdenados = data.turnos.sort((a, b) => {
          const horaA = convertirHoraAMinutos(a.HORA_INICIO);
          const horaB = convertirHoraAMinutos(b.HORA_INICIO);
          return horaA - horaB;
        });
        setTurnosActivos(turnosOrdenados || []);
      }
    } catch (error) {
      console.error("Error cargando turnos activos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar historial de turnos completados hoy
  const cargarHistorialTurnos = async () => {
    setLoadingHistorial(true);
    try {
      const hoy = new Date().toISOString().split('T')[0];
      const res = await fetch(`${API}/turnos/turnos-por-fecha/${hoy}`);
      const data = await res.json();
      
      if (data.success) {
        // Filtrar solo los completados
        const completados = data.turnos.filter(t => t.ESTADO === 'completado');
        setHistorialTurnos(completados);
      }
    } catch (error) {
      console.error("Error cargando historial de turnos:", error);
    } finally {
      setLoadingHistorial(false);
    }
  };

  // Cargar automáticamente cada 30 segundos
  useEffect(() => {
    cargarTurnosActivos();
    cargarHistorialTurnos();
    
    const intervalo = setInterval(() => {
      cargarTurnosActivos();
      if (mostrarHistorial) {
        cargarHistorialTurnos();
      }
    }, 30000); // 30 segundos

    return () => clearInterval(intervalo);
  }, [mostrarHistorial]);

  // Marcar turno como completado (admin)
  const completarTurnoAdmin = async (turnoId) => {
    try {
      // Primero finalizar el turno (marcar hora real de fin)
      const resFin = await fetch(`${API}/turnos/finalizar-turno`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnoId })
      });

      const dataFin = await resFin.json();
      
      if (dataFin.success) {
        // Luego marcar como completado con empleadoId 0 (admin)
        const resCompletar = await fetch(`${API}/turnos/completar-turno`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            turnoId,
            empleadoId: 0 // Admin puede completar cualquier turno
          })
        });

        const dataCompletar = await resCompletar.json();
        if (dataCompletar.success) {
          setMensaje("✅ Turno completado por administrador");
          // Recargar datos
          cargarTurnosActivos();
          if (mostrarHistorial) {
            cargarHistorialTurnos();
          }
        } else {
          setMensaje(`❌ ${dataCompletar.message || "Error al completar turno"}`);
        }
      } else {
        setMensaje(`❌ ${dataFin.message || "Error al finalizar turno"}`);
      }
    } catch (error) {
      console.error("Error completando turno:", error);
      setMensaje("❌ Error de conexión");
    }
  };

  // Iniciar turno desde admin
  const iniciarTurnoAdmin = async (turnoId) => {
    try {
      const res = await fetch(`${API}/turnos/iniciar-turno`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnoId })
      });

      const data = await res.json();
      if (data.success) {
        setMensaje("✅ Turno iniciado por administrador");
        cargarTurnosActivos();
      } else {
        setMensaje(`❌ ${data.message || "Error al iniciar turno"}`);
      }
    } catch (error) {
      console.error("Error iniciando turno:", error);
      setMensaje("❌ Error de conexión");
    }
  };

  // Cancelar turno
  const cancelarTurnoAdmin = async (turnoId) => {
    if (!confirm("¿Está seguro de cancelar este turno?")) return;
    
    try {
      const res = await fetch(`${API}/turnos/cancelar-turno`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnoId })
      });

      const data = await res.json();
      if (data.success) {
        setMensaje("✅ Turno cancelado");
        cargarTurnosActivos();
        if (mostrarHistorial) {
          cargarHistorialTurnos();
        }
      } else {
        setMensaje(`❌ ${data.message || "Error al cancelar turno"}`);
      }
    } catch (error) {
      console.error("Error cancelando turno:", error);
      setMensaje("❌ Error de conexión");
    }
  };

  // Formatear hora
  const formatearHora = (horaString) => {
    if (!horaString) return "--:--";
    if (horaString.length === 4) return `0${horaString}`.substring(0, 5);
    return horaString.substring(0, 5);
  };

  // Convertir hora a minutos para cálculos
  const convertirHoraAMinutos = (horaString) => {
    if (!horaString) return 0;
    const horaFormateada = horaString.length === 4 ? `0${horaString}` : horaString;
    const [horas, minutos] = horaFormateada.substring(0, 5).split(':').map(Number);
    return horas * 60 + minutos;
  };

  // Calcular hora fin basada en hora inicio y duración
  const calcularHoraFin = (horaInicio, duracionMinutos) => {
    if (!horaInicio || !duracionMinutos) return "--:--";
    
    const inicioMinutos = convertirHoraAMinutos(horaInicio);
    const finMinutos = inicioMinutos + parseInt(duracionMinutos);
    
    const horas = Math.floor(finMinutos / 60);
    const minutos = finMinutos % 60;
    
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
  };

  // Calcular diferencia de tiempo real
  const calcularDuracionReal = (horaInicioReal, horaFinReal) => {
    if (!horaInicioReal || !horaFinReal) return null;
    
    const inicio = convertirHoraAMinutos(horaInicioReal);
    const fin = convertirHoraAMinutos(horaFinReal);
    const diffMins = fin - inicio;
    
    return diffMins > 0 ? diffMins : null;
  };

  // Calcular próxima hora disponible
  const calcularProximaHoraDisponible = (turnos) => {
    if (turnos.length === 0) return "Ahora";
    
    // Tomar el último turno en atención o pendiente
    const ultimoTurno = turnos[turnos.length - 1];
    const ultimaHoraFin = ultimoTurno.HORA_FIN_REAL || calcularHoraFin(
      ultimoTurno.HORA_INICIO_REAL || ultimoTurno.HORA_INICIO,
      ultimoTurno.DURACION_MINUTOS || 60
    );
    
    return formatearHora(ultimaHoraFin);
  };

  // Obtener tiempo transcurrido desde inicio real
  const obtenerTiempoTranscurrido = (horaInicioReal) => {
    if (!horaInicioReal) return null;
    
    const inicio = convertirHoraAMinutos(horaInicioReal);
    const ahora = new Date();
    const ahoraMinutos = ahora.getHours() * 60 + ahora.getMinutes();
    
    const diffMins = ahoraMinutos - inicio;
    return diffMins > 0 ? diffMins : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                👁️ Monitor de Turnos - Administrador
              </h1>
              <p className="text-gray-600 mt-2">
                Gestión de turnos en tiempo real - {new Date().toLocaleDateString('es-ES')}
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
                onClick={() => {
                  cargarTurnosActivos();
                  if (mostrarHistorial) cargarHistorialTurnos();
                  setMensaje("🔄 Datos actualizados");
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                <span>Actualizar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mensajes */}
        {mensaje && (
          <div className={`mb-6 p-4 rounded-lg ${
            mensaje.includes("✅") || mensaje.includes("🔄") 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          }`}>
            {mensaje}
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-200">
            <div className="flex items-center">
              <Clock className="text-blue-600 mr-3" size={32} />
              <div>
                <p className="text-3xl font-bold text-blue-800">
                  {turnosActivos.length}
                </p>
                <p className="text-gray-600">Turnos Activos</p>
                {turnosActivos.length > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    Próximo disponible: {calcularProximaHoraDisponible(turnosActivos)}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-yellow-200">
            <div className="flex items-center">
              <AlertCircle className="text-yellow-600 mr-3" size={32} />
              <div>
                <p className="text-3xl font-bold text-yellow-800">
                  {turnosActivos.filter(t => t.ESTADO === 'pendiente').length}
                </p>
                <p className="text-gray-600">En Espera</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-green-200">
            <div className="flex items-center">
              <PlayCircle className="text-green-600 mr-3" size={32} />
              <div>
                <p className="text-3xl font-bold text-green-800">
                  {turnosActivos.filter(t => t.ESTADO === 'confirmado').length}
                </p>
                <p className="text-gray-600">En Atención</p>
                {turnosActivos.filter(t => t.ESTADO === 'confirmado').length > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    En curso: {turnosActivos.filter(t => t.ESTADO === 'confirmado').length}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-200">
            <div className="flex items-center">
              <CheckSquare className="text-purple-600 mr-3" size={32} />
              <div>
                <p className="text-3xl font-bold text-purple-800">
                  {historialTurnos.length}
                </p>
                <p className="text-gray-600">Completados Hoy</p>
                {historialTurnos.length > 0 && (
                  <p className="text-xs text-purple-600 mt-1">
                    Promedio: {Math.round(historialTurnos.reduce((sum, t) => {
                      const duracion = calcularDuracionReal(t.HORA_INICIO_REAL, t.HORA_FIN_REAL);
                      return sum + (duracion || 0);
                    }, 0) / historialTurnos.length)} min
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Botón para mostrar/ocultar historial */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => {
              setMostrarHistorial(!mostrarHistorial);
              if (!mostrarHistorial) {
                cargarHistorialTurnos();
              }
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            <History size={20} />
            <span>{mostrarHistorial ? "Ocultar Historial" : "Ver Historial"}</span>
          </button>
        </div>

        {/* Turnos Activos */}
        <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Clock className="mr-2 text-blue-600" />
              Turnos Activos Hoy
            </h2>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                {turnosActivos.length} activos
              </span>
              {turnosActivos.length > 0 && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                  Siguiente: {calcularProximaHoraDisponible(turnosActivos)}
                </span>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando turnos activos...</p>
            </div>
          ) : turnosActivos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-gray-600 text-lg">
                No hay turnos activos en este momento
              </p>
              <p className="text-gray-500 mt-2">
                Todos los turnos han sido atendidos o no hay citas programadas
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empleado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Servicio / Duración
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Horario Programado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Horario Real / Fin Estimado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tiempo / Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {turnosActivos.map((turno) => {
                    const duracion = turno.DURACION_MINUTOS || 60;
                    const horaFinProgramada = calcularHoraFin(turno.HORA_INICIO, duracion);
                    const horaFinEstimada = turno.HORA_INICIO_REAL 
                      ? calcularHoraFin(turno.HORA_INICIO_REAL, duracion)
                      : null;
                    const tiempoTranscurrido = obtenerTiempoTranscurrido(turno.HORA_INICIO_REAL);
                    const tiempoRestante = tiempoTranscurrido !== null 
                      ? Math.max(0, duracion - tiempoTranscurrido)
                      : null;
                    
                    return (
                      <tr key={turno.ID} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User size={20} className="text-gray-400 mr-3" />
                            <div>
                              <div className="font-medium text-gray-900">
                                {turno.CLIENTE_NOMBRE || "Sin nombre"}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Phone size={12} className="mr-1" />
                                {turno.CLIENTE_TELEFONO || "Sin teléfono"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {turno.EMPLEADO}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Scissors size={16} className="text-gray-400 mr-2" />
                            <div>
                              <div className="font-medium text-gray-900">
                                {turno.SUBSERVICIO || turno.SERVICIO}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center">
                                <Timer size={12} className="mr-1" />
                                {duracion} minutos
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="text-gray-900 font-medium">
                              {formatearHora(turno.HORA_INICIO)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Fin: {formatearHora(horaFinProgramada)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {turno.FECHA ? new Date(turno.FECHA).toLocaleDateString('es-ES') : ''}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            {turno.HORA_INICIO_REAL ? (
                              <>
                                <div className="text-green-700 font-medium">
                                  Inicio: {formatearHora(turno.HORA_INICIO_REAL)}
                                </div>
                                <div className="text-blue-700">
                                  Fin estimado: {formatearHora(horaFinEstimada)}
                                </div>
                                {turno.HORA_FIN_REAL && (
                                  <div className="text-purple-700">
                                    Fin real: {formatearHora(turno.HORA_FIN_REAL)}
                                  </div>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400 text-sm">No iniciado</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              turno.ESTADO === 'pendiente' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {turno.ESTADO_TEXTO || turno.ESTADO}
                            </span>
                            
                            {tiempoTranscurrido !== null && (
                              <div className="text-xs">
                                <div className={`font-bold ${
                                  tiempoTranscurrido > duracion 
                                    ? 'text-red-600' 
                                    : tiempoTranscurrido > duracion * 0.8
                                    ? 'text-yellow-600'
                                    : 'text-green-600'
                                }`}>
                                  ⏱️ {tiempoTranscurrido}/{duracion} min
                                </div>
                                {tiempoRestante !== null && tiempoRestante > 0 && (
                                  <div className="text-gray-500">
                                    Restan: {tiempoRestante} min
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-2">
                            {turno.ESTADO === 'pendiente' && (
                              <button
                                onClick={() => iniciarTurnoAdmin(turno.ID)}
                                className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                              >
                                <PlayCircle size={14} />
                                <span>Iniciar</span>
                              </button>
                            )}
                            
                            {turno.ESTADO === 'confirmado' && (
                              <button
                                onClick={() => completarTurnoAdmin(turno.ID)}
                                className="flex items-center space-x-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                              >
                                <CheckCircle size={14} />
                                <span>Completar</span>
                              </button>
                            )}
                            
                            {(turno.ESTADO === 'pendiente' || turno.ESTADO === 'confirmado') && (
                              <button
                                onClick={() => cancelarTurnoAdmin(turno.ID)}
                                className="flex items-center space-x-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                              >
                                <span>Cancelar</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Historial de Turnos Completados */}
        {mostrarHistorial && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <History className="mr-2 text-purple-600" />
                Historial de Turnos Completados Hoy
              </h2>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-bold">
                  {historialTurnos.length} turnos
                </span>
              </div>
            </div>

            {loadingHistorial ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando historial...</p>
              </div>
            ) : historialTurnos.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-gray-500">
                  No hay turnos completados hoy
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Empleado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Servicio / Duración
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Horario Programado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Horario Real
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duración Real
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Eficiencia
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historialTurnos.map((turno) => {
                      const duracionEstimada = turno.DURACION_MINUTOS || 60;
                      const duracionReal = calcularDuracionReal(
                        turno.HORA_INICIO_REAL, 
                        turno.HORA_FIN_REAL
                      );
                      const horaFinProgramada = calcularHoraFin(turno.HORA_INICIO, duracionEstimada);
                      const diferencia = duracionReal ? duracionReal - duracionEstimada : null;
                      
                      return (
                        <tr key={turno.ID} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <User size={16} className="text-gray-400 mr-2" />
                              <div>
                                <div className="font-medium text-gray-900">
                                  {turno.CLIENTE_NOMBRE}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {turno.CLIENTE_TELEFONO}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {turno.EMPLEADO}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {turno.SUBSERVICIO || turno.SERVICIO}
                            </div>
                            <div className="text-xs text-gray-500">
                              Duración estimada: {duracionEstimada} min
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatearHora(turno.HORA_INICIO)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Fin estimado: {formatearHora(horaFinProgramada)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              <div className="text-gray-900">
                                Inicio: {formatearHora(turno.HORA_INICIO_REAL) || "--:--"}
                              </div>
                              <div className="text-gray-900">
                                Fin: {formatearHora(turno.HORA_FIN_REAL) || "--:--"}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              {duracionReal ? (
                                <div className="space-y-1">
                                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    duracionReal > duracionEstimada
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-green-100 text-green-800'
                                  }`}>
                                    {duracionReal} min
                                  </span>
                                  {diferencia !== null && (
                                    <div className={`text-xs ${diferencia > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                      {diferencia > 0 ? `+${diferencia}` : diferencia} min
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">--</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              {duracionReal ? (
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  duracionReal <= duracionEstimada
                                    ? 'bg-green-100 text-green-800'
                                    : duracionReal <= duracionEstimada * 1.2
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {Math.round((duracionEstimada / duracionReal) * 100)}% eficiencia
                                </span>
                              ) : (
                                <span className="text-gray-400">--</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Resumen estadístico del historial */}
            {historialTurnos.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-gray-700 mb-3">📈 Resumen del día:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{historialTurnos.length}</p>
                    <p className="text-xs text-gray-600">Total completados</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {historialTurnos.filter(t => {
                        const duracionReal = calcularDuracionReal(t.HORA_INICIO_REAL, t.HORA_FIN_REAL);
                        const duracionEstimada = t.DURACION_MINUTOS || 60;
                        return duracionReal && duracionReal <= duracionEstimada;
                      }).length}
                    </p>
                    <p className="text-xs text-gray-600">A tiempo</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {historialTurnos.filter(t => {
                        const duracionReal = calcularDuracionReal(t.HORA_INICIO_REAL, t.HORA_FIN_REAL);
                        const duracionEstimada = t.DURACION_MINUTOS || 60;
                        return duracionReal && duracionReal > duracionEstimada;
                      }).length}
                    </p>
                    <p className="text-xs text-gray-600">Con retraso</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {Math.round(historialTurnos.reduce((sum, t) => {
                        const duracionReal = calcularDuracionReal(t.HORA_INICIO_REAL, t.HORA_FIN_REAL);
                        return sum + (duracionReal || 0);
                      }, 0) / historialTurnos.length)} min
                    </p>
                    <p className="text-xs text-gray-600">Promedio real</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Información del sistema */}
        <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
          <h3 className="text-lg font-bold text-blue-800 mb-3">ℹ️ Funciones del Administrador:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">Cálculos de tiempo:</h4>
              <ul className="text-sm text-blue-600 space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-800 font-bold mr-2">•</span>
                  <span><strong>Duración estimada:</strong> Basada en configuración del servicio</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-800 font-bold mr-2">•</span>
                  <span><strong>Horario real:</strong> Marcado al iniciar/completar turno</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-800 font-bold mr-2">•</span>
                  <span><strong>Fin estimado:</strong> Hora inicio real + duración del servicio</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">Supervisión:</h4>
              <ul className="text-sm text-blue-600 space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-800 font-bold mr-2">•</span>
                  <span><strong>Tiempo transcurrido:</strong> Minutos desde inicio real</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-800 font-bold mr-2">•</span>
                  <span><strong>Eficiencia:</strong> Comparación duración real vs estimada</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-800 font-bold mr-2">•</span>
                  <span><strong>Próximo disponible:</strong> Basado en último turno</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}