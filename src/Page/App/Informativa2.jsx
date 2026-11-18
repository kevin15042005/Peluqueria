import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, ShieldCheck, Clock } from "lucide-react";
import Presentacion1 from "../../assets/Presentacion1.jpg";
import Presentacion2 from "../../assets/Presentacion2.jpg";
import FondoInicio from "../../assets/FondoInicio.webp";
import ImagenMasajesFacial from "../../assets/MasajeFacial.png";
import ImagenMasajes from "../../assets/Masajes.png";
import ImagenManicure from "../../assets/Manicure.png";
import ImagenSalonBelleza from "../../assets/SalonBelleza.png";

const images = [Presentacion1, Presentacion2];

const servicios = [
  {
    img: ImagenSalonBelleza,
    titulo: "Corte y peinado",
    texto: "Cortes modernos y clásicos, cepillado y peinados para cualquier ocasión.",
  },
  {
    img: ImagenManicure,
    titulo: "Manicure y pedicure",
    texto: "Uñas impecables con esmaltado tradicional, semipermanente y spa de manos.",
  },
  {
    img: ImagenMasajesFacial,
    titulo: "Tratamiento facial",
    texto: "Limpieza e hidratación profunda para una piel fresca y luminosa.",
  },
  {
    img: ImagenMasajes,
    titulo: "Masajes relajantes",
    texto: "Libera la tensión del viaje con masajes de cuello, espalda y hombros.",
  },
];

const ventajas = [
  { icon: Sparkles, titulo: "Productos premium", texto: "Marcas profesionales reconocidas." },
  { icon: ShieldCheck, titulo: "Buena higiene", texto: "Herramientas esterilizadas en cada servicio." },
  { icon: Clock, titulo: "Atención ágil", texto: "Pensado para el ritmo del viajero." },
];

const Slider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {images.map((img, index) => (
        <img
          key={index}
          src={img}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
};

const TituloSeccion = ({ etiqueta, titulo, centrado = true }) => (
  <div className={centrado ? "text-center" : ""}>
    <p
      className={`mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-gold ${
        centrado ? "justify-center" : ""
      }`}
    >
      <span className="h-px w-8 bg-gold" />
      {etiqueta}
      {centrado && <span className="h-px w-8 bg-gold" />}
    </p>
    <h2 className="font-display text-3xl text-white md:text-5xl">{titulo}</h2>
  </div>
);

export default function Informativa2() {
  return (
    <div className="bg-ink">
      {/* Servicios */}
      <section id="servicios" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-24 md:px-8">
        <TituloSeccion etiqueta="Lo que hacemos" titulo="Nuestros servicios" />

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {servicios.map((s, i) => (
            <article
              key={s.titulo}
              className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition-all duration-500 hover:-translate-y-1 hover:border-gold/50 hover:bg-white/[0.05]"
            >
              <span className="absolute right-6 top-6 font-display text-4xl text-white/5 transition-colors duration-500 group-hover:text-gold/20">
                0{i + 1}
              </span>
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-gold/10 transition-transform duration-500 group-hover:scale-110">
                <img src={s.img} alt="" className="h-9 w-9 object-contain" />
              </div>
              <h3 className="font-display text-xl text-white">{s.titulo}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/60">{s.texto}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/ServiciosUsuarios"
            className="group inline-flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-gold hover:text-gold-light"
          >
            Ver todos los servicios
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* Nosotros */}
      <section className="border-y border-white/5 bg-linear-to-b from-[#121214] to-ink">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 py-24 md:px-8 lg:grid-cols-2">
          {/* Imágenes */}
          <div className="relative pb-16 sm:pr-16">
            <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/60">
              <img
                src={FondoInicio}
                alt="Fachada de Peluquería El Dorado"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 hidden h-48 w-40 overflow-hidden rounded-2xl border-4 border-ink shadow-2xl sm:block">
              <Slider />
            </div>
            <div className="absolute -left-3 -top-3 -z-0 hidden h-24 w-24 rounded-tl-2xl border-l-2 border-t-2 border-gold/60 sm:block" />
          </div>

          {/* Texto */}
          <div>
            <TituloSeccion etiqueta="La mejor escapada" titulo="No es tu salón de todos los días" centrado={false} />
            <p className="mt-6 leading-relaxed text-white/65">
              Entre vuelo y vuelo, regálate un momento para ti. En El Dorado
              combinamos la experiencia de nuestros estilistas con productos
              profesionales para que llegues a tu destino luciendo increíble.
            </p>

            <ul className="mt-10 space-y-6">
              {ventajas.map(({ icon: Icon, titulo, texto }) => (
                <li key={titulo} className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                    <Icon size={20} />
                  </span>
                  <div>
                    <h4 className="font-semibold text-white">{titulo}</h4>
                    <p className="text-sm text-white/55">{texto}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              to="/Citas"
              className="mt-10 inline-block rounded-full bg-gold px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] text-ink transition-colors duration-300 hover:bg-gold-light"
            >
              Reserva ahora
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
