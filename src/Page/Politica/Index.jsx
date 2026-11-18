import React from "react";
import Contacto from "../Politica/Contacto";
import Politica from "../Politica/Politicas";

export default function Index() {
  return (
    <>
      <div className="min-h-screen bg-ink text-white flex justify-center">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <div className="">
            <Contacto/>
          </div>
          <div>
            <Politica/>
          </div>
        </div>
      </div>
    </>
  );
}
