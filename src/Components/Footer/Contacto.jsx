import React from "react";
import {  Instagram } from "lucide-react";

export default function Contacto() {
  return (
    <>
      <div className="my-20">
        <div className=" bg-amber-900 flex flex-col   p-4 text-white gap-2  ">
          <span className="flex gap-x-2">
            <Instagram/>
            <a  className="font-medium" href="mailto:kevin20131118@gmail.com">kevi2013118@gmail.com</a>
          </span>
          <span>
            <a href="tel:+573202837622">Tel:3202837622</a>
          </span>
        </div>
        <div className="flex justify-center mt-6">
          <form className="border-2 border-amber-300 p-6 w-full max-w-md space-y-4 ">
            <fieldset className="flex flex-col">
              <legend className="font-bold my-1 ">Nombre</legend>
              <input
                type="text"
                placeholder="Nombre"
                className="border-2 rounded-[10px] p-2"
              />
            </fieldset>
            <fieldset>
              <legend className="font-bold my-1 ">Correco Electronico</legend>
              <input
                type="email"
                placeholder="Correo"
                className="border-2 rounded-[10px] p-2"
              />
            </fieldset>
            <fieldset>
              <legend className="font-bold my-1 ">
                Cuentanos brevemenete de tu emeprendimiento
              </legend>
              <input
                type="text"
                maxLength={200}
                className="border-2 rounded-[10px] p-2 w-full "
              />
            </fieldset>
            <div className="flex justify-center items-center ">
              <button>Enviar</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
