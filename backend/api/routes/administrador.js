import express, { Router } from "express";
import conectDb from "../db.js";

const router = express.Router();


//Obtener Usuarios
router.get("/usuarios", async (req, res) => {
  try {
    const db = await conectDb();
    const [rows] = await db.execute("CALL OBTENER_USUARIOS()");
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener usuario",
      error,
    });
  }
});


//Obtener roles
router.get("/roles", async (req, res) => {
  try {
    const db = await conectDb()
    const [rows] = await db.execute("CALL OBTENER_ROLES()");
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener roles", error });
  }
});


// LOGIN
 
router.post("/login", async (req, res) => {
  const { correo, password } = req.body;

  try {
    const db = await conectDb();
    const [data] = await db.execute("CALL LOGIN_USUARIO(?,?)", [
      correo,
      password,
    ]);

    if (data[0].length === 0) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    res.json({
      message: "Login correcto",
      usuario: data[0][0],
    });
  } catch (error) {
    res.status(500).json({ message: "Error en login", error });
  }
});

//Crear Admin

router.post("/crear_administrador", async (req, res) => {

  const { nombre, correo, password, pin, rolId } = req.body;
  if (!nombre || !correo || !password) {
    return res.status(401).json({ message: "Campos necesarios" });
  }
  if (!pin || pin.length !== 6) {
    return res.status(400).json({ message: "Obligatorio 6 digitos" });
  }
  try {
    const db = await conectDb();
    await db.execute("CALL CREAR_USUARIO (?,?,?,?,?)", [
      nombre,
      correo,
      password,
      pin,
      rolId,
    ]);
    return res.json({ meesage: "Usuario creado corretcamnete" });
  } catch (error) {
    res.status(500).json({ message: "Error al crear usuario" }, error);
  }
});

//Actualziar Admin

router.put("/update_admin", async (req, res) => {
  const { correo, pin, nueva_password } = req.body;

  try {
    const db = await conectDb();
    const [validar] = await db.execute(
      "CALL VALIDAR_PIN(?,?)",[correo,pin]
    )
    
      if (validar[0].length === 0) {
      return res.status(401).json({ message: "Pin incorrecto" });
    }
   
    
    await db.execute(
      "CALL  ACTUALIZAR_PASSWORD(?,?,?)",[correo, pin, nueva_password]
    );
  
    
    return res.json({ message: "Contrasena cambiada correctamente " });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al actualizar admnistrador", error });
  }
});

//Eliminar Administrador

router.delete("/delete_administrador/:id",async(req,res)=>{
    const {id}= req.params

    try {
        const db =await  conectDb()
        await db.execute("CALL ELIMINAR_USUARIO(?)",[id])
        return res.json({meesage:"Admnistrador eliminado correctamente"})
    } catch (error) {
        return res.status(500).json({message:"Error al eliminar",error})
    }

})

export default router;
