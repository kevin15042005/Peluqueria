import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Clock, User, Phone, Sparkles, Loader2, CheckCircle2, AlertCircle, Info } from "lucide-react";
export default function Citas() {
  const [servicios, setServicios] = useState({});
  const [categorias, setCategorias] = useState([]);
  const [subservicios, setSubservicios] = useState([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [empleadoDisponible, setEmpleadoDisponible] = useState(null);

  const [servicioSeleccionado, setServicioSeleccionado] = useState("");
  const [subservicioSeleccionado, setSubservicioSeleccionado] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [, setTurnoCreado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [duracionServicio, setDuracionServicio] = useState(0);
  const [cargandoServicios, setCargandoServicios] = useState(true);

  const API = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  //CARGAR CATEGORÍAS Y SUBSERVICIOS

  useEffect(() => {
    const cargarTodo = async () => {
      try {
        console.log("🔄 Iniciando carga de datos...");
        setCargandoServicios(true);

        // 1. CARGAR CATEGORÍAS
        const resCategorias = await fetch(`${API}/servicios/obtener_servicios`);

        if (!resCategorias.ok) {
          throw new Error(`Error categorías: ${resCategorias.status}`);
        }

        const dataCategorias = await resCategorias.json();

        if (!dataCategorias.success || !dataCategorias.data) {
          throw new Error("Formato de categorías incorrecto");
        }

        const nombresCategorias = dataCategorias.data.map((cat) => cat.NOMBRE);
        setCategorias(nombresCategorias);

        const estructuraInicial = {};
        dataCategorias.data.forEach((categoria) => {
          estructuraInicial[categoria.NOMBRE] = [];
        });
        setServicios(estructuraInicial);

        // 2. CARGAR SUBSERVICIOS
        const resSubservicios = await fetch(
          `${API}/subservicio/obtener_subservicios`,
        );

        if (!resSubservicios.ok) {
          throw new Error(`Error subservicios: ${resSubservicios.status}`);
        }

        const dataSubservicios = await resSubservicios.json();

        // 3. COMBINAR DATOS
        if (
          dataSubservicios.success &&
          dataSubservicios.data &&
          dataSubservicios.data.length > 0
        ) {
          const serviciosCompletos = { ...estructuraInicial };

          dataSubservicios.data.forEach((sub) => {
            const categoria = dataCategorias.data.find(
              (cat) => cat.ID == sub.SERVICIO_ID,
            );

            if (categoria) {
              const categoriaNombre = categoria.NOMBRE;
              if (!serviciosCompletos[categoriaNombre]) {
                serviciosCompletos[categoriaNombre] = [];
              }

              serviciosCompletos[categoriaNombre].push({
                ...sub,
                SUBSERVICIO_ID: sub.SUBSERVICIO_ID || sub.ID,
              });
            }
          });

          setServicios(serviciosCompletos);

          const totalSubservicios = Object.values(serviciosCompletos).reduce(
            (total, arr) => total + arr.length,
            0,
          );
          if (totalSubservicios === 0) {
            setMensaje(
              "⚠️ Hay categorías pero no hay servicios específicos disponibles.",
            );
          }
        } else {
          setMensaje("ℹ️ Hay categorías pero no hay servicios específicos.");
        }
      } catch (error) {
        console.error("❌ Error al cargar servicios:", error);
        setMensaje(`❌ Error: ${error.message}`);
      } finally {
        setCargandoServicios(false);
      }
    };

    cargarTodo();
  }, []);

  // ACTUALIZAR SUBSERVICIOS AL CAMBIAR CATEGORÍA

  useEffect(() => {
    if (servicioSeleccionado && servicios[servicioSeleccionado]) {
      const subs = servicios[servicioSeleccionado];
      console.log("📋 Subservicios para", servicioSeleccionado, ":", subs);
      setSubservicios(subs);

      setSubservicioSeleccionado("");
      setDuracionServicio(0);
      setHorariosDisponibles([]);
      setHorariosOcupados([]);
      setHora("");
      setEmpleadoDisponible(null);

      if (subs.length === 0) {
        setMensaje(
          `⚠️ La categoría "${servicioSeleccionado}" no tiene servicios específicos.`,
        );
      } else {
        setMensaje(`✅ ${subs.length} servicio(s) disponible(s)`);
      }
    } else {
      setSubservicios([]);
      setSubservicioSeleccionado("");
    }
  }, [servicioSeleccionado, servicios]);

  //ACTUALIZAR DURACIÓN AL SELECCIONAR SUBSERVICIO

  useEffect(() => {
    if (subservicioSeleccionado) {
      const subservicioInfo = obtenerSubservicioInfo(subservicioSeleccionado);
      console.log("📊 Info del subservicio seleccionado:", subservicioInfo);
      if (subservicioInfo) {
        const duracion = subservicioInfo.DURACION_MINUTOS || 60;
        setDuracionServicio(duracion);
      }
    }
  }, [subservicioSeleccionado]);

  //Cargar hoarios disponibles
  const cargarHorariosDisponibles = async () => {
    if (!subservicioSeleccionado || !fecha) {
      setMensaje("Por favor selecciona un servicio y una fecha primero");
      return;
    }

    setCargandoHorarios(true);
    setMensaje("");
    setHorariosDisponibles([]);
    setHora("");

    try {
      // 1. Obtener horarios disponibles desde el backend
      console.log(
        `🔍 Buscando horarios para subservicio ${subservicioSeleccionado} en fecha ${fecha}`,
      );

      const url = `${API}/turnos/horarios-disponibles/${subservicioSeleccionado}/${fecha}`;
      console.log(`🔗 URL completa: ${url}`);

      const resHorarios = await fetch(url);
      console.log(`📊 Status respuesta: ${resHorarios.status}`);

      if (!resHorarios.ok) {
        throw new Error(`Error HTTP ${resHorarios.status}`);
      }

      const dataHorarios = await resHorarios.json();
      console.log("📦 Datos recibidos del backend:", dataHorarios);

      if (dataHorarios.success) {
        // SI HAY HORARIOS DISPONIBLES
        if (dataHorarios.horarios && dataHorarios.horarios.length > 0) {
          // Formatear horarios correctamente
          const horariosFormateados = dataHorarios.horarios.map((horario) => {
            if (typeof horario === "object" && horario.HORA) {
              return horario;
            } else if (typeof horario === "string") {
              return { HORA: horario };
            } else {
              return { HORA: String(horario) };
            }
          });

          console.log("📅 Horarios formateados:", horariosFormateados);
          setHorariosDisponibles(horariosFormateados);
          setMensaje(
            `✅ Se encontraron ${horariosFormateados.length} horarios disponibles`,
          );

          // 2. Buscar empleado disponible
          try {
            const resEmpleado = await fetch(
              `${API}/turnos/empleado-disponible/${subservicioSeleccionado}`,
            );

            if (resEmpleado.ok) {
              const dataEmpleado = await resEmpleado.json();
              console.log("👨‍💼 Empleado disponible:", dataEmpleado);

              if (dataEmpleado.success && dataEmpleado.data) {
                setEmpleadoDisponible(dataEmpleado.data);
              }
            }
          } catch (error) {
            console.warn("⚠️ No se pudo obtener empleado:", error);
          }

          // 3. Si hay empleado, cargar horarios ocupados
          if (empleadoDisponible?.ID || empleadoDisponible?.TRABAJADOR_ID) {
            await cargarHorariosOcupados(
              empleadoDisponible.ID || empleadoDisponible.TRABAJADOR_ID,
              fecha,
              horariosFormateados,
            );
          }
        } else {
          // SI NO HAY HORARIOS DISPONIBLES
          setMensaje(
            "❌ No hay horarios disponibles para esta fecha. Prueba otra fecha.",
          );
          console.log("⚠️ El backend devolvié un array vacío de horarios");

          // Generar horarios de prueba para desarrollo
          if (import.meta.env.DEV) {
            console.log("🛠️ Modo desarrollo: Generando horarios de prueba");
            const horariosPrueba = generarHorariosDePrueba();
            setHorariosDisponibles(horariosPrueba);
            setMensaje(
              `🛠️ Modo desarrollo: ${horariosPrueba.length} horarios de prueba`,
            );
          }
        }
      } else {
        setMensaje(
          `❌ Error del servidor: ${dataHorarios.message || "No se pudieron obtener horarios"}`,
        );
      }
    } catch (error) {
      console.error("❌ Error al cargar horarios:", error);
      setMensaje(
        "❌ Error de conexión con el servidor. Verifica que la API esté funcionando.",
      );

      // En desarrollo, mostrar horarios de prueba
      if (import.meta.env.DEV) {
        console.log(
          "🛠️ Modo desarrollo: Usando datos de prueba por error de conexión",
        );
        const horariosPrueba = generarHorariosDePrueba();
        setHorariosDisponibles(horariosPrueba);
        setMensaje(
          `🛠️ Modo desarrollo: Usando ${horariosPrueba.length} horarios de prueba`,
        );
      }
    } finally {
      setCargandoHorarios(false);
    }
  };

  //Generar horarios
  const generarHorariosDePrueba = () => {
    const horarios = [];
    const horaInicio = 9; // 9:00 AM
    const horaFin = 18; // 6:00 PM

    for (let hora = horaInicio; hora < horaFin; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 30) {
        const horaStr = `${hora.toString().padStart(2, "0")}:${minuto.toString().padStart(2, "0")}`;
        horarios.push({ HORA: horaStr });
      }
    }

    return horarios;
  };

  //Calcular horarios ocupado por el empelado
  const cargarHorariosOcupados = async (
    empleadoId,
    fechaSeleccionada,
    todosHorarios,
  ) => {
    try {
      console.log(
        `📅 Buscando horarios ocupados para empleado ${empleadoId} en ${fechaSeleccionada}`,
      );

      const res = await fetch(
        `${API}/turnos/mis-turnos-fecha/${empleadoId}/${fechaSeleccionada}/${fechaSeleccionada}`,
      );

      if (!res.ok) return;

      const data = await res.json();

      if (data.success && data.data) {
        const turnosActivos = data.data.filter(
          (turno) =>
            (turno.ESTADO === "pendiente" || turno.ESTADO === "confirmado") &&
            turno.FECHA === fechaSeleccionada,
        );

        const horasOcupadas = turnosActivos
          .map((turno) => turno.HORA_INICIO || turno.HORA_SELECCIONADA)
          .filter((hora) => hora);

        const bloquesABloquear = calcularBloquesABloquear(
          horasOcupadas,
          todosHorarios,
        );
        setHorariosOcupados(bloquesABloquear);
      }
    } catch (error) {
      console.error("⚠️ Error al cargar horarios ocupados:", error);
    }
  };

  //Calcular bloques a bloquear
  const calcularBloquesABloquear = (horasOcupadas, todosHorarios) => {
    const bloquesABloquear = new Set();

    horasOcupadas.forEach((horaOcupada) => {
      const horaOcupadaFormateada = formatearHoraParaComparar(horaOcupada);
      const indexOcupado = todosHorarios.findIndex(
        (h) => formatearHoraParaComparar(h.HORA || h) === horaOcupadaFormateada,
      );

      if (indexOcupado !== -1) {
        const bloques = Math.max(1, Math.ceil(duracionServicio / 30));
        for (let i = 0; i < bloques; i++) {
          const bloqueIndex = indexOcupado + i;
          if (bloqueIndex < todosHorarios.length) {
            const horaBloqueada = todosHorarios[bloqueIndex];
            bloquesABloquear.add(
              formatearHoraParaComparar(horaBloqueada.HORA || horaBloqueada),
            );
          }
        }
      }
    });

    return Array.from(bloquesABloquear);
  };

  //Verificar horario
  const estaHorarioOcupado = (horario) => {
    const horaStr = formatearHoraParaComparar(horario.HORA || horario);
    return horariosOcupados.some(
      (horaOcupada) => formatearHoraParaComparar(horaOcupada) === horaStr,
    );
  };

  //Formatear Hora
  const formatearHoraParaComparar = (horaStr) => {
    if (!horaStr) return "";
    if (horaStr.length === 4) return `0${horaStr}`.substring(0, 5);
    return horaStr.substring(0, 5);
  };

  const formatearHora = (horaStr) => {
    return formatearHoraParaComparar(horaStr);
  };

  //Calcular hora fin
  const calcularHoraFin = (horaInicio) => {
    if (!horaInicio || !duracionServicio) return "";

    const [horas, minutos] = horaInicio.split(":").map(Number);
    const totalMinutos = horas * 60 + minutos + duracionServicio;
    const finHoras = Math.floor(totalMinutos / 60);
    const finMinutos = totalMinutos % 60;

    return `${finHoras.toString().padStart(2, "0")}:${finMinutos.toString().padStart(2, "0")}`;
  };

  //Registrar turno
  const registrarTurno = async () => {
    if (
      !subservicioSeleccionado ||
      !fecha ||
      !hora ||
      !clienteNombre ||
      !clienteTelefono
    ) {
      setMensaje("Por favor completa todos los campos obligatorios");
      return;
    }

    if (!/^\d{10}$/.test(clienteTelefono.replace(/\D/g, ""))) {
      setMensaje("El teléfono debe tener 10 dígitos");
      return;
    }

    if (estaHorarioOcupado(hora)) {
      setMensaje("❌ Este horario ya está ocupado");
      return;
    }

    setLoading(true);
    setMensaje("");

    try {
      const res = await fetch(`${API}/turnos/registrar-con-hora`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subservicioId: subservicioSeleccionado,
          fecha: fecha,
          horaSeleccionada: hora,
          clienteNombre: clienteNombre.trim(),
          clienteTelefono: clienteTelefono.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setTurnoCreado(true);
        setMensaje("✅ ¡Cita agendada exitosamente!");

        // Guardar el teléfono para que "Mi turno" lo recuerde
        try {
          localStorage.setItem("telefonoCliente", clienteTelefono.replace(/\D/g, ""));
        } catch {
          /* sin almacenamiento disponible */
        }

        // Llevar al cliente a la pantalla de seguimiento de su turno
        navigate(`/MiTurno/${data.turnoId}?nuevo=1`);
      } else {
        setMensaje(`❌ ${data.message || "Error al agendar la cita"}`);
      }
    } catch (error) {
      console.error(error);
      setMensaje("❌ Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  //Obtener Subservicio
  const obtenerSubservicioInfo = (id) => {
    if (!id) return null;

    for (const categoria in servicios) {
      const subservicio = servicios[categoria].find(
        (s) => s.SUBSERVICIO_ID == id || s.id == id || s.ID == id,
      );
      if (subservicio) return subservicio;
    }
    return null;
  };

  const infoSeleccionado = obtenerSubservicioInfo(subservicioSeleccionado);
  const precioSeleccionado = parseFloat(
    infoSeleccionado?.PRECIO || infoSeleccionado?.precio || 0,
  );
  const formularioIncompleto =
    !subservicioSeleccionado || !fecha || !hora || !clienteNombre || !clienteTelefono;

  const tipoMensaje = mensaje.includes("✅")
    ? "ok"
    : mensaje.includes("❌")
      ? "error"
      : "info";

  // Quitar el emoji inicial del mensaje (ya se muestra un ícono)
  const textoMensaje = mensaje.replace(/^(✅|❌|⚠️|ℹ️|🛠️)\s*/u, "");

  return (
    <div className="min-h-screen bg-ink text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        {/* Encabezado */}
        <div className="mb-12 text-center">
          <p className="mb-4 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.35em] text-gold">
            <span className="h-px w-8 bg-gold" />
            Reserva en línea
            <span className="h-px w-8 bg-gold" />
          </p>
          <h1 className="font-display text-4xl md:text-5xl">
            Agenda tu <span className="text-gradient-gold italic">turno</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-white/60">
            Elige el servicio, la fecha y la hora que prefieras. Te esperamos.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            {/* PASO 1: SERVICIO */}
            <Paso numero="1" titulo="Elige tu servicio">
              <Etiqueta>Categoría</Etiqueta>
              {cargandoServicios ? (
                <p className="flex items-center gap-2 text-sm text-white/50">
                  <Loader2 size={16} className="animate-spin text-gold" />
                  Cargando categorías...
                </p>
              ) : categorias.length === 0 ? (
                <p className="text-sm text-white/50">No hay categorías disponibles.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categorias.map((categoria) => (
                    <button
                      key={categoria}
                      type="button"
                      onClick={() => setServicioSeleccionado(categoria)}
                      className={`rounded-full border px-5 py-2.5 text-sm transition-all duration-300 ${
                        servicioSeleccionado === categoria
                          ? "border-gold bg-gold font-semibold text-ink"
                          : "border-white/15 text-white/75 hover:border-gold/60 hover:text-gold"
                      }`}
                    >
                      {categoria}
                    </button>
                  ))}
                </div>
              )}

              {servicioSeleccionado && (
                <div className="mt-8">
                  <Etiqueta>Servicio específico</Etiqueta>
                  {subservicios.length === 0 ? (
                    <p className="text-sm text-white/50">
                      No hay servicios en esta categoría.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {subservicios.map((s, index) => {
                        const itemId = s.SUBSERVICIO_ID || s.id || s.ID || `temp-${index}`;
                        const itemNombre = s.NOMBRE || s.nombre || `Servicio ${index + 1}`;
                        const itemPrecio = parseFloat(s.PRECIO || s.precio || 0);
                        const itemDuracion =
                          s.DURACION_MINUTOS || s.duracionMinutos || s.duracion || 60;
                        const activo = String(subservicioSeleccionado) === String(itemId);

                        return (
                          <button
                            key={`${itemId}-${index}`}
                            type="button"
                            onClick={() => setSubservicioSeleccionado(String(itemId))}
                            className={`rounded-2xl border p-4 text-left transition-all duration-300 ${
                              activo
                                ? "border-gold bg-gold/10 shadow-lg shadow-gold/10"
                                : "border-white/10 hover:border-gold/50 hover:bg-white/[0.03]"
                            }`}
                          >
                            <span className="block font-semibold text-white">{itemNombre}</span>
                            <span className="mt-2 flex items-center justify-between text-sm">
                              <span className="text-gold">${itemPrecio.toLocaleString()}</span>
                              <span className="flex items-center gap-1 text-white/50">
                                <Clock size={14} />
                                {itemDuracion} min
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </Paso>

            {/* PASO 2: FECHA Y HORA */}
            <Paso numero="2" titulo="Fecha y hora">
              <Etiqueta htmlFor="fecha">Fecha</Etiqueta>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="fecha"
                  type="date"
                  value={fecha}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setFecha(e.target.value)}
                  className={`${inputClass} sm:max-w-xs`}
                  required
                />
                <button
                  type="button"
                  onClick={cargarHorariosDisponibles}
                  disabled={cargandoHorarios || !subservicioSeleccionado || !fecha}
                  className="flex items-center justify-center gap-2 rounded-xl border border-gold/60 px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-gold transition-colors duration-300 hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/30 disabled:hover:bg-transparent"
                >
                  {cargandoHorarios ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <CalendarDays size={18} />
                  )}
                  {cargandoHorarios ? "Buscando..." : "Ver horarios"}
                </button>
              </div>
              {(!subservicioSeleccionado || !fecha) && (
                <p className="mt-2 text-xs text-white/40">
                  Selecciona un servicio y una fecha para ver los horarios disponibles.
                </p>
              )}

              {horariosDisponibles.length > 0 && (
                <div className="mt-8">
                  <Etiqueta>Horarios disponibles</Etiqueta>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                    {horariosDisponibles.map((horario, index) => {
                      const horaStr = horario.HORA || horario;
                      const ocupado = estaHorarioOcupado(horario);
                      const activo = hora === horaStr;

                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => !ocupado && setHora(horaStr)}
                          disabled={ocupado}
                          title={ocupado ? "Horario ocupado" : `Disponible: ${formatearHora(horaStr)}`}
                          className={`rounded-xl border py-2.5 text-sm font-medium transition-all duration-200 ${
                            ocupado
                              ? "cursor-not-allowed border-white/5 text-white/20 line-through"
                              : activo
                                ? "border-gold bg-gold text-ink"
                                : "border-white/15 text-white/80 hover:border-gold hover:text-gold"
                          }`}
                        >
                          {formatearHora(horaStr)}
                        </button>
                      );
                    })}
                  </div>
                  {duracionServicio > 0 && (
                    <p className="mt-3 text-xs text-white/40">
                      Este servicio ocupa {Math.ceil(duracionServicio / 30)} bloque(s) de 30 minutos.
                    </p>
                  )}
                </div>
              )}
            </Paso>

            {/* PASO 3: DATOS */}
            <Paso numero="3" titulo="Tus datos">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Etiqueta htmlFor="nombre">Nombre completo</Etiqueta>
                  <input
                    id="nombre"
                    type="text"
                    autoComplete="name"
                    value={clienteNombre}
                    onChange={(e) => setClienteNombre(e.target.value)}
                    placeholder="Ej: Ana Pérez"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <Etiqueta htmlFor="telefono">Teléfono</Etiqueta>
                  <input
                    id="telefono"
                    type="tel"
                    autoComplete="tel"
                    inputMode="numeric"
                    value={clienteTelefono}
                    onChange={(e) => setClienteTelefono(e.target.value)}
                    placeholder="Ej: 3001234567"
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </Paso>
          </div>

          {/* RESUMEN */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-3xl border border-gold/30 bg-linear-to-b from-gold/10 to-transparent p-6 md:p-8">
              <h2 className="mb-6 flex items-center gap-2 font-display text-xl">
                <Sparkles size={20} className="text-gold" />
                Resumen
              </h2>

              <dl className="space-y-4 text-sm">
                <FilaResumen titulo="Servicio">
                  {infoSeleccionado?.NOMBRE || infoSeleccionado?.nombre || "—"}
                </FilaResumen>
                <FilaResumen titulo="Fecha">{fecha || "—"}</FilaResumen>
                <FilaResumen titulo="Horario">
                  {hora ? `${formatearHora(hora)} - ${calcularHoraFin(hora)}` : "—"}
                </FilaResumen>
                <FilaResumen titulo="Duración">
                  {duracionServicio ? `${duracionServicio} min` : "—"}
                </FilaResumen>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-white/50">Total</dt>
                  <dd className="font-display text-2xl text-gold">
                    {precioSeleccionado ? `$${precioSeleccionado.toLocaleString()}` : "—"}
                  </dd>
                </div>
              </dl>

              {(clienteNombre || clienteTelefono) && (
                <div className="mt-6 space-y-2 rounded-2xl bg-white/[0.04] p-4 text-sm text-white/70">
                  {clienteNombre && (
                    <p className="flex items-center gap-2">
                      <User size={14} className="text-gold" />
                      {clienteNombre}
                    </p>
                  )}
                  {clienteTelefono && (
                    <p className="flex items-center gap-2">
                      <Phone size={14} className="text-gold" />
                      {clienteTelefono}
                    </p>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={registrarTurno}
                disabled={loading || formularioIncompleto}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gold py-4 text-sm font-semibold uppercase tracking-[0.15em] text-ink transition-all duration-300 hover:bg-gold-light disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? "Agendando..." : "Confirmar cita"}
              </button>

              {mensaje && (
                <div
                  className={`mt-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
                    tipoMensaje === "ok"
                      ? "border-green-500/30 bg-green-500/10 text-green-300"
                      : tipoMensaje === "error"
                        ? "border-red-500/30 bg-red-500/10 text-red-300"
                        : "border-gold/30 bg-gold/10 text-gold-light"
                  }`}
                >
                  {tipoMensaje === "ok" ? (
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                  ) : tipoMensaje === "error" ? (
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  ) : (
                    <Info size={18} className="mt-0.5 shrink-0" />
                  )}
                  <span>{textoMensaje}</span>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ===== Componentes de presentación ===== */

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/[0.04] p-3.5 text-white placeholder:text-white/30 outline-none transition-colors [color-scheme:dark] focus:border-gold focus:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50";

function Paso({ numero, titulo, children }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <h2 className="mb-6 flex items-center gap-3 font-display text-xl text-white">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold font-sans text-sm font-bold text-ink">
          {numero}
        </span>
        {titulo}
      </h2>
      {children}
    </section>
  );
}

function Etiqueta({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/60"
    >
      {children}
    </label>
  );
}

function FilaResumen({ titulo, children }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/10 pb-4">
      <dt className="text-white/50">{titulo}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}
