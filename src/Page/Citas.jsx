import React from "react";

export default function Citas() {
  return (
    <>
      <div className="p-4 flex justify-center ">
        <div className="p-4 text-center w-full max-w-md">
          <h2>Citas</h2>
          <form
            action=""
            className="flex flex-col items-center gap-4 border-2  border-amber-50 rounded-lg p-8"
          >
            <input type="text" name="" placeholder="Nombre" className="w-full border px-3 py-2 rounded"
/>
            <input type="text" name="Correo" placeholder="Correo" className="w-full border px-3 py-2 rounded"
 />
            <input
              type="text"
              name="Tipo de Servicio"
              placeholder="Tipo de Servicio"
              className="w-full border px-3 py-2 rounded"

            />
            <input type="text" name="Fechs" placeholder="Preferred Date"className="w-full border px-3 py-2 rounded"
 />
            <select name="" id="" className="w-full border px-3 py-2 rounded"
>
              <option value="">Alejandra</option>
              <option value="">Kevin</option>
            </select>
            <button className="bg-blue-500 p-2 border-[0.7] rounded-2xl">Solcitar</button>
          </form>
        </div>
      </div>
    </>
  );
}
