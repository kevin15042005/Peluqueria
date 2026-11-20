import { Router } from "express";
import { callProc, query } from "../db.js";
import { manejar } from "../errores.js";

const router = Router();

/* ---------- utilidades ---------- */

// Consulta base: incluye todos los nombres de campo que usan las pantallas
const SELECT_TURNOS = `
  SELECT
    T.ID,
    T.TRABAJADOR_ID,
    U.NOMBRE AS EMPLEADO,
    U.NOMBRE AS EMPLEADO_NOMBRE,
    T.CLIENTE_NOMBRE,
    T.CLIENTE_TELEFONO,
    S.NOMBRE AS SERVICIO,
    SS.NOMBRE AS SUBSERVICIO,
    SS.NOMBRE AS SUBSERVICIO_NOMBRE,
    SS.PRECIO,
    SS.DURACION_MINUTOS,
    DATE_FORMAT(T.FECHA, '%Y-%m-%d') AS FECHA,
    T.HORA_SELECCIONADA,
    T.HORA_INICIO,
    T.HORA_FIN,
    T.HORA_INICIO_REAL,
    T.HORA_FIN_REAL,
    T.ESTADO,
    CASE T.ESTADO
      WHEN 'pendiente'  THEN 'PENDIENTE'
      WHEN 'confirmado' THEN 'EN ATENCIÓN'
      WHEN 'completado' THEN 'COMPLETADO'
      ELSE 'CANCELADO'
    END AS ESTADO_TEXTO,
    TIMESTAMPDIFF(MINUTE, T.HORA_INICIO_REAL, T.HORA_FIN_REAL) AS DURACION_REAL_MINUTOS
  FROM TURNO T
  INNER JOIN USUARIO U      ON T.TRABAJADOR_ID = U.ID
  INNER JOIN SUBSERVICIO SS ON T.SUBSERVICIO_ID = SS.ID
  INNER JOIN SERVICIO S     ON SS.SERVICIO_ID = S.ID
`;

const esFecha = (f) => /^\d{4}-\d{2}-\d{2}$/.test(f || "");
const esHora = (h) => /^\d{2}:\d{2}(:\d{2})?$/.test(h || "");
const hoyLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const horaActual = () => new Date().toTimeString().slice(0, 8);

// Código visible del turno: T-007
export const codigoTurno = (id) => `T-${String(id).padStart(3, "0")}`;

// "Ana María Pérez" -> "Ana P."  (para pantallas públicas)
const nombreCorto = (n) => {
  const partes = String(n || "Cliente").trim().split(/\s+/);
  return partes.length > 1 ? `${partes[0]} ${partes[partes.length - 1][0]}.` : partes[0];
};

/* ---------- reserva (clientes) ---------- */

// GET /turnos/horarios-disponibles/:subservicioId/:fecha
router.get(
  "/horarios-disponibles/:subservicioId/:fecha",
  manejar(async (req, res) => {
    const { subservicioId, fecha } = req.params;
    if (!esFecha(fecha)) return res.status(400).json({ success: false, message: "Fecha inválida" });
    if (fecha < hoyLocal()) return res.json({ success: true, horarios: [] });

    let horarios = await callProc("OBTENER_HORARIOS_DISPONIBLES", [Number(subservicioId), fecha]);
    // Si es hoy, no mostrar horas que ya pasaron
    if (fecha === hoyLocal()) {
      const ahora = horaActual();
      horarios = horarios.filter((h) => h.HORA > ahora);
    }
    res.json({ success: true, horarios });
  }),
);

// GET /turnos/empleado-disponible/:subservicioId
router.get(
  "/empleado-disponible/:subservicioId",
  manejar(async (req, res) => {
    const filas = await callProc("EMPLEADO_DISPONIBLE_POR_SUBSERVICIO", [Number(req.params.subservicioId)]);
    const emp = filas[0];
    res.json({ success: true, data: emp ? { ID: emp.TRABAJADOR_ID, ...emp } : null });
  }),
);

// POST /turnos/registrar-con-hora
// { subservicioId, fecha, horaSeleccionada, clienteNombre, clienteTelefono }
router.post(
  "/registrar-con-hora",
  manejar(async (req, res) => {
    const { subservicioId, fecha, horaSeleccionada, clienteNombre, clienteTelefono } = req.body;
    const telefono = String(clienteTelefono || "").replace(/\D/g, "");

    if (!subservicioId || !esFecha(fecha) || !esHora(horaSeleccionada) || !clienteNombre?.trim()) {
      return res.status(400).json({ success: false, message: "Completa todos los campos" });
    }
    if (telefono.length !== 10) {
      return res.status(400).json({ success: false, message: "El teléfono debe tener 10 dígitos" });
    }
    const hora = horaSeleccionada.length === 5 ? `${horaSeleccionada}:00` : horaSeleccionada;
    if (fecha < hoyLocal() || (fecha === hoyLocal() && hora <= horaActual())) {
      return res.status(400).json({ success: false, message: "Esa fecha u hora ya pasó" });
    }

    const filas = await callProc("REGISTRAR_TURNO_CLIENTE", [
      Number(subservicioId),
      fecha,
      hora,
      clienteNombre.trim().slice(0, 100),
      telefono,
    ]);
    const turnoId = filas[0]?.TURNO_ID;
    res.status(201).json({
      success: true,
      message: "Cita agendada",
      turnoId,
      codigo: codigoTurno(turnoId),
      empleadoId: filas[0]?.EMPLEADO_ID,
    });
  }),
);

/* ---------- seguimiento (clientes) ---------- */

// Calcula cuántos turnos activos tiene el mismo empleado antes de este
async function calcularPosicion(turno) {
  const [{ DELANTE }] = await query(
    `SELECT COUNT(*) AS DELANTE FROM TURNO
      WHERE TRABAJADOR_ID = ? AND FECHA = ? AND ESTADO IN ('pendiente','confirmado')
        AND (HORA_INICIO < ? OR (HORA_INICIO = ? AND ID < ?))`,
    [turno.TRABAJADOR_ID, turno.FECHA, turno.HORA_INICIO, turno.HORA_INICIO, turno.ID],
  );
  return Number(DELANTE);
}

// Datos que se pueden mostrar al cliente (sin teléfono ni datos internos)
const vistaCliente = (t, delante) => ({
  ID: t.ID,
  CODIGO: codigoTurno(t.ID),
  CLIENTE: nombreCorto(t.CLIENTE_NOMBRE),
  SERVICIO: t.SERVICIO,
  SUBSERVICIO: t.SUBSERVICIO,
  DURACION_MINUTOS: t.DURACION_MINUTOS,
  PRECIO: t.PRECIO,
  EMPLEADO: nombreCorto(t.EMPLEADO),
  FECHA: t.FECHA,
  HORA_INICIO: t.HORA_INICIO,
  HORA_FIN: t.HORA_FIN,
  ESTADO: t.ESTADO,
  ESTADO_TEXTO: t.ESTADO_TEXTO,
  DELANTE: delante,
});

// GET /turnos/estado/:id  -> estado del turno y cuántas personas hay antes
router.get(
  "/estado/:id",
  manejar(async (req, res) => {
    const [turno] = await query(`${SELECT_TURNOS} WHERE T.ID = ?`, [Number(req.params.id)]);
    if (!turno) return res.status(404).json({ success: false, message: "Turno no encontrado" });
    const activo = ["pendiente", "confirmado"].includes(turno.ESTADO);
    const delante = activo ? await calcularPosicion(turno) : 0;
    res.json({ success: true, turno: vistaCliente(turno, delante) });
  }),
);

// GET /turnos/por-telefono/:telefono  -> próximos turnos del cliente
router.get(
  "/por-telefono/:telefono",
  manejar(async (req, res) => {
    const telefono = String(req.params.telefono).replace(/\D/g, "");
    if (telefono.length !== 10) {
      return res.status(400).json({ success: false, message: "El teléfono debe tener 10 dígitos" });
    }
    const filas = await query(
      `${SELECT_TURNOS}
       WHERE T.CLIENTE_TELEFONO = ? AND T.FECHA >= CURDATE()
       ORDER BY T.FECHA ASC, T.HORA_INICIO ASC
       LIMIT 10`,
      [telefono],
    );
    const turnos = await Promise.all(
      filas.map(async (t) =>
        vistaCliente(t, ["pendiente", "confirmado"].includes(t.ESTADO) ? await calcularPosicion(t) : 0),
      ),
    );
    res.json({ success: true, turnos });
  }),
);

// GET /turnos/pantalla  -> datos para la pantalla pública del salón
router.get(
  "/pantalla",
  manejar(async (_req, res) => {
    const filas = await query(
      `${SELECT_TURNOS}
       WHERE T.FECHA = CURDATE() AND T.ESTADO IN ('pendiente','confirmado')
       ORDER BY T.HORA_INICIO ASC, T.ID ASC`,
    );
    const publico = (t) => ({
      ID: t.ID,
      CODIGO: codigoTurno(t.ID),
      CLIENTE: nombreCorto(t.CLIENTE_NOMBRE),
      SERVICIO: t.SUBSERVICIO,
      EMPLEADO: nombreCorto(t.EMPLEADO),
      HORA_INICIO: t.HORA_INICIO,
      HORA_INICIO_REAL: t.HORA_INICIO_REAL,
      ESTADO: t.ESTADO,
    });
    res.json({
      success: true,
      atendiendo: filas.filter((t) => t.ESTADO === "confirmado").map(publico),
      siguientes: filas.filter((t) => t.ESTADO === "pendiente").map(publico),
    });
  }),
);

/* ---------- gestión (admin / empleados) ---------- */

// GET /turnos/activos-hoy
router.get(
  "/activos-hoy",
  manejar(async (_req, res) => {
    const turnos = await query(
      `${SELECT_TURNOS}
       WHERE T.FECHA = CURDATE() AND T.ESTADO IN ('pendiente','confirmado')
       ORDER BY T.HORA_INICIO ASC`,
    );
    res.json({ success: true, turnos });
  }),
);

// GET /turnos/turnos-por-fecha/:fecha
router.get(
  "/turnos-por-fecha/:fecha",
  manejar(async (req, res) => {
    if (!esFecha(req.params.fecha)) return res.status(400).json({ success: false, message: "Fecha inválida" });
    const turnos = await query(`${SELECT_TURNOS} WHERE T.FECHA = ? ORDER BY T.HORA_INICIO ASC`, [req.params.fecha]);
    res.json({ success: true, turnos });
  }),
);

// GET /turnos/mis-turnos/:empleadoId
router.get(
  "/mis-turnos/:empleadoId",
  manejar(async (req, res) => {
    const data = await query(
      `${SELECT_TURNOS} WHERE T.TRABAJADOR_ID = ? ORDER BY T.FECHA DESC, T.HORA_INICIO ASC`,
      [Number(req.params.empleadoId)],
    );
    res.json({ success: true, data });
  }),
);

// GET /turnos/mis-turnos-fecha/:empleadoId/:desde/:hasta
router.get(
  "/mis-turnos-fecha/:empleadoId/:desde/:hasta",
  manejar(async (req, res) => {
    const { empleadoId, desde, hasta } = req.params;
    if (!esFecha(desde) || !esFecha(hasta)) {
      return res.status(400).json({ success: false, message: "Fechas inválidas" });
    }
    const data = await query(
      `${SELECT_TURNOS} WHERE T.TRABAJADOR_ID = ? AND T.FECHA BETWEEN ? AND ? ORDER BY T.FECHA, T.HORA_INICIO`,
      [Number(empleadoId), desde, hasta],
    );
    res.json({ success: true, data });
  }),
);

// POST /turnos/iniciar-turno  { turnoId }
router.post(
  "/iniciar-turno",
  manejar(async (req, res) => {
    const filas = await callProc("INICIAR_TURNO_REAL", [Number(req.body.turnoId)]);
    if (!filas[0]?.FILAS_ACTUALIZADAS) {
      return res.status(404).json({ success: false, message: "Turno no encontrado" });
    }
    res.json({ success: true, message: "Turno iniciado" });
  }),
);

// POST /turnos/finalizar-turno  { turnoId }
router.post(
  "/finalizar-turno",
  manejar(async (req, res) => {
    const filas = await callProc("FINALIZAR_TURNO_REAL", [Number(req.body.turnoId)]);
    if (!filas[0]?.FILAS_ACTUALIZADAS) {
      return res.status(404).json({ success: false, message: "Turno no encontrado" });
    }
    res.json({ success: true, message: "Turno finalizado" });
  }),
);

// POST /turnos/completar-turno  { turnoId, empleadoId }
router.post(
  "/completar-turno",
  manejar(async (req, res) => {
    const filas = await callProc("COMPLETAR_TURNO", [Number(req.body.turnoId), Number(req.body.empleadoId)]);
    if (!filas[0]?.FILAS_ACTUALIZADAS) {
      return res.status(400).json({ success: false, message: "El turno no se pudo completar" });
    }
    res.json({ success: true, message: "Turno completado" });
  }),
);

// POST /turnos/cancelar-turno  { turnoId }
router.post(
  "/cancelar-turno",
  manejar(async (req, res) => {
    const filas = await callProc("CANCELAR_TURNO", [Number(req.body.turnoId)]);
    if (!filas[0]?.FILAS_ACTUALIZADAS) {
      return res.status(400).json({ success: false, message: "El turno ya no se puede cancelar" });
    }
    res.json({ success: true, message: "Turno cancelado" });
  }),
);

export default router;
