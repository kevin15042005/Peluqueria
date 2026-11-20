import { Router } from "express";
import { callProc } from "../db.js";
import { manejar } from "../errores.js";

// Asistencia de empleados (entrada / salida)
const router = Router();

// GET /ingreso/empleados
router.get(
  "/empleados",
  manejar(async (_req, res) => {
    res.json({ success: true, data: await callProc("OBTENER_EMPLEADOS") });
  }),
);

// GET /ingreso/asistencia
router.get(
  "/asistencia",
  manejar(async (_req, res) => {
    res.json({ success: true, data: await callProc("OBTENER_ASISTENCIA") });
  }),
);

// POST /ingreso/entrada  { trabajador_id }
router.post("/entrada", async (req, res) => {
  const id = Number(req.body.trabajador_id);
  if (!id) return res.status(400).json({ success: false, message: "Selecciona un empleado" });
  try {
    const filas = await callProc("REGISTRAR_ASISTENCIA", [id]);
    res.status(201).json({ success: true, asistenciaId: filas[0]?.ASISTENCIA_ID });
  } catch (error) {
    // El frontend ofrece "reactivar" cuando recibe este código
    if (error?.sqlMessage === "EMPLEADO_YA_TIENE_ENTRADA") {
      return res.status(409).json({
        success: false,
        code: "ENTRADA_DUPLICADA",
        message: "Este empleado ya registró entrada hoy",
      });
    }
    return manejar(() => {
      throw error;
    })(req, res);
  }
});

// POST /ingreso/reactivar  { trabajador_id }
router.post(
  "/reactivar",
  manejar(async (req, res) => {
    const filas = await callProc("REACTIVAR_ENTRADA", [Number(req.body.trabajador_id)]);
    res.json({ success: true, asistenciaId: filas[0]?.ASISTENCIA_ID });
  }),
);

// PUT /ingreso/salida  { asistencia_id }
router.put(
  "/salida",
  manejar(async (req, res) => {
    const filas = await callProc("REGISTRAR_SALIDA_ASISTENCIA", [Number(req.body.asistencia_id)]);
    if (!filas[0]?.FILAS_ACTUALIZADAS) {
      return res.status(400).json({ success: false, message: "Esta asistencia ya tiene salida registrada" });
    }
    res.json({ success: true });
  }),
);

export default router;
