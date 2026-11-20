// Traduce los SIGNAL de los procedimientos almacenados a mensajes legibles
const MENSAJES = {
  NO_HAY_EMPLEADOS_DISPONIBLES_PARA_ESTE_HORARIO:
    "No hay empleados disponibles para este horario. Prueba otra hora.",
  EMPLEADO_NO_TIENE_ASISTENCIA_PRESENTE:
    "El empleado no tiene la asistencia registrada hoy.",
  EMPLEADO_NO_TIENE_ASISTENCIA_PARA_ESTE_DIA:
    "El empleado no tiene asistencia registrada para ese día.",
  USUARIO_NO_ES_EMPLEADO_ACTIVO: "El usuario no es un empleado activo.",
  EMPLEADO_YA_TIENE_ENTRADA: "Este empleado ya registró entrada hoy.",
  NO_HAY_ASISTENCIA_PARA_REACTIVAR: "No hay asistencia de hoy para reactivar.",
};

export function mensajeError(error) {
  if (error?.sqlState === "45000" && MENSAJES[error.sqlMessage]) {
    return MENSAJES[error.sqlMessage];
  }
  if (error?.code === "ER_DUP_ENTRY") return "Ese registro ya existe.";
  if (error?.code === "ECONNREFUSED") return "No se pudo conectar a la base de datos.";
  if (error?.code === "ER_ACCESS_DENIED_ERROR") return "Usuario o contraseña de MySQL incorrectos.";
  return "Error interno del servidor";
}

/**
 * Envuelve un handler async: captura errores y responde
 * { success: false, message, code } con el estado HTTP adecuado.
 */
export const manejar = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (error) {
    const esDeNegocio = error?.sqlState === "45000";
    if (!esDeNegocio) console.error(`❌ ${req.method} ${req.originalUrl}:`, error);
    res.status(esDeNegocio ? 400 : 500).json({
      success: false,
      message: mensajeError(error),
      code: esDeNegocio ? error.sqlMessage : error?.code,
    });
  }
};
