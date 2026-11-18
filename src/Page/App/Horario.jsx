import { MapPin, Phone, Clock } from "lucide-react";
import Reloj from "../App/Reloj";

export default function Horario() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:px-8">
      <div className="text-center">
        <p className="mb-4 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.35em] text-gold">
          <span className="h-px w-8 bg-gold" />
          Visítanos
          <span className="h-px w-8 bg-gold" />
        </p>
        <h2 className="font-display text-3xl text-white md:text-5xl">Horario y ubicación</h2>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-[340px_1fr]">
        <div className="flex flex-col gap-6">
          <Reloj />

          <ul className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/70">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-gold" />
              <a href="https://maps.app.goo.gl/vRM6TETAekEdvicj7" target="_blank" rel="noreferrer" className="hover:text-gold">
                Aeropuerto El Dorado, Local 26 <br /> Bogotá, Colombia
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="shrink-0 text-gold" />
              <a href="tel:+573202837622" className="hover:text-gold">+57 320 283 7622</a>
            </li>
            <li className="flex items-center gap-3">
              <Clock size={18} className="shrink-0 text-gold" />
              Todos los días · 6:00 a.m. – 10:00 p.m.
            </li>
          </ul>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/50">
          <iframe
            className="h-80 w-full grayscale-[40%] lg:h-full lg:min-h-[520px]"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.414658000806!2d-74.1455078251313!3d4.6977993952771975!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9cb753f18c55%3A0x6f766c561c665212!2sPeluquer%C3%ADa!5e0!3m2!1ses-419!2sco!4v1769799174912!5m2!1ses-419!2sco"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación de la Peluquería"
          ></iframe>
        </div>
      </div>
    </section>
  );
}
