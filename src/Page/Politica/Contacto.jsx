import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Phone, MapPin, TabletSmartphone , HeartPlus } from "lucide-react";


export default function Contacto() {
  const contacto = [
    {
      icon: TabletSmartphone ,
      nombre: "Contacto",
      texto:
        "Llamanos tenemos Belleza y bienestar para viajeros",
        rs1:Instagram,
        rs2:Phone,
        rs3:MapPin
    },
    {
      icon: HeartPlus,
      nombre: "Nuestras Redes",
      texto:
        "Masajes y rituales de relajación para liberar la tensión del viaje.",
    },
  ];
  return (
    <>
      <section className="mx-auto max-w-4xl px-6 py-12 text-center md:py-32">
        {" "}
        <h1 className="font-display text-4xl md:text-5xl">
          <span className="text-gradient-gold">Contactos</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl leading-relaxed md:text-l">
          Encontraras la informacion nuestras politicas{" "}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {contacto.map(({ icon: Icon, nombre, texto }, i) => (
            <article
              key={nombre}
              className="group relative m-4 flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition-all duration-500 hover:-translate-y-1 hover:border-gold/50 hover:bg-white/[0.05]"
            >
              <span className="absolute right-6 top-6 font-display text-4xl text-white/5 transition-colors duration-500 group-hover:text-gold/20">
                0{i + 1}
              </span>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold transition-transform duration-500 group-hover:scale-110">
                <Icon size={24} />
              </div>
              <h3 className="font-display text-xl">{nombre}</h3>
              <p className="mt-3 grow text-sm leading-relaxed text-white/60">
                {texto}
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
