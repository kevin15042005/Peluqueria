import { Link } from "react-router-dom";
import imagen from "../../assets/react.svg";
export default function Informacion1() {
  return (
    <>
      <div className="relative h-160 sm:h-170 md:h-130">
        <img
          src={imagen}
          alt=""
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        < div className="relative z-10 grid grid-cols-1  md:grid-cols-[2fr_1fr] mt-8  p-6 pt-4  md:pt-10">
        
          <div className="flex flex-col justify-center p-5 bg-blue-300  sm">
            <div className="m-2 text-[12px] font-bold sm:text-[15px] md:text-[18px]">
              <h5>Disfruta del Ambiente</h5>
              <h3>NUESTROS AMPLIA GAMA DE SERVICOS </h3>
            </div>

            <div className="space-y-4">
              {" "}
              <div className="flex justify-between items-center ">
                <div className="">
                  <h3 className="">
                    <a href="">Manicure y Pedicure</a>{" "}
                  </h3>
                  <h4>30 min uñas</h4>
                </div>
                <h4>$30.000</h4>
              </div>
              <div className="flex justify-between items-center ">
                <div className="">
                  <h3>
                    <a href="">Salon de belleza</a>
                  </h3>
                  <h4>1 hora</h4>
                </div>
                <h4>$30.000</h4>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <h3>
                    <a href="">Masaje</a>
                  </h3>
                  <h4>20 min de masaje </h4>
                </div>
                <div clas>
                  <h4>$30.000</h4>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#B1A684] opacity-80 font-serif flex flex-col justify-center items-center text-center p-1 md:mb-3 sm:p-8  min-h-full">
            <div className="flex flex-col justify-center p-8 ">
              <h2 className="text-[20px] font-bold mb-2 text-white">
                VEN A <strong>EXPERIMENTAR</strong> EL VERDADERO PLACER
              </h2>
              <h2>PIDE TU TURNO</h2>
            </div>

            <div>
              <Link to="/Citas">
                <button>AQUI</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
