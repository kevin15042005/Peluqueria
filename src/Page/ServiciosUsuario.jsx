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
      id: 3,
      nombre: "Spa de manos",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxxfxXrue-VJv5Ul7b6icJdNN_UGWN3qCawQ&s",
    },
  ];

  return (
    <>
      <div className="flex flex-col items-center pt-24 min-h-screen text-white ">
        <div className="">
          <div className="flex flex-col justify-center items-center border-[0.8px] rounded-2xl m-3 text-center">
            <h1 className="text-3xl my-4">
              Que experiencia quiere vivir ahora?
            </h1>
            <p className="">
              Llevamos x años mejorando la belleza y transformacion visual
            </p>
            <p>
              En el grupo el <strong>EL DORADO </strong>cada servicio es una
              experiencia nueva por vivir , diseñando para vivir cada tecnica
              elegancia y presicion
            </p>

            <div className="w-full justify-center">
              <ul className="grid grid-cols md:grid-cols-2 ">
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
                    className="flex items-center justify-center gap-2 p-3 mx-auto mt-4 w-fit bg-amber-400 text-black rounded-lg hover:scale-105 transition-transform cursor-default"
                  >
                    <span className="r">{item.split(" "[0])}</span>
                    <span>{item.split(" ").slice(1).join(" ")}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-yellow-400 my-6 mx-auto w-fit px-3 rounded-4xl hover:bg-white text-[20px] md:text-[20px] sm:text-[14px]">
                <Link to="/Citas">
                  <h2 className="text-black">PIDE TU TURNO</h2>
                  <button className="text-black">AQUI</button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col text-center ">
          <button
            className="mt-4 px-6 py-2 border-2 border-amber-400 text-amber-400 rounded-full hover:bg-amber-400 hover:text-black transition-all font-bold"
            onClick={() => setIsModalOpen(true)}
          >
            Mirar la Carta
          </button>{" "}
        </div>
        <div className="w-full px-4">
          <h1 className="text-amber-400 text-center mt-8 text-3xl font-sans">
            Nuestros Servicios
          </h1>

          {/* Contenedor del Swiper con overflow controlado */}
          <div className="w-full max-w-5xl mx-auto py-10 md:py-20">
            <div className="relative">
              {/* Gradientes para móvil (opcional) */}
              <div className="absolute inset-y-0 left-0 w-4 bg-linear-to-r from-black to-transparent z-10 md:hidden"></div>
              <div className="absolute inset-y-0 right-0 w-4 bg-linear-to-l from-black to-transparent z-10 md:hidden"></div>

              <Swiper
                modules={[Autoplay]}
                spaceBetween={16}
                slidesPerView={1.2}
                centeredSlides={true}
                loop={true}
                autoplay={{
                  delay: 1500,
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
                    slidesPerView: 4,
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
                        <h4 className="text-sm md:text-base text-center px-2">
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
                  {/* Botón Cerrar */}
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

            <div className="text-center flex justify-center items-center bg-yellow-400 my-6 mx-auto w-fit px-6 py-2 rounded-4xl hover:bg-white text-[20px] md:text-[20px] sm:text-[14px] transition-colors">
              <Link to="/Citas">
                <h2 className="text-black font-">PIDE TU TURNO</h2>
                <button className="text-black">AQUI</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
