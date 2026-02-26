import React, { useRef, useState, useEffect } from "react";
import HTMLFlipBook from "react-pageflip";
import "./Informativa2.css";
import imagen1 from "../assets/1.webp";
import imagen2 from "../assets/2.webp";
import imagen3 from "../assets/3.webp";
import imagen4 from "../assets/4.webp";
import imagen5 from "../assets/5.webp";

function Cartas() {
  const flipBook = useRef();
  
  // 1. Estado para detectar si es móvil
  const [esMovil, setEsMovil] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setEsMovil(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const servicios = [
    { id: 1, title: "Servicio A", img: imagen2 },
    { id: 2, title: "Servicio B", img: imagen3 },
    { id: 3, title: "Servicio C", img: imagen4 },
    { id: 4, title: "Servicio D", img: imagen5 },
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full overflow-hidden">
      <HTMLFlipBook 
        // 2. Ajuste dinámico de tamaño
        width={esMovil ? 300 : 550} 
        height={esMovil ? 450 : 650} 
        size={esMovil ? "fixed" : "stretch"}
        minWidth={300}
        maxWidth={700}
        minHeight={400}
        maxHeight={800}
        maxShadowOpacity={0.55} 
        showCover={true}
        mobileScrollSupport={true} // 3. Importante para móviles
        ref={flipBook}
        className="shadow-2xl"
      >
        <div className="demoPage">
          <img src={imagen1} alt="Portada" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {servicios.map((servicio) => (
          <div className="demoPage" key={servicio.id}>
            <img 
              src={servicio.img} 
              alt={servicio.title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
        ))}

        <div className="demoPage">
          <img src={imagen1} alt="Contra" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </HTMLFlipBook>

      {/* Botones inferiores */}
      <div className="flex gap-4 mt-6">
        <button 
          onClick={() => flipBook.current.pageFlip().pagePrev()}
          className="bg-zinc-800 border border-amber-400 text-amber-400 px-4 py-2 rounded-full text-sm font-bold"
        >
          ANTERIOR
        </button>
        <button 
          onClick={() => flipBook.current.pageFlip().pageForward()}
          className="bg-amber-400 text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg"
        >
          SIGUIENTE
        </button>
      </div>
    </div>
  );
}

export default Cartas;