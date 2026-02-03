import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "./../assets/log/logo.png";
const NavbarEmpleado = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleMenuClick = () => {
    setIsScrolled(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <>
      <nav
        className={`font-sans text-white p-4 bg-[#000000] flex items-center justify-center fixed w-full top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-black   shadow-xl/70 shadow-amber-400 "
            : "bg-[#000000] "
        }`}
      >
        <div className="flex items-center justify-around w-full pr-7">
          <div className="flex shrink-0">
            <img
              src={Logo}
              alt="Logo"
              className={`${isScrolled ? " roun" : "border-2 border-amber-50 rounded-2xl"} `}
            />
          </div>

          <div className="flex justify-center">
            <ul className=" hidden md:flex justify-center space-x-8 ml-auto">
              <li className=" font-extrabold text-yellow-400  transition-colors duration-300">
                <Link to="/Empleado">Asistencia</Link>
              </li>
              <li
                className=" font-extrabold text-yellow-400  transition-colors duration-300"
                onClick={handleMenuClick}
              >
                <Link to="/MisTurnos">MisTurnos</Link>
              </li>
              <li
                className=" font-extrabold text-yellow-400  transition-colors duration-300"
                onClick={handleMenuClick}
              >
                <Link to="/">Salir</Link>
              </li>
            </ul>
          </div>
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
        <ul
          className={`absolute top-full left-0 w-full flex flex-col items-center border-y-[0.8px] border-amber-400 transition-all duration-300 ease-in-out ${
            isMenuOpen
              ? "max-h-screen opacity-100 bg-black py-2"
              : "max-h-0 opacity-0 overflow-hidden pointer-events-none"
          }`}
        >
           <li className=" font-extrabold text-yellow-400  transition-colors duration-300">
                <Link to="/Empleado">Asistencia</Link>
              </li>
              <li
                className=" font-extrabold text-yellow-400  transition-colors duration-300"
                onClick={handleMenuClick}
              >
                <Link to="/MisTurnos">MisTurnos</Link>
              </li>
          <li
            className=" font-extrabold text-yellow-400  transition-colors duration-300"
            onClick={() => {
              handleMenuClick();
              setIsMenuOpen(false);
            }}
          >
            <Link to="/">Salir</Link>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default NavbarEmpleado;
