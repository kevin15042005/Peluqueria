import React, { useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { ChevronLeft, ChevronRight, Loader2, BookOpen } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

// Muestra la carta (páginas PNG subidas desde el panel admin) como un libro
function Cartas() {
  const flipBook = useRef(null);
  const [paginas, setPaginas] = useState([]);
  const [proporcion, setProporcion] = useState(1.414); // alto / ancho (A4 por defecto)
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [paginaActual, setPaginaActual] = useState(0);
  const [esMovil, setEsMovil] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setEsMovil(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const res = await fetch(`${API}/carta`);
        const data = await res.json();
        if (cancelado) return;
        const urls = (data.paginas || []).map((p) => `${API}${p}`);
        // Toma la proporción de la primera página para que el libro no deforme la imagen
        if (urls.length) {
          await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              if (img.naturalWidth) setProporcion(img.naturalHeight / img.naturalWidth);
              resolve();
            };
            img.onerror = resolve;
            img.src = urls[0];
          });
        }
        if (!cancelado) setPaginas(urls);
      } catch {
        if (!cancelado) setError("No se pudo cargar la carta");
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  if (cargando) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 size={32} className="animate-spin text-gold" />
      </div>
    );
  }

  if (error || paginas.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center text-white/50">
        <BookOpen size={40} className="text-gold/60" />
        <p>{error || "La carta aún no está disponible."}</p>
      </div>
    );
  }

  const ancho = esMovil ? Math.min(window.innerWidth - 64, 340) : 420;
  const alto = Math.round(ancho * proporcion);

  return (
    <div className="flex w-full flex-col items-center overflow-hidden">
      <HTMLFlipBook
        key={`${paginas.length}-${esMovil}`}
        ref={flipBook}
        width={ancho}
        height={alto}
        size="fixed"
        showCover={true}
        usePortrait={esMovil}
        mobileScrollSupport={true}
        maxShadowOpacity={0.5}
        drawShadow={true}
        className="shadow-2xl"
        onFlip={(e) => setPaginaActual(e.data)}
      >
        {paginas.map((src, i) => (
          <div key={src} className="bg-white">
            <img
              src={src}
              alt={`Página ${i + 1} de la carta`}
              loading={i < 4 ? "eager" : "lazy"}
              draggable={false}
              className="h-full w-full select-none object-contain"
            />
          </div>
        ))}
      </HTMLFlipBook>

      <div className="mt-6 flex items-center gap-4 text-white">
        <button
          onClick={() => flipBook.current?.pageFlip()?.flipPrev()}
          disabled={paginaActual === 0}
          aria-label="Página anterior"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/50 text-gold transition-colors hover:bg-gold hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gold"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="min-w-24 text-center text-sm text-white/60">
          {paginaActual + 1} / {paginas.length}
        </span>
        <button
          onClick={() => flipBook.current?.pageFlip()?.flipNext()}
          disabled={paginaActual >= paginas.length - 1}
          aria-label="Página siguiente"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/50 text-gold transition-colors hover:bg-gold hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gold"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

export default Cartas;
