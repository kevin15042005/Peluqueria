import { Router } from "express";
import { callProc, query } from "../db.js";
import { manejar } from "../errores.js";

const router = Router();

// GET /servicios/obtener_servicios
router.get(
  "/obtener_servicios",
  manejar(async (_req, res) => {
    res.json({ success: true, data: await callProc("OBTENER_SERVICIO") });
  }),
);

// POST /servicios/registrar_servicios  { nombre, descripcion }
router.post(
  "/registrar_servicios",
  manejar(async (req, res) => {
    const { nombre, descripcion } = req.body;
    if (!nombre?.trim()) {
      return res.status(400).json({ success: false, message: "El nombre es obligatorio" });
    }
    await callProc("REGISTRAR_SERVICIO", [nombre.trim(), descripcion?.trim() || null]);
    res.status(201).json({ success: true, message: "Servicio creado" });
  }),
);

// DELETE /servicios/eliminar_servicio/:id  (lo desactiva junto con sus subservicios)
router.delete(
  "/eliminar_servicio/:id",
  manejar(async (req, res) => {
    const id = Number(req.params.id);
    const r = await query("UPDATE SERVICIO SET ESTADO = 'inactivo' WHERE ID = ?", [id]);
    if (!r.affectedRows) {
      return res.status(404).json({ success: false, message: "Servicio no encontrado" });
    }
    await query("UPDATE SUBSERVICIO SET ESTADO = 'inactivo' WHERE SERVICIO_ID = ?", [id]);
    res.json({ success: true, message: "Servicio eliminado" });
  }),
);

export default router;
