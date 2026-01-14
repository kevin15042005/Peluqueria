import express from "express";
import administrador from "./api/routes/administrador.js";
import ingreso from "./api/routes/ingreso.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/administrador",administrador);
app.use("/ingreso",ingreso);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
