import React from "react";
import { Link } from "react-router-dom";

const NavbarEmpleado = () => {
  return (
    <nav className="bg-[#0083a0] text-white shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <img
            src="https://thewebmax.org/spa/images/logo.png"
            alt="Logo"
            className="h-10"
          />
          <Link to="/Administrador">CRUD</Link>
          <Link to="/Asistencia">Asistencia</Link>
              <Link to="/Servicios">Servicios</Link>

          {/* Botón Salir */}
          <Link
            to="/"
            className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-md font-bold transition shadow"
          >
            Salir
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavbarEmpleado;
