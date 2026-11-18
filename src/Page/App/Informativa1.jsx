import { Link } from "react-router-dom";
import video from "../../assets/Dorado.mp4";
import { Instagram, Phone, MapPin, ChevronDown } from "lucide-react";

const TikTok = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48Z" />
  </svg>
);

const redes = [
  {
    href: "https://www.instagram.com/peluqueriaseldorado",
    label: "Instagram",
    icon: <Instagram size={20} />,
  },
  {
    href: "https://www.tiktok.com/@eldoradopeluquerias",
    label: "TikTok",
    icon: <TikTok size={20} />,
  },
  {
    href: "tel:+573202837622",
    label: "Llamar",
    icon: <Phone size={20} />,
  },
];

export default function Informacion1() {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-5rem)] items-center overflow-hidden bg-ink">
      {/* Video de fondo */}
      <video
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        autoPlay
        muted
        playsInline
        loop
      >
        <source src={video} type="video/mp4" />
      </video>
      {/* Capas de oscurecimiento */}
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-ink via-ink/80 to-ink/30" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-linear-to-t from-ink to-transparent" />

      <div className="mx-auto w-full max-w-7xl px-6 py-20 md:px-8">
        <div className="max-w-2xl">
          <p className="mb-5 flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-gold">
            <span className="h-px w-10 bg-gold" />
            Peluquería El Dorado
          </p>

          <h1 className="font-display text-4xl leading-tight text-white sm:text-5xl md:text-6xl">
            Cambia tu estilo <br />
            <span className="text-gradient-gold italic">con confianza</span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/70 md:text-lg">
            Corte, color, manicure y tratamientos en el corazón del Aeropuerto
            El Dorado. Llega con prisa, sal renovado.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/Citas"
              className="rounded-full bg-gold px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] text-ink shadow-lg shadow-gold/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-light hover:shadow-gold/40"
            >
              Pide tu turno
            </Link>
            <Link
              to="/ServiciosUsuarios"
              className="rounded-full border border-white/30 px-8 py-4 text-sm font-semibold uppercase tracking-[0.15em] text-white transition-colors duration-300 hover:border-gold hover:text-gold"
            >
              Ver servicios
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              {redes.map((r) => (
                <a
                  key={r.label}
                  href={r.href}
                  target={r.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  aria-label={r.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 text-gold transition-all duration-300 hover:bg-gold hover:text-ink"
                >
                  {r.icon}
                </a>
              ))}
            </div>
            <span className="flex items-center gap-2 text-sm text-white/60">
              <MapPin size={16} className="text-gold" />
              Aeropuerto El Dorado · Local 26
            </span>
          </div>
        </div>
      </div>

      <a
        href="#servicios"
        aria-label="Ir a servicios"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce text-gold/70 hover:text-gold"
      >
        <ChevronDown size={28} />
      </a>
    </section>
  );
}
