import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Ingreso = () => {
  const navigate = useNavigate();

  const [currentForm, setCurrentForm] = useState("login");
  const [showPassword, setShowPassword] = useState(false);

  const changeForm = (formName) => {
    setCurrentForm(formName);
    localStorage.setItem("currentForm", formName);
  };

  const hanldeClick = () => {
    window.scrollTo(0, 0);
  };
  //Iniciar Sesion
  const handleIniciar = async (e) => {
    e.preventDefault();

    const email = e.target.correo.value;
    const password = e.target.contraseña.value;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: email,
          constraseña: password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Iniciar de seion correcto");
        localStorage.setItem("USER", JSON.stringify(data.usuario));
        localStorage.setItem("isLogin", "true");
        navigate("/Administrador");
      } else {
        alert(data.message || "Credenciales incorrectas");
        localStorage.setItem("isLogin", "false");
      }
    } catch (error) {
      console.log("Error al inicar sesion", error);
    }
  };

  const hanldeActualizar = async (e) => {
    e.preventDefault();

    const correo = e.target.correo.value;
    const pinSeguridad = e.target.antiguaContraseña.value;
    const nuevacontraseña = e.target.nuevacontraseña.value;

    if (!correo || !pinSeguridad || !nuevacontraseña) {
      alert("Todos los comapos son obligatorios");
      return;
    }
    if (nuevacontraseña.length < 8) {
      alert("La contraseña debe contener minimo 8 caracteres");
      return;
    }
    if (!/^\d{4}$/.test(pinSeguridad)) {
      alert(" pin deb ser extamente 4 digitos");
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo_Usuario: correo,
          pinSeguridad: pinSeguridad,
          nuevacontraseña: nuevacontraseña,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        alert("Contrasem=na actualizada correctamente");
        changeForm("login");
      } else {
        alert(data.message || "Error al actualizar la contrasena");
      }
    } catch (error) {
      console.log("Error al actualzoia contrasena", error);
      alert("Error de conexion con el servidor");
    }
  };

  return (
    <>
      <div>
        {currentForm === "login" && (
          <form
            className="bg-[#F2F4F7] flex flex-col p-4 "
            onSubmit={handleIniciar}
          >
            <fieldset className="flex flex-col  items-center text-center ">
              <legend>Ingreso</legend>
              <legend>Email</legend>
              <input  type="email" name="correo" placeholder="correo" required />
              <legend></legend>
              <input 
                type={showPassword ? "text" : "password"}
                name="contraseña"
                placeholder="contraseña" 
                required
              />
              <input
                type="checkbox"
                onChange={() => setShowPassword(!showPassword)}
              />{" "}
              Olvide Contraseña
              <div>
                <button type="submit" onClick={hanldeClick}>
                  Ingreso
                </button>
                <a
                  href=""
                  onClick={(e) => {
                    e.preventDefault();
                    changeForm("forgotPassword");
                  }}
                >
                  Olvide mi contraseña
                </a>
              </div>
            </fieldset>
          </form>
        )}

        {/*Recuperar contrasena*/}

        {currentForm === "forgotPassword" && (
          <form onSubmit={hanldeActualizar}>
            <fieldset>
              <legend>Recuperar Contrasena</legend>
              <legend>
                Correo
                <input
                  type="email"
                  name="correo"
                  placeholder="Ingrese Su Corrreo"
                />
              </legend>
              <legend>
                PIN seguridad 4
                <input
                  type="password"
                  name="antiguaContraseña"
                  pattern="\d{4}"
                  maxLength={4}
                  required
                />
              </legend>
              <legend>
                Nueva Contrasena{" "}
                <input
                  type={showPassword ? "text" : "password"}
                  name="nuevacontraseña"
                  minLength={8}
                  placeholder="MIninimo 8 caracteres"
                />
                <input
                  type="checkbox"
                  onChange={() => setShowPassword(!showPassword)}
                />
              </legend>
              <button type="submit">Actualiar contrasena</button>
            </fieldset>
            <div>
              <button onClick={() => changeForm("login")}>
                Volver a inicio
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
};
export default Ingreso;
