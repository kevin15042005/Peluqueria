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

  // LOGIN
  const handleIniciar = async (e) => {
    e.preventDefault();

    const correo = e.target.correo.value;
    const contraseña = e.target.contraseña.value;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/administrador/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo, password: contraseña }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Inicio de sesión correcto");
        localStorage.setItem("USER", JSON.stringify(data.usuario));
        localStorage.setItem("isLogin", "true");
        if (data.usuario.ROL === "administrador") {
          navigate("/Administrador");
        } else {
          navigate("/Empleado");
        }
      }
    } catch (error) {
      console.error("Error al iniciar sesión", error);
      alert("Error de conexión");
    }
  };

  // ACTUALIZAR CONTRASEÑA
  const handleActualizar = async (e) => {
    e.preventDefault();

    const correo = e.target.correo.value;
    const pin = e.target.pin.value;
    const nueva_password = e.target.nueva_password.value;

    if (!correo || !pin || !nueva_password) {
      alert("Todos los campos son obligatorios");
      return;
    }

    if (!/^\d{6}$/.test(pin)) {
      alert("El PIN debe tener 6 dígitos");
      return;
    }

    if (nueva_password.length < 8) {
      alert("La contraseña debe tener mínimo 8 caracteres");
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/administrador/update_admin`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo, pin, nueva_password }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Contraseña actualizada correctamente");
        changeForm("login");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error al actualizar contraseña", error);
      alert("Error de conexión");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      {currentForm === "login" && (
        <form
          className="flex flex-col  w-full max-w-sm bg-white p-6 rounded shadow"
          onSubmit={handleIniciar}
        >
          <fieldset>
            <legend className="text-center">Ingreso</legend>

            <input className="w-full border mb-3 p-3" type="email" name="correo" placeholder="Correo" required />

            <input 
            className="w-full border p-3"
              type={showPassword ? "text" : "password"}
              name="contraseña"
              placeholder="Contraseña"
              required
            />

            <label className="flex mb-3 justify-center ">
              <input 
              className=" "
                type="checkbox"
                onChange={() => setShowPassword(!showPassword)}
              />
              Mostrar contraseña
            </label>

<div className="flex justify-around">
  
            <button className="border" type="submit">Ingresar</button>

            <button className="border " type="button" onClick={() => changeForm("forgotPassword")}>
              Olvidé mi contraseña
            </button>
</div>
          </fieldset>
        </form>
      )}

      {currentForm === "forgotPassword" && (
        <form
          className="flex flex-col  mb-3 w-full max-w-sm "
          onSubmit={handleActualizar}
        >
          <fieldset>
            <legend>Recuperar contraseña</legend>

            <input className="border p-2 mb-3 w-full" type="email" name="correo" placeholder="Correo" required />

            <input
            className="border p-2 mb-3  w-full "
              type={showPassword ? "text" : "password"}
              name="pin"
              placeholder="PIN (6 dígitos)"
              maxLength={6}
              required
            />

            <input 
            className="border p-2 mb-3 rounded w-full"
              type={showPassword ? "text" : "password"}
              name="nueva_password"
              maxLength={8}
              placeholder="Nueva contraseña"
              required
            />

            <label className="flex justify-center">
              <input 
              
                type="checkbox"
                onChange={() => setShowPassword(!showPassword)}
              />
              Mostrar contraseña
            </label>
            <div className="flex justify-between ">
              <button className="border" type="submit">Actualizar contraseña</button>

              <button className="border" type="button" onClick={() => changeForm("login")}>
                Volver
              </button>
            </div>
          </fieldset>
        </form>
      )}
    </div>
  );
};

export default Ingreso;
