import React from "react";
import { Link } from "react-router-dom";
import { MailCheck, Instagram } from "lucide-react";
export default function Footer() {
  return (
    <>
      <footer className="bg-[#000000] p-7 text-white">
        <div className="max-w-8xl max-auto grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 text-center  ">
          <div>
            <h3 className="font-bold text-[16px] sm:text-[17px]  ">Contacto</h3>
            <ul>
              <li className="hover:underline text-[15px]  sm:text-[17px]">
                <a href="tel:+573202837622" target="_blank" rel="noreferrer">
                  +573202837622
                </a>
              </li>
              <li className="hover:underline  text-[15px]  sm:text-[17px] ">
                <a href="https://maps.app.goo.gl/vRM6TETAekEdvicj7">
                  Aeropuerto el dorado Local 26
                </a>
              </li>
              <span className=" text-[15px]  sm:text-[17px]">
                Bogota , Colombia
              </span>
            </ul> 
          </div>
          <div>
            <h3 className="font-bold text-[16px] sm:text-[17px]">
              Informaicon
            </h3>
            <ul>
              <li>Preguntas Frecuentes</li>
              <li className="hover:underline  text-[15px]  sm:text-[17px]">
                <Link to="/Contacto">Contacto</Link>
              </li>
              <li className="hover:underline  text-[15px]  sm:text-[17px]">
                <Link to="/Quienes_somos">Quienes somos</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-[16px] sm:text-[17px]">Legal</h3>
            <ul>
              <li className="hover:underline  text-[15px]  sm:text-[17px]">
                <Link to="/Politica_privacidad">Politica de Privacidad</Link>
              </li>
              <li className="hover:underline  text-[15px]  sm:text-[17px]">
                <Link to="Terminos_condiciones">Terminos y condiciones</Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>
      <div className="flex flex-col sm:flex-row items-center justify-between  bg-[#222222] opacity-[0.9] p-3 text-white">
        <p className="text-[12px] sm:text-[12px] md:text-[17px] ] transition-all  ">
          Powered by We are Datalab © Peluqeuria 2026
        </p>
        <div className="flex items-center gap-4 my-2 text-[13px] sm:text-[15px] px-5 ">
          <MailCheck />
          <Instagram />
          imagen 3
        </div>
      </div>
    </>
  );
}
