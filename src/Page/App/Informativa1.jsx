import { Link } from "react-router-dom";
import video from "../../assets/Dorado.mp4";
import { MailCheck, Instagram } from "lucide-react";

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
          <div className="bg-[#222222]  rounded-2xl font-serif flex flex-col justify-center items-center text-center p-1 md:mb-3 sm:p-8  min-h-ful shadow-xl/60 shadow-amber-300">
            <div className="flex  flex-col justify-center p-10 max-w-full ">
              <h2 className="text-1 md:text-[20px] sm:text-[10px]font-bold mb-2 text-white text-center flex flex-col justify-center">
                CAMBIA TU ESTILO CON CONFIANZA
              </h2>
              <div className="bg-yellow-400 py-1.5 px-1 rounded-4xl  hover:bg-white  text-[20px] md:text-[20px] sm:text-[14px]">
                <Link to="/Citas">
                  <h2>PIDE TU TURNO</h2>
                  <button>AQUI</button>
                </Link>
              </div>
            </div>
            <div className="flex border-4 rounded-2xl border-amber-300/80 divide-x-6 divide-amber-300/80  ">
              <div className="flex-1 py-5 px-4 flex justify-center items-center">
                <MailCheck size={40} className="text-yellow-300" />
              </div>
              <div className="flex-1 py-5  px-4 flex justify-center items-center">
                <Instagram size={40}  className="text-yellow-300"/>
              </div>
              <div className="flex-1 py-5 px-4 flex justify-center items-center">
                {" "}
                <Instagram size={40}  className="text-yellow-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
