import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Carta from "./Cartas.jsx";
//Importar esitlos
import "swiper/css";
import "swiper/css/pagination";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const servicios = [
    {
      id: 1,
      nombre: "Spa Capilar",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8ngw1JgUnRUs2jRJxqsPeIrGYYiQdnxTBAQ&s",
    },
    {
      id: 2,
      nombre: "Spa Corporal",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQb3IHGnBoWSNe3jYZAaB-OyM2sSTzw9xNPmA&s",
    },
    {
      id: 3,
      nombre: "Spa de manos",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxxfxXrue-VJv5Ul7b6icJdNN_UGWN3qCawQ&s",
    },
    {
      id: 4,
      nombre: "Spa Capilar",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8ngw1JgUnRUs2jRJxqsPeIrGYYiQdnxTBAQ&s",
    },
    {
      id: 5,
      nombre: "Spa Corporal",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQb3IHGnBoWSNe3jYZAaB-OyM2sSTzw9xNPmA&s",
    },
    {
      id: 6,
      nombre: "Spa Corporal",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQb3IHGnBoWSNe3jYZAaB-OyM2sSTzw9xNPmA&s",
    },
  ];

  return (
    <>
      <div className="flex flex-col  items-center pt-24 min-h-screen text-white ">
        <div className="">
          <div className="flex flex-col justify-center items-center border-[0.8px] border-amber-400 rounded-3xl m-3 p-10 text-center bg-zinc-900/50 backdrop-blur-md">
            <h1 className=" md:text-4xl  mvb-6  text-center bg-linear-to-b from-amber-200 to-yellow-700/90 bg-clip-text text-transparent uppercase font-bold font-serif mvb-6 tracking-tight  text-3xl mb-4 ">
              Que experiencia quiere vivir ahora?
            </h1>
            <p className="text-amber-400/80 uppercase tracking-[0.2rem] text-sm my-4 font-bold">
              Mas x años transformando tu belleza
            </p>
            <p className="max-w-2xl text-white leading-relaxed">
               Grupo  <strong className=" bg-linear-to-b from-amber-200 to-yellow-700/90 bg-clip-text text-transparent">EL DORADO </strong>cada servicio es una
              experiencia nueva por vivir , diseñando para vivir cada tecnica
              <span className="text-white italic"> elegancia y presicion</span>
            </p>

            <div className="w-full max-w-2xl">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10  ">
                {[
                  " Spa Capilar",
                  " Spa Corporal",
                  " Spa de manos y pies",
                  " Make Up",
                  " Cejas pestaña",
                  " Corte y peinado",
                ].map((item, index) => (
                  <li
                    key={index}
                    className="  bg-amber-200 borde border-amber-400/30 text-black font-bold gap-3 mt-3 py-4 px-4 rounded-lg text-sm shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:text-black hover:scale-105 transition-transform duration-300 cursor-default   "
                  >
                    <span className="r">{item.split(" "[0])}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-amber-200 text-black px-12 py-4 rounded-2xl font-black text-lg shadow-[0_0_20px_rgba(251,191,36,0.4)] group-hover:bg-white transition-transform hover:scale-105  duration-200 ">
                <Link to="/Citas">
                  <h2 className="text-black">PIDE TU TURNO</h2>
                  <button className="text-black">AQUI</button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col text-center ">

        <a href="#_" class="relative inline-block text-lg group">
          <span class="relative z-10 block px-10 py-6 overflow-hidden font-medium leading-tight text-gray-800 transition-colors duration-300 ease-out border-2 border-gray-900 rounded-lg group-hover:text-white">
            <span class="absolute inset-0 w-full h-full px-10 py-6 rounded-lg bg-gray-50"></span>
            <span class="absolute left-0 w-50 h-50 -ml-2 transition-all duration-300 origin-top-right -rotate-90 -translate-x-full translate-y-12 bg-amber-600 group-hover:-rotate-180 ease"></span>
            <button className="relative text-[15px] md:text-[18px]" onClick={() => setIsModalOpen(true)}>
              Mirar la Carta
            </button>{" "}
          </span>
          <span
            className="absolute bottom-0 right-0 w-full h-12 -mb-1 -mr-1 transition-all duration-200 ease-linear bg-amber-600 rounded-lg group-hover:mb-0 group-hover:mr-0"
            data-rounded="rounded-lg"
          ></span>
        </a></div>

        <div className="w-full px-4">
          <h1 className=" mt-10 text-center bg-linear-to-t from-amber-200 to-yellow-700/90 bg-clip-text text-transparent uppercase font-bold font-serif mvb-6 tracking-tight  text-3xl mb-4 ">
            Nuestros Servicios
          </h1>

          {/* Contenedor del Swiper con overflow controlado */}
          <div className="w-full max-w-5xl mx-auto py-10 min-h-87.5 md:min-h-97.5">
            <div className="relative">
              {/* Gradientes para móvil (opcional) */}
              <div className="absolute inset-y-0 left-0 w-4 bg-linear-to-r from-black to-transparent z-10 md:hidden"></div>
              <div className="absolute inset-y-0 right-0 w-4 bg-linear-to-l from-black to-transparent z-10 md:hidden"></div>

              <Swiper
                modules={[Autoplay]}
                preloadImages={false}
                watchSlidesProgress={true} //Mejora el rendimiento de deslice 
                spaceBetween={16}
                slidesPerView={1.6}
                centeredSlides={true}
                loop={true}
                autoplay={{
                  delay: 1000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                breakpoints={{
                  480: {
                    slidesPerView: 1.5,
                    centeredSlides: false,
                    spaceBetween: 20,
                  },
                  640: {
                    slidesPerView: 2,
                    spaceBetween: 24,
                  },
                  768: {
                    slidesPerView: 2.5,
                  },
                  1024: {
                    slidesPerView: 3,
                    spaceBetween: 28,
                  },
                }}
                className="mySwiper"
              >
                {servicios.map((servicio) => (
                  <SwiperSlide key={servicio.id}>
                    <div className="flex flex-col items-center p-2">
                      <div className="w-full h-48 md:h-56 overflow-hidden rounded-lg mb-3">
                        <img
                          src={servicio.img}
                          alt={servicio.nombre}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex justify-center">
                        <h4 className="text-sm md:text-base text-center px-2 bg-linear-to-r from-amber-200 to-yellow-700/90 bg-clip-text text-transparent  uppercase font-bold font-serif mvb-6 tracking-tight  ">
                          {servicio.nombre}
                        </h4>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
            {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-zinc-900 border border-amber-400/50 rounded-2xl  w-full h-full overflow-y-auto relative p-8">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-4 right-4 text-white text-2xl hover:text-amber-400"
                  >
                    ✕
                  </button>

                  <h2 className="text-3xl font-bold text-amber-400 mb-6 text-center">
                    Nuestra Carta de Servicios
                  </h2>

                  <div className="space-y-8">
                    <Carta />{" "}
                  </div>
                </div>
              </div>
            )}

            <div className="text-center flex justify-center items-center mt-10">
              <Link to="/Citas">
                <a href="#_" class="relative inline-block text-lg group">
                  <span class="relative z-10 block px-10 py-6 overflow-hidden font-medium leading-tight text-black transition-colors duration-300 ease-out border-2 border-gray-900 rounded-lg group-hover:text-white">
                    <span class="absolute inset-0 w-full h-full px-10 py-6 rounded-lg bg-gray-50"></span>
                    <span class="absolute left-0 w-80 h-50 -ml-1 transition-all duration-300 origin-top-right -rotate-90 -translate-x-full translate-y-12 bg-amber-600 group-hover:-rotate-180 ease"></span>
                    <button className="relative text-[15px] md:text-[18px]">PIDE TU TURNO AQUI</button>
                  </span>
                  <span
                    className="absolute bottom-0 right-0 w-full h-12 -mb-1 -mr-1 transition-all duration-200 ease-linear bg-amber-600 rounded-lg group-hover:mb-0 group-hover:mr-0"
                    data-rounded="rounded-lg"
                  ></span>
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
