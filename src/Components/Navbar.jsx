import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "./../assets/log/logo.png"
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  //Cerrar menu de Movil
  const handleMenuClick = () => {
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  //Subir a pricipio de panralla
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
        className={`font-sans text-white p-4 bg-[#000000] flex items-center justify-between fixed w-full top-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-black   shadow-xl/70 shadow-amber-400 " : "bg-[#000000] "
        }`}
      >
        <div className="flex items-center justify-around w-full pr-7">
          <div >
            <img src={Logo} alt="Logo" className={`${isScrolled?" roun": "border-2 border-amber-50 rounded-2xl"} `} />
          </div>

          {/*Menu Desktop*/}
          <div className="flex justify-center">
            <ul className=" hidden md:flex justify-center space-x-8 ml-auto">
              <li
                className={` font-extrabold font-cu ${isScrolled?"text-yellow-400 transition-colors duration-300":"text-yellow-400"} `}
                onClick={handleMenuClick}
              >
                <Link to="/">Inicio</Link>
              </li>
              <li
                className={` font-extrabold ${isScrolled?"text-yellow-400 transition-colors duration-300":"text-yellow-400"} `}
                onClick={handleMenuClick}
              >
                <Link to="/ServiciosUsuarios">Servicios</Link>
              </li>

              <li
                className={` font-extrabold ${isScrolled?"text-yellow-400 transition-colors duration-300":"text-yellow-400"} `}
                onClick={handleMenuClick}
              >
                <Link to="/Citas">Agenda Turno</Link>
              </li>
              <li
                className={` font-extrabold ${isScrolled?"text-yellow-400 transition-colors duration-300":"text-yellow-400"} `}
                onClick={handleMenuClick}
              >
                <Link to="/Ingreso">Ingreso</Link>
              </li>
            </ul>
            {/*Menu de navegacion Movil*/}
          </div>
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
        <ul
          className={`flex flex-col items-center  border-y-[0.8px] border-amber-400  bg-amber-300  w-full absolute top-full left-0 md:hidden transition-all duration-300 gap-y-${
            isMenuOpen
              ? "max-h-screen opacity-100 bg-black"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <li
                className=" font-extrabold text-yellow-400  transition-colors duration-300"
                onClick={handleMenuClick}
              >
                <Link to="/">Inico</Link>
              </li>
              <li
                className=" font-extrabold text-yellow-400  transition-colors duration-300"
                onClick={handleMenuClick}
              >
                <Link to="/ServiciosUsuarios">Servicios</Link>
              </li>

              <li
                className=" font-extrabold text-yellow-400  transition-colors duration-300"
                onClick={handleMenuClick}
              >
                <Link to="/Citas">Agenda Turno</Link>
              </li>
              <li
                className=" font-extrabold text-yellow-400  transition-colors duration-300"
                onClick={handleMenuClick}
              >
                <Link to="/Ingreso">Ingreso</Link>
              </li>
        </ul>
      </nav>
    </>
  );
};

export default Navbar;
