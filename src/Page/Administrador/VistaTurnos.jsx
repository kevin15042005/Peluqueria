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
  Timer,
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
      const hoy = new Date().toISOString().split("T")[0];
      const res = await fetch(`${API}/turnos/turnos-por-fecha/${hoy}`);
      const data = await res.json();

      if (data.success) {
        // Filtrar solo los completados
        const completados = data.turnos.filter(
          (t) => t.ESTADO === "completado",
        );
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
    }, 30000);

    return () => clearInterval(intervalo);
  }, [mostrarHistorial]);

  const completarTurnoAdmin = async (turnoId) => {
    // 1. ELIMINACIÓN OPTIMISTA (Velocidad visual)
    // Filtramos el turno de la lista local INMEDIATAMENTE
    setTurnosActivos((prevTurnos) =>
      prevTurnos.filter((t) => t.ID !== turnoId),
    );
    setMensaje("✅ Procesando...");

    try {
      // 2. EJECUCIÓN EN PARALELO (Velocidad de red)
      const [ resComp] = await Promise.all([
        fetch(`${API}/turnos/finalizar-turno`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ turnoId: Number(turnoId) }),
        }),
        fetch(`${API}/turnos/completar-turno`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ turnoId: Number(turnoId), empleadoId: 0 }),
        }),
      ]);

      const dataComp = await resComp.json();

      if (dataComp.success) {
        setMensaje("✅ Turno completado exitosamente");

        await cargarTurnosActivos();
        if (mostrarHistorial) {
          await cargarHistorialTurnos();
        }
      } else {
        await cargarTurnosActivos();
      }
    } catch (error) {
      console.error("Error:", error);
      setMensaje("❌ Error de conexión, refrescando...");
      await cargarTurnosActivos();
    } finally {
      setTimeout(() => setMensaje(""), 3000);
    }
  };
  // Iniciar turno desde admin
  const iniciarTurnoAdmin = async (turnoId) => {
    try {
      const res = await fetch(`${API}/turnos/iniciar-turno`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnoId }),
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
        body: JSON.stringify({ turnoId }),
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
    const horaFormateada =
      horaString.length === 4 ? `0${horaString}` : horaString;
    const [horas, minutos] = horaFormateada
      .substring(0, 5)
      .split(":")
      .map(Number);
    return horas * 60 + minutos;
  };

  // Calcular hora fin basada en hora inicio y duración
  const calcularHoraFin = (horaInicio, duracionMinutos) => {
    if (!horaInicio || !duracionMinutos) return "--:--";

    const inicioMinutos = convertirHoraAMinutos(horaInicio);
    const finMinutos = inicioMinutos + parseInt(duracionMinutos);

    const horas = Math.floor(finMinutos / 60);
    const minutos = finMinutos % 60;

    return `${horas.toString().padStart(2, "0")}:${minutos.toString().padStart(2, "0")}`;
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
    const ultimaHoraFin =
      ultimoTurno.HORA_FIN_REAL ||
      calcularHoraFin(
        ultimoTurno.HORA_INICIO_REAL || ultimoTurno.HORA_INICIO,
        ultimoTurno.DURACION_MINUTOS || 60,
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
    <div className="min-h-screen my-12 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-black rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col gap-5 md:flex-row justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-amber-400">
                Monitor de Turnos - Administrador
              </h1>
              <p className="text-amber-400 mt-2 text-sm md:text-base">
                Gestión de turnos en tiempo real{" "}
                {new Date().toLocaleDateString("es-ES")}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 mt-4 md:mt-0">
              <div className="flex items-center border-[0.8px] space-x-2 bg-black text-amber-400 px-4 py-2 rounded-lg text-sm">
                <Calendar size={20} />
                <span className="hidden sm:inline">
                  {new Date().toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="sm:hidden">
                  {new Date().toLocaleDateString("es-ES")}
                </span>
              </div>
              <button
                onClick={() => {
                  cargarTurnosActivos();
                  if (mostrarHistorial) cargarHistorialTurnos();
                  setMensaje("🔄 Datos actualizados");
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-amber-200 border-[0.8px] border-amber-400 text-black rounded-lg hover:bg-white transition-colors text-sm"
              >
                <RefreshCw
                  size={20}
                  className={loading ? "animate-spin" : ""}
                />
                <span>Actualizar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mensajes */}
        {mensaje && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm md:text-base ${
              mensaje.includes("✅") || mensaje.includes("🔄")
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {mensaje}
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-amber-200 p-4 md:p-6 rounded-xl shadow-lg border border-blue-200">
            <div className="flex items-center">
              <Clock
                className="text-blue-500 font-extrabold mr-2 md:mr-3"
                size={24}
              />
              <div>
                <p className="text-xl md:text-3xl font-extrabold text-blue-500">
                  {turnosActivos.length}
                </p>
                <p className="text-black font-extrabold text-xs md:text-sm">
                  Turnos Activos
                </p>
                {turnosActivos.length > 0 && (
                  <p className="text-xs text-yello-300 mt-1 hidden md:block">
                    Próximo: {calcularProximaHoraDisponible(turnosActivos)}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-amber-200 p-4 md:p-6 rounded-xl shadow-lg border border-yellow-200">
            <div className="flex items-center">
              <AlertCircle className="text-yellow-600 mr-2 md:mr-3" size={24} />
              <div>
                <p className="text-xl md:text-3xl text-yellow-800 font-extrabold">
                  {turnosActivos.filter((t) => t.ESTADO === "pendiente").length}
                </p>
                <p className="text-black font-extrabold text-xs md:text-sm">
                  En Espera
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-200 p-4 md:p-6 rounded-xl shadow-lg border border-amber-200">
            <div className="flex items-center">
              <PlayCircle className="text-green-600 mr-2 md:mr-3" size={24} />
              <div>
                <p className="text-xl md:text-3xl text-green-800 font-extrabold">
                  {
                    turnosActivos.filter((t) => t.ESTADO === "confirmado")
                      .length
                  }
                </p>
                <p className="text-black font-extrabold text-xs md:text-sm">
                  En Atención
                </p>
                {turnosActivos.filter((t) => t.ESTADO === "confirmado").length >
                  0 && (
                  <p className="text-xs text-green-600 mt-1 hidden md:block">
                    En curso:{" "}
                    {
                      turnosActivos.filter((t) => t.ESTADO === "confirmado")
                        .length
                    }
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-amber-200 p-4 md:p-6 rounded-xl shadow-lg border border-purple-200">
            <div className="flex items-center">
              <CheckSquare className="text-purple-600 mr-2 md:mr-3" size={24} />
              <div>
                <p className="text-xl md:text-3xl font-extrabold text-purple-800">
                  {historialTurnos.length}
                </p>
                <p className="text-black font-extrabold text-xs md:text-sm">
                  Completados Hoy
                </p>
                {historialTurnos.length > 0 && (
                  <p className="text-xs font-extrabold text-purple-600 mt-1 hidden md:block">
                    Promedio:{" "}
                    {Math.round(
                      historialTurnos.reduce((sum, t) => {
                        const duracion = calcularDuracionReal(
                          t.HORA_INICIO_REAL,
                          t.HORA_FIN_REAL,
                        );
                        return sum + (duracion || 0);
                      }, 0) / historialTurnos.length,
                    )}{" "}
                    min
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
            className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors font-extrabold text-sm md:text-base"
          >
            <History size={20} />
            <span>
              {mostrarHistorial ? "Ocultar Historial" : "Ver Historial"}
            </span>
          </button>
        </div>

        {/* Turnos Activos - VISTA MÓVIL */}
        <div className="md:hidden mb-8">
          <div className="bg-amber-200 rounded-xl shadow-lg p-4 mb-6">
            <div className="flex flex-col items-center mb-4">
              <h2 className="text-xl font-bold text-yello-300 flex items-center mb-2">
                <Clock className="mr-2 text-yellow-800 font-extrabold" />
                Turnos Activos Hoy
              </h2>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-blue-100 text-yellow-800 rounded-full text-xs font-extrabold">
                  {turnosActivos.length} activos
                </span>
                {turnosActivos.length > 0 && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                    Siguiente: {calcularProximaHoraDisponible(turnosActivos)}
                  </span>
                )}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-yello-300 text-sm">
                  Cargando turnos activos...
                </p>
              </div>
            ) : turnosActivos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-yellow-800 font-extrabold text-base">
                  No hay turnos activos en este momento
                </p>
                <p className="text-black font-extrabold mt-2 text-sm">
                  Todos los turnos han sido atendidos o no hay citas programadas
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {turnosActivos.map((turno) => {
                  const duracion = turno.DURACION_MINUTOS || 60;
                  const horaFinProgramada = calcularHoraFin(
                    turno.HORA_INICIO,
                    duracion,
                  );
                  const horaFinEstimada = turno.HORA_INICIO_REAL
                    ? calcularHoraFin(turno.HORA_INICIO_REAL, duracion)
                    : null;
                  const tiempoTranscurrido = obtenerTiempoTranscurrido(
                    turno.HORA_INICIO_REAL,
                  );
                  const tiempoRestante =
                    tiempoTranscurrido !== null
                      ? Math.max(0, duracion - tiempoTranscurrido)
                      : null;

                  return (
                    <div
                      key={turno.ID}
                      className="bg-white rounded-lg p-4 shadow border"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center">
                            <User size={16} className="text-yello-300 mr-2" />
                            <div>
                              <div className="font-medium text-yello-300 text-sm">
                                {turno.CLIENTE_NOMBRE || "Sin nombre"}
                              </div>
                              <div className="text-xs text-yello-300 flex items-center">
                                <Phone size={10} className="mr-1" />
                                {turno.CLIENTE_TELEFONO || "Sin teléfono"}
                              </div>
                            </div>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {turno.EMPLEADO}
                        </span>
                      </div>

                      {/* Servicio y Duración */}
                      <div className="mb-3">
                        <div className="flex items-center mb-1">
                          <Scissors size={14} className="text-yello-300 mr-2" />
                          <div className="font-medium text-yello-300 text-sm">
                            {turno.SUBSERVICIO || turno.SERVICIO}
                          </div>
                        </div>
                        <div className="text-xs text-yello-300 flex items-center">
                          <Timer size={10} className="mr-1" />
                          {duracion} minutos
                        </div>
                      </div>

                      {/* Horarios */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-yello-300">Programado</p>
                          <p className="text-sm text-yello-300 font-medium">
                            {formatearHora(turno.HORA_INICIO)}
                          </p>
                          <p className="text-xs text-yello-300">
                            Fin: {formatearHora(horaFinProgramada)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-yello-300">Real/Estimado</p>
                          {turno.HORA_INICIO_REAL ? (
                            <>
                              <p className="text-xs text-green-700 font-medium">
                                Inicio: {formatearHora(turno.HORA_INICIO_REAL)}
                              </p>
                              <p className="text-xs text-blue-700">
                                Fin: {formatearHora(horaFinEstimada)}
                              </p>
                            </>
                          ) : (
                            <p className="text-xs text-yello-300">No iniciado</p>
                          )}
                        </div>
                      </div>

                      {/* Estado y Tiempo */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              turno.ESTADO === "pendiente"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {turno.ESTADO_TEXTO || turno.ESTADO}
                          </span>
                          {tiempoTranscurrido !== null && (
                            <div
                              className={`text-xs font-bold ${
                                tiempoTranscurrido > duracion
                                  ? "text-red-600"
                                  : tiempoTranscurrido > duracion * 0.8
                                    ? "text-yellow-600"
                                    : "text-green-600"
                              }`}
                            >
                              ⏱️ {tiempoTranscurrido}/{duracion} min
                            </div>
                          )}
                        </div>
                        {tiempoRestante !== null && tiempoRestante > 0 && (
                          <div className="text-xs text-yello-300">
                            Restan: {tiempoRestante} min
                          </div>
                        )}
                      </div>

                      {/* Acciones */}
                      <div className="flex space-x-2">
                        {turno.ESTADO === "pendiente" && (
                          <button
                            onClick={() => iniciarTurnoAdmin(turno.ID)}
                            className="flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs"
                          >
                            <PlayCircle size={12} />
                            <span>Iniciar</span>
                          </button>
                        )}
                        {turno.ESTADO === "confirmado" && (
                          <button
                            onClick={() => completarTurnoAdmin(turno.ID)}
                            className="flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs"
                          >
                            <CheckCircle size={12} />
                            <span>Completar</span>
                          </button>
                        )}
                        <button
                          onClick={() => cancelarTurnoAdmin(turno.ID)}
                          className="flex-1 flex items-center justify-center px-2 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs"
                        >
                          <span>Cancelar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Turnos Activos - VISTA DESKTOP */}
        <div className="hidden md:block mb-8 bg-amber-200 rounded-xl shadow-lg p-6">
          <div className="flex flex-col justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-yello-300 flex items-center">
              <Clock className="mr-2 text-yellow-800 font-extrabold" />
              Turnos Activos Hoy
            </h2>
            <div className="flex items-center space-x-2">
              <span className="px-4 py-2 bg-blue-100 text-yellow-800 rounded-full text-sm font-extrabold">
                {turnosActivos.length} activos
              </span>
              {turnosActivos.length > 0 && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                  Siguiente: {calcularProximaHoraDisponible(turnosActivos)}
                </span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto shadow-lg rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-amber-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yello-300 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yello-300 uppercase tracking-wider">
                    Empleado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yello-300 uppercase tracking-wider">
                    Servicio / Duración
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yello-300 uppercase tracking-wider">
                    Horario Programado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yello-300 uppercase tracking-wider">
                    Horario Real / Fin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yello-300 uppercase tracking-wider">
                    Tiempo / Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yello-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {turnosActivos.length > 0 ? (
                  turnosActivos.map((turno) => (
                    <tr
                      key={turno.ID}
                      className="hover:bg-gray-50/20 transition-colors"
                    >
                      {/* CLIENTE */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="shrink-0 h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-amber-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium ">
                              {turno.CLIENTE_NOMBRE}
                            </div>
                            <div className="text-xs ">
                              {turno.CLIENTE_TELEFONO}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* EMPLEADO */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-yellow-900">
                          <Scissors className="w-4 h-4 mr-2 text-yellow-300" />
                          {turno.EMPLEADO_NOMBRE || "Sin asignar"}
                        </div>
                      </td>

                      {/* SERVICIO */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-yellow-400">
                          {turno.SUBSERVICIO_NOMBRE}
                        </div>
                        <div className="text-xs text-yellow-400">
                          {turno.DURACION_MINUTOS} min
                        </div>
                      </td>

                      {/* HORARIO PROGRAMADO */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yello-300 font-mono">
                        {formatearHora(turno.HORA_INICIO)}
                      </td>

                      {/* HORARIO REAL / FIN (ELIMINA EL "NO INICIADO") */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-yello-300">
                          <span className="text-yello-300 text-xs font-bold mr-1">
                            R:
                          </span>
                          {/* Si no hay inicio real, muestra el programado */}
                          {turno.HORA_INICIO_REAL
                            ? formatearHora(turno.HORA_INICIO_REAL)
                            : formatearHora(turno.HORA_INICIO)}
                        </div>
                        <div className="text-xs text-yello-300">
                          <span className="font-bold mr-1">F:</span>
                          {turno.HORA_FIN_REAL
                            ? formatearHora(turno.HORA_FIN_REAL)
                            : calcularHoraFin(
                                turno.HORA_INICIO_REAL || turno.HORA_INICIO,
                                turno.DURACION_MINUTOS,
                              )}
                        </div>
                      </td>

                      {/* TIEMPO / ESTADO */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            turno.ESTADO === "en atención"
                              ? "bg-blue-100 text-blue-800"
                              : turno.ESTADO === "completado"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-yello-300"
                          }`}
                        >
                          {turno.ESTADO.toUpperCase()}
                        </span>
                        <div className="mt-1">
                          {turno.ESTADO === "en atención" && (
                            <span className="text-xs flex items-center text-blue-600 animate-pulse">
                              <Timer className="w-3 h-3 mr-1" />
                              {obtenerTiempoTranscurrido(
                                turno.HORA_INICIO_REAL,
                              )}{" "}
                              min
                            </span>
                          )}
                        </div>
                      </td>

                      {/* ACCIONES (VELOCIDAD OPTIMISTA) */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          {turno.ESTADO !== "en atención" && (
                            <button
                              onClick={() => iniciarTurnoAdmin(turno.ID)}
                              className="text-blue-600 hover:text-blue-900 transition-transform hover:scale-110"
                              title="Iniciar Turno"
                            >
                              <PlayCircle className="w-6 h-6" />
                            </button>
                          )}
                          <button
                            onClick={() => completarTurnoAdmin(turno.ID)}
                            className="text-green-600 hover:text-green-900 transition-transform hover:scale-110"
                            title="Finalizar y Completar"
                          >
                            <CheckCircle className="w-6 h-6" />
                          </button>
                          <button
                            onClick={() => cancelarTurnoAdmin(turno.ID)}
                            className="text-red-400 hover:text-red-600 transition-transform hover:scale-110"
                            title="Cancelar"
                          >
                            <AlertCircle className="w-6 h-6" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-10 text-center text-yello-300 italic"
                    >
                      No hay turnos activos para mostrar en este momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Historial de Turnos Completados - VISTA MÓVIL */}
        {mostrarHistorial && (
          <div className="md:hidden">
            <div className="p-4 border-2 border-amber-500 rounded-xl bg-linear-to-br from-black to-gray-900 shadow-lg mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-yellow-500  flex items-center">
                  <History className="mr-2 text-yellow-800" />
                  Historial de Turnos
                </h2>
                <span className="px-3 py-1 bg-blue-100 text-yellow-800 rounded-full text-xs font-extrabold">
                  {historialTurnos.length} turnos
                </span>
              </div>

              {loadingHistorial ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-yello-300 text-sm">
                    Cargando historial...
                  </p>
                </div>
              ) : historialTurnos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-black font-extrabold text-base">
                    No hay turnos completados hoy
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {historialTurnos.slice(0, 5).map((turno) => {
                    const duracionEstimada = turno.DURACION_MINUTOS || 60;
                    const duracionReal = calcularDuracionReal(
                      turno.HORA_INICIO_REAL,
                      turno.HORA_FIN_REAL,
                    );
                    const horaFinProgramada = calcularHoraFin(
                      turno.HORA_INICIO,
                      duracionEstimada,
                    );
                    const diferencia = duracionReal
                      ? duracionReal - duracionEstimada
                      : null;
                    const eficiencia = duracionReal
                      ? Math.round((duracionEstimada / duracionReal) * 100)
                      : 0;

                    return (
                      <div
                        key={turno.ID}
                        className="bg-white rounded-lg p-4 shadow"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center">
                              <User size={16} className="text-yello-300 mr-2" />
                              <div>
                                <div className="font-medium text-yello-300 text-sm">
                                  {turno.CLIENTE_NOMBRE}
                                </div>
                                <div className="text-xs text-yello-300">
                                  {turno.CLIENTE_TELEFONO}
                                </div>
                              </div>
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {turno.EMPLEADO}
                          </span>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm text-yello-300 font-medium mb-1">
                            {turno.SUBSERVICIO || turno.SERVICIO}
                          </p>
                          <p className="text-xs text-yello-300">
                            Duración estimada: {duracionEstimada} min
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <p className="text-xs text-yello-300">Programado</p>
                            <p className="text-sm text-yello-300">
                              {formatearHora(turno.HORA_INICIO)}
                            </p>
                            <p className="text-xs text-yello-300">
                              Fin: {formatearHora(horaFinProgramada)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-yello-300">Real</p>
                            <p className="text-sm text-yello-300">
                              Inicio:{" "}
                              {formatearHora(turno.HORA_INICIO_REAL) || "--:--"}
                            </p>
                            <p className="text-sm text-yello-300">
                              Fin:{" "}
                              {formatearHora(turno.HORA_FIN_REAL) || "--:--"}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            {duracionReal ? (
                              <div className="space-y-1">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    duracionReal > duracionEstimada
                                      ? "bg-red-100 text-red-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {duracionReal} min
                                </span>
                                {diferencia !== null && (
                                  <div
                                    className={`text-xs ${diferencia > 0 ? "text-red-600" : "text-green-600"}`}
                                  >
                                    {diferencia > 0
                                      ? `+${diferencia}`
                                      : diferencia}{" "}
                                    min
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-yello-300 text-xs">--</span>
                            )}
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${
                              duracionReal <= duracionEstimada
                                ? "bg-green-100 text-green-800"
                                : duracionReal <= duracionEstimada * 1.2
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {eficiencia}% eficiencia
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Resumen estadístico del historial - MÓVIL */}
            {historialTurnos.length > 0 && (
              <div className="p-3 border border-amber-300 rounded-2xl bg-linear-to-br from-black to-gray-900 shadow-lg mb-6">
                <h4 className="font-bold text-white mb-3 text-sm">
                  📈 Resumen del día:
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">
                      {historialTurnos.length}
                    </p>
                    <p className="text-xs text-white font-bold">
                      Total completados
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">
                      {
                        historialTurnos.filter((t) => {
                          const duracionReal = calcularDuracionReal(
                            t.HORA_INICIO_REAL,
                            t.HORA_FIN_REAL,
                          );
                          const duracionEstimada = t.DURACION_MINUTOS || 60;
                          return (
                            duracionReal && duracionReal <= duracionEstimada
                          );
                        }).length
                      }
                    </p>
                    <p className="text-xs text-white font-bold">A tiempo</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-red-600">
                      {
                        historialTurnos.filter((t) => {
                          const duracionReal = calcularDuracionReal(
                            t.HORA_INICIO_REAL,
                            t.HORA_FIN_REAL,
                          );
                          const duracionEstimada = t.DURACION_MINUTOS || 60;
                          return (
                            duracionReal && duracionReal > duracionEstimada
                          );
                        }).length
                      }
                    </p>
                    <p className="text-xs text-white font-bold">Con retraso</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-600">
                      {Math.round(
                        historialTurnos.reduce((sum, t) => {
                          const duracionReal = calcularDuracionReal(
                            t.HORA_INICIO_REAL,
                            t.HORA_FIN_REAL,
                          );
                          return sum + (duracionReal || 0);
                        }, 0) / historialTurnos.length,
                      )}{" "}
                      min
                    </p>
                    <p className="text-xs text-white font-bold">
                      Promedio real
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Historial de Turnos Completados - VISTA DESKTOP */}
        {mostrarHistorial && (
          <div className="hidden md:block overflow-x-auto">
            ={" "}
            <div className="p-6 border-2 border-amber-500 rounded-xl bg-linear-to-br from-black to-gray-900 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-yellow-500 flex items-center">
                  <History className="mr-2 text-yellow-800" />
                  Historial de Turnos
                </h2>
                <div className="flex justify-center space-x-2">
                  <span className="px-4 py-2 bg-blue-100 text-yellow-800 rounded-full text-sm font-extrabold">
                    {historialTurnos.length} turnos
                  </span>
                </div>
              </div>

              {loadingHistorial ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-yello-300">Cargando historial...</p>
                </div>
              ) : historialTurnos.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-black font-extrabold">
                    No hay turnos completados hoy
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    {/* ... MANTENGO LA TABLA COMPLETA ... */}
                    <thead className="border border-amber-400 divide-y-2 divide-x-2">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-yello-300 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-yello-300 uppercase tracking-wider">
                          Empleado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-yello-300 uppercase tracking-wider">
                          Servicio / Duración
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-yello-300 uppercase tracking-wider">
                          Horario Programado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-yello-300 uppercase tracking-wider">
                          Horario Real
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-yello-300 uppercase tracking-wider">
                          Duración Real
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-yello-300 uppercase tracking-wider">
                          Eficiencia
                        </th>
                      </tr>
                    </thead>
                    <tbody className="border border-amber-400">
                      {historialTurnos.map((turno) => {
                        const duracionEstimada = turno.DURACION_MINUTOS || 60;
                        const duracionReal = calcularDuracionReal(
                          turno.HORA_INICIO_REAL,
                          turno.HORA_FIN_REAL,
                        );
                        const horaFinProgramada = calcularHoraFin(
                          turno.HORA_INICIO,
                          duracionEstimada,
                        );
                        const diferencia = duracionReal
                          ? duracionReal - duracionEstimada
                          : null;

                        return (
                          <tr key={turno.ID} className="hover:bg-amber-500/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <User
                                  size={16}
                                  className="text-yello-300 mr-2"
                                />
                                <div>
                                  <div className="font-medium text-white">
                                    {turno.CLIENTE_NOMBRE}
                                  </div>
                                  <div className="text-xs text-white">
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
                              <div className="text-sm text-white">
                                {turno.SUBSERVICIO || turno.SERVICIO}
                              </div>
                              <div className="text-xs text-white">
                                Duración estimada: {duracionEstimada} min
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-white">
                                {formatearHora(turno.HORA_INICIO)}
                              </div>
                              <div className="text-xs text-yello-300">
                                Fin estimado: {formatearHora(horaFinProgramada)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm">
                                <div className=" text-white">
                                  Inicio:{" "}
                                  {formatearHora(turno.HORA_INICIO_REAL) ||
                                    "--:--"}
                                </div>
                                <div className=" text-white">
                                  Fin:{" "}
                                  {formatearHora(turno.HORA_FIN_REAL) ||
                                    "--:--"}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm">
                                {duracionReal ? (
                                  <div className="space-y-1">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                                        duracionReal > duracionEstimada
                                          ? "bg-red-100 text-red-800"
                                          : "bg-green-100 text-green-800"
                                      }`}
                                    >
                                      {duracionReal} min
                                    </span>
                                    {diferencia !== null && (
                                      <div
                                        className={`text-xs ${diferencia > 0 ? "text-red-600" : "text-green-600"}`}
                                      >
                                        {diferencia > 0
                                          ? `+${diferencia}`
                                          : diferencia}{" "}
                                        min
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-yello-300">--</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm">
                                {duracionReal ? (
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                                      duracionReal <= duracionEstimada
                                        ? "bg-green-100 text-green-800"
                                        : duracionReal <= duracionEstimada * 1.2
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {Math.round(
                                      (duracionEstimada / duracionReal) * 100,
                                    )}
                                    % eficiencia
                                  </span>
                                ) : (
                                  <span className="text-yello-300">--</span>
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
            {historialTurnos.length > 0 && (
              <div className="p-3 border border-amber-300 rounded-2xl bg-linear-to-br from-black to-gray-900 shadow-lg mb-6">
                <h4 className="font-bold text-white mb-3">
                  📈 Resumen del día:
                </h4>
                <div className="grid grid-cols-2 items-center md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {historialTurnos.length}
                    </p>
                    <p className="text-xs text-white font-bold">
                      Total completados
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {
                        historialTurnos.filter((t) => {
                          const duracionReal = calcularDuracionReal(
                            t.HORA_INICIO_REAL,
                            t.HORA_FIN_REAL,
                          );
                          const duracionEstimada = t.DURACION_MINUTOS || 60;
                          return (
                            duracionReal && duracionReal <= duracionEstimada
                          );
                        }).length
                      }
                    </p>
                    <p className="text-xs text-white font-bold">A tiempo</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {
                        historialTurnos.filter((t) => {
                          const duracionReal = calcularDuracionReal(
                            t.HORA_INICIO_REAL,
                            t.HORA_FIN_REAL,
                          );
                          const duracionEstimada = t.DURACION_MINUTOS || 60;
                          return (
                            duracionReal && duracionReal > duracionEstimada
                          );
                        }).length
                      }
                    </p>
                    <p className="text-xs text-white font-bold">Con retraso</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {Math.round(
                        historialTurnos.reduce((sum, t) => {
                          const duracionReal = calcularDuracionReal(
                            t.HORA_INICIO_REAL,
                            t.HORA_FIN_REAL,
                          );
                          return sum + (duracionReal || 0);
                        }, 0) / historialTurnos.length,
                      )}{" "}
                      min
                    </p>
                    <p className="text-xs text-white font-bold">
                      Promedio real
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
