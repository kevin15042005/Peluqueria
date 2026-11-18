import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Phone, MapPin } from "lucide-react";
import Logo from "../../assets/log/logo.png";

const TikTok = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48Z" />
  </svg>
);

const Titulo = ({ children }) => (
  <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-gold">{children}</h3>
);

const linkClass = "text-white/60 transition-colors duration-300 hover:text-gold";

export default function Footer() {
  return (
    <footer className="border-t border-gold/20 bg-[#08080a] text-sm text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-16 sm:grid-cols-2 md:px-8 lg:grid-cols-4">
        <div>
          <img src={Logo} alt="Peluquería El Dorado" className="h-12 w-auto" />
          <p className="mt-5 max-w-xs leading-relaxed text-white/50">
            Belleza y bienestar para viajeros en el Aeropuerto El Dorado.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href="https://www.instagram.com/peluqueriaseldorado"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-gold hover:text-gold"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://www.tiktok.com/@eldoradopeluquerias"
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-gold hover:text-gold"
            >
              <TikTok />
            </a>
          </div>
        </div>

        <div>
          <Titulo>Contacto</Titulo>
          <ul className="space-y-3">
            <li className="flex items-center gap-2">
              <Phone size={15} className="text-gold" />
              <a href="tel:+573202837622" className={linkClass}>+57 320 283 7622</a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={15} className="mt-0.5 text-gold" />
              <a href="https://maps.app.goo.gl/vRM6TETAekEdvicj7" target="_blank" rel="noreferrer" className={linkClass}>
                Aeropuerto El Dorado, Local 26 <br /> Bogotá, Colombia
              </a>
            </li>
          </ul>
        </div>

        <div>
          <Titulo>Información</Titulo>
          <ul className="space-y-3">
            <li><Link to="/Contacto" className={linkClass}>Contacto</Link></li>
            <li><Link to="/Quienes_somos" className={linkClass}>Quiénes somos</Link></li>
            <li><Link to="/Citas" className={linkClass}>Agenda tu turno</Link></li>
          </ul>
        </div>

        <div>
          <Titulo>Legal</Titulo>
          <ul className="space-y-3">
            <li><Link to="/Politica_privacidad" className={linkClass}>Política de privacidad</Link></li>
            <li><Link to="/Terminos_condiciones" className={linkClass}>Términos y condiciones</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-white/40 sm:flex-row md:px-8">
          <p>© {new Date().getFullYear()} Peluquería El Dorado. Todos los derechos reservados.</p>
          <p>Powered by We are Datalab</p>
        </div>
      </div>
    </footer>
  );
}
