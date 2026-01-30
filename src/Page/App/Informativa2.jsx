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
          />{" "}
        </div>
      ))}
    </div>
  );
};

export default function Informativa2() {
  return (
    <div className="my-20 bg-white flex flex-col justify-center items-center">
      <h2 className="text-black font-extrabold font-serif text-[20px] sm:text-[20px] md:text-[40px] py-10">
        Buena Higiene
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 justify-center items-center">
        <div className=" flex flex-col justify-center items-center border-2 border-amber-300 max-h-full my-20 py-6 px-3  bg-black    text-white transform scale-105  w-11/12 max-w-lg mx-auto">
          <h5 className="text-2xl text-[18px] sm:text-[20px] md:text-[26px] ">
            La mejor escapada{" "}
          </h5>
          <h3 className="text-center text-[18px] sm:text-[20px] md:text-[26px]">
            No es tu salon de belleza de todo los dias{" "}
          </h3>
        </div>
        <div>
          <Slider />
        </div>
      </div>
      <ul className="grid  grid-cols-1 md:grid-cols-2  gap-8 p-10 my-40  ">
        <li className="flex flex-col items-center text-center max-w-xs py-2 border-t-2 pt-6">
          <h4 className="font-bold font-serif text-2xl">
            <span>1.</span>Manicure y pedicure
          </h4>
          <img src={ImageneManicure} alt="Manicure" />
          <p>
            There are many variations of passages of Lorem Ipsum available.
            Majority have suffered alteration in some form.
          </p>
        </li>
        <li className="flex flex-col items-center text-center max-w-xs border-t-2 pt-6">
          <h4 className="font-bold font-serif text-2xl">
            <span>2.</span>Salon belleza
          </h4>
          <img src={ImageSalonBelleza} alt="Belleza" />
          <p className="font-sans">
            There are many variations of passages of Lorem Ipsum available.
            Majority have suffered alteration in some form.
          </p>
        </li>
        <li className="flex flex-col items-center text-center max-w-xs border-t-2 pt-6 ">
          <h4 className="font-bold font-serif text-2xl">
            <span>3.</span>Masajes
          </h4>
          <img src={ImagenMasajes} alt="Masaje" />
          <p>
            There are many variations of passages of Lorem Ipsum available.
            Majority have suffered alteration in some form.
          </p>
        </li>  <li className="flex flex-col items-center text-center max-w-xs border-t-2 pt-6 ">
          <h4 className="font-bold font-serif text-2xl">
            <span>4.</span>Facial
          </h4>
          <img src={ImagenMasajesFacial} alt="Facial" />
          <p>
            There are many variations of passages of Lorem Ipsum available.
            Majority have suffered alteration in some form.
          </p>
        </li>
      </ul>
    </div>
  );
}
