import { Router } from "express";
import { callProc, query } from "../db.js";
import { manejar } from "../errores.js";

const router = Router();

const validar = (body) => {
  const { servicioId, nombre, precio } = body;
  if (!servicioId || !nombre?.trim() || precio === undefined || isNaN(Number(precio))) {
    return "Servicio, nombre y precio son obligatorios";
  }
  if (Number(precio) < 0) return "El precio no puede ser negativo";
  return null;
};

// GET /subservicio/obtener_subservicios
// El procedimiento devuelve SUBSERVICIO_ID; el panel admin usa ID, así que se envían ambos.
router.get(
  "/obtener_subservicios",
  manejar(async (_req, res) => {
    const filas = await callProc("OBTENER_SUBSERVICIO");
    res.json({ success: true, data: filas.map((s) => ({ ID: s.SUBSERVICIO_ID, ...s })) });
  }),
);

// POST /subservicio/registrar_subservicio  { servicioId, nombre, precio, descripcion, duracionMinutos }
router.post(
  "/registrar_subservicio",
  manejar(async (req, res) => {
    const error = validar(req.body);
    if (error) return res.status(400).json({ success: false, message: error });
    const { servicioId, nombre, precio, descripcion, duracionMinutos } = req.body;
    await callProc("REGISTRAR_SUBSERVICIO", [
      Number(servicioId),
      nombre.trim(),
      Number(precio),
      descripcion?.trim() || null,
      Number(duracionMinutos) || 60,
    ]);
    res.status(201).json({ success: true, message: "Subservicio creado" });
  }),
);

// PUT /subservicio/actualizar_subservicio/:id
router.put(
  "/actualizar_subservicio/:id",
  manejar(async (req, res) => {
    const error = validar(req.body);
    if (error) return res.status(400).json({ success: false, message: error });
    const { servicioId, nombre, precio, descripcion, duracionMinutos } = req.body;
    const r = await query(
      `UPDATE SUBSERVICIO
         SET SERVICIO_ID = ?, NOMBRE = ?, PRECIO = ?, DESCRIPCION = ?, DURACION_MINUTOS = ?
       WHERE ID = ?`,
      [
        Number(servicioId),
        nombre.trim(),
        Number(precio),
        descripcion?.trim() || null,
        Math.max(15, Number(duracionMinutos) || 60),
        Number(req.params.id),
      ],
    );
    if (!r.affectedRows) {
      return res.status(404).json({ success: false, message: "Subservicio no encontrado" });
    }
    res.json({ success: true, message: "Subservicio actualizado" });
  }),
);

// DELETE /subservicio/eliminar_subservicio/:id  (lo desactiva)
router.delete(
  "/eliminar_subservicio/:id",
  manejar(async (req, res) => {
    const r = await query("UPDATE SUBSERVICIO SET ESTADO = 'inactivo' WHERE ID = ?", [Number(req.params.id)]);
    if (!r.affectedRows) {
      return res.status(404).json({ success: false, message: "Subservicio no encontrado" });
    }
    res.json({ success: true, message: "Subservicio eliminado" });
  }),
);

export default router;
