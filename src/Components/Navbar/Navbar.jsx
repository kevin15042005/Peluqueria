import React, { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "../../assets/log/logo.png";

const enlaces = [
  { to: "/", label: "Inicio" },
  { to: "/ServiciosUsuarios", label: "Servicios" },
  { to: "/Citas", label: "Agenda turno" },
  { to: "/MiTurno", label: "Mi turno" },
  { to : "/Contacto", label: "Contacto"}
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Cerrar menú móvil y subir al inicio
  const handleMenuClick = () => {
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const linkClass = ({ isActive }) =>
    `relative py-2 text-sm uppercase tracking-[0.18em] transition-colors duration-300 after:absolute after:left-0 after:-bottom-0.5 after:h-px after:bg-gold after:transition-all after:duration-300 ${
      isActive
        ? "text-gold after:w-full"
        : "text-white/80 hover:text-gold after:w-0 hover:after:w-full"
    }`;

  return (
    <nav
      className={`fixed top-0 z-50 w-full h-20 transition-all duration-300 ${
        isScrolled
          ? "bg-ink/90 backdrop-blur-md border-b border-gold/20 shadow-lg shadow-black/40"
          : "bg-ink border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-5 md:px-8">
        <Link to="/" onClick={handleMenuClick} className="shrink-0">
          <img src={Logo} alt="Peluquería El Dorado" className="h-11 w-auto" />
        </Link>

        {/* Menú escritorio */}
        <ul className="hidden md:flex items-center gap-10">
          {enlaces.map((e) => (
            <li key={e.to}>
              <NavLink to={e.to} end className={linkClass} onClick={handleMenuClick}>
                {e.label}
              </NavLink>
            </li>
          ))}
          <li>
            <Link
              to="/Ingreso"
              onClick={handleMenuClick}
              className="rounded-full border border-gold/60 px-5 py-2 text-sm uppercase tracking-[0.18em] text-gold transition-colors duration-300 hover:bg-gold hover:text-ink"
            >
              Ingreso
            </Link>
          </li>
        </ul>

        {/* Botón menú móvil */}
        <button
          className="md:hidden text-gold"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Menú móvil */}
      <div
        className={`md:hidden absolute top-full left-0 w-full overflow-hidden bg-ink/95 backdrop-blur-md border-b border-gold/20 transition-all duration-500 ease-in-out ${
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <ul className="flex flex-col items-center gap-5 py-8">
          {enlaces.map((e) => (
            <li key={e.to}>
              <NavLink to={e.to} end className={linkClass} onClick={handleMenuClick}>
                {e.label}
              </NavLink>
            </li>
          ))}
          <li>
            <Link
              to="/Ingreso"
              onClick={handleMenuClick}
              className="mt-2 inline-block rounded-full border border-gold/60 px-6 py-2 text-sm uppercase tracking-[0.18em] text-gold"
            >
              Ingreso
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
