import express from "express";
import conectDb from "../db.js";

const router = express.Router();

// ========== OBTENER SERVICIOS ==========
router.get("/obtener_servicios", async (req, res) => {
  try {
    const db = await conectDb();
    const [rows] = await db.execute("CALL OBTENER_SERVICIO()");
    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener servicios",
      error: error.message,
    });
  }
});

// ========== CREAR SERVICIO ==========
router.post("/registrar_servicios", async (req, res) => {
  const { nombre, descripcion } = req.body;

  if (!nombre) {
    return res.status(400).json({
      success: false,
      message: "El nombre es obligatorio",
    });
  }

  try {
    const db = await conectDb();
    await db.execute("CALL REGISTRAR_SERVICIO(?,?)", [
      nombre,
      descripcion || null,
    ]);

    res.json({
      success: true,
      message: "Servicio creado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al crear servicio",
      error: error.message,
    });
  }
});

//======Eliminar Servicio=====//

router.delete("/eliminar_servicio/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Seleccionar el id" });
  }

  try {
    const db = await conectDb();
    await db.execute("CALL ELIMINAR_SERVICIO(?)", [id]);
    res.json({ success: true, message: "Servicio eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar servicio",
      error: error.message,
    });
  }
});
export default router;
