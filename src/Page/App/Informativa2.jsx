import React from "react";

export default function Informativa2() {
  return (
    <div className="bg-white flex flex-col justify-center items-center">
      <h2 className="text-blue-300 text-[18px] sm:text-[20px] md:text-[18px] py-10">
        Buena Higiene
      </h2>
      <div className="flex  flex-col justify-center items-center">
        <h5 className="text-2xl ">La mejor escapada </h5>
        <h3 className="text-[18px] sm:text-[20px] md:text-[26px]">
          No es tu salon de belleza de todo los dias{" "}
        </h3>
      </div>
      <ul className="flex flex-col sm:flex-row  justify-center  items-center gap-8 list-decimal p-10 ">
        <li className="flex flex-col items-center text-center max-w-xs py-2">
          <img src="#" alt="" />
          Imagen 1
          <h4 className="">
            <span>1.</span>Manicure y pedicure
          </h4>
          <p>
            There are many variations of passages of Lorem Ipsum available.
            Majority have suffered alteration in some form.
          </p>
        </li>
        <li className="flex flex-col items-center text-center max-w-xs">
          <img src="#" alt="" />
          Imagen 2
          <h4>
            <span>2.</span>Salon belleza
          </h4>
          <p>
            There are many variations of passages of Lorem Ipsum available.
            Majority have suffered alteration in some form.
          </p>
        </li>
        <li className="flex flex-col items-center text-center max-w-xs">
          <img src="#" alt="" />
          Imagen 3
          <h4>
            <span>3.</span>Masajes
          </h4>
          <p>
            There are many variations of passages of Lorem Ipsum available.
            Majority have suffered alteration in some form.
          </p>
        </li>
      </ul>
    </div>
  );
}
