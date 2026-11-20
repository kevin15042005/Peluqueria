import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";
import { AuthProvider } from "./Components/RutaProteguida/AutoContext.jsx";

//Layout
import Layout from "./Components/Layout/Layout.jsx";
import LayoutAdmin from "./Components/Layout/LayoutAdmin.jsx";
import LayouEmpleado from "./Components/Layout/LayoutEmpleado.jsx";

import App from "./Page/App/App.jsx";
import Citas from "./Page/Citas.jsx";
import Ingreso from "./Page/Sesion/Ingreso.jsx";
import Contacto from "./Page/Politica/Index.jsx"
import TurnosEmpleado from "./Page/Empleado/Asistencia.jsx";
import RutaProtegida from "./Components/RutaProteguida/Index.jsx";
import ServiciosUsuario from "./Page/ServiciosUsuario.jsx";
//Rutas proteguidas
import Administrador from "./Page/Administrador/Index.jsx";
import Asistencia from "./Page/Administrador/Asistenica.jsx";
import Servicios from "./Page/Administrador/Servicios.jsx";
import VistaTurno from "./Page/Administrador/VistaTurnos.jsx";
import CartaAdmin from "./Page/Administrador/CartaAdmin.jsx";
import MiTurno from "./Page/MiTurno.jsx";
import Pantalla from "./Page/Pantalla.jsx";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<App />} />
            <Route path="/Citas" element={<Citas />} />
            <Route path="/Ingreso" element={<Ingreso />} />
            <Route
              path="/ServiciosUsuarios"
              element={<ServiciosUsuario />}
            ></Route>
            <Route
              path="/Contacto"
              element={<Contacto />}
            ></Route>
            <Route path="/MiTurno" element={<MiTurno />} />
            <Route path="/MiTurno/:id" element={<MiTurno />} />
          </Route>

          {/* Pantalla pública para la TV del salón (sin menú) */}
          <Route path="/Pantalla" element={<Pantalla />} />

          <Route element={<LayoutAdmin />}>
            <Route
              path="/Carta"
              element={
                <RutaProtegida rolPermitido="administrador">
                  <CartaAdmin />
                </RutaProtegida>
              }
            />
        

            <Route
              path="/VistaTurno"
              element={
                <RutaProtegida rolPermitido="administrador">
                  <VistaTurno />
                </RutaProtegida>
              }
            />

            <Route
              path="/Administrador"
              element={
                <RutaProtegida rolPermitido="administrador">
                  <Administrador />
                </RutaProtegida>
              }
            />
            <Route
              path="/Servicios"
              element={
                <RutaProtegida rolPermitido="administrador">
                  <Servicios />
                </RutaProtegida>
              }
            />
            <Route path="/Servicios" element={<Servicios />} />

            <Route
              path="/Asistencia"
              element={
                <RutaProtegida rolPermitido="administrador">
                  <Asistencia />
                </RutaProtegida>
              }
            />
          </Route>

          <Route element={<LayouEmpleado />}>
            <Route
              path="/Empleado"
              element={
                <RutaProtegida rolPermitido="empleado">
                  <TurnosEmpleado />
                </RutaProtegida>
              }
            />{" "}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
