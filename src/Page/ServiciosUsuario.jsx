import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Droplets,
  Flower2,
  Hand,
  Palette,
  Eye,
  Scissors,
  BookOpen,
  X,
  ArrowRight,
} from "lucide-react";
import Carta from "./Cartas.jsx";
import FondoInicio from "../assets/FondoInicio.webp";

const servicios = [
  {
    icon: Droplets,
    nombre: "Spa capilar",
    texto: "Hidratación profunda, keratina y tratamientos que devuelven brillo y fuerza a tu cabello.",
  },
  {
    icon: Flower2,
    nombre: "Spa corporal",
    texto: "Masajes y rituales de relajación para liberar la tensión del viaje.",
  },
  {
    icon: Hand,
    nombre: "Spa de manos y pies",
    texto: "Manicure y pedicure tradicional o semipermanente con exfoliación e hidratación.",
  },
  {
    icon: Palette,
    nombre: "Make up",
    texto: "Maquillaje social y para eventos, pensado para durar todo el día.",
  },
  {
    icon: Eye,
    nombre: "Cejas y pestañas",
    texto: "Diseño de cejas, laminado y lifting de pestañas para una mirada definida.",
  },
  {
    icon: Scissors,
    nombre: "Corte y peinado",
    texto: "Cortes de tendencia, cepillado y peinados para cualquier ocasión.",
  },
];

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Bloquear scroll y cerrar con Escape mientras la carta está abierta
  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e) => e.key === "Escape" && setIsModalOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isModalOpen]);

  return (
    <div className="bg-ink text-white">
      {/* Encabezado */}
      <section className="relative isolate overflow-hidden">
        <img
          src={FondoInicio}
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-b from-ink/85 via-ink/80 to-ink" />

        <div className="mx-auto max-w-4xl px-6 py-24 text-center md:py-32">
          <p className="mb-5 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.35em] text-gold">
            <span className="h-px w-8 bg-gold" />
            Grupo El Dorado
            <span className="h-px w-8 bg-gold" />
          </p>
          <h1 className="font-display text-4xl leading-tight md:text-6xl">
            ¿Qué experiencia quieres <br className="hidden sm:block" />
            <span className="text-gradient-gold italic">vivir hoy?</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-white/70 md:text-lg">
            Cada servicio es una experiencia nueva, diseñada con técnica,
            elegancia y precisión.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/Citas"
              className="rounded-full bg-gold px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] text-ink shadow-lg shadow-gold/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-light"
            >
              Pide tu turno
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] text-white transition-colors duration-300 hover:border-gold hover:text-gold"
            >
              <BookOpen size={18} />
              Ver la carta
            </button>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section className="mx-auto max-w-7xl px-6 pb-24 md:px-8">
        <div className="text-center">
          <p className="mb-4 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.35em] text-gold">
            <span className="h-px w-8 bg-gold" />
            Lo que hacemos
            <span className="h-px w-8 bg-gold" />
          </p>
          <h2 className="font-display text-3xl md:text-5xl">Nuestros servicios</h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {servicios.map(({ icon: Icon, nombre, texto }, i) => (
            <article
              key={nombre}
              className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition-all duration-500 hover:-translate-y-1 hover:border-gold/50 hover:bg-white/[0.05]"
            >
              <span className="absolute right-6 top-6 font-display text-4xl text-white/5 transition-colors duration-500 group-hover:text-gold/20">
                0{i + 1}
              </span>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold transition-transform duration-500 group-hover:scale-110">
                <Icon size={24} />
              </div>
              <h3 className="font-display text-xl">{nombre}</h3>
              <p className="mt-3 grow text-sm leading-relaxed text-white/60">{texto}</p>
              <Link
                to="/Citas"
                className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold opacity-80 transition-opacity hover:opacity-100"
              >
                Reservar
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </article>
          ))}
        </div>

        {/* Llamado final */}
        <div className="mt-20 flex flex-col items-center justify-between gap-6 rounded-3xl border border-gold/25 bg-linear-to-r from-gold/10 via-transparent to-gold/10 px-8 py-10 text-center md:flex-row md:text-left">
          <div>
            <h3 className="font-display text-2xl md:text-3xl">¿Te regalas una escapada?</h3>
            <p className="mt-2 text-white/60">Reserva en menos de un minuto y te esperamos.</p>
          </div>
          <Link
            to="/Citas"
            className="shrink-0 rounded-full bg-gold px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] text-ink transition-colors duration-300 hover:bg-gold-light"
          >
            Agenda tu turno
          </Link>
        </div>
      </section>

      {/* Modal carta */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative max-h-full w-full max-w-5xl overflow-y-auto rounded-3xl border border-gold/30 bg-[#121214] p-6 md:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              aria-label="Cerrar"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-gold hover:text-gold"
            >
              <X size={20} />
            </button>
            <h2 className="mb-8 text-center font-display text-2xl md:text-3xl">
              Nuestra <span className="text-gradient-gold italic">carta</span>
            </h2>
            <Carta />
          </div>
        </div>
      )}
    </div>
  );
}
