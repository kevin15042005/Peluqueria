import express from "express";
import conectDb from "../db.js";

const router = express.Router();

// ========== OBTENER SUBSERVICIOS PARA TURNOS ==========
router.get("/subservicios", async (req, res) => {
  try {
    const db = await conectDb();
    const [rows] = await db.execute("CALL OBTENER_SUBSERVICIOS_CLIENTE()");
    res.json({ 
      success: true, 
      data: rows[0] 
    });
  } catch (error) {
    console.error("❌ Error al obtener subservicios:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al obtener subservicios",
      error: error.message,
    });
  }
});

// ========== OBTENER SUBSERVICIOS POR SERVICIO ==========
router.get("/subservicios-por-servicio/:servicioId", async (req, res) => {
  const { servicioId } = req.params;

  try {
    const db = await conectDb();
    const [rows] = await db.execute(
      "CALL OBTENER_SUBSERVICIOS_POR_SERVICIO(?)",
      [servicioId]
    );
    res.json({ 
      success: true, 
      data: rows[0] 
    });
  } catch (error) {
    console.error("❌ Error al obtener subservicios por servicio:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al obtener subservicios",
      error: error.message,
    });
  }
});

// ========== OBTENER EMPLEADO DISPONIBLE ==========
router.get("/empleado-disponible/:subservicioId", async (req, res) => {
  const { subservicioId } = req.params;

  try {
    const db = await conectDb();
    const [rows] = await db.execute(
      "CALL EMPLEADO_DISPONIBLE_POR_SUBSERVICIO(?)",
      [subservicioId]
    );
    res.json({ 
      success: true, 
      data: rows[0][0] || null 
    });
  } catch (error) {
    console.error("❌ Error al buscar empleado:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al buscar empleado",
      error: error.message,
    });
  }
});

// ========== OBTENER HORARIOS DISPONIBLES ==========
router.get("/horarios-disponibles/:subservicioId/:fecha", async (req, res) => {
  const { subservicioId, fecha } = req.params;

  try {
    const db = await conectDb();
    const [rows] = await db.execute(
      "CALL OBTENER_HORARIOS_DISPONIBLES(?, ?)",
      [subservicioId, fecha]
    );

    res.json({
      success: true,
      horarios: rows[0] || []
    });
  } catch (error) {
    console.error("❌ Error al obtener horarios:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al obtener horarios disponibles",
      error: error.message,
    });
  }
});

// ========== REGISTRAR TURNO CON HORA (CLIENTE) ==========
router.post("/registrar-con-hora", async (req, res) => {
  const { 
    subservicioId, 
    fecha, 
    horaSeleccionada, 
    clienteNombre, 
    clienteTelefono 
  } = req.body;

  if (!subservicioId || !fecha || !horaSeleccionada || !clienteNombre || !clienteTelefono) {
    return res.status(400).json({
      success: false,
      message: "Todos los campos son obligatorios",
    });
  }

  try {
    const db = await conectDb();
    
    const [result] = await db.execute(
      "CALL REGISTRAR_TURNO_CLIENTE(?, ?, ?, ?, ?)",
      [subservicioId, fecha, horaSeleccionada, clienteNombre, clienteTelefono]
    );

    const turnoData = result[0][0];
    
    if (turnoData && turnoData.TURNO_ID) {
      let mensaje = "Cita agendada exitosamente";
      
      if (turnoData.CON_ASISTENCIA === 0) {
        mensaje += " (Nota: Empleado asignado no tiene asistencia registrada hoy)";
      }
      
      res.json({
        success: true,
        message: mensaje,
        turnoId: turnoData.TURNO_ID,
        empleadoId: turnoData.EMPLEADO_ID,
        conAsistencia: turnoData.CON_ASISTENCIA === 1
      });
    } else {
      res.status(400).json({
        success: false,
        message: "No se pudo agendar la cita. Verifique la disponibilidad."
      });
    }
  } catch (error) {
    console.error("❌ Error al registrar turno:", error.message);
    
    let mensajeError = "Error al agendar la cita";
    if (error.message.includes('NO_HAY_EMPLEADOS_DISPONIBLES')) {
      mensajeError = "No hay empleados disponibles para este servicio en el horario seleccionado";
    }
    
    res.status(500).json({
      success: false,
      message: mensajeError,
      error: error.message,
    });
  }
});

// ========== REGISTRAR TURNO MANUAL (ADMIN) ==========
router.post("/registrar-manual", async (req, res) => {
  const { 
    subservicioId, 
    empleadoId,
    fecha, 
    horaSeleccionada, 
    clienteNombre, 
    clienteTelefono 
  } = req.body;

  if (!subservicioId || !empleadoId || !fecha || !horaSeleccionada || !clienteNombre || !clienteTelefono) {
    return res.status(400).json({
      success: false,
      message: "Todos los campos son obligatorios",
    });
  }

  try {
    const db = await conectDb();
    
    const [result] = await db.execute(
      "CALL REGISTRAR_TURNO_MANUAL(?, ?, ?, ?, ?, ?)",
      [subservicioId, empleadoId, fecha, horaSeleccionada, clienteNombre, clienteTelefono]
    );

    const turnoData = result[0][0];
    
    if (turnoData && turnoData.TURNO_ID) {
      res.json({
        success: true,
        message: "Turno registrado manualmente",
        turnoId: turnoData.TURNO_ID
      });
    } else {
      res.status(400).json({
        success: false,
        message: "No se pudo registrar el turno. Verifique la disponibilidad del empleado."
      });
    }
  } catch (error) {
    console.error("❌ Error al registrar turno manual:", error.message);
    
    let mensajeError = "Error al registrar turno";
    if (error.message.includes('EMPLEADO_NO_DISPONIBLE')) {
      mensajeError = "El empleado no está disponible en ese horario";
    }
    
    res.status(500).json({
      success: false,
      message: mensajeError,
      error: error.message,
    });
  }
});

// ========== OBTENER SERVICIOS DE EMPLEADO ==========
router.get("/servicios-empleado/:empleadoId", async (req, res) => {
  const { empleadoId } = req.params;

  try {
    const db = await conectDb();
    const [rows] = await db.execute(
      "CALL OBTENER_SERVICIOS_EMPLEADO(?)",
      [empleadoId]
    );

    res.json({ 
      success: true, 
      data: rows[0] 
    });
  } catch (error) {
    console.error("❌ Error al obtener servicios del empleado:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al obtener servicios",
      error: error.message,
    });
  }
});

// ========== OBTENER TURNOS DE EMPLEADO ==========
router.get("/mis-turnos/:empleadoId", async (req, res) => {
  const { empleadoId } = req.params;

  try {
    const db = await conectDb();
    const [rows] = await db.execute(
      "CALL OBTENER_TURNOS_EMPLEADO(?)",
      [empleadoId]
    );

    res.json({ 
      success: true, 
      data: rows[0] 
    });
  } catch (error) {
    console.error("❌ Error al obtener turnos:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al obtener turnos",
      error: error.message,
    });
  }
});

// ========== OBTENER SIGUIENTE TURNO PARA EMPLEADO ==========
router.get("/siguiente-turno/:empleadoId", async (req, res) => {
  const { empleadoId } = req.params;

  try {
    const db = await conectDb();
    const [rows] = await db.execute(
      "CALL OBTENER_SIGUIENTE_TURNO(?)",
      [empleadoId]
    );

    const siguienteTurno = rows[0][0];
    
    if (siguienteTurno && siguienteTurno.MENSAJE === 'EMPLEADO_NO_TIENE_ASISTENCIA_PRESENTE') {
      res.json({
        success: false,
        message: "El empleado no tiene asistencia registrada hoy",
        siguienteTurno: null
      });
    } else {
      res.json({
        success: true,
        siguienteTurno: siguienteTurno || null
      });
    }
  } catch (error) {
    console.error("❌ Error al obtener siguiente turno:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al obtener siguiente turno",
      error: error.message,
    });
  }
});

// ========== INICIAR TURNO (EN ATENCIÓN) ==========
router.post("/iniciar-turno", async (req, res) => {
  const { turnoId } = req.body;

  if (!turnoId) {
    return res.status(400).json({
      success: false,
      message: "Turno ID es requerido"
    });
  }

  try {
    const db = await conectDb();
    const [result] = await db.execute(
      "CALL INICIAR_TURNO_REAL(?)",
      [turnoId]
    );

    const filasActualizadas = result[0][0]?.FILAS_ACTUALIZADAS || 0;
    
    if (filasActualizadas > 0) {
      res.json({
        success: true,
        message: "Turno iniciado correctamente"
      });
    } else {
      res.status(400).json({
        success: false,
        message: "No se puede iniciar el turno. El empleado no tiene asistencia registrada."
      });
    }
  } catch (error) {
    console.error("❌ Error al iniciar turno:", error.message);
    
    let mensajeError = "Error al iniciar turno";
    if (error.message.includes('EMPLEADO_NO_TIENE_ASISTENCIA_PRESENTE')) {
      mensajeError = "No se puede iniciar el turno. El empleado no tiene asistencia registrada.";
    }
    
    res.status(500).json({
      success: false,
      message: mensajeError,
      error: error.message,
    });
  }
});

// ========== FINALIZAR TURNO ==========
router.post("/finalizar-turno", async (req, res) => {
  const { turnoId } = req.body;

  if (!turnoId) {
    return res.status(400).json({
      success: false,
      message: "Turno ID es requerido"
    });
  }

  try {
    const db = await conectDb();
    const [result] = await db.execute(
      "CALL FINALIZAR_TURNO_REAL(?)",
      [turnoId]
    );

    const filasActualizadas = result[0][0]?.FILAS_ACTUALIZADAS || 0;
    
    if (filasActualizadas > 0) {
      res.json({
        success: true,
        message: "Turno finalizado correctamente"
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Turno no encontrado"
      });
    }
  } catch (error) {
    console.error("❌ Error al finalizar turno:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al finalizar turno",
      error: error.message,
    });
  }
});

// ========== COMPLETAR TURNO ==========
router.post("/completar-turno", async (req, res) => {
  const { turnoId, empleadoId } = req.body;

  if (!turnoId || !empleadoId) {
    return res.status(400).json({
      success: false,
      message: "Turno ID y Empleado ID son requeridos"
    });
  }

  try {
    const db = await conectDb();
    const [result] = await db.execute(
      "CALL COMPLETAR_TURNO(?, ?)",
      [turnoId, empleadoId]
    );

    const filasActualizadas = result[0][0]?.FILAS_ACTUALIZADAS || 0;
    
    if (filasActualizadas > 0) {
      res.json({
        success: true,
        message: "Turno marcado como completado"
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Turno no encontrado o no autorizado"
      });
    }
  } catch (error) {
    console.error("❌ Error al completar turno:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al completar turno",
      error: error.message,
    });
  }
});

// ========== OBTENER TURNOS ACTIVOS HOY ==========
router.get("/activos-hoy", async (req, res) => {
  try {
    const db = await conectDb();
    const [rows] = await db.execute("CALL OBTENER_TURNOS_ACTIVOS_HOY()");

    res.json({
      success: true,
      turnos: rows[0]
    });
  } catch (error) {
    console.error("❌ Error al obtener turnos activos:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al obtener turnos activos",
      error: error.message,
    });
  }
});

// ========== OBTENER TURNOS DEL DÍA ==========
router.get("/turnos-hoy", async (req, res) => {
  try {
    const db = await conectDb();
    const [rows] = await db.execute("CALL OBTENER_TURNOS_HOY()");

    res.json({
      success: true,
      turnos: rows[0]
    });
  } catch (error) {
    console.error("❌ Error al obtener turnos de hoy:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al obtener turnos de hoy",
      error: error.message,
    });
  }
});

// ========== CANCELAR TURNO ==========
router.post("/cancelar-turno", async (req, res) => {
  const { turnoId } = req.body;

  if (!turnoId) {
    return res.status(400).json({
      success: false,
      message: "Turno ID es requerido"
    });
  }

  try {
    const db = await conectDb();
    const [result] = await db.execute(
      "CALL CANCELAR_TURNO(?)",
      [turnoId]
    );

    const filasActualizadas = result[0][0]?.FILAS_ACTUALIZADAS || 0;
    
    if (filasActualizadas > 0) {
      res.json({
        success: true,
        message: "Turno cancelado correctamente"
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Turno no encontrado o ya está completado/cancelado"
      });
    }
  } catch (error) {
    console.error("❌ Error al cancelar turno:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al cancelar turno",
      error: error.message,
    });
  }
});

// ========== OBTENER TURNOS POR FECHA ==========
router.get("/turnos-por-fecha/:fecha", async (req, res) => {
  const { fecha } = req.params;

  try {
    const db = await conectDb();
    const [rows] = await db.execute(
      "CALL OBTENER_TURNOS_POR_FECHA(?)",
      [fecha]
    );

    res.json({
      success: true,
      turnos: rows[0]
    });
  } catch (error) {
    console.error("❌ Error al obtener turnos por fecha:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al obtener turnos por fecha",
      error: error.message,
    });
  }
});

// ========== OBTENER TURNOS DE CLIENTE POR TELÉFONO ==========
router.get("/turnos-cliente/:telefono", async (req, res) => {
  const { telefono } = req.params;

  try {
    const db = await conectDb();
    const [rows] = await db.execute(
      "CALL OBTENER_TURNOS_POR_TELEFONO(?)",
      [telefono]
    );

    res.json({
      success: true,
      turnos: rows[0]
    });
  } catch (error) {
    console.error("❌ Error al obtener turnos del cliente:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al obtener turnos del cliente",
      error: error.message,
    });
  }
});

// ========== VERIFICAR DISPONIBILIDAD EMPLEADO ==========
router.post("/verificar-disponibilidad", async (req, res) => {
  const { empleadoId, fecha, horaInicio, duracionMinutos } = req.body;

  if (!empleadoId || !fecha || !horaInicio || !duracionMinutos) {
    return res.status(400).json({
      success: false,
      message: "Todos los campos son requeridos"
    });
  }

  try {
    const db = await conectDb();
    const [rows] = await db.execute(
      "CALL VERIFICAR_DISPONIBILIDAD_EMPLEADO(?, ?, ?, ?)",
      [empleadoId, fecha, horaInicio, duracionMinutos]
    );

    const disponibilidad = rows[0][0];
    
    res.json({
      success: true,
      disponible: disponibilidad.DISPONIBLE === 1,
      mensaje: disponibilidad.MENSAJE
    });
  } catch (error) {
    console.error("❌ Error al verificar disponibilidad:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al verificar disponibilidad",
      error: error.message,
    });
  }
});

// ========== OBTENER EMPLEADOS DISPONIBLES PARA SERVICIO ==========
router.get("/empleados-disponibles/:subservicioId/:fecha/:hora", async (req, res) => {
  const { subservicioId, fecha, hora } = req.params;

  try {
    const db = await conectDb();
    
    const [rows] = await db.execute(
      "CALL OBTENER_EMPLEADOS_DISPONIBLES(?, ?, ?)",
      [subservicioId, fecha, hora]
    );

    res.json({
      success: true,
      empleados: rows[0] || [],
      total: rows[0]?.length || 0
    });
  } catch (error) {
    console.error("❌ Error al obtener empleados disponibles:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al obtener empleados disponibles",
      error: error.message,
    });
  }
});

// ========== OBTENER ESTADÍSTICAS DE TURNOS ==========
router.get("/estadisticas/:fechaInicio/:fechaFin", async (req, res) => {
  const { fechaInicio, fechaFin } = req.params;

  try {
    const db = await conectDb();
    
    const [rows] = await db.execute(
      "CALL OBTENER_ESTADISTICAS_TURNOS(?, ?)",
      [fechaInicio, fechaFin]
    );

    res.json({
      success: true,
      estadisticas: rows[0][0] || {},
      detalles: rows[1] || []
    });
  } catch (error) {
    console.error("❌ Error al obtener estadísticas:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al obtener estadísticas",
      error: error.message,
    });
  }
});

export default router;