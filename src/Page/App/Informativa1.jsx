import { Link } from "react-router-dom";
import video from "../../assets/Dorado.mp4";
import { MailCheck, Instagram, PersonStanding } from "lucide-react";

const VideoPlayer = () => {
  return (
    <div className="w-full= flex flex-col items-center justify-center mt-8 mb-8">
      <video
        className="w-full max-w-2xl aspect-video rounded-xl shadow-2xl "
        controls
        autoPlay
        muted
        playsInline
        loop
      >
        <source src={video} type="video/mp4" />
        Tu navegador no soporta etiquetas de video.
      </video>
    </div>
  );
};

export default function Informacion1() {
  return (
    <>
      <div className="mt-15 relative h-160 sm:h-170 md:h-130 bg-black">
        <div className="relative z-10 grid grid-cols-1 justify-center  md:grid-cols-[1fr_1fr] mt-8  p-6 pt-4  md:pt-10">
          <div>
            <VideoPlayer />
          </div>
          <div className="bg-[#2b25204f]  rounded-2xl font-serif flex flex-col justify-center items-center text-center p-1 md:mb-3 sm:p-8  min-h-ful shadow-xl/60 shadow-amber-300">
            <div className="flex  flex-col justify-center p-10 max-w-full ">
              <h2 className="text-1 md:text-[20px] sm:text-[10px]font-bold mb-2 text-white text-center flex flex-col justify-center">
                CAMBIA TU ESTILO CON CONFIANZA
              </h2>
              <div className="text-center flex justify-center items-center mt-10">
                <Link to="/Citas">
                  <a href="#_" class="relative inline-block text-lg group">
                    <span class="relative z-10 block px-10 py-6 overflow-hidden font-medium leading-tight text-black transition-colors duration-300 ease-out border-2 border-gray-900 rounded-lg group-hover:text-white">
                      <span class="absolute inset-0 w-full h-full px-10 py-6 rounded-lg bg-gray-50"></span>
                      <span class="absolute left-0 w-80 h-50 -ml-1 transition-all duration-300 origin-top-right -rotate-90 -translate-x-full translate-y-12 bg-amber-600 group-hover:-rotate-180 ease"></span>
                      <button className="relative">PIDE TU TURNO AQUI</button>
                    </span>
                    <span
                      className="absolute bottom-0 right-0 w-full h-12 -mb-1 -mr-1 transition-all duration-200 ease-linear bg-amber-600 rounded-lg group-hover:mb-0 group-hover:mr-0"
                      data-rounded="rounded-lg"
                    ></span>
                  </a>
                </Link>
              </div>
            </div>
            <div className="flex  divide-amber-300/80 gap-3 ">
              <div className=" py-5 px-4 flex justify-center items-center border-b-4 hover:bg-linear-to-r from-amber-200 via-amber-700 to-amber-900  bg-clip-text text-transparent  ">
                <a href="">
                  <MailCheck
                    size={40}
                    className="border-amber-300/80 divide-y-3 gap-3 text-yellow-300 font-bold"
                  />
                </a>
              </div>
              <div className=" border-amber-300/80 divide-y-3 gap-3 py-5  px-4 flex justify-center items-center border-b-4 hover:bg-linear-to-r from-amb-from-amber-200 via-amber-700 to-amber-900   bg-clip-text text-transparen ">
                <a href="https://www.instagram.com/peluqueriaseldorado?igsh=MXNsNmxkc2llaHY2ZA==https://www.instagram.com/peluqueriaseldorado?igsh=MXNsNmxkc2llaHY2ZA==">
                  <Instagram size={40} className="text-yellow-300  font-bold" />
                </a>
              </div>
              <div className=" border-amber-300/80 divide-y-3 gap-3 py-5 px-4 flex justify-center items-center   border-b-4 hover:bg-linear-to-r from-amb-from-amber-200 via-amber-700 to-amber-900  bg-clip-text text-transparen ">
                <a href="https://www.tiktok.com/@eldoradopeluquerias">
                  <PersonStanding
                    size={40}
                    className="text-yellow-300  font-bold"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
