//Css folder

import React, { useEffect, useState } from "react";
import Presentacion1 from "../../assets/Presentacion1.jpg";
import Presentacion2 from "../../assets/Presentacion2.jpg";
import ImagenMasajesFacial from "../../assets/MasajeFacial.png";
import ImagenMasajes from "../../assets/Masajes.png";
import ImageneManicure from "../../assets/Manicure.png";
import ImageSalonBelleza from "../../assets/SalonBelleza.png";
const images = [Presentacion1, Presentacion2];

const Slider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className=" relative w-full h-70 max-90 md:h-90 md:max-120   overflow-hidden rounded-2xl shadow-2xl">
      {images.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-2000 ease-in-out ${index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          <img
            src={img}
            alt={`slider-${index}`}
            className="w-full h-full object-cover object-center"
          />
        </div>
      ))}
    </div>
  );
};

export default function Informativa2() {
  return (
    <div className="my-20 rounded-2xl  flex flex-col justify-center items-center">
      <h2 className="text-white font-extrabold font-serif text-[20px] sm:text-[20px] md:text-[40px] py-10">
        Buena Higiene
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 justify-center items-center">
        <div className=" flex flex-col justify-center items-center rounded-2xl gap-4 border-2 border-amber-300 max-h-full my-20 py-6 px-3  bg-black    text-white transform scale-105  w-11/12 max-w-lg mx-auto">
          <h5 className="font-play text-2xl text-[18px] sm:text-[20px] md:text-[26px] ">
            `La mejor escapada`
          </h5>
          <h3 className="text-center text-[18px] sm:text-[20px] md:text-[26px]">
            No es tu salon de belleza de todo los dias
          </h3>
        </div>
        <div>
          <Slider />
        </div>
      </div>

      <div className="mx-full md:mx-20 grid  grid-cols-1 md:grid-cols-3 mt gap-3 p-10 my-40  ">
        <div className="flex flex-col text-center items-center border border-amber-200 rounded-2xl p-6 backdrop-blur-sm shadow-2xl  ">
          <div className="w-full overflow-hidden rounded-xl mb-6">
            <img
              src={ImageneManicure}
              alt="Manicure"
              className="w-full h-48 object-cover hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div>
            <h4 className="font-bold font-serif text-2xl text-white">
              <span>1.</span>Manicure y pedicure
            </h4>
            <p className="text-white">
              There are many variations of passages of Lorem Ipsum available.
              Majority have suffered alteration in some form.
            </p>
          </div>
        </div>
        <div className="flex flex-col text-center items-center border border-amber-200 rounded-2xl p-6 backdrop-blur-sm shadow-2xl ">
          <div className="w-full overflow-hidden rounded-xl mb-6">
            <img
              src={ImageneManicure}
              alt="Manicure"
              className="w-full h-48 object-cover hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div>
            <h4 className="font-bold font-serif text-2xl text-white">
              <span>1.</span>Manicure y pedicure
            </h4>
            <p className="text-white">
              There are many variations of passages of Lorem Ipsum available.
              Majority have suffered alteration in some form.
            </p>
          </div>
        </div>
        <div className="flex flex-col text-center items-center border border-amber-200 rounded-2xl p-6 backdrop-blur-sm shadow-2xl ">
          <div className="w-full overflow-hidden rounded-xl mb-6">
            <img
              src={ImageneManicure}
              alt="Manicure"
              className="w-full h-48 object-cover hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div>
            <h4 className="font-bold font-serif text-2xl text-white">
              <span>1.</span>Manicure y pedicure
            </h4>
            <p className="text-white">
              There are many variations of passages of Lorem Ipsum available.
              Majority have suffered alteration in some form.
            </p>
          </div>
        </div>
        <div className="flex flex-col text-center items-center border border-amber-200 rounded-2xl p-6 backdrop-blur-sm shadow-2xl ">
          <div className="w-full overflow-hidden rounded-xl mb-6">
            <img
              src={ImageneManicure}
              alt="Manicure"
              className="w-full h-48 object-cover hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div>
            <h4 className="font-bold font-serif text-2xl text-white">
              <span>1.</span>Manicure y pedicure
            </h4>
            <p className="text-white">
              There are many variations of passages of Lorem Ipsum available.
              Majority have suffered alteration in some form.
            </p>
          </div>
        </div>
        <div className="flex flex-col text-center items-center border border-amber-200 rounded-2xl p-6 backdrop-blur-sm shadow-2xl ">
          <div className="w-full overflow-hidden rounded-xl mb-6">
            <img
              src={ImageneManicure}
              alt="Manicure"
              className="w-full h-48 object-cover hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div>
            <h4 className="font-bold font-serif text-2xl text-white">
              <span>1.</span>Manicure y pedicure
            </h4>
            <p className="text-white">
              There are many variations of passages of Lorem Ipsum available.
              Majority have suffered alteration in some form.
            </p>
          </div>
        </div>{" "}
        <div className="flex flex-col text-center items-center border border-amber-200 rounded-2xl p-6 backdrop-blur-sm shadow-2xl ">
          <div className="w-full overflow-hidden rounded-xl mb-6">
            <img
              src={ImageneManicure}
              alt="Manicure"
              className="w-full h-48 object-cover hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div>
            <h4 className="font-bold font-serif text-2xl text-white">
              <span>1.</span>Manicure y pedicure
            </h4>
            <p className="text-white">
              There are many variations of passages of Lorem Ipsum available.
              Majority have suffered alteration in some form.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
