import React, { useEffect, useState } from "react";

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
  const [turnoCreado, setTurnoCreado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [duracionServicio, setDuracionServicio] = useState(0);
  const [cargandoServicios, setCargandoServicios] = useState(true);

  const API = import.meta.env.VITE_API_URL;

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
        
        const nombresCategorias = dataCategorias.data.map(cat => cat.NOMBRE);
        setCategorias(nombresCategorias);
        
        const estructuraInicial = {};
        dataCategorias.data.forEach(categoria => {
          estructuraInicial[categoria.NOMBRE] = [];
        });
        setServicios(estructuraInicial);
        
        // 2. CARGAR SUBSERVICIOS
        const resSubservicios = await fetch(`${API}/subservicio/obtener_subservicios`);
        
        if (!resSubservicios.ok) {
          throw new Error(`Error subservicios: ${resSubservicios.status}`);
        }
        
        const dataSubservicios = await resSubservicios.json();
        
        // 3. COMBINAR DATOS
        if (dataSubservicios.success && dataSubservicios.data && dataSubservicios.data.length > 0) {
          const serviciosCompletos = { ...estructuraInicial };
          
          dataSubservicios.data.forEach(sub => {
            const categoria = dataCategorias.data.find(cat => cat.ID == sub.SERVICIO_ID);
            
            if (categoria) {
              const categoriaNombre = categoria.NOMBRE;
              if (!serviciosCompletos[categoriaNombre]) {
                serviciosCompletos[categoriaNombre] = [];
              }
              
              serviciosCompletos[categoriaNombre].push({
                ...sub,
                SUBSERVICIO_ID: sub.SUBSERVICIO_ID || sub.ID
              });
            }
          });
          
          setServicios(serviciosCompletos);
          
          const totalSubservicios = Object.values(serviciosCompletos).reduce((total, arr) => total + arr.length, 0);
          if (totalSubservicios === 0) {
            setMensaje("⚠️ Hay categorías pero no hay servicios específicos disponibles.");
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
        setMensaje(`⚠️ La categoría "${servicioSeleccionado}" no tiene servicios específicos.`);
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
      console.log(`🔍 Buscando horarios para subservicio ${subservicioSeleccionado} en fecha ${fecha}`);
      
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
          const horariosFormateados = dataHorarios.horarios.map(horario => {
            if (typeof horario === 'object' && horario.HORA) {
              return horario;
            } else if (typeof horario === 'string') {
              return { HORA: horario };
            } else {
              return { HORA: String(horario) };
            }
          });
          
          console.log("📅 Horarios formateados:", horariosFormateados);
          setHorariosDisponibles(horariosFormateados);
          setMensaje(`✅ Se encontraron ${horariosFormateados.length} horarios disponibles`);
          
          // 2. Buscar empleado disponible
          try {
            const resEmpleado = await fetch(
              `${API}/turnos/empleado-disponible/${subservicioSeleccionado}`
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
              horariosFormateados
            );
          }
          
        } else {
          // SI NO HAY HORARIOS DISPONIBLES
          setMensaje("❌ No hay horarios disponibles para esta fecha. Prueba otra fecha.");
          console.log("⚠️ El backend devolvié un array vacío de horarios");
          
          // Generar horarios de prueba para desarrollo
          if (import.meta.env.DEV) {
            console.log("🛠️ Modo desarrollo: Generando horarios de prueba");
            const horariosPrueba = generarHorariosDePrueba();
            setHorariosDisponibles(horariosPrueba);
            setMensaje(`🛠️ Modo desarrollo: ${horariosPrueba.length} horarios de prueba`);
          }
        }
      } else {
        setMensaje(`❌ Error del servidor: ${dataHorarios.message || "No se pudieron obtener horarios"}`);
      }
    } catch (error) {
      console.error("❌ Error al cargar horarios:", error);
      setMensaje("❌ Error de conexión con el servidor. Verifica que la API esté funcionando.");
      
      // En desarrollo, mostrar horarios de prueba
      if (import.meta.env.DEV) {
        console.log("🛠️ Modo desarrollo: Usando datos de prueba por error de conexión");
        const horariosPrueba = generarHorariosDePrueba();
        setHorariosDisponibles(horariosPrueba);
        setMensaje(`🛠️ Modo desarrollo: Usando ${horariosPrueba.length} horarios de prueba`);
      }
    } finally {
      setCargandoHorarios(false);
    }
  };

  //Generar horarios
  const generarHorariosDePrueba = () => {
    const horarios = [];
    const horaInicio = 9; // 9:00 AM
    const horaFin = 18;   // 6:00 PM
    
    for (let hora = horaInicio; hora < horaFin; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 30) {
        const horaStr = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
        horarios.push({ HORA: horaStr });
      }
    }
    
    return horarios;
  };

  //Calcular horarios ocupado por el empelado 
  const cargarHorariosOcupados = async (empleadoId, fechaSeleccionada, todosHorarios) => {
    try {
      console.log(`📅 Buscando horarios ocupados para empleado ${empleadoId} en ${fechaSeleccionada}`);
      
      const res = await fetch(
        `${API}/turnos/mis-turnos-fecha/${empleadoId}/${fechaSeleccionada}/${fechaSeleccionada}`
      );
      
      if (!res.ok) return;
      
      const data = await res.json();
      
      if (data.success && data.data) {
        const turnosActivos = data.data.filter(turno => 
          (turno.ESTADO === 'pendiente' || turno.ESTADO === 'confirmado') && 
          turno.FECHA === fechaSeleccionada
        );
        
        const horasOcupadas = turnosActivos.map(turno => 
          turno.HORA_INICIO || turno.HORA_SELECCIONADA
        ).filter(hora => hora);
        
        const bloquesABloquear = calcularBloquesABloquear(horasOcupadas, todosHorarios);
        setHorariosOcupados(bloquesABloquear);
      }
    } catch (error) {
      console.error("⚠️ Error al cargar horarios ocupados:", error);
    }
  };

  //Calcular bloques a bloquear
  const calcularBloquesABloquear = (horasOcupadas, todosHorarios) => {
    const bloquesABloquear = new Set();
    
    horasOcupadas.forEach(horaOcupada => {
      const horaOcupadaFormateada = formatearHoraParaComparar(horaOcupada);
      const indexOcupado = todosHorarios.findIndex(h => 
        formatearHoraParaComparar(h.HORA || h) === horaOcupadaFormateada
      );
      
      if (indexOcupado !== -1) {
        const bloques = Math.max(1, Math.ceil(duracionServicio / 30));
        for (let i = 0; i < bloques; i++) {
          const bloqueIndex = indexOcupado + i;
          if (bloqueIndex < todosHorarios.length) {
            const horaBloqueada = todosHorarios[bloqueIndex];
            bloquesABloquear.add(formatearHoraParaComparar(horaBloqueada.HORA || horaBloqueada));
          }
        }
      }
    });
    
    return Array.from(bloquesABloquear);
  };

  //Verificar horario
  const estaHorarioOcupado = (horario) => {
    const horaStr = formatearHoraParaComparar(horario.HORA || horario);
    return horariosOcupados.some(horaOcupada => 
      formatearHoraParaComparar(horaOcupada) === horaStr
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
    
    const [horas, minutos] = horaInicio.split(':').map(Number);
    const totalMinutos = horas * 60 + minutos + duracionServicio;
    const finHoras = Math.floor(totalMinutos / 60);
    const finMinutos = totalMinutos % 60;
    
    return `${finHoras.toString().padStart(2, '0')}:${finMinutos.toString().padStart(2, '0')}`;
  };

  //Registrar turno
  const registrarTurno = async () => {
    if (!subservicioSeleccionado || !fecha || !hora || !clienteNombre || !clienteTelefono) {
      setMensaje("Por favor completa todos los campos obligatorios");
      return;
    }

    if (!/^\d{10}$/.test(clienteTelefono.replace(/\D/g, ''))) {
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
          clienteTelefono: clienteTelefono.trim()
        }),
      });

      const data = await res.json();

      if (data.success) {
        setTurnoCreado(true);
        setMensaje("✅ ¡Cita agendada exitosamente!");
        
        const subservicioInfo = obtenerSubservicioInfo(subservicioSeleccionado);
        const empleadoNombre = empleadoDisponible?.NOMBRE || "Por asignar";
        const horaFin = calcularHoraFin(hora);
        
        alert(`
          🎉 ¡CITA CONFIRMADA!
          
          📋 Detalles:
          • Servicio: ${subservicioInfo?.NOMBRE || ""}
          • Duración: ${duracionServicio} minutos
          • Horario: ${formatearHora(hora)} - ${horaFin}
          • Fecha: ${fecha}
          • Empleado: ${empleadoNombre}
          • Cliente: ${clienteNombre}
          • Teléfono: ${clienteTelefono}
        `);
        
        setClienteNombre("");
        setClienteTelefono("");
        setHora("");
        
        // Recargar horarios después de agendar
        await cargarHorariosDisponibles();
        
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
      const subservicio = servicios[categoria].find(s => 
        (s.SUBSERVICIO_ID == id) || 
        (s.id == id) || 
        (s.ID == id)
      );
      if (subservicio) return subservicio;
    }
    return null;
  };


  return (
    <div className=" max-w-86 md:max-w-lg  mx-auto  p-6 bg-black rounded-xl shadow-lg my-16 ">
      <h2 className="text-2xl font-bold mb-6 text-center  bg-linear-to-b from-amber-200 to-yellow-700/90 bg-clip-text text-transparent uppercase">
        Agendar Cita
      </h2>

      {/* FECHA */}
      <div className="mb-4">
        <label className="block font-semibold mb-2 text-amber-400">
          📅 Fecha *
        </label>
        <input
          type="date"
          value={fecha}
          min={new Date().toISOString().split('T')[0]}
          onChange={(e) => setFecha(e.target.value)}
          className="w-full border text-amber-400 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
        <p className="text-xs text-amber-400 mt-1">
          Selecciona una fecha para ver horarios disponibles
        </p>
      </div>

      {/* CATEGORÍA DE SERVICIO */}
      <div className="mb-4">
        <label className="block font-semibold mb-2 text-amber-400">
           Categoría de Servicio
        </label>
        <select
          value={servicioSeleccionado}
          onChange={(e) => setServicioSeleccionado(e.target.value)}
          className="w-full border text-amber-400 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={cargandoServicios || categorias.length === 0}
        >
          <option value="">
            {cargandoServicios 
              ? "Cargando categorías..." 
              : categorias.length === 0 
                ? "No hay categorías disponibles" 
                : "Selecciona una categoría"}
          </option>
          {categorias.map((categoria) => (
            <option  className="bg-black text-amber-400" key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
        {categorias.length > 0 && (
          <p className="text-xs text-amber-400 mt-1">
            {categorias.length} categoría(s) disponible(s)
          </p>
        )}
      </div>

      {/* SERVICIO ESPECÍFICO */}
      <div className="mb-4">
        <label className=" block font-semibold mb-2 text-amber-400">
           Servicio Específico *
        </label>
        <select
          value={subservicioSeleccionado}
          onChange={(e) => setSubservicioSeleccionado(e.target.value)}
          className="w-full border border-gray-300 p-3   text-amber-400 rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={!servicioSeleccionado || subservicios.length === 0}
        >
          <option value="" >
            {!servicioSeleccionado 
              ? "Primero selecciona una categoría" 
              : subservicios.length === 0 
                ? "No hay servicios en esta categoría" 
                : "Selecciona un servicio"}
          </option>
          {subservicios.map((s, index) => {
            const itemId = s.SUBSERVICIO_ID || s.id || s.ID || `temp-${index}`;
            const itemNombre = s.NOMBRE || s.nombre || `Servicio ${index + 1}`;
            const itemPrecio = parseFloat(s.PRECIO || s.precio || 0);
            const itemDuracion = s.DURACION_MINUTOS || s.duracionMinutos || s.duracion || 60;
            
            return (
              <option  className="bg-black"
                key={`${itemId}-${index}`} 
                value={itemId}
              >
                {itemNombre} - ${itemPrecio.toLocaleString()} - {itemDuracion} min
              </option>
            );
          })}
        </select>
        
        {subservicios.length > 0 && (
          <p className="text-xs  text-amber-400  mt-1">
            {subservicios.length} servicio(s) disponible(s)
          </p>
        )}
      </div>

      {/* INFORMACIÓN DE DURACIÓN */}
      {subservicioSeleccionado && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-black">
             <span className="font-bold">Duración:</span> {duracionServicio} minutos
            {hora && (
              <span className="ml-2">
                • Horario: {formatearHora(hora)} - {calcularHoraFin(hora)}
              </span>
            )}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            * Se bloquearán {Math.ceil(duracionServicio / 30)} horario(s) consecutivo(s)
          </p>
        </div>
      )}

      {/* BOTÓN BUSCAR HORARIOS */}
      {subservicioSeleccionado && fecha && (
        <div className="mb-6">
          <button
            onClick={cargarHorariosDisponibles}
            disabled={cargandoHorarios}
            className={`w-full p-3 rounded-lg font-semibold ${
              cargandoHorarios
                ? 'bg--300 text-gray-500 cursor-not-allowed'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            {cargandoHorarios ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Buscando horarios...
              </span>
            ) : (
              'Buscar Horarios Disponibles'
            )}
          </button>
        </div>
      )}

      {/* HORARIOS DISPONIBLES */}
      {horariosDisponibles.length > 0 && (
        <div className="mb-6">
          <label className="block font-semibold mb-2 text-yellow-400">
             Horarios Disponibles *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {horariosDisponibles.map((horario, index) => {
              const horaStr = horario.HORA || horario;
              const ocupado = estaHorarioOcupado(horario);
              
              return (
                <button
                  key={index}
                  onClick={() => !ocupado && setHora(horaStr)}
                  disabled={ocupado}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    ocupado
                      ? 'bg-red-100 text-red-800 border-red-300 cursor-not-allowed'
                      : hora === horaStr
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-gray-100 hover:bg-amber-200 border-gray-300'
                  }`}
                  title={ocupado ? "Horario ocupado" : `Disponible: ${formatearHora(horaStr)}`}
                >
                  {formatearHora(horaStr)}
                </button>
              );
            })}
          </div>
          
          {hora && (
            <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-300">
              <p className="text-sm text-amber-600">
                <span className="font-bold">Horario seleccionado:</span> {formatearHora(hora)} - {calcularHoraFin(hora)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* DATOS DEL CLIENTE */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3 text-amber-400"> Tus datos</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-amber-400 mb-1">
            Nombre Completo *
          </label>
          <input
            type="text"
            value={clienteNombre}
            onChange={(e) => setClienteNombre(e.target.value)}
            placeholder="Ej: Juan Pérez"
            className="w-full border text-amber-400 border-gray-300 p-3 rounded-lg"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-amber-400 mb-1">
            Teléfono *
          </label>
          <input
            type="tel"
            value={clienteTelefono}
            onChange={(e) => setClienteTelefono(e.target.value)}
            placeholder="Ej: 3001234567"
            className="w-full border border-gray-300 p-3 rounded-lg text-amber-400"
            required
          />
        </div>
      </div>

      {/* BOTÓN AGENDAR */}
      <button
        onClick={registrarTurno}
        disabled={loading || !subservicioSeleccionado || !fecha || !hora || !clienteNombre || !clienteTelefono}
        className={`
          w-full p-4 rounded-lg font-semibold text-lg text-white transition-colors
          ${(loading || !subservicioSeleccionado || !fecha || !hora || !clienteNombre || !clienteTelefono)
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-amber-600 hover:bg-amber-700'
          }
        `}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-2 w- mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Agendando...
          </span>
        ) : (
          ' Confirmar Cita'
        )}
      </button>

      {/* MENSAJES */}
      {mensaje && (
        <div className={`
          mt-4 p-3 rounded-lg text-center
          ${mensaje.includes('✅') 
            ? 'bg-green-100 text-green-800 border border-green-200'
            : mensaje.includes('❌')
            ? 'bg-red-100 text-red-800 border border-red-200'
            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
          }
        `}>
          {mensaje}
        </div>
      )}

      {/* MODO DESARROLLO INFO */}
     
    </div>
  );
}