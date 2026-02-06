import React from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
//Importar esitlos
import "swiper/css";
import "swiper/css/pagination";
export default function Home() {
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col justify-center items-center border-[0.8px] rounded-2xl m-3 text-center">
            <h1 className="text-3xl my-4">Que experiencia quiere vivir ahora?</h1>
            <p className="">
              Llevamos x años mejorando l abelleza y transformacion visual 
            </p> 
            <p>
              En el grupo el <strong>EL DORADO </strong>cada servicio es una
              experiencia nueva por vivir , diseñando para vivir cadas tecnica
              elegenacia y presicion 
            </p>
            <div className="w-full justify-center">
              <ul>
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
className="flex items-center justify-center gap-2 p-3 mx-auto mt-4  w-fit bg-amber-400 text-black rounded-lg hover:scale-105 transition-transform cursor-default"                  >
                    <span className="r">{item.split(" "[0])}</span>
                    <span>{item.split(" ").slice(1).join(" ")}</span>
                  </li>
                ))}
              </ul>
                  <div className="bg-yellow-400  my-6 mx-auto w-fit  px-3 rounded-4xl  hover:bg-white  text-[20px] md:text-[20px] sm:text-[14px]">
                <Link to="/Citas">
                  <h2 className="text-black">PIDE TU TURNO</h2>
                  <button className="text-black">AQUI</button>
                </Link>
              </div>
            </div>
          </div>
          <div className="flex  flex-col justify-center items-center border-2 ">
            <h1>Hola mundo</h1>
          </div>
        </div>
        <div>
          <h1 className="text-amber-400 text-center mt-8 text-3xl font-sans">
            Nuestro Servicios 
          </h1>
          <div className="w-full h-full object-cover max-w-5xl px-1 py-20">
            <Swiper
              modules={[Autoplay]}
              spaceBetween={1}
              slidesPerView={2.8}
              loop={true}
              loopAdditionalSlides={3}
              autoplay={{
                delay: 1500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              pagination={{ clickable: true }}
              breakpoints={{
                480: { slidesPerView: 1 },
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 4 },
              }}
              className="mySwiper"
            >
              {[...servicios, ...servicios].map((servicio, index) => (
                <SwiperSlide key={`${servicio.id}-${index}`}>
                   
                  <div className="flex flex-col text-centerm items-center">
                    <img src={servicio.img} alt={servicio.nombre} />

                    <div className="flex justify-center">
                      <h4 className="">{servicio.nombre}</h4>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
               <div className=" text-center flex justify-center items-center bg-yellow-400  my-6 mx-auto w-fit  px-3 rounded-4xl  hover:bg-white  text-[20px] md:text-[20px] sm:text-[14px]">
                <Link to="/Citas">
                  <h2 className="text-black">PIDE TU TURNO</h2>
                  <button className="text-black ">AQUI</button>
                </Link>
              </div>
          </div>
        </div>
      </div>
    </>
  );
}
