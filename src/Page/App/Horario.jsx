import React from "react";

export default function Horario() {
  return (
    <>
      <div className="flex justify-center items-center min-h-15 p-6">
        <div className="b-white p-12 rounded-lg shadow-lg  max-w-md ">
          <h2 className="text-xl font-bold mb-3 border-b-2 border-blue-500 pb-2">
            Horario de apertura
          </h2>
          <p className="italic text-sm text-gray-600 mb-6">
            Donde la belleza se encuentra con la felicidad
          </p>
          <ul>
            <li className="flex justify-between items-center pb-3 ">
              <strong className="block text-base">Lunes a Domingo</strong>
              <span className="text-lg font-semibold text-blue-600">
                06:00 - 22:00 hrs
              </span>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
