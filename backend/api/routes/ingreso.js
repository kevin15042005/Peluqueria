import express from "express";
import connectDb from "../db.js";

const router = express.Router();
//Obtener empleados

router.get("/empleados", async (req, res) => {
  try {
    const db = await connectDb();
    const [rows] = await db.execute("CALL OBTENER_EMPLEADOS()");
    res.json({
      success: true,
      data: rows[0] || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtemer empleados",
      error: error.message,
    });
  }
});

//Obtener Asistencias
router.get("/asistencia", async (req, res) => {
  try {
    const db = await connectDb();
    const [rows] = await db.execute("CALL OBTENER_ASISTENCIA()");
    res.json({
      success: true,
      data: rows[0] || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro al obtener asistencia",
      error: error.message,
    });
  }
});
44; //Regsistrar Entrada

router.post("/entrada", async (req, res) => {
  try {
    const { trabajador_id } = req.body;
    if (!trabajador_id) {
      return res.status(400).json({
        success: false,
        message: "El id del trabajador es requerido",
      });
    }

    const db = await connectDb();
    const hoy = new Date().toISOString().split("T")[0];
    const hora = new Date().toTimeString().slice(0, 8);

    await db.execute("CALL REGISTRAR_ASISTENCIA(?,?,?)", [
      trabajador_id,
      hoy,
      hora,
    ]);
    res.json({ success: true, message: "Entrada registrada correctamente" });
  } catch (error) {
    if (error.message.includes("EMPLEADO_YA_TIENE_ENTRADA")) {
      return res.status(400).json({
        success: false,
        message: "Este empelado ya tiene entrada regsitrada",
        code: "Entrada_duplicada",
      });
    }
    if (error.message.includes("USUARIO_NO_ES_EMPLEADO")) {
      return res.status(400).json({
        success: false,
        message: "El ususario no es un empelado",
        code: "No__es_empleado",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error al registrar entrada",
      error: error.message,
    });
  }
});

//Actualizar Asistencia

router.put("/salida", async (req, res) => {
  try {
    const { asistencia_id } = req.body;

    if (!asistencia_id) {
      return res.status(400).json({
        success: false,
        message: "El id de la asistencia es requerido",
      });
    }
    const db = await connectDb();
    const hora = new Date().toTimeString().slice(0, 8);
    await db.execute("CALL REGISTRAR_SALIDA_ASISTENCIA(?,?)", [
      asistencia_id,
      hora,
    ]);
    res.json({ success: true, message: "Salida registrada exitosamente" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro al registrar salida",
      error: error.message,
    });
  }
});

//ReACTIVAR USUSARIO

router.post("/reactivar", async (req, res) => {
  try {
    const { trabajador_id } = req.body;

    if (!trabajador_id) {
      return res
        .status(400)
        .json({ success: false, message: "El id del trabajaodr es rquerido" });
    }

    const db = await connectDb();
    const hoy = new Date().toISOString().split("T")[0];
    await db.execute("CALL REACTIVAR_ENTRADA(?,?,?)", [trabajador_id, hoy]);
    res.json({ success: true, message: "Entrada reactivada exitosamente" });
  } catch (error) {
    if (error.message.includes("NO_HAY_ASISTENCIA_PARA_REACTIVAR")) {
      return res.status(404).json({
        success: false,
        message: "No se encotnro aistencia para reactivar",
        code: "No_hay_asistenica",
      });
    }
    res.status(500).json({
      success: false,
      message: "Erro alreactivar entrada",
      error: error.message,
    });
  }
});

export default router;
