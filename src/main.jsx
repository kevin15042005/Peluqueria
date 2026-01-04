import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";
import { AuthProvider } from "./Components/RutaProteguida/AutoContext.jsx";

import Layout from "./Components/Layout.jsx";
import App from "./Page/App/App.jsx";
import Servicios from "./Page/Servicios.jsx";
import Citas from "./Page/Citas.jsx";
import Ingreso from "./Page/Sesion/Ingreso.jsx";
import Administrador from "./Page/Administrador.jsx";
import RutaProtegida from "./Components/RutaProteguida/Index.jsx";

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

            <Route
              path="/Administrador"
              element={
                <RutaProtegida>
                  <Administrador />
                </RutaProtegida>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
