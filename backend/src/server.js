import "dotenv/config";
import express from "express";
import cors from "cors";
import { pool } from "./db.js";
import administrador from "./routes/administrador.js";
import servicios from "./routes/servicios.js";
import subservicio from "./routes/subservicio.js";
import turnos from "./routes/turnos.js";
import ingreso from "./routes/ingreso.js";
import carta, { UPLOADS_DIR } from "./routes/carta.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

const origenes = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      // Permite herramientas sin origin (Postman) y los orígenes configurados
      if (!origin || origenes.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin)) cb(null, true);
      else cb(new Error(`Origen no permitido por CORS: ${origin}`));
    },
  }),
);
app.use(express.json({ limit: "1mb" }));

// Imágenes de la carta
app.use("/uploads", express.static(UPLOADS_DIR, { maxAge: "1h" }));

// Rutas
app.use("/administrador", administrador);
app.use("/servicios", servicios);
app.use("/subservicio", subservicio);
app.use("/turnos", turnos);
app.use("/ingreso", ingreso);
app.use("/carta", carta);

// Salud: comprueba que la API y la base de datos respondan
app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ success: true, api: "ok", db: "ok" });
  } catch (error) {
    res.status(500).json({ success: false, api: "ok", db: error.code || "error" });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Ruta no encontrada: ${req.method} ${req.path}` });
});

// Errores no controlados (JSON mal formado, CORS, etc.)
app.use((err, _req, res, _next) => {
  console.error("❌", err.message);
  const status = err.type === "entity.parse.failed" ? 400 : 500;
  res.status(status).json({ success: false, message: status === 400 ? "JSON inválido" : err.message });
});

app.listen(PORT, async () => {
  console.log(`🚀 API escuchando en http://localhost:${PORT}`);
  try {
    await pool.query("SELECT 1");
    console.log(`✅ Conectado a MySQL (${process.env.DB_NAME || "PELUQUERIA"})`);
  } catch (error) {
    console.error(`⚠️  No se pudo conectar a MySQL: ${error.code} - revisa backend/.env`);
  }
});
