import React, { useEffect, useRef, useState } from "react";
import { FileUp, Loader2, Trash2, CheckCircle2, AlertCircle, FileText, Upload } from "lucide-react";
import Cartas from "../Cartas.jsx";

const API = import.meta.env.VITE_API_URL;
const ANCHO_MAX = 1600; // ancho máximo de cada página en píxeles (calidad vs. peso)

// Convierte cada página del PDF en un PNG usando pdf.js en el navegador
async function pdfAPngs(archivo, onProgreso) {
  const pdfjs = await import("pdfjs-dist");
  const { default: workerUrl } = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const pdf = await pdfjs.getDocument({ data: await archivo.arrayBuffer() }).promise;
  const paginas = [];

  for (let n = 1; n <= pdf.numPages; n++) {
    const pagina = await pdf.getPage(n);
    const base = pagina.getViewport({ scale: 1 });
    const escala = Math.min(ANCHO_MAX / base.width, 3);
    const viewport = pagina.getViewport({ scale: escala });

    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff"; // fondo blanco (los PDF pueden ser transparentes)
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await pagina.render({ canvasContext: ctx, viewport }).promise;
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    paginas.push({ blob, vista: URL.createObjectURL(blob) });
    onProgreso(n, pdf.numPages);
  }
  return paginas;
}

export default function CartaAdmin() {
  const [archivo, setArchivo] = useState(null);
  const [paginas, setPaginas] = useState([]);
  const [progreso, setProgreso] = useState(null);
  const [estado, setEstado] = useState("idle"); // idle | convirtiendo | listo | subiendo
  const [mensaje, setMensaje] = useState(null);
  const [versionVista, setVersionVista] = useState(0);
  const inputRef = useRef(null);

  // Liberar las vistas previas al cambiar de archivo o salir
  useEffect(() => () => paginas.forEach((p) => URL.revokeObjectURL(p.vista)), [paginas]);

  const elegirArchivo = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.type !== "application/pdf") {
      setMensaje({ tipo: "error", texto: "El archivo debe ser un PDF" });
      return;
    }
    setArchivo(f);
    setPaginas([]);
    setMensaje(null);
    setEstado("convirtiendo");
    try {
      const resultado = await pdfAPngs(f, (n, total) => setProgreso({ n, total }));
      setPaginas(resultado);
      setEstado("listo");
    } catch (err) {
      console.error(err);
      setMensaje({ tipo: "error", texto: "No se pudo leer el PDF. ¿Está protegido o dañado?" });
      setEstado("idle");
    } finally {
      setProgreso(null);
    }
  };

  const publicar = async () => {
    setEstado("subiendo");
    setMensaje(null);
    try {
      const form = new FormData();
      paginas.forEach((p, i) => form.append("paginas", p.blob, `pagina-${i + 1}.png`));
      const res = await fetch(`${API}/carta`, { method: "POST", body: form });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setMensaje({ tipo: "ok", texto: `Carta publicada con ${data.paginas} páginas` });
      setPaginas([]);
      setArchivo(null);
      setVersionVista((v) => v + 1);
      setEstado("idle");
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message || "No se pudo subir la carta" });
      setEstado("listo");
    }
  };

  const eliminar = async () => {
    if (!window.confirm("¿Eliminar la carta publicada?")) return;
    try {
      const res = await fetch(`${API}/carta`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setMensaje({ tipo: "ok", texto: "Carta eliminada" });
      setVersionVista((v) => v + 1);
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message || "No se pudo eliminar" });
    }
  };

  return (
    <div className="w-full bg-ink px-4 py-12 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-3xl md:text-4xl">
          Carta de <span className="text-gradient-gold italic">servicios</span>
        </h1>
        <p className="mt-2 text-white/60">
          Sube la carta en PDF. Cada página se convierte en imagen y se muestra como libro en la sección Servicios.
        </p>

        {/* Subir */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={elegirArchivo} />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={estado === "convirtiendo" || estado === "subiendo"}
            className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-gold/40 px-6 py-10 text-center transition-colors hover:border-gold hover:bg-gold/5 disabled:opacity-50"
          >
            <FileUp size={36} className="text-gold" />
            <span className="font-semibold">{archivo ? "Elegir otro PDF" : "Elegir PDF de la carta"}</span>
            {archivo && (
              <span className="flex items-center gap-2 text-sm text-white/50">
                <FileText size={14} /> {archivo.name}
              </span>
            )}
          </button>

          {estado === "convirtiendo" && (
            <div className="mt-6">
              <p className="flex items-center gap-2 text-sm text-white/70">
                <Loader2 size={16} className="animate-spin text-gold" />
                Convirtiendo página {progreso?.n || 0} de {progreso?.total || "…"}
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-gold transition-all"
                  style={{ width: `${progreso ? (progreso.n / progreso.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          {paginas.length > 0 && (
            <>
              <p className="mt-6 text-sm text-white/60">Vista previa · {paginas.length} páginas</p>
              <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6">
                {paginas.map((p, i) => (
                  <div key={p.vista} className="overflow-hidden rounded-lg border border-white/10 bg-white">
                    <img src={p.vista} alt={`Página ${i + 1}`} className="w-full" />
                  </div>
                ))}
              </div>
              <button
                onClick={publicar}
                disabled={estado === "subiendo"}
                className="mt-6 flex items-center gap-2 rounded-full bg-gold px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] text-ink transition-colors hover:bg-gold-light disabled:opacity-60"
              >
                {estado === "subiendo" ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                {estado === "subiendo" ? "Publicando..." : "Publicar carta"}
              </button>
            </>
          )}

          {mensaje && (
            <div
              className={`mt-6 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
                mensaje.tipo === "ok"
                  ? "border-green-500/30 bg-green-500/10 text-green-300"
                  : "border-red-500/30 bg-red-500/10 text-red-300"
              }`}
            >
              {mensaje.tipo === "ok" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {mensaje.texto}
            </div>
          )}
        </div>

        {/* Carta publicada */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl">Carta publicada</h2>
            <button
              onClick={eliminar}
              className="flex items-center gap-2 rounded-full border border-red-500/40 px-4 py-2 text-sm text-red-300 transition-colors hover:bg-red-500/10"
            >
              <Trash2 size={16} /> Eliminar
            </button>
          </div>
          <Cartas key={versionVista} />
        </div>
      </div>
    </div>
  );
}
