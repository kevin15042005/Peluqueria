import express from "express";
import connectDb from "../db.js";

const router = express.Router();

router.get("/obtener_subservicio", async (req, res) => {
  try {
    const db = await db.connectDb();
    const [rows] = await db.execute("CALL OBTENER_SUBSERVICIO()");
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener subservicio",
      error: error.message,
    });
  }
});

router.post("/registrar_subservicio", async (req, res) => {
  const { servicioId, nombre, precio, descripcion } = req.body;

  if (!servicioId || !nombre || !precio) {
    return res.status(400).json({ message: "Datos incompletos" });
  }

  try {
    const db = await connectDb();
    await db.execute("CALL REGISTRAR_SUBSERVICIO(?,?,?,?)", [
      servicioId,
      nombre,
      precio,
      descripcion,
    ]);
    res.json({ success: true, message: "SUBSERVICO CREADO" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al crear subservicio",
      error: error.message,
    });
  }
});

export default router;