import express from "express";
import conectDb from "../db.js";

const router = express.Router();

// ========== OBTENER EMPLEADOS ==========
router.get("/empleados", async (req, res) => {
  try {
    const db = await conectDb();
    const [rows] = await db.execute("CALL OBTENER_EMPLEADOS()");
    res.json({ 
      success: true, 
      data: rows[0] 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener empleados",
      error: error.message,
    });
  }
});

// ========== OBTENER ASISTENCIAS ==========
router.get("/asistencia", async (req, res) => {
  try {
    const db = await conectDb();
    const [rows] = await db.execute("CALL OBTENER_ASISTENCIA()");
    res.json({ 
      success: true, 
      data: rows[0] 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener asistencias",
      error: error.message,
    });
  }
});

// ========== REGISTRAR ENTRADA ==========
router.post("/entrada", async (req, res) => {
  const { trabajador_id } = req.body;

  if (!trabajador_id) {
    return res.status(400).json({ 
      success: false, 
      message: "ID del trabajador es requerido" 
    });
  }

  try {
    const db = await conectDb();
    await db.execute("CALL REGISTRAR_ASISTENCIA(?)", [trabajador_id]);
    
    res.json({ 
      success: true, 
      message: "Entrada registrada correctamente" 
    });
  } catch (error) {
    if (error.message.includes('EMPLEADO_YA_TIENE_ENTRADA')) {
      return res.status(400).json({ 
        success: false, 
        code: 'ENTRADA_DUPLICADA',
        message: "Este empleado ya tiene entrada hoy" 
      });
    }
    
    if (error.message.includes('USUARIO_NO_ES_EMPLEADO')) {
      return res.status(400).json({ 
        success: false, 
        message: "El usuario no es un empleado" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Error al registrar entrada",
      error: error.message 
    });
  }
});

// ========== REGISTRAR SALIDA ==========
router.put("/salida", async (req, res) => {
  const { asistencia_id } = req.body;

  if (!asistencia_id) {
    return res.status(400).json({ 
      success: false, 
      message: "ID de asistencia es requerido" 
    });
  }

  try {
    const db = await conectDb();
    await db.execute("CALL REGISTRAR_SALIDA_ASISTENCIA(?)", [asistencia_id]);
    
    res.json({ 
      success: true, 
      message: "Salida registrada correctamente" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error al registrar salida",
      error: error.message 
    });
  }
});

// ========== REACTIVAR ENTRADA ==========
router.post("/reactivar", async (req, res) => {
  const { trabajador_id } = req.body;

  if (!trabajador_id) {
    return res.status(400).json({ 
      success: false, 
      message: "ID del trabajador es requerido" 
    });
  }

  try {
    const db = await conectDb();
    await db.execute("CALL REACTIVAR_ENTRADA(?)", [trabajador_id]);
    
    res.json({ 
      success: true, 
      message: "Entrada reactivada correctamente" 
    });
  } catch (error) {
    if (error.message.includes('NO_HAY_ASISTENCIA_PARA_REACTIVAR')) {
      return res.status(400).json({ 
        success: false, 
        message: "No hay asistencia para reactivar" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Error al reactivar entrada",
      error: error.message 
    });
  }
});

export default router;