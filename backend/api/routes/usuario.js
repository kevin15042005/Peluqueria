import express from "express";
import db from "../db.js";
import conectDb from "../db.js";

const router = express.Router();

//Obtener Usuarios
router.get("/Obtener", async (req, res) => {
  try {
    const db = await conectDb();
    const [data] = await db.execute("CALL Administrador");
    return res.json(data[0]);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener usuarios", error: err });
  }
});

//Registro de Usuarios

router.post("/registrar", async (req, res) => {
  const { contraseña, correo, pin } = req.body;

  if (!pin || pin.length !== 4) {
    return res
      .status(400)
      .json({ message: "El pin de seguridad debe tener 4 digitos" });
  }

  try {
    const db = await conectDb();
    const [exitente] = await db.execute("CALL USUARIO(?,?)", [
      correo,
      contraseña,
    ]);
    if (exitente[0].length > 0) {
      return res.status(400).json({ message: "Usuario ya existente" });
    }
    await db.execute("CALL INSERTAR_USUARIO (?,?,?,?)", [
      correo,
      contraseña,
      pin,
    ]);
    return res
      .status(200)
      .json({ message: "Usuario registrado correctamente" });
  } catch (err) {
    res.status(500).json({ message: "Error al registrar usuario", error: err });
  }
});

router.put("/update", async (req, res) => {
  const { correo, pinSeguridad, nuevaContraseña } = req.body;



try{
  const db = await conectDb();
  const [data] = await db.execute("CALL OBTENER_PIN_USUARIO(?)", [correo]);
  if(data.length === 0){
    return res.status(401).json({message:"Correo no registrado"});
  }
  if(data[0][0].pinSeguridad !== pinSeguridad){
    return res.status(401).json({message:"Pin de seguridad incorrecto"});
  }
  await db.execute("CALL ACTULIZAR_USUARIO_CONTRASEÑA(?,?)",[nuevaContraseña,correo]);
  return res.json({message:"Con"})
}catch(err){
console.error("Eror al actualizar", err)
}

  const verificarQuery = "CALL OBTENER_PIN_USUARIO(?) ";
  db.query(verificarQuery, [correo], (err, data) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error al verificar el pin", error: err });
    }
    if (data.length === 0) {
      return res.status(400).json({ message: "COrreo no regsitrado" });
    }
    const pinAlmacenado = data[0].pinSeguridad;

    if (pinAlmacenado !== pinSeguridad) {
      return res.status(401).json({ message: "Pin de seguridad iuncorrecto" });
    }
    const actualziarQuery = "CALL ACTUALIZAR_USUSARIO_CONTRASEÑA(?,?,?) ";

    db.query(actualziarQuery, [nuevaContraseña, correo], (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error al actualizar la contraseña", error: err });
      }
      return res.json({ message: "Contraseña actualizada correctamente" });
    });
  });
});

router.delete("/delete/:id", (req, res) => {
  const usuarioId = req.params.id;
  const q = "CALL ELIMINAR_USUARIO(?)";
  db.query(q, [usuarioId], (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error al eliminar usuario", error: err });
    }
    return res.json({ message: "Usuario eliminado correctamente" });
  });
});

export default router;
