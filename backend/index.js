import express from "express";
import administrador from "./api/routes/administrador.js";
import ingreso from "./api//routes/ingreso.js";
import turnos from "./api/routes/turnos.js"

import servicios from "./api/routes/servicios.js"
import subservicio from "./api/routes/subservicio.js"

import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/administrador",administrador);
app.use("/ingreso",ingreso);
app.use("/turnos",turnos)
app.use("/servicios",servicios)
app.use("/subservicio",subservicio)


const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
