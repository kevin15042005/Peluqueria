import express from "express";
import conectDb from "../db.js";

const router = express.Router();

// ========== OBTENER SUBSERVICIOS ==========
router.get("/obtener_subservicios", async (req, res) => {
  try {
    const db = await conectDb();
    const [rows] = await db.execute("CALL OBTENER_SUBSERVICIO()");
    
    res.json({ 
      success: true, 
      data: rows[0] 
    });
    
  } catch (error) {
    console.error("❌ Error al obtener subservicios:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al obtener subservicios",
      error: error.message,
    });
  }
});

// ========== CREAR SUBSERVICIO (CON DURACIÓN) ==========
router.post("/registrar_subservicio", async (req, res) => {
  const { servicioId, nombre, precio, descripcion, duracionMinutos } = req.body;

  console.log("📥 Datos recibidos:", { 
    servicioId, nombre, precio, descripcion, duracionMinutos 
  });

  // Validaciones
  if (!servicioId || !nombre || !precio) {
    return res.status(400).json({ 
      success: false, 
      message: "Servicio, nombre y precio son obligatorios" 
    });
  }

  if (isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) {
    return res.status(400).json({ 
      success: false, 
      message: "El precio debe ser un número positivo" 
    });
  }

  // Validar duración
  const duracion = parseInt(duracionMinutos) || 30; // 30 por defecto
  if (isNaN(duracion) || duracion < 15) {
    return res.status(400).json({ 
      success: false, 
      message: "La duración debe ser al menos 15 minutos" 
    });
  }

  if (duracion > 300) {
    return res.status(400).json({ 
      success: false, 
      message: "La duración no puede exceder 300 minutos" 
    });
  }

  try {
    const db = await conectDb();
    
    // ¡IMPORTANTE! Llamar al procedimiento con 5 parámetros
    await db.execute("CALL REGISTRAR_SUBSERVICIO(?, ?, ?, ?, ?)", [
      parseInt(servicioId),
      nombre.trim(),
      parseFloat(precio),
      descripcion ? descripcion.trim() : null,
      duracion  // <-- QUINTO PARÁMETRO: DURACIÓN
    ]);
    
    console.log(`✅ Subservicio creado: ${nombre}, Duración: ${duracion}min`);
    
    res.json({ 
      success: true, 
      message: "Subservicio creado correctamente",
      duracionGuardada: duracion
    });
    
  } catch (error) {
    console.error("❌ Error al crear subservicio:", error.message);
    
    // Manejar errores específicos
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ 
        success: false, 
        message: "El servicio seleccionado no existe" 
      });
    }
    
    if (error.message.includes("wrong number of arguments")) {
      return res.status(500).json({ 
        success: false, 
        message: "Error: El procedimiento REGISTRAR_SUBSERVICIO necesita 5 parámetros. Verifica la base de datos.",
        error: error.message
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Error al crear subservicio",
      error: error.message
    });
  }
});

// ========== OBTENER SUBSERVICIOS PARA CLIENTES ==========
router.get("/obtener_subservicios_cliente", async (req, res) => {
  try {
    const db = await conectDb();
    
    const [rows] = await db.execute("CALL OBTENER_SUBSERVICIOS_CLIENTE()");
    
    res.json({ 
      success: true, 
      data: rows[0] 
    });
    
  } catch (error) {
    console.error("❌ Error al obtener subservicios cliente:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al obtener subservicios",
      error: error.message,
    });
  }
});

// ========== OBTENER SUBSERVICIOS POR SERVICIO ==========
router.get("/subservicios_por_servicio/:servicioId", async (req, res) => {
  const { servicioId } = req.params;
  
  try {
    const db = await conectDb();
    
    const [rows] = await db.execute("CALL OBTENER_SUBSERVICIOS_POR_SERVICIO(?)", [servicioId]);
    
    res.json({ 
      success: true, 
      data: rows[0] 
    });
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al obtener subservicios",
      error: error.message,
    });
  }
});

// ========== ACTUALIZAR DURACIÓN DE SUBSERVICIO ==========
router.put("/actualizar_duracion/:id", async (req, res) => {
  const { id } = req.params;
  const { duracionMinutos } = req.body;
  
  if (!duracionMinutos || isNaN(parseInt(duracionMinutos)) || parseInt(duracionMinutos) < 15) {
    return res.status(400).json({ 
      success: false, 
      message: "Duración inválida (mínimo 15 minutos)" 
    });
  }
  
  try {
    const db = await conectDb();
    
    await db.execute(
      "UPDATE SUBSERVICIO SET DURACION_MINUTOS = ? WHERE ID = ?",
      [parseInt(duracionMinutos), id]
    );
    
    res.json({ 
      success: true, 
      message: "Duración actualizada correctamente" 
    });
    
  } catch (error) {
    console.error("❌ Error al actualizar duración:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al actualizar duración",
      error: error.message,
    });
  }
});

// ========== OBTENER DURACIÓN DE SUBSERVICIO ==========
router.get("/duracion/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    const db = await conectDb();
    
    const [rows] = await db.execute(
      "SELECT DURACION_MINUTOS FROM SUBSERVICIO WHERE ID = ?",
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Subservicio no encontrado" 
      });
    }
    
    res.json({ 
      success: true, 
      duracionMinutos: rows[0].DURACION_MINUTOS || 60 
    });
    
  } catch (error) {
    console.error("❌ Error al obtener duración:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al obtener duración",
      error: error.message,
    });
  }
});

// ========== RUTA DE PRUEBA ==========
router.get("/test", async (req, res) => {
  try {
    const db = await conectDb();
    
    // Probar conexión con consulta simple
    const [result] = await db.execute("SELECT 1 + 1 as test");
    
    res.json({ 
      success: true, 
      message: "Backend de subservicios funcionando",
      test: result[0].test,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Error en test de conexión"
    });
  }
});

export default router;