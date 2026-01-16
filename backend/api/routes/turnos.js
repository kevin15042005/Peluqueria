import express from "express";
import conectDb from "../db.js";

const router = express.Router();

//Obtener Servicos

router.get("/mis-turnos/:empleadoId", async (req, res) => {
  try {
    const db = await conectDb();
    const { empleadoId } = req.params;

    const [rows] = await db.execute(
      "CALL OBTENER_TURNOS_EMPLEADO(?)",
      [empleadoId]
    );

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener turnos",
      error: error.message,
    });
  }
});
router.get("/subservicios", async (req, res) => {
  try {
    const db = await conectDb();
    const [rows] = await db.execute(
      "CALL OBTENER_SUBSERVICIOS_CLIENTE()"
    );

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener subservicios",
      error: error.message,
    });
  }
});


//Obtener empleado

router.get("/empleado-disponible/:subservicioId", async (req, res) => {
  try {
    const db = await conectDb();
    const { subservicioId } = req.params;
    const [rows] = await db.execute(
      "CALL EMPLEADO_DISPONIBLE_POR_SUBSERVICIO(?)",
      [subservicioId]
    );
    res.json({ success: true, data: rows[0][0] || null });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al buscar empleado ",
      error: error.message,
    });
  }
});

//Registar tunro automatico
router.post("/registrar", async (req, res) => {
  try {
    const db = await conectDb();
    const { subservicioId, fecha } = req.body;

    if (!subservicioId || !fecha) {
      return res.status(400).json({
        success: false,
        message: "Datos incompletos",
      });
    }

    await db.execute("CALL REGISTRAR_TURNO_AUTOMATICO(?, ?)", [
      subservicioId,
      fecha,
    ]);

    res.json({
      success: true,
      message: "Turno registrado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al registrar turno",
      error: error.message,
    });
  }
});

export default router;
