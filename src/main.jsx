import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";
import { AuthProvider } from "./Components/RutaProteguida/AutoContext.jsx";

//Layout o
import Layout from "./Components/Layout.jsx";
//LayoutAdmin
import LayoutAdmin from "./Components/LayoutAdmin.jsx";
//Layout Empleado
import LayouEmpleado from "./Components/LayoutEmpleado.jsx";

import App from "./Page/App/App.jsx";
import Citas from "./Page/Citas.jsx";
import Ingreso from "./Page/Sesion/Ingreso.jsx";
import TurnosEmpleado from "./Page/Empleado/Asistencia.jsx";
import RutaProtegida from "./Components/RutaProteguida/Index.jsx";
import ServiciosUsuario from "./Page/ServiciosUsuario.jsx";
//Rutas proteguidas
import Administrador from "./Page/Administrador/Index.jsx";
import Asistencia from "./Page/Administrador/Asistenica.jsx";
import Servicios from "./Page/Administrador/Servicios.jsx";
import VistaTurno from "./Page/Administrador/VistaTurnos.jsx";

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
          </Route>
          <Route element={<LayoutAdmin />}>
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
            />

           
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
