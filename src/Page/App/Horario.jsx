import React from "react";

export default function Horario() {
  return (
    <>
      <div className="flex flex-col md:flex-row justify-center items-center gap-9 min-h-15 p-6">
        {" "}
        <div className="bg-white p-12 rounded-lg shadow-lg  max-w-md ">
          <h2 className="text-3xl  font-bold mb-3 border-b-2 border-amber-400 pb-2">
            Horario de apertura
          </h2>
          <p className=" text-sm text-black mb-6">
            Donde la belleza se encuentra con la felicidad
          </p>
          <ul>
            <li className="flex flex-col justify-between items-center pb-3 ">
              <strong className="block  text-2xl">Lunes a Domingo</strong>
              <span className="text-lg font-semibold text-amber-400">
                06:00 - 22:00 hrs
              </span>
            </li>
          </ul>
        </div>
        <div className="my-20">
          <iframe
            className="rounded-2xl h-70 w-100 md:h-130 md:w-200 "
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.414658000806!2d-74.1455078251313!3d4.6977993952771975!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9cb753f18c55%3A0x6f766c561c665212!2sPeluquer%C3%ADa!5e0!3m2!1ses-419!2sco!4v1769799174912!5m2!1ses-419!2sco"
            width="600"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación de la Peluquería"
          ></iframe>{" "}
        </div>
      </div>
    </>
  );
}
