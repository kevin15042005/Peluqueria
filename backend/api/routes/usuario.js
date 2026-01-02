import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/Obtener", (req, res) => {
  const q = "SELECT *FROM Administrador";
  db.query(q, (err, data) => {
    if (err) return res.status(500).josn({ err: "Error al obtner datos" });
    return res.json(data);
  });
});

//Registro de Usuarios

router.post("/registrar", (req, res) => {
  const { nombre, contraseña, correo, pin } = req.body;

  const chekUsuario = "SELECT *FROM usuarios WHERE nombre = ? OR corrreo = ?";

  db.query(chekUsuario, [nombre, correo], (err, data) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Errro al verificr , duplicado usuario", error: err });
    }
    if (data.length > 0) {
      return res.status(400).json({ message: "Usuario ya exitente" });
    }
    if (!pin || pin.length !== 4) {
      return res
        .status(400)
        .json({ message: "El pin de seguridad debe tener 4 caracteres" });
    }
    const q = `INSER INTO Usuario (nombre, contraseña, correo , pin) VALUES (?,?,?,?)`;
    db.query(q, [nombre, contraseña, correo, pin], (err) => {
      if (err) {
        return res.status(500).json({
          message: "Errro al registrarse",
          error: err,
        });
      }
      return res.json(200)({ message: "Usuario registtrado correctamente" });
    });
  });
});
