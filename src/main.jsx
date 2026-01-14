import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";
import { AuthProvider } from "./Components/RutaProteguida/AutoContext.jsx";

//Layout o
import Layout from "./Components/Layout.jsx";
//LayoutAdmin
import LayoutAdmin from "./Components/LayoutAdmin.jsx";

import App from "./Page/App/App.jsx";
import Servicios from "./Page/Servicios.jsx";
import Citas from "./Page/Citas.jsx";
import Ingreso from "./Page/Sesion/Ingreso.jsx";
import TurnosEmpleado from "./Page/Empleado/Misturnos.jsx";
import RutaProtegida from "./Components/RutaProteguida/Index.jsx";

//Rutas proteguidas
import Administrador from "./Page/Administrador/Index.jsx";
import Asistencia from "./Page/Administrador/Asistenica.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<App />} />
            <Route path="/Servicios" element={<Servicios />} />
            <Route path="/Citas" element={<Citas />} />
            <Route path="/Ingreso" element={<Ingreso />} />
          </Route>
          <Route element={<LayoutAdmin />}>
            <Route
              path="/Administrador"
              element={
                <RutaProtegida rolPermitido="administrador">
                  <Administrador />
                </RutaProtegida>
              }
            />

            <Route
              path="/Asistencia"
              element={
                <RutaProtegida rolPermitido="administrador">
                  <Asistencia />
                </RutaProtegida>
              }
            />

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
  </StrictMode>
);
