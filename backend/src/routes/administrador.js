import { Router } from "express";
import { pool, callProc } from "../db.js";
import { manejar } from "../errores.js";

const router = Router();

// POST /administrador/login  { correo, password }
router.post(
  "/login",
  manejar(async (req, res) => {
    const { correo, password } = req.body;
    if (!correo || !password) {
      return res.status(400).json({ success: false, message: "Correo y contraseña son obligatorios" });
    }
    const filas = await callProc("LOGIN_USUARIO", [String(correo).trim(), password]);
    if (filas.length === 0) {
      return res.status(401).json({ success: false, message: "Correo o contraseña incorrectos" });
    }
    res.json({ success: true, usuario: filas[0] });
  }),
);

// GET /administrador/usuarios  -> arreglo (el frontend espera el arreglo directo)
router.get(
  "/usuarios",
  manejar(async (_req, res) => {
    res.json(await callProc("OBTENER_USUARIOS"));
  }),
);

// GET /administrador/roles  -> arreglo
router.get(
  "/roles",
  manejar(async (_req, res) => {
    res.json(await callProc("OBTENER_ROLES"));
  }),
);

// POST /administrador/crear_administrador  { nombre, correo, password, pin, rolId }
router.post(
  "/crear_administrador",
  manejar(async (req, res) => {
    const { nombre, correo, password, pin, rolId } = req.body;
    if (!nombre || !correo || !password || !pin || !rolId) {
      return res.status(400).json({ success: false, message: "Todos los campos son obligatorios" });
    }
    if (!/^\d{6}$/.test(String(pin))) {
      return res.status(400).json({ success: false, message: "El PIN debe tener 6 dígitos" });
    }
    await callProc("CREAR_USUARIO", [nombre.trim(), correo.trim(), password, String(pin), Number(rolId)]);
    res.status(201).json({ success: true, message: "Usuario creado correctamente" });
  }),
);

// PUT /administrador/update_admin  { correo, pin, nueva_password }
router.put(
  "/update_admin",
  manejar(async (req, res) => {
    const { correo, pin, nueva_password } = req.body;
    if (!correo || !pin || !nueva_password) {
      return res.status(400).json({ success: false, message: "Correo, PIN y nueva contraseña son obligatorios" });
    }
    const [r] = await pool.query("CALL ACTUALIZAR_PASSWORD(?, ?, ?)", [correo, String(pin), nueva_password]);
    if (!r.affectedRows) {
      return res.status(400).json({ success: false, message: "Correo o PIN incorrectos" });
    }
    res.json({ success: true, message: "Contraseña actualizada" });
  }),
);

// DELETE /administrador/delete_administrador/:id  (desactiva el usuario)
router.delete(
  "/delete_administrador/:id",
  manejar(async (req, res) => {
    const [r] = await pool.query("CALL ELIMINAR_USUARIO(?)", [Number(req.params.id)]);
    if (!r.affectedRows) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }
    res.json({ success: true, message: "Usuario desactivado" });
  }),
);

// GET /administrador/servicios_empleado/:id  -> { success, servicios }
router.get(
  "/servicios_empleado/:id",
  manejar(async (req, res) => {
    const servicios = await callProc("OBTENER_SERVICIOS_EMPLEADO", [Number(req.params.id)]);
    res.json({ success: true, servicios });
  }),
);

// POST /administrador/asignar_servicios_empleado  { trabajadorId, serviciosIds: [] }
router.post(
  "/asignar_servicios_empleado",
  manejar(async (req, res) => {
    const { trabajadorId, serviciosIds } = req.body;
    if (!trabajadorId || !Array.isArray(serviciosIds)) {
      return res.status(400).json({ success: false, message: "Datos incompletos" });
    }
    const ids = serviciosIds.map(Number).filter((n) => Number.isInteger(n) && n > 0);
    const servicios = await callProc("ASIGNAR_SERVICIOS_EMPLEADO", [Number(trabajadorId), JSON.stringify(ids)]);
    res.json({ success: true, message: "Servicios asignados", servicios });
  }),
);

export default router;
