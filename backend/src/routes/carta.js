import { Router } from "express";
import multer from "multer";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { manejar } from "../errores.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOADS_DIR = path.resolve(__dirname, "../../uploads");
const CARTA_DIR = path.join(UPLOADS_DIR, "carta");
const TEMP_DIR = path.join(UPLOADS_DIR, "carta_tmp");

const router = Router();

// El navegador convierte el PDF en imágenes PNG (una por página) y las envía aquí
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 80 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "image/png") cb(null, true);
    else cb(new Error("Solo se permiten imágenes PNG"));
  },
});

async function listarPaginas() {
  try {
    const archivos = await fs.readdir(CARTA_DIR);
    return archivos.filter((a) => a.endsWith(".png")).sort();
  } catch {
    return [];
  }
}

// GET /carta  -> { success, paginas: ["/uploads/carta/pagina-001.png?v=..."] }
router.get(
  "/",
  manejar(async (_req, res) => {
    const archivos = await listarPaginas();
    let version = 0;
    if (archivos.length) version = Math.floor((await fs.stat(CARTA_DIR)).mtimeMs);
    res.json({
      success: true,
      paginas: archivos.map((a) => `/uploads/carta/${a}?v=${version}`),
    });
  }),
);

// POST /carta  (multipart, campo "paginas") -> reemplaza la carta actual
router.post("/", (req, res) => {
  upload.array("paginas")(req, res, async (err) => {
    if (err) {
      const message = err.code === "LIMIT_FILE_SIZE" ? "Una de las páginas pesa más de 15 MB" : err.message;
      return res.status(400).json({ success: false, message });
    }
    if (!req.files?.length) {
      return res.status(400).json({ success: false, message: "No se recibió ninguna página" });
    }
    try {
      // Escribe en una carpeta temporal y luego reemplaza la carta anterior
      await fs.rm(TEMP_DIR, { recursive: true, force: true });
      await fs.mkdir(TEMP_DIR, { recursive: true });
      await Promise.all(
        req.files.map((f, i) =>
          fs.writeFile(path.join(TEMP_DIR, `pagina-${String(i + 1).padStart(3, "0")}.png`), f.buffer),
        ),
      );
      await fs.rm(CARTA_DIR, { recursive: true, force: true });
      await fs.rename(TEMP_DIR, CARTA_DIR);
      res.status(201).json({ success: true, message: "Carta actualizada", paginas: req.files.length });
    } catch (error) {
      console.error("❌ Error guardando la carta:", error);
      res.status(500).json({ success: false, message: "No se pudo guardar la carta" });
    }
  });
});

// DELETE /carta  -> elimina la carta
router.delete(
  "/",
  manejar(async (_req, res) => {
    await fs.rm(CARTA_DIR, { recursive: true, force: true });
    res.json({ success: true, message: "Carta eliminada" });
  }),
);

export default router;
