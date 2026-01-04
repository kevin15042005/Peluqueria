import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Components/RutaProteguida/AutoContext.jsx";

/* 🔹 USUARIOS DE PRUEBA (SIMULAN LA BD) */
const usuariosMock = [
  {
    correo: "admin@correo.com",
    contraseña: "12345678",
    nombre: "Administrador",
  },
  {
    correo: "user@correo.com",
    contraseña: "87654321",
    nombre: "Usuario",
  },
];

const Ingreso = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [currentForm, setCurrentForm] = useState("login");
  const [showPassword, setShowPassword] = useState(false);

  const changeForm = (formName) => {
    setCurrentForm(formName);
    localStorage.setItem("currentForm", formName);
  };

  const hanldeClick = () => {
    window.scrollTo(0, 0);
  };

  /* 🔹 LOGIN CON ARRAY */
  const handleIniciar = (e) => {
    e.preventDefault();

    const email = e.target.correo.value;
    const password = e.target.contraseña.value;

    const usuario = usuariosMock.find(
      (u) => u.correo === email && u.contraseña === password
    );

    if (usuario) {
      alert("Inicio de sesión correcto");

      localStorage.setItem("USER", JSON.stringify(usuario));
      login(); // 🔐 Estado global
      navigate("/Administrador");
    } else {
      alert("Correo o contraseña incorrectos");
    }
  };

  /* 🔹 RECUPERAR CONTRASEÑA (SIMULADA) */
  const hanldeActualizar = (e) => {
    e.preventDefault();

    alert("Función simulada (sin backend)");
    changeForm("login");
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md ">
          {currentForm === "login" && (
            <form
              className="bg-[#F2F4F7] flex flex-col p-20 border-2 rounded-3xl min-h-130 "
              onSubmit={handleIniciar}
            >
              <h2 className="my-2 text-2xl font-extrabold text-center">
                Ingreso
              </h2>

              <fieldset className="flex flex-col items-center text-center">
                <legend>Email</legend>
                <input
                  type="email"
                  name="correo"
                  placeholder="Correo"
                  required
                  className="border-amber-500 border-2 p-2 rounded-3xl my-4"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  name="contraseña"
                  placeholder="Contraseña"
                  required
                  className="border-amber-500 border-2 p-2 rounded-3xl"
                />

                <button
                  className="bg-green-800 my-4 p-3 rounded-2xl w-full text-amber-50 font-bold"
                  type="submit"
                  onClick={hanldeClick}
                >
                  Ingreso
                </button>

                <div className="flex items-center justify-center gap-2">
                  <input
                    type="checkbox"
                    onChange={() => setShowPassword(!showPassword)}
                  />
                  <span>Ver contraseña</span>
                </div>
              </fieldset>

              <div className="flex justify-center text-black hover:text-gray-500">
                <a
                  href=""
                  onClick={(e) => {
                    e.preventDefault();
                    changeForm("forgotPassword");
                  }}
                >
                  Olvidé mi contraseña
                </a>
              </div>
            </form>
          )}

          {currentForm === "forgotPassword" && (
            <form
              className="bg-[#F2F4F7] flex flex-col p-20 border-2 rounded-3xl min-h-130"
              onSubmit={hanldeActualizar}
            >
              <fieldset className="text-center">
                <legend className="font-extrabold text-2xl">
                  Recuperar Contraseña
                </legend>

                <p className="my-4">Función simulada (sin base de datos)</p>
              </fieldset>

              <div className="flex justify-center gap-2">
                <button
                  className="bg-blue-500 p-2 rounded-2xl my-4"
                  onClick={() => changeForm("login")}
                >
                  Volver a inicio
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default Ingreso;
