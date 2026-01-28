import express from "express";
import conectDb from "../db.js";

const router = express.Router();

// ========== LOGIN ==========
router.post("/login", async (req, res) => {
  const { correo, password } = req.body;

  try {
    const db = await conectDb();
    const [data] = await db.execute("CALL LOGIN_USUARIO(?,?)", [correo, password]);

    if (data[0].length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: "Credenciales incorrectas" 
      });
    }

    res.json({
      success: true,
      message: "Login exitoso",
      usuario: data[0][0],
    });
  } catch (error) {
    console.error("❌ Error en login:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Error en el servidor",
      error: error.message 
    });
  }
});

//  OBTENER USUARIOS 
router.get("/usuarios", async (req, res) => {
  try {
    const db = await conectDb();
    const [rows] = await db.execute("CALL OBTENER_USUARIOS()");
    res.json(rows[0]);
  } catch (error) {
    console.error("❌ Error al obtener usuarios:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al obtener usuarios",
      error: error.message,
    });
  }
});

// OBTENER ROLES 
router.get("/roles", async (req, res) => {
  try {
    const db = await conectDb();
    const [rows] = await db.execute("CALL OBTENER_ROLES()");
    res.json(rows[0]);
  } catch (error) {
    console.error("❌ Error al obtener roles:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Error al obtener roles",
      error: error.message 
    });
  }
});

// CREAR USUARIO
router.post("/crear_administrador", async (req, res) => {
  const { nombre, correo, password, pin, rolId } = req.body;
  
  
  // Validaciones
  if (!nombre || !correo || !password || !pin || !rolId) {
    return res.status(400).json({ 
      success: false, 
      message: "Todos los campos son obligatorios" 
    });
  }

  if (!/^\d{6}$/.test(pin)) {
    return res.status(400).json({ 
      success: false, 
      message: "El PIN debe tener 6 dígitos" 
    });
  }

  try {
    const db = await conectDb();
    
    // Usar el procedimiento con 5 parámetros
    await db.execute("CALL CREAR_USUARIO(?, ?, ?, ?, ?)", [
      nombre, 
      correo, 
      password, 
      pin, 
      parseInt(rolId)
    ]);
    
    console.log("✅ Usuario creado exitosamente");
    
    res.json({ 
      success: true, 
      message: "Usuario creado correctamente"
    });
    
  } catch (error) {
    console.error("❌ Error al crear usuario:", error.message);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false, 
        message: "El correo ya está registrado" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Error al crear usuario",
      error: error.message
    });
  }
});

//  ACTUALIZAR PASSWORD 
router.put("/update_admin", async (req, res) => {
  const { correo, pin, nueva_password } = req.body;

  if (!correo || !pin || !nueva_password) {
    return res.status(400).json({ 
      success: false, 
      message: "Todos los campos son obligatorios" 
    });
  }

  try {
    const db = await conectDb();
    
    // Validar PIN primero
    const [validar] = await db.execute("CALL VALIDAR_PIN(?,?)", [correo, pin]);
    
    if (validar[0].length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: "PIN incorrecto" 
      });
    }
    
    await db.execute("CALL ACTUALIZAR_PASSWORD(?,?,?)", [
      correo, 
      pin, 
      nueva_password
    ]);
    
    res.json({ 
      success: true, 
      message: "Contraseña cambiada correctamente" 
    });
  } catch (error) {
    console.error("❌ Error al actualizar:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Error al actualizar contraseña",
      error: error.message 
    });
  }
});

// ========== ELIMINAR USUARIO ==========
router.delete("/delete_administrador/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const db = await conectDb();
    await db.execute("CALL ELIMINAR_USUARIO(?)", [parseInt(id)]);
    
    res.json({ 
      success: true, 
      message: "Usuario eliminado correctamente" 
    });
  } catch (error) {
    console.error("❌ Error al eliminar:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Error al eliminar usuario",
      error: error.message 
    });
  }
});

// ========== OBTENER SERVICIOS PARA ASIGNAR A EMPLEADO ==========
router.get("/servicios_para_asignar/:trabajadorId", async (req, res) => {
  const { trabajadorId } = req.params;

  if (!trabajadorId) {
    return res.status(400).json({ 
      success: false, 
      message: "ID de trabajador requerido" 
    });
  }

  try {
    const db = await conectDb();
    const [rows] = await db.execute(
      "CALL OBTENER_SERVICIOS_PARA_ASIGNAR(?)", 
      [parseInt(trabajadorId)]
    );
    
    res.json({
      success: true,
      servicios: rows[0]
    });
  } catch (error) {
    console.error("❌ Error al obtener servicios:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Error al obtener servicios",
      error: error.message 
    });
  }
});

// ========== ASIGNAR SERVICIOS A EMPLEADO ==========
router.post("/asignar_servicios_empleado", async (req, res) => {
  const { trabajadorId, serviciosIds } = req.body;

  // Validaciones
  if (!trabajadorId || !serviciosIds || !Array.isArray(serviciosIds)) {
    return res.status(400).json({ 
      success: false, 
      message: "Datos inválidos. Se requieren trabajadorId y un array de serviciosIds" 
    });
  }

  if (serviciosIds.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: "Debe seleccionar al menos un servicio" 
    });
  }

  try {
    const db = await conectDb();
    
    // Usar el procedimiento almacenado
    const [result] = await db.execute("CALL ASIGNAR_SERVICIOS_EMPLEADO(?, ?)", [
      parseInt(trabajadorId),
      JSON.stringify(serviciosIds)
    ]);
    
    console.log(`✅ Servicios asignados al empleado ${trabajadorId}:`, serviciosIds);
    
    res.json({
      success: true,
      message: "Servicios asignados correctamente",
      serviciosAsignados: result[0]
    });
    
  } catch (error) {
    console.error("❌ Error al asignar servicios:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Error al asignar servicios",
      error: error.message 
    });
  }
});

// ========== OBTENER SERVICIOS ASIGNADOS A EMPLEADO ==========
router.get("/servicios_empleado/:trabajadorId", async (req, res) => {
  const { trabajadorId } = req.params;

  try {
    const db = await conectDb();
    const [rows] = await db.execute(
      "CALL OBTENER_SERVICIOS_EMPLEADO(?)", 
      [parseInt(trabajadorId)]
    );
    
    res.json({
      success: true,
      servicios: rows[0]
    });
  } catch (error) {
    console.error("❌ Error al obtener servicios del empleado:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Error al obtener servicios del empleado",
      error: error.message 
    });
  }
});

export default router;