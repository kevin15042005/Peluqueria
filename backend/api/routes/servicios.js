import express from "express";
import conncetDb from "../db.js";

const router = express.Router();

router.get("/obtener_servicios", async (req, res) => {
  try {
    const db = await conncetDb();
    const [rows] = await db.execute("CALL OBTENER_SERVICIO()");
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res
      .status(500)
      .json({
        succes: false,
        message: "Errro al obtner servicios",
        error: error.message,
      });
  }
});

router.post("/registrar_servicios", async (req, res) => {
  const { nombre, descripcion } = req.body;

  if (!nombre) {
    return res.status(400).json({ message: "Nombre obligatorio" });
  }

  try {
    const db = await conncetDb();
    await db.execute("CALL REGISTRAR_SERVICIO(?,?)", [nombre, descripcion]);
    res.json({ success: true, message: "Servicio creado" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Errro al crear servicio",
        error: error.message,
      });
  }
});
export default router;