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
  Calendar,
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
    const horaFormateada =
      horaString.length === 4 ? `0${horaString}` : horaString;
    const [horas, minutos] = horaFormateada
      .substring(0, 5)
      .split(":")
      .map(Number);
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
useEffect(() => {
  console.log("API URL:", API);
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
        const hoy = new Date().toISOString().split("T")[0];
        const turnosHoy = dataActual.data.filter(
          (turno) => turno.FECHA === hoy,
        );

        // Ordenar turnos por hora de inicio (ascendente)
        const turnosOrdenados = [...turnosHoy].sort((a, b) => {
          const horaA = convertirHoraAMinutos(
            a.HORA_INICIO || a.HORA_SELECCIONADA,
          );
          const horaB = convertirHoraAMinutos(
            b.HORA_INICIO || b.HORA_SELECCIONADA,
          );
          return horaA - horaB;
        });

        console.log("Turnos ordenados:", turnosOrdenados);

        // Buscar turno en atención (confirmado)
        const turnoEnAtencion = turnosOrdenados.find(
          (t) => t.ESTADO === "confirmado",
        );
        if (turnoEnAtencion) {
          setTurnoActual(turnoEnAtencion);
        } else {
          setTurnoActual(null);
        }

        // Buscar siguiente turno pendiente
        const siguientePendiente = turnosOrdenados.find(
          (t) => t.ESTADO === "pendiente",
        );
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
        const hoy = new Date().toISOString().split("T")[0];
        const completadosHoy = data.data.filter(
          (turno) => turno.ESTADO === "completado" && turno.FECHA === hoy,
        );

        // Ordenar completados por hora
        const completadosOrdenados = completadosHoy.sort((a, b) => {
          const horaA = convertirHoraAMinutos(
            a.HORA_INICIO || a.HORA_SELECCIONADA,
          );
          const horaB = convertirHoraAMinutos(
            b.HORA_INICIO || b.HORA_SELECCIONADA,
          );
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
        body: JSON.stringify({ turnoId }),
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
      console.log(
        "Completando turno:",
        turnoActual.ID,
        "Empleado:",
        usuario.ID,
      );

      // Usar la misma ruta que el administrador pero con el ID del empleado
      const res = await fetch(`${API}/turnos/finalizar-turno`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          turnoId: turnoActual.ID,
          empleadoId: usuario.ID,
        }),
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
          setMensaje("");
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
      
      setTimeout(()=>{
        setMensaje("")
      },3000)
    }


  };

  // Formatear hora
  const formatearHora = (horaString) => {
    if (!horaString) return "--:--";
    if (horaString.length === 4) return `0${horaString}`.substring(0, 5);
    return horaString.substring(0, 5);
  };

  return (
    <div className="min-h-screen grow pt-20 flex items-center justify-center bg-gray-700 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mt-10 mb-8 p-6 border-2 border-yellow-500 rounded-xl bg-linear-to-br from-black to-gray-900 shadow-lg ">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-yellow-400">
                Panel de Turnos - Empleado
              </h1>
              <p className="text-yellow-500 mt-2">
                <span className="font-extrabold">"{usuario?.NOMBRE}"</span> Gestiona tus turnos del día
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="flex items-center space-x-2 bg-yellow-100 text-black-800 font-bold px-4 py-2 rounded-lg">
                <Calendar size={20} />
                <span>
                  {new Date().toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div>
                
              </div>
              <button
                onClick={recargarTodo}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-300 hover:bg-yellow-400 rounded-lg text-gray-700 transition-colors"
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
          <div
          
            className={`m-2 p-4 rounded-lg  transition-all duration-2000 ease-in-out ${
                      mensaje 
                ? "bg-green-100 text-green-800 traslate-y-0 "
                : "bg-red-100 text-red-800 opacity-0 scale-95 -traslate-y-2 pointer-events-none"
            }`}
          >
            {mensaje || "Cargado..."}
          </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 transition-opacity duration-2000 ease-in-out">
          <div className="mt-10 mb-8 p-6 border-2 border-yellow-500 rounded-xl bg-linear-to-br from-black to-gray-900 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-yellow-300 flex items-center">
                <Play className="mr-2 text-yellow-300" />
                Turno en Atención
              </h2>
              {turnoActual && (
                <span className="px-3 py-1 text-white bg-green-900/20 p-3 md:p-4 rounded-xl border border-green-500 hover:bg-green-800 text-sm font-bold">
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
                <div className=" rounded-lg p-6 border border-yellow-400">
                  <div className="flex items-center mb-4">
                    <User className="text-blue-600 mr-3" size={24} />
                    <div>
                      <h3 className="text-xl font-extrabold text-yellow-300">
                        {turnoActual.CLIENTE_NOMBRE || "Cliente"}
                      </h3>
                      {turnoActual.CLIENTE_TELEFONO && (
                        <p className="text-yellow-600 flex items-center mt-1">
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
                        <p className="font-semibold text-yellow-300">
                          {turnoActual.SERVICIO} - {turnoActual.SUBSERVICIO}
                        </p>
                        <p className="text-sm text-yellow-600">
                          Duración estimada:{" "}
                          {turnoActual.DURACION_MINUTOS || 60} min
                        </p>
                      </div>
                    </div>

                    {/* Horario */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="p-3  rounded-lg border border-yellow-200">
                        <p className="text-sm text-gray-600">Hora Programada</p>
                        <p className="font-bold text-blue-700 ">
                          {formatearHora(turnoActual.HORA_INICIO)}
                        </p>
                      </div>
                      <div className=" p-3  rounded-lg border border-yellow-200">
                        <p className="text-sm text-gray-600 ">
                          Hora Estimada Fin
                        </p>
                        <p className="font-bold text-green-700  ">
                          {formatearHora(turnoActual.HORA_FIN)}
                        </p>
                      </div>
                    </div>

                    {/* Horas reales */}
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {turnoActual.HORA_INICIO_REAL && (
                        <div className="p-3  rounded-lg border border-yellow-200">
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
                  className="w-full py-4 bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle size={24} />
                  <span>Marcar como Completado</span>
                </button>

                <p className="text-sm text-yellow-300 text-center">
                  Al completar, se mostrará automáticamente el siguiente cliente
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-bold text-yellow-300 mb-2">
                  Sin turnos en atención
                </h3>
                <p className="text-yellow-300 mb-6">
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
          <div className="mt-10 mb-8 p-6 border-2 border-amber-500 rounded-xl bg-linear-to-br from-black to-gray-900 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-yellow-300 flex items-center">
                <Clock className="mr-2 text-yellow-300" />
                Próximo Turno
              </h2>
              {siguienteTurno && (
                <span className="px-3 py-1 text-white bg-yellow-900/20 p-3 md:p-4 rounded-xl border border-yellow-500 hover:bg-yellow-800 text-sm font-bold">
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
                <div className=" rounded-lg p-6 border border-yellow-200">
                  <div className="flex items-center mb-4">
                    <User className="text-yellow-400 mr-3" size={24} />
                    <div>
                      <h3 className="text-xl font-bold text-yellow-300">
                        {siguienteTurno.CLIENTE_NOMBRE || "Cliente"}
                      </h3>
                      {siguienteTurno.CLIENTE_TELEFONO && (
                        <p className="text-yellow-600 flex items-center mt-1">
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
                        <p className="font-semibold text-yellow-300">
                          {siguienteTurno.SERVICIO} -{" "}
                          {siguienteTurno.SUBSERVICIO}
                        </p>
                        <p className="text-sm text-yellow-600">
                          Duración: {siguienteTurno.DURACION_MINUTOS || 60} min
                        </p>
                      </div>
                    </div>

                    {/* Horario */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="border-yellow-200 p-3 rounded-lg border">
                        <p className="text-sm text-yellow-600">Horario Cita</p>
                        <p className="font-extrabold text-yellow-400">
                          {formatearHora(
                            siguienteTurno.HORA_INICIO ||
                              siguienteTurno.HORA_SELECCIONADA,
                          )}
                        </p>
                        <p className="text-xs text-yellow-300 mt-1">
                          {siguienteTurno.FECHA
                            ? new Date(siguienteTurno.FECHA).toLocaleDateString(
                                "es-ES",
                              )
                            : ""}
                        </p>
                      </div>
                      <div className="border-yellow-200 p-3 rounded-lg border">
                        <p className="text-sm text-yellow-600">Orden del día</p>
                        <span className="inline-block px-3 py-1 bg-blue-900/20 text-blue-800 rounded-full text-sm font-bold">
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
                      ? "bg-gray-400 cursor-not-allowed text-gray-600"
                      : "bg-linear-to-r from-yellow-500/60 to-amber-600/60 hover:from-amber-600/60 hover:to-yellow-700 text-white"
                  }`}
                >
                  <Play size={24} />
                  <span>
                    {turnoActual
                      ? "Termina el turno actual primero"
                      : "Iniciar Atención"}
                  </span>
                </button>

                {/* Información */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <span className="font-bold">Instrucción:</span>
                    Para atender a este cliente, primero debes completar el
                    turno actual (si hay uno en curso). Los turnos se muestran
                    en orden cronológico (de más temprano a más tarde).
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-bold text-yellow-300 mb-2">
                  No hay turnos pendientes
                </h3>
                <p className="text-yellow-300">
                  Todos los turnos del día han sido atendidos o no hay citas
                  programadas
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Turnos Completados Hoy */}
        <div className="mt-10 mb-8 p-6 border-2 border-yellow-500 rounded-xl bg-linear-to-br from-black to-gray-900 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-yellow-300 flex items-center">
              <CheckCircle className="mr-2 text-green-600" />
              Turnos Completados Hoy
            </h2>
            <div className="flex flex-col md:flex-row gap-4 items-center space-x-2">
              <span className="px-3 py-1  text-green-300 bg-green-900/20 p-3 md:p-4 rounded-xl border border-green-500 hover:bg-green-800 text-sm">
                {turnosCompletados.length}{" "}
                {turnosCompletados.length === 1 ? "turno" : "turnos"}
              </span>
              <button
                onClick={() => cargarTurnosCompletados(usuario?.ID)}
                disabled={loadingCompletados}
                className="flex items-center space-x-1 px-3 py-1 text-blue-300 bg-blue-900/20 p-3 md:p-4 rounded-xl border border-blue-500 hover:bg-blue-800 text-sm"
              >
                <RefreshCw
                  size={14}
                  className={loadingCompletados ? "animate-spin" : ""}
                />
                <span>Actualizar</span>
              </button>
            </div>
          </div>

          {loadingCompletados ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">
                Cargando turnos completados...
              </p>
            </div>
          ) : turnosCompletados.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-yellow-300">
                Aún no has completado ningún turno hoy
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y ">
                <thead className="">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      Orden
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      Servicio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      Hora Cita
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      Inicio Real
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      Fin Real
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      Duración
                    </th>
                  </tr>
                </thead>
                <tbody className=" divide-y divide-gray-200">
                  {turnosCompletados.map((turno, index) => (
                    <tr key={turno.ID} className="hover:bg-gray-50/20">
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-block w-6 h-6 bg-gray-100 rounded-full  items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User size={16} className="text-yellow-400 mr-2" />
                          <div>
                            <div className="font-bold  text-yellow-600">
                              {turno.CLIENTE_NOMBRE || "Cliente"}
                            </div>
                            {turno.CLIENTE_TELEFONO && (
                              <div className="text-xs text-yellow-300">
                                {turno.CLIENTE_TELEFONO}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold  text-yellow-600">
                          {turno.SUBSERVICIO}
                        </div>
                        <div className="text-xs text-yellow-300">
                          {turno.SERVICIO}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold  text-yellow-600">
                          {formatearHora(
                            turno.HORA_INICIO || turno.HORA_SELECCIONADA,
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold  text-yellow-600">
                          {formatearHora(turno.HORA_INICIO_REAL) || "--:--"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold  text-yellow-600">
                          {formatearHora(turno.HORA_FIN_REAL) || "--:--"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {turno.DURACION_REAL_MINUTOS ? (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold ${
                                turno.DURACION_REAL_MINUTOS >
                                (turno.DURACION_MINUTOS || 60)
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {turno.DURACION_REAL_MINUTOS} min
                              {turno.DURACION_REAL_MINUTOS >
                                (turno.DURACION_MINUTOS || 60) && " ⏱️"}
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
        </div>
      </div>
    </div>
  );
}
