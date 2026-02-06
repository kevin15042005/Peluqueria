import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:8080";

const Asistencia = () => {
  // Estados principales
  const [empleados, setEmpleados] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Obtener fecha de hoy en formato YYYY-MM-DD
  const obtenerFechaHoy = () => {
    const hoy = new Date();
    return hoy.toISOString().split("T")[0];
  };

  // Cargar datos iniciales
  useEffect(() => {
    cargarEmpleados();
    cargarAsistencias();
  }, []);

  // 1. Cargar empleados usando procedimiento almacenado
  const cargarEmpleados = async () => {
    try {
      const respuesta = await fetch(`${API_URL}/ingreso/empleados`);
      const datos = await respuesta.json();

      if (datos.success) {
        setEmpleados(datos.data);
      } else {
        setMensaje("Error al cargar empleados");
      }
    } catch (error) {
      console.error("Error:", error);
      setMensaje("Error de conexión con el servidor");
    }
  };

  // 2. Cargar asistencias usando procedimiento almacenado
  const cargarAsistencias = async () => {
    try {
      const respuesta = await fetch(`${API_URL}/ingreso/asistencia`);
      const datos = await respuesta.json();

      if (datos.success) {
        setAsistencias(datos.data);
      } else {
        setMensaje("Error al cargar asistencias");
      }
    } catch (error) {
      console.error("Error:", error);
      setMensaje("Error de conexión con el servidor");
    }
  };

  // 3. Registrar entrada usando procedimiento almacenado
  const registrarEntrada = async () => {
    if (!empleadoSeleccionado) {
      setMensaje("Por favor selecciona un empleado");
      return;
    }

    setCargando(true);
    setMensaje("");

    try {
      const respuesta = await fetch(`${API_URL}/ingreso/entrada`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trabajador_id: parseInt(empleadoSeleccionado) }),
      });

      const datos = await respuesta.json();

      if (datos.success) {
        setMensaje("✅ Entrada registrada correctamente");
        setEmpleadoSeleccionado("");
        cargarAsistencias(); // Recargar lista
      } else {
        // Si ya tiene entrada, preguntar si quiere reactivar
        if (datos.code === "ENTRADA_DUPLICADA") {
          const confirmar = window.confirm(
            "Este empleado ya tiene entrada hoy. ¿Quieres reactivar la entrada?",
          );

          if (confirmar) {
            await reactivarEntrada(parseInt(empleadoSeleccionado));
          }
        } else {
          setMensaje(`❌ ${datos.message}`);
        }
      }
    } catch (error) {
      setMensaje("❌ Error de conexión");
      console.error("Error:", error);
    } finally {
      setCargando(false);
    }
  };

  // 4. Reactivar entrada usando procedimiento almacenado
  const reactivarEntrada = async (empleadoId) => {
    setCargando(true);

    try {
      const respuesta = await fetch(`${API_URL}/ingreso/reactivar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trabajador_id: empleadoId }),
      });

      const datos = await respuesta.json();

      if (datos.success) {
        setMensaje("🔄 Entrada reactivada correctamente");
        cargarAsistencias(); // Recargar lista
      } else {
        setMensaje(`❌ ${datos.message}`);
      }
    } catch (error) {
      setMensaje("❌ Error de conexión");
      console.error("Error:", error);
    } finally {
      setCargando(false);
    }
  };

  // 5. Registrar salida usando procedimiento almacenado
  const registrarSalida = async (asistenciaId, nombreEmpleado) => {
    if (!window.confirm(`¿Registrar salida para ${nombreEmpleado}?`)) {
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch(`${API_URL}/ingreso/salida`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asistencia_id: asistenciaId }),
      });

      const datos = await respuesta.json();

      if (datos.success) {
        setMensaje(` Salida registrada para ${nombreEmpleado}`);
        cargarAsistencias(); // Recargar lista
      } else {
        setMensaje(`❌ ${datos.message}`);
      }
    } catch (error) {
      setMensaje("❌ Error de conexión");
      console.error("Error:", error);
    } finally {
      setCargando(false);
    }
  };

  // Filtrar asistencias de hoy
  const hoy = obtenerFechaHoy();
  const asistenciasHoy = asistencias.filter((a) => a.FECHA === hoy);

  return (
    <>
    
      <div className="  mt-12 items-center p-4 md:p-8 max-w-6xl w-full mx-auto text-amber-300 font-bold">
        <h1>Registro de Asistencia</h1>
        <p>Fecha: {hoy}</p>

        {mensaje && (
          <div
            className={`
  px-4 py-3 rounded
  ${
    mensaje.includes("✅")
      ? "bg-green-100 border border-green-300 text-green-800"
      : mensaje.includes("🔄")
        ? "bg-yellow-100 border border-yellow-300 text-yellow-800"
        : "bg-red-100 border border-red-300 text-red-800"
  }
`}
          >
            {mensaje}
          </div>
        )}

        {/* Sección 1: Registrar Entrada */}
        <div className="mb-8 p-6 border-2 border-amber-500 rounded-xl bg-linear-to-br from-black to-gray-900 shadow-lg">
          <h2 className=" text-2xl py-3">Registrar Entrada</h2>

          <div className="max0-w-md">
            <label className="block mb-2 text-lg">Seleccionar Empleado:</label>
            <select
              value={empleadoSeleccionado}
              onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
              disabled={cargando}
              className="w-full p-3 mb-4 bg-gray-800 border-2 border-amber-400 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 "
            >
              <option className="bg-black" value="">
                -- Selecciona un empleado --
              </option>
              {empleados.map((emp) => (
                <option className="bg-black" key={emp.ID} value={emp.ID}>
                  {emp.NOMBRE} ({emp.CORREO})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={registrarEntrada}
            disabled={cargando || !empleadoSeleccionado}
            className={`w-full py-3 px-4 rounded-lg font-bold transition-all duration-200 ${
              cargando || !empleadoSeleccionado
                ? "bg-gray-700 cursor-not-allowed opacity-50"
                : "bg-linear-to-r from-yellow-600 to-amber-700 hover:from-yellow-700 hover:to-amber-800"
            }`}
          >
            {cargando ? "Procesando..." : "Registrar Entrada"}
          </button>
        </div>

        {/* Sección 2: Asistencias de Hoy */}
        <div className=" p-6 border-2 border-amber-500 rounded-xl bg-linear-to-br from-black to-gray-900 shadow-lg">
          <div className="flex flex-col  md:flex-row justify-between item-center">
            <h2>Asistencias de Hoy</h2>
            <button
              onClick={() => {
                cargarEmpleados();
                cargarAsistencias();
              }}
              disabled={cargando}
              className="bg-linear-to-r from-yellow-600 to-amber-700 hover:from-yellow-700 hover:to-amber-800 p-4 m-2 rounded-2xl "
            >
              Actualizar
            </button>
          </div>

          {asistenciasHoy.length === 0 ? (
            <p>No hay asistencias registradas hoy</p>
          ) : (
            <div className="overflow-x-auto overflow-y-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-400 text-black">
                    <th className="border p-3">Empleado</th>
                    <th className="border p-3">Entrada</th>
                    <th className="border p-3">Salida</th>
                    <th className="border p-3">Estado</th>
                    <th className="border p-3">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {asistenciasHoy.map((asistencia) => {
                    const puedeSalida =
                      asistencia.ESTADO === "PRESENTE" &&
                      (!asistencia.HORA_SALIDA ||
                        asistencia.HORA_SALIDA === "00:00:00");

                    return (
                      <tr className="border p-3" key={asistencia.ID}>
                        <td className="border p-3">{asistencia.NOMBRE}</td>
                        <td className="border p-3">
                          {asistencia.HORA_ENTRADA || "--"}
                        </td>
                        <td className="border p-3">
                          {asistencia.HORA_SALIDA || "--"}
                        </td>
                        <td>
                          <span
                            className="py-2 px-4 border rounded-2xl"
                            style={{
                              backgroundColor:
                                asistencia.ESTADO === "PRESENTE"
                                  ? "#d4edda"
                                  : "#f8d7da",
                              color:
                                asistencia.ESTADO === "PRESENTE"
                                  ? "#155724"
                                  : "#721c24",
                            }}
                          >
                            {asistencia.ESTADO}
                          </span>
                        </td>
                        <td className="p-3 border">
                          {puedeSalida ? (
                            <button
                              onClick={() =>
                                registrarSalida(
                                  asistencia.ID,
                                  asistencia.NOMBRE,
                                )
                              }
                              disabled={cargando}
                              className="py-2 px-4 rounded-2xl bg-[#dc3545]"
                              style={{
                                cursor: cargando ? "not-allowed" : "pointer",
                              }}
                            >
                              Registrar Salida
                            </button>
                          ) : (
                            <span className="bg-[#35dc75] py-2 px-4 rounded-2xl">
                              Completado
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Asistencia;
