import React from "react";
import Tasa from "../../assets/log/Tasa.webp"
export default function Tratado() {
  return (
    <>
      <div>
        <div className="flex flex-col py-10 items-center text-center">
          <h2>!Se tratado como la realeza!</h2>
          <h2>Porque Peluqueria</h2>
        </div>
        <div>
            <ul className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 items-center text-center gap-8 ">
                <li className="flex flex-col items-center"><img src={Tasa} alt="" /><h4>Rompe la rutina</h4><p>La mejorar de verse esteticamente bien</p></li>
              <li className="flex flex-col items-center "><img src={Tasa} alt="" /><h4>Mejora la belleza </h4><p>Proporciona mejor nutirnetes a tu cuero cabelludo</p></li>
              <li className="flex flex-col items-center "><img src={Tasa} alt="" /><h4>Cuerpo , mente y alma</h4><p>La mejor salon de belleza ,mejorr armonia ya tu uerpo y alma</p></li>
              <li className="flex flex-col items-center "><img src={Tasa} alt="" /><h4>Controlar la caida de cabello</h4><p>Ayuda  tu cuero cabelludo a etar mas fuerte </p> </li>
               
            </ul>
        </div>
      </div>
    </>
  );
}
